const mongoClient = require("./db");

async function searchRun(searchString, skipDev = 0, skipBlog = 0){
    let result = {};

    try{
        let projection = {"score": {$meta: "textScore"}, "_id":0, "title": 1, "url": 1, "abstract": 1};

        let cursorDev = mongoClient.db().collection("dev").find({$text: {$search: searchString}}).sort({ score: {$meta: "textScore"} }).project(projection).limit(20).skip(skipDev);
        let cursorBlog = mongoClient.db().collection("blog").find({$text: {$search: searchString}}).sort({ score: {$meta: "textScore"} }).project(projection).limit(20).skip(skipBlog);

        let devDocs = await cursorDev.toArray();
        let blogDocs = await cursorBlog.toArray();        

        for(let i = 0; i < devDocs.length; i++){
            devDocs[i]["tag"] = "DEV";            
        }
        for(let i = 0; i < blogDocs.length; i++){
            blogDocs[i]["tag"] = "BLOG";            
        }    

        //count if initial search
        if(skipDev === 0 && skipBlog === 0){
            let countDev = await mongoClient.db().collection("dev").countDocuments({$text: {$search: searchString}});
            let countBlog = await mongoClient.db().collection("blog").countDocuments({$text: {$search: searchString}});
            result["totalDev"] = countDev;
            result["totalBlog"] = countBlog;
        }

        //organize final array (mixing dev and blog) by score
        let rows = [];
        let d = 0;
        let b = 0;
        for(let i = 0; i < 20; i++){
            if(d < devDocs.length && b < blogDocs.length){
                if(devDocs[d].score >= blogDocs[b].score){
                    rows.push(devDocs[d]);
                    d++;
                }
                else{
                    rows.push(blogDocs[b]);
                    b++;
                }
            }
            else if(d < devDocs.length){
                rows.push(devDocs[d]);
                d++;
            }
            else if(b < blogDocs.length){
                rows.push(blogDocs[b]);
                b++;
            }
        }
        result["rows"] = rows;
        result["skipDev"] = skipDev + d;
        result["skipBlog"] = skipBlog + b;
        result["okay"] = true;
    }
    catch(e){
        console.error(e);
        result = {
            okay: false,
            msg: "Erro ao executar a busca, por favor tente novamente utilizando termos diferentes."
        };
    }
    finally{
        return result;
    }
}


module.exports = {
    search(fields){
        //tratar os campos        
        return new Promise((resolve, reject) =>{
            if(typeof fields.search === "undefined" || fields.search.trim() === ""){
                reject({
                    okay: false,
                    msg: "Você deve digitar um termo de busca."
                });
                return;
            }

            let skipDev = 0;
            if(typeof fields.skipDev !== "undefined"){
                skipDev = parseInt(fields.skipDev, 10);
                if(isNaN(skipDev)){
                    skipDev = 0;
                }
            }

            let skipBlog = 0;
            if(typeof fields.skipBlog !== "undefined"){
                skipBlog = parseInt(fields.skipBlog, 10);
                if(isNaN(skipBlog)){
                    skipBlog = 0;
                }
            }

            searchRun(fields.search, skipDev, skipBlog).then(result =>{
                resolve(result);
                return;
            }).catch(rejection =>{
                reject(rejection);
                return;
            });
        });
    }
}
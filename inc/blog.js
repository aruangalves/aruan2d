const fs = require('fs');
const path = require('path');
const mongoClient = require('./db');
const { ObjectId } = require('mongodb');
const projectpath = require('./projectpath');
const utils = require('./utils');

async function findCategories(id){
    let crs = mongoClient.db().collection("blogcategories").find({"posts": id}).sort({"name" : 1, "_id": 1});
    let docs = await crs.toArray();
    return docs;        
}

function setCategories(docs){
    return new Promise((resolve, reject)=>{  
        let calls = [];            
        for(let i = 0; i < docs.length; i++){
            calls.push(setCategory(docs[i]));
        }
        Promise.all(calls).then(()=>{            
            resolve(docs);
        });        
    });
    
}

function setCategory(doc){
    return new Promise((resolve, reject)=>{
        findCategories(doc._id).then(categories =>{
            let catlist = [];
            categories.forEach(category =>{
                catlist.push({
                    name: category.name,
                    url: category.url
                });
            })
            doc.categories = catlist;
            resolve();
        });
    });
}

function insertIntoCategories(categories, post_id){
    return new Promise((resolve, reject)=>{        
        let calls = [];
        for(let i = 0; i < categories.length; i++){
            calls.push(insertIntoCategory(categories[i], post_id));
        }
        Promise.all(calls).then(()=>{
            resolve();
        }).catch(error =>{
            console.log(error);
            reject();
        })
    });
}

function insertIntoCategory(individualcategory, post_id){
    return new Promise((resolve, reject) =>{
        mongoClient.db().collection("blogcategories").findOne({ "name": individualcategory}).then(category =>{
            if(category){
                let catid = category._id;
                let cat = category;
                delete cat["_id"];
                cat["posts"].push(post_id);
                mongoClient.db().collection("blogcategories").updateOne({ "_id" : catid}, {$set: cat}).then(result =>{
                    console.log("A2Dlog - Adding category " +individualcategory +" to BLOG post: ");
                    console.log(result);
                    resolve();
                }).catch(error =>{
                    console.log("A2Dlog - Error adding category " +individualcategory +"to BLOG post:");
                    console.log(error);
                });
            }
            else{
                let posts = [];
                let url = utils.generateURL(individualcategory);
                let check = utils.checkURL(url, 3, "a categoria");
                if(check.test){
                    utils.setUniqueURL(url, "blogcategories").then(uniqueURL =>{
                        posts.push(post_id);
                        let cat = {
                            name: individualcategory,
                            url: uniqueURL,
                            posts
                        };
                        mongoClient.db().collection("blogcategories").insertOne(cat).then(result =>{
                            console.log("A2Dlog - Adding category " +individualcategory +" to BLOG post: ");
                            console.log(result);
                            resolve();
                        }).catch(error =>{
                            console.log("A2Dlog - Error adding category " +individualcategory +"to BLOG post:");
                            console.log(error);
                        });
                    });
                    
                }
                else{
                    reject({
                        okay: false,
                        msg: check.msg
                    });
                }
                
            }
        });
    });
}

function removeFromCategories(removedCategories, post_id){
    return new Promise((resolve, reject) =>{
        let calls = [];
        for(let i = 0; i < removedCategories.length; i++){
            calls.push(removeFromCategory(removedCategories[i], post_id));
        }
        Promise.all(calls).then(()=>{
            resolve();
        }).catch(error =>{
            console.log(error);
            reject();
        });
    });
}

function removeFromCategory(removedcategory, post_id){
    return new Promise((resolve, reject) =>{
        mongoClient.db().collection("blogcategories").findOne({ "name": removedcategory.name}).then(category =>{
            let catid = category._id;
            let cat = {};            
            cat["posts"] = category.posts;            
            let indexItem = utils.indexOfObjectIdArray(post_id, cat.posts);            
            if(indexItem > -1){                
                cat.posts.splice(indexItem,1);

                if(cat.posts.length === 0){
                    mongoClient.db().collection("blogcategories").deleteOne({"_id" : catid}).then(result=>{
                        console.log("A2Dlog - While removing post from category " +category.name +", it became empty and was removed: ");
                        console.log(result);
                        resolve();
                    }).catch(error =>{
                        console.log("A2Dlog - Error removing category: " +category.name);
                        console.log(error);
                        reject();
                    });
                }
                else{
                    mongoClient.db().collection("blogcategories").updateOne({"_id" : catid}, { $set: cat}).then(result =>{
                        console.log("A2Dlog - Removing BLOG post from category " +category.name +": ");
                        console.log(result);
                        resolve();
                    }).catch(error =>{
                        console.log("A2Dlog - Error removing category: " +category.name);
                        console.log(error);
                        reject();
                    });
                }
            }
        });
    });
}

async function retrieveData(resultsPerPage, skipped){    
    let crs = mongoClient.db().collection("blog").find().sort({"time": -1, "_id": -1}).limit(resultsPerPage).skip(skipped);
    let docs = await crs.toArray();
    let total = 0;
    total = await mongoClient.db().collection("blog").estimatedDocumentCount();    

    let result = {
        docs, total
    };
    
    return result;
    
    
};

async function retrieveLiteData(resultsPerPage, skipped){
    let cursor = mongoClient.db().collection("blog").find().sort({"time": -1, "_id": -1}).project({"title": 1, "url": 1, "abstract": 1, "time": 1, "coverimg": 1}).limit(resultsPerPage).skip(skipped);
    let docs = await cursor.toArray();
    let total = 0;
    total = await mongoClient.db().collection("blog").estimatedDocumentCount();

    let result = {
        docs, total
    };

    return result;
};

function listImages(blocks){
    let images = [];
    blocks.forEach(block =>{
        if(block.type === "image"){
            images.push(block.data.file.url);
        }
    });
    return images;
}

function deleteFiles(fileList){
    for(let i = 0; i < fileList.length; i++){
        //SET DELETION FOLDER FOR EACH IMAGE
        let basename = path.parse(fileList[i]).base;
        let fullpath = projectpath.resourcepath +basename;
        fs.unlink(fullpath, function(error){
            if(error){
                console.log(`A2Dlog - Error deleting file: "${fullpath}". Error: ${error}`);
            }
        });
    }
}

function deleteCover(coverimg){
    let basename = path.parse(coverimg).base;
    let fullpath = projectpath.imagepath +basename;
    fs.unlink(fullpath, function(error){
        if(error){
            console.log(`A2Dlog - Error deleting file: "${fullpath}". Error: ${error}`);
        }
    });
}

module.exports = {
    getData(page, resultsPerPage = 10, omitid = false){
        return new Promise((resolve, reject) =>{
            let total = 0;
            let totalpages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*resultsPerPage;

            retrieveData(resultsPerPage, skipped).then(result =>{
                total = result.total;
                totalpages = Math.ceil(total/resultsPerPage);
                data['pages'] = totalpages;
                setCategories(result.docs).then(newdocs =>{                    
                    if(omitid){
                        newdocs.forEach(newdoc =>{
                            delete newdoc["_id"];
                        });
                    }
                    
                    data['rows'] = newdocs;
                    data['okay'] = true;                    
                    resolve(data);
                    return;
                });
                
            }).catch(error =>{
                console.log(`A2Dlog - Error retrieving BLOG posts at page ${page}: ${error}`);
                reject({
                    okay: false,
                    msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                });
                return;
            });
        });
    },

    getLiteData(page, resultsPerPage = 10){
        return new Promise((resolve, reject)=>{
            let total = 0;
            let totalpages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*resultsPerPage;

            retrieveLiteData(resultsPerPage, skipped).then(result =>{
                total = result.total;
                totalpages = Math.ceil(total/resultsPerPage);
                data["pages"] = totalpages;
                setCategories(result.docs).then(newdocs =>{
                    newdocs.forEach(newdoc =>{
                        delete newdoc["_id"];
                    });
                    data['rows'] = newdocs;
                    data['okay'] = true;
                    resolve(data);
                    return;
                })
            }).catch(error =>{
                console.log(`A2Dlog - Error retrieving BLOG posts at page ${page}: ${error}`);
                reject({
                    okay: false,
                    msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                });
                return;
            });//retrieveLiteData()

        });//return new Promise()
    },

    save(fields, files){
        return new Promise((resolve, reject)=>{
            let doc = {};
            let data = JSON.parse(fields.data);
            doc["data"] = data;            
            let images = listImages(data.blocks);
            doc["images"] = images;
            doc["abstract"] = fields.abstract;

            //SAVE OR EDIT BLOG POST?

            //SAVE BLOG POST
            if(fields._id === ""){
                //Set creation time
                let time = parseInt(fields.time);
                doc["time"] = time;

                //Check post title
                if(fields.title === ""){
                    reject({
                        okay: false,
                        msg: "Erro: você deve digitar um título para o post."
                    });
                    return;
                }
                else if(fields.title.length < 6){
                    reject({
                        okay: false,
                        msg: "Erro: você deve digitar um título com pelo menos 6 caracteres."
                    });
                    return;
                }
                else{
                    
                    doc["title"] = utils.removeExcessWhitespaces(fields.title);

                    let url = utils.generateURL(doc["title"]);

                    let check = utils.checkURL(url);

                    if(!check.test){
                        reject({
                            okay: false,
                            msg: check.msg
                        });
                        return;
                    }
                    else{
                        utils.setUniqueURL(url, "blog").then(uniqueURL =>{
                            doc["url"] = uniqueURL;

                            //Check cover image
                            if(files.coverimg.size > 0){                                
                                //Moving image to /upload/images/
                                let basename = path.parse(files.coverimg.filepath).base;
                                doc["coverimg"] = `/upload/images/${basename}`;
                                fs.rename(
                                    files.coverimg.filepath,
                                    projectpath.imagepath +basename,
                                    function(error){
                                        if(error){
                                            console.log('A2Dlog - Error moving cover image: ', error);
                                            reject({
                                                okay: false,
                                                msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                                            });
                                            return;
                                        }
                                    }
                                );                                
                            }

                            //Check references
                            let refno = parseInt(fields.refno);
                            if(refno > 0){
                                doc["refno"] = refno;
                                let references = [];
                                for(let i = 1; i <= refno; i++){
                                    let indref = utils.removeExcessWhitespaces(fields['ref' +i]);
                                    references.push(indref);
                                }
                                doc["references"] = references;
                            }
                            
                            //Check categories
                            let catno = parseInt(fields.catno);
                            let categories = [];
                            if(catno < 1){
                                reject({
                                    okay: false,
                                    msg: "Erro: o post deve possuir pelo menos uma categoria."
                                });
                                return;
                            }
                            else if(catno > 10){
                                reject({
                                    okay: false,
                                    msg: "Erro: o post deve possuir no máximo dez categorias."
                                });
                                return;
                            }
                            else{
                                for(let i = 1; i <= catno; i++){
                                    let indcat = utils.removeExcessWhitespaces(fields['cat' +i]);
                                    categories.push(indcat);
                                }

                                //Check if there are any repeated categories
                                for(let i = 0; i < categories.length; i++){
                                    for(let j = 0; j < categories.length; j++){
                                        if(i === j);
                                        else{
                                            if(categories[i] === categories[j]){
                                                reject({
                                                    okay: false,
                                                    msg: "Erro: o post possui categorias repetidas."
                                                });
                                                return;
                                            }
                                        }
                                    }
                                }
                            }                            

                            //Insert post into database
                            mongoClient.db().collection("blog").insertOne(doc).then(result =>{
                                let id = result.insertedId;
                                console.log("Inserting data to BLOG section: ");
                                console.log(result);


                                //Insert into categories
                                insertIntoCategories(categories, id).then(()=>{
                                    resolve({
                                        okay: true,
                                        msg: "Post cadastrado com sucesso!"
                                    });
                                    return;
                                }).catch(rejection =>{
                                    reject({
                                        okay: false,
                                        msg: "Categoria em formato inválido: ela deve possuir pelo menos uma palavra com no mínimmo 3 caracteres."
                                    });
                                });                    
                            });
                        });
                    }
                    
                }
                
            }
            //EDIT BLOG POST
            else{                
                let id = ObjectId(fields._id);
                let newurl = false;
                let calls = [];

                //Set edit time
                let edit = parseInt(fields.time);
                doc["edit"] = edit;
                

                mongoClient.db().collection("blog").findOne({"_id": id}).then(olddoc =>{                    
                    //Copy creation time to new doc
                    doc["time"] = olddoc.time;

                    let oldcoverdelete = "";
                    //Check cover image
                    if(files.coverimg.size > 0){
                        //Moving image to /upload/images/
                        let basename = path.parse(files.coverimg.filepath).base;
                        doc["coverimg"] = `/upload/images/${basename}`;
                        fs.rename(
                            files.coverimg.filepath,
                            projectpath.imagepath +basename,
                            function(error){
                                if(error){
                                    console.log('Error moving cover image: ', error);
                                    reject({
                                        okay: false,
                                        msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                                    });
                                    return;
                                }
                            }
                        );

                        //Check if the post already had an image
                        //If POSITIVE, delete old image
                        //Do nothing if NO previous image was uploaded
                        if(typeof olddoc.coverimg !== "undefined"){
                            oldcoverdelete = olddoc.coverimg;
                        }
                    }                    

                    //Check if new TITLE is empty, use old TITLE if so
                    if(fields.title === ""){
                        doc["title"] = olddoc.title;
                    }
                    //Check if title wasn't changed
                    else if(fields.title === olddoc.title){
                        doc["title"] = olddoc.title;
                    }
                    else{
                        if(fields.title.length < 6){
                            reject({
                                okay: false,
                                msg: "Erro: você deve digitar um título com pelo menos 6 caracteres."
                            });
                            return;
                        }
                        else{
                            doc["title"] = utils.removeExcessWhitespaces(fields.title);
        
                            let url = utils.generateURL(doc["title"]);
        
                            let check = utils.checkURL(url);
        
                            if(!check.test){
                                reject({
                                    okay: false,
                                    msg: check.msg
                                });
                                return;                                
                            }
                            else{
                                newurl = true;
                                calls.push(utils.setUniqueURL(url, "blog", id));
                            }
                            
                        }                        
                    }                    

                    //Check references
                    let deleteReferences = false;
                    let refno = parseInt(fields.refno);
                    if(refno > 0){
                        doc["refno"] = refno;
                        let references = [];
                        for(let i = 1; i <= refno; i++){
                            let indref = utils.removeExcessWhitespaces(fields['ref' +i]);
                            references.push(indref);
                        }
                        doc["references"] = references;
                    }
                    else{      
                        //Check if there were previous references that need to be deleted
                        if(typeof olddoc.refno !== "undefined" && typeof olddoc.references !== "undefined"){
                            deleteReferences = true;
                        }
                    }

                    //Check post image list for changes
                    let deletefiles = false;
                    let dellist = olddoc.images;
                    if(doc.images.length === 0 && olddoc.images.length > 0){
                        //Delete all previous images, if they exist
                        deletefiles = true;                        
                    }
                    else if(doc.images.length > 0){
                        //Check images for deletion
                        if(dellist.length > 0){
                            deletefiles = true;
                            for(let i = 0; i < doc.images.length; i++){
                                for(let j = 0; j < dellist.length; j++){
                                    if(doc.images[i] === dellist[j]){
                                        dellist.splice(j,1);
                                        j = dellist.length;
                                    }
                                }
                            }
                        }
                    }                    

                    //Check categories for changes
                    let catno = parseInt(fields.catno);                    
                    let categories = [];                    
                    if(catno < 1){
                        reject({
                            okay: false,
                            msg: "Erro: o post deve possuir pelo menos uma categoria."
                        });
                        return;
                    }
                    else if(catno > 10){
                        reject({
                            okay: false,
                            msg: "Erro: o post deve possuir no máximo dez categorias."
                        });
                        return;
                    }
                    else{                        
                        for(let i = 1; i <= catno; i++){
                            let indcat = utils.removeExcessWhitespaces(fields['cat' +i])
                            categories.push(indcat);
                        }

                        //Check if there are any repeated categories
                        for(let i = 0; i < categories.length; i++){
                            for(let j = 0; j < categories.length; j++){
                                if(i !== j){
                                    if(categories[i] === categories[j]){
                                        reject({
                                            okay: false,
                                            msg: "Erro: o post possui categorias repetidas."
                                        });
                                        return;
                                    }
                                }
                            }
                        }
                    }  

                    findCategories(id).then(oldcategories =>{                          
                        //Remove post ObjectId from deleted categories
                        //Add post ObjectId to new categories
                        //Existing categories don't require changes in database
                        let deletedcategories = [];
                        let newcategories = [];
                        let categoriesToRemove = [];
                        let categoriesToAdd = [];
                        for(let i = 0; i < oldcategories.length; i++){
                            deletedcategories.push(i);                            
                        }
                        for(let i = 0; i < categories.length; i++){
                            newcategories.push(i);
                        }

                        //Set indexes for deleted categories
                        for(let i = 0; i < categories.length; i++){
                            for(let j = 0; j < oldcategories.length; j++){
                                if(categories[i] === oldcategories[j].name){
                                    let index = deletedcategories.indexOf(j);
                                    if(index > -1){
                                        deletedcategories.splice(index,1);
                                    }                                    
                                    j = oldcategories.length;
                                }
                            }
                        }

                        if(deletedcategories.length > 0){
                            for(let i = 0; i < deletedcategories.length; i++){
                                categoriesToRemove.push(oldcategories[deletedcategories[i]]);
                            }
                            calls.push(removeFromCategories(categoriesToRemove, id));
                        }

                        //Set indexes for added categories
                        for(let i = 0; i < oldcategories.length; i++){
                            for(let j = 0; j < categories.length; j++){
                                if(oldcategories[i].name === categories[j]){
                                    let index = newcategories.indexOf(j);
                                    if(index > -1){
                                        newcategories.splice(index,1);
                                    }
                                    j = categories.length;
                                }
                            }
                        }

                        if(newcategories.length > 0){
                            for(let i = 0; i < newcategories.length; i++){
                                categoriesToAdd.push(categories[newcategories[i]]);
                            }
                            calls.push(insertIntoCategories(categoriesToAdd, id));
                        }

                        
                        
                        Promise.all(calls).then(values =>{
                            if(newurl){
                                doc["url"] = values[0];
                            };
                            
                            let parameters = {$set: doc};
                            if(deleteReferences){
                                parameters = {$set: doc, $unset: { "refno": "", "references": ""}};
                            }

                            mongoClient.db().collection("blog").updateOne({"_id": id}, parameters).then(result =>{
                                console.log('A2Dlog - post UPDATE on BLOG section:');
                                console.log(result);
                                //Delete old cover image?
                                if(oldcoverdelete !== ""){
                                    deleteCover(oldcoverdelete);
                                }
                                //Delete post images?
                                if(deletefiles){
                                    deleteFiles(dellist);
                                }
    
                                resolve({
                                    okay: true,
                                    msg: "Post atualizado com sucesso!"
                                });
                                return;
                            });
                        }).catch(rejection =>{
                            console.log("A2Dlog - Error updating BLOG post: ", rejection);
                            reject({
                                okay: false,
                                msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                            });
                            return;
                        });
                        
                        

                    });


                    


                    


                });
                
            }
        });
    },

    delete(id){
        id = ObjectId(id);        
        let deletedfiles = [];            
        let coverimg = "";
        return new Promise((resolve, reject)=>{
            
            mongoClient.db().collection("blog").findOne({ _id: id}).then(doc =>{
                if(typeof doc.coverimg !== "undefined"){
                    coverimg = doc.coverimg;
                }
                deletedfiles = doc.images;
                findCategories(id).then(categories =>{
                    removeFromCategories(categories, id).then(()=>{
                        mongoClient.db().collection("blog").deleteOne({_id: id}).then(response =>{
                            console.log(response);
                            if(coverimg !== ""){
                                deleteCover(coverimg);
                            }
                            deleteFiles(deletedfiles);
                            resolve({
                                okay: true,
                                msg: "Post removido com sucesso!"
                            });
                            return;
                        }).catch(error =>{
                            console.log("A2Dlog - Error removing BLOG post: ", error);
                            reject({
                                okay: false,
                                msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                            });
                            return;
                        });
                    });
                });
            });
        });
    },

    getCategories(excludeURL = false, excludePosts = false){
        let projection = {};
        projection["_id"] = 0;
        if(excludeURL){
            projection["url"] = 0;
        }
        if(excludePosts){
            projection["posts"] = 0;
        }
        return new Promise((resolve, reject)=>{
            let cursor = mongoClient.db().collection("blogcategories").find().project(projection).sort({"name" : 1});
            cursor.toArray().then(docs =>{
                resolve({
                    okay: true,
                    docs
                });
                return;
            }).catch(rejection =>{
                console.log(rejection);
                reject({
                    okay: false,
                    msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                })
            });
            
        });
    },

    getCategoryPosts(url, page = 1, resultsPerPage = 10){
        return new Promise((resolve, reject)=>{       
            if(page < 1){
                reject({
                    okay: false,
                    msg: "Página inválida para esta categoria."
                });
                return;
            }
            mongoClient.db().collection("blogcategories").findOne({"url": url}).then(category =>{
                if(category){                    
                    let length = category.posts.length;
                    let totalpages = Math.ceil(length/resultsPerPage);
                    if(page > totalpages){
                        reject({
                            okay: false,
                            msg: "Página inválida para esta categoria."
                        });
                        return;
                    }
                    let actualpage = page-1;
                    let skip = (length - 1) - (actualpage * resultsPerPage);
                    let limiter = (length - 1) - (page * resultsPerPage);
                    if(limiter < 0){
                        limiter = -1;
                    }
                    let postsToFind = [];
                    for(let i = skip; i > limiter; i--){
                        postsToFind.push(category.posts[i]);
                    }
                    let cursor = mongoClient.db().collection("blog").find({"_id": {$in: postsToFind}}).sort({"time": -1});

                    cursor.toArray().then(docs =>{
                        setCategories(docs).then(newdocs =>{
                            newdocs.forEach(newdoc =>{
                                delete newdoc["_id"];
                            });
                            let data = {
                                okay: true,
                                rows: newdocs,
                                pages: totalpages                                
                            };
                            resolve(data);
                            return;
                        }).catch(error =>{
                            console.log(error);
                            reject({
                                okay: false,
                                msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                            });    
                        });
                    }).catch(error =>{
                        console.log(error);
                        reject({
                            okay: false,
                            msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                        });
                    });
                    
                }
                else{
                    reject({
                        okay: false,
                        msg: "Não foi possível encontrar nenhum post com esse endereço."
                    });
                    return;
                }
            });
        });
    },

    getCategoryName(url){
        return new Promise((resolve, reject) =>{
            mongoClient.db().collection("blogcategories").findOne({"url": url}).then(category =>{
                if(category){
                    resolve(category.name);
                    return;
                }
                resolve("");
                return;

            }).catch(error =>{
                console.log(error);
                reject("");
                return;
            });
        });
    },

    getHistory(sendMostRecent = true){        
        return new Promise((resolve, reject)=>{            
            let projection = {"time": 1};
            let crs = mongoClient.db().collection("blog").find().project(projection).sort({"time": 1}).limit(1);
            crs.toArray().then(docs =>{
                if(docs.length > 0){
                    let oldestTime = new Date(docs[0].time);
                    let oldestYear = oldestTime.getFullYear();
                    let oldestMonth = oldestTime.getMonth();
                    let ncrs = mongoClient.db().collection("blog").find().project(projection).sort({"time": -1}).limit(1);
                    ncrs.toArray().then(ndocs =>{
                        if(ndocs.length > 0){
                            let newestTime = new Date(ndocs[0].time);
                            let newestYear = newestTime.getFullYear();
                            let newestMonth = newestTime.getMonth();
                            let years = [];
                            for(let i = newestYear; i >= oldestYear; i--){
                                years.push(i);
                            }
                            if(sendMostRecent){
                                let cutoffDate = new Date(newestYear, newestMonth);
                                let startingDate = Date.parse(cutoffDate);
                                cutoffDate = new Date(newestYear, newestMonth+1);
                                let endingDate = Date.parse(cutoffDate);
                                projection = {"time": 1, "title": 1, "url": 1};
                                let cursor = mongoClient.db().collection("blog").find({"time": {$gte: startingDate, $lt: endingDate}}).project(projection).sort({"time": -1});
                                cursor.toArray().then(posts =>{
                                    resolve({
                                        okay: true,
                                        posts,
                                        years,
                                        newestMonth,
                                        oldestMonth
                                    });
                                });
                            }
                            else{
                                resolve({
                                    okay: true,
                                    years,
                                    newestMonth,
                                    oldestMonth
                                });
                                return;
                            }
                        }
                        else{
                            reject({
                                okay: false,
                                msg: "O blog não possui nenhum post, não é possível retornar o histórico."
                            });
                            return;
                        }
                    })
                }
                else{
                    reject({
                        okay: false,
                        msg: "O blog não possui nenhum post, não é possível retornar o histórico."
                    });
                    return;
                }
            });
        });
    },

    getHistoryPosts(year, month){
        return new Promise((resolve, reject)=>{
            let cutoffDate = new Date(year, month);
            let startingDate = Date.parse(cutoffDate);
            cutoffDate = new Date(year, month+1);
            let endingDate = Date.parse(cutoffDate);
            let projection = {"time": 1, "title": 1, "url": 1};
            let cursor = mongoClient.db().collection("blog").find({"time": {$gte: startingDate, $lt: endingDate}}).project(projection).sort({"time": -1});
            cursor.toArray().then(posts =>{
                resolve({
                    okay: true,
                    posts
                });
                return;
            }).catch(error =>{
                console.log(error);
                reject({
                    okay: false,
                    msg: "Não foi possível encontrar nenhum post dentro deste período de tempo."
                })
            });
        });
    },

    getPost(url){
        return new Promise((resolve, reject) =>{
            mongoClient.db().collection("blog").findOne({"url" : url}).then(result =>{
                if(result){                     
                    let doc = result;                   
                    setCategory(doc).then(() =>{
                        resolve({
                            okay: true,
                            doc
                        })
                    })
                }
                else{
                    reject({
                        okay: false,
                        msg: "Erro: não foi possível encontrar um post com este endereço."
                    })
                }
            });
        });
    }
}
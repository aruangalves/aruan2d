const { promisify } = require('util');
const mongoClient = require('./db');
const projectpath = require('./projectpath');
const fastFolderSize = require('fast-folder-size');
const { resolveInclude } = require('ejs');

async function retrieveAttempts(resultsPerPage, skipped){
    let crs = mongoClient.db().collection("attempts").find().sort({"_id": -1}).limit(resultsPerPage).skip(skipped);
    let docs = await crs.toArray();
    let total = 0;
    total = await mongoClient.db().collection("attempts").estimatedDocumentCount();

    let result = {
        docs, total
    };

    return result;
}

async function retrieveStats(){
    let posts = 0, projects = 0, blogcategories = 0, devcategories = 0, logo = 0, print = 0, art = 0, vid = 0, upload = 0;

    posts = await mongoClient.db().collection("blog").estimatedDocumentCount();
    projects = await mongoClient.db().collection("dev").estimatedDocumentCount();
    blogcategories = await mongoClient.db().collection("blogcategories").estimatedDocumentCount();
    devcategories = await mongoClient.db().collection("devcategories").estimatedDocumentCount();
    logo = await mongoClient.db().collection("logo").estimatedDocumentCount();
    print = await mongoClient.db().collection("print").estimatedDocumentCount();
    art = await mongoClient.db().collection("art").estimatedDocumentCount();
    vid = await mongoClient.db().collection("vid").estimatedDocumentCount();
    
    let calculateUploadSize = promisify(fastFolderSize);
    upload = await calculateUploadSize(projectpath.uploadpath);

    let result = {
        posts, projects, blogcategories, devcategories, logo, print, art, vid, upload,
        okay: true
    };

    return result;
}

module.exports = {
    getAttempts(page = 1, resultsPerPage = 20){
        return new Promise((resolve, reject) =>{
            let total = 0;
            let totalpages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*resultsPerPage;

            retrieveAttempts(resultsPerPage, skipped).then(result =>{
                total = result.total;
                totalpages = Math.ceil(total/resultsPerPage);
                data['pages'] = totalpages;
                data['rows'] = result.docs;
                data['okay'] = true;
                resolve(data);
                return;
            });
        });        
    },

    getStats(){
        return new Promise((resolve, reject)=>{
            retrieveStats().then(result =>{
                resolve(result);
                return;
            });
        });
    }
};
const fs = require('fs');
const path = require("path");
const mongoClient = require("./db");
const { ObjectId } = require('mongodb');
const projectpath = require('./projectpath');
const utils = require("./utils");

async function retrieveData(resultsPerPage, skipped){
    let crs = mongoClient.db().collection("dev").find().sort({"title": 1, "_id": 1}).limit(resultsPerPage).skip(skipped);
    let docs = await crs.toArray();
    let total = 0;
    total = await mongoClient.db().collection("dev").estimatedDocumentCount();

    let result = {
        docs, total
    };

    return result;
}

async function retrieveLiteData(resultsPerPage, skipped, orderByTitle){

    let sorting = {"title": 1, "_id": -1};
    if(!orderByTitle){
        sorting = {"time": -1, "_id": -1};
    }
    let cursor = mongoClient.db().collection("dev").find().sort(sorting).project({"title": 1, "url": 1, "abstract": 1, "time": 1, "currentversion": 1, "edit": 1}).limit(resultsPerPage).skip(skipped);
    let docs = await cursor.toArray();
    let total = 0;
    total = await mongoClient.db().collection("dev").estimatedDocumentCount();

    let result = {
        docs, total
    };

    return result;
}

async function findCategories(id){
    let crs = mongoClient.db().collection("devcategories").find({"projects": id}).sort({"name": 1, "_id": 1});
    let docs = await crs.toArray();
    return docs;
}

function insertIntoCategory(individualcategory, project_id){
    return new Promise((resolve, reject) =>{
        mongoClient.db().collection("devcategories").findOne({ "name": individualcategory}).then(category =>{
            if(category){
                let catid = category._id;
                let cat = category;
                delete cat["_id"];
                cat["projects"].push(project_id);
                mongoClient.db().collection("devcategories").updateOne({ "_id": catid}, {$set: cat}).then(result =>{
                    console.log("A2Dlog - Adding category " +individualcategory +"to project in DEV: ");
                    console.log(result);
                    resolve();
                }).catch(error =>{
                    console.log("A2Dlog - Error adding category " +individualcategory +"to project in DEV: ");
                    console.log(error);
                });
            }
            else{
                let projects = [];
                let url = utils.generateURL(individualcategory);
                let check = utils.checkURL(url, 3, "a categoria");
                if(check.test){
                    utils.setUniqueURL(url, "devcategories").then(uniqueURL =>{
                        projects.push(project_id);
                        let cat = {
                            name: individualcategory,
                            url: uniqueURL,
                            projects
                        }                        
                        mongoClient.db().collection("devcategories").insertOne(cat).then(result =>{
                            console.log("A2Dlog - Adding category " +individualcategory +"to project in DEV: ");
                            console.log(result);
                            resolve();
                        }).catch(error =>{
                            console.log("A2Dlog - Error adding category " +individualcategory +"to project in DEV: ");
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
            
        })
    });
}

function insertIntoCategories(categories, project_id){
    return new Promise((resolve, reject)=>{
        let calls = [];
        for(let i = 0; i < categories.length; i++){
            calls.push(insertIntoCategory(categories[i], project_id));
        }
        Promise.all(calls).then(()=>{
            resolve();
        }).catch(error =>{
            console.log(error);
            reject();
        });
    })
}

function removeFromCategory(removedcategory, project_id){
    return new Promise((resolve, reject) =>{
        mongoClient.db().collection("devcategories").findOne({ "name": removedcategory.name}).then(category =>{
            let catid = category._id;
            let cat = {};
            cat["projects"] = category.projects;
            let indexItem = utils.indexOfObjectIdArray(project_id, cat.projects);
            if(indexItem > -1){
                cat.projects.splice(indexItem, 1);
                //This category is now empty, so must be removed from database
                if(cat.projects.length === 0){
                    mongoClient.db().collection("devcategories").deleteOne({"_id": catid}).then(result =>{
                        console.log("A2Dlog - While removing project from category " +category.name +", it became empty and was removed: ");
                        console.log(result);
                        resolve();
                    }).catch(error =>{
                        console.log("A2Dlog - Error while removing category: " +category.name);
                        console.log(error);
                        reject();
                    });
                }
                else{
                    mongoClient.db().collection("devcategories").updateOne({"_id": catid}, {$set: cat}).then(result =>{
                        console.log("A2Dlog - Removing DEV project from category " +category.name +": ");
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

function removeFromCategories(removedCategories, project_id){
    return new Promise((resolve, reject) =>{
        let calls = [];
        for(let i = 0; i < removedCategories.length; i++){
            calls.push(removeFromCategory(removedCategories[i], project_id));
        }
        Promise.all(calls).then(()=>{
            resolve();
        }).catch(error =>{
            console.log(error);
            reject();
        })
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
            });
            doc.categories = catlist;
            resolve();
        });
    });
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
                console.log(`A2Dlog - Error deleting file: "${fullpath}". Error: ${error}`)
            }
        });
    }
}

function deleteCover(coverimg){
    let basename = path.parse(coverimg).base;
    let fullpath = projectpath.imagepath +basename;
    fs.unlink(fullpath, function(error){
        if(error){
            console.log(`A2Dlog - Error deleting file: "${fullpath}". Error: ${error}`)
        }
    });
}

function validateFields(fields){
    let isValid = true;
    let msg = "Os seguintes erros foram detectados: <br>";

    if(fields.title.trim() === ""){
        isValid = false;
        msg = msg + "Você deve digitar um título para o projeto.<br>";     
    }
    
    if(fields.title.length < 6){
        isValid = false;
        msg = msg + "Você deve digitar um título com, pelo menos, seis caracteres.<br>";
    }

    if(fields.time.trim() === ""){
        isValid = false;
        msg = msg + "Você deve inserir uma data para o projeto.<br>";
    }

    if(fields.abstract.trim() === ""){
        isValid = false;
        msg = msg + "Você deve fornecer um sumário para o projeto.<br>";
    }

    if(fields.status.trim() === ""){
        isValid = false;
        msg = msg + "Você deve fornecer o status do projeto.<br>";
    }

    if(fields.currentversion.trim() === ""){
        isValid = false;
        msg = msg + "Você deve informar a versão atual do projeto.<br>";
    }

    if(fields.externalurl.trim() !== ""){
        if(utils.validateURL(fields.externalurl.trim()) === null){
            isValid = false;
            msg = msg + "Você deve fornecer um URL válido para o link do projeto ou deixar o campo em branco.<br>";
        }
    }

    if(fields.repo.trim() !== ""){
        if(utils.validateURL(fields.repo.trim()) === null){
            isValid = false;
            msg = msg + "Você deve fornecer um URL válido para o repositório ou deixar o campo em branco.<br>"
        }
    }

    if(fields.license.trim() === ""){
        isValid = false;
        msg = msg + "Você deve informar a licença do projeto.<br>";
    }

    if(utils.validateURL(fields.licenseurl.trim()) === null){
        isValid = false;
        msg = msg + "Você deve inserir um URL válido para a licença do projeto.<br>";
    }

    if(fields.cat1.trim() === "" && fields.cat2.trim() === "" && fields.cat3.trim() === ""){
        isValid = false;
        msg = msg + "Você deve incluir o projeto em pelo menos uma categoria.";
    }

    return {
        isValid, msg
    };
}

function saveProject(fields, files){
    return new Promise((resolve, reject)=>{
        let doc = {};

        doc["overview"] = JSON.parse(fields.overview);
        doc["intro"] = JSON.parse(fields.intro);
        doc["manual"] = JSON.parse(fields.manual);
        doc["resources"] = JSON.parse(fields.resources);
        doc["changelog"] = JSON.parse(fields.changelog);

        let images = [];
        images = images.concat(
            listImages(doc["overview"].blocks),
            listImages(doc["intro"].blocks),
            listImages(doc["manual"].blocks),
            listImages(doc["resources"].blocks),
            listImages(doc["changelog"].blocks)
        );

        doc["images"] = images;

        doc["time"] = fields.time;
        
        let checkfields = validateFields(fields);

        if(!checkfields.isValid){
            reject({
                okay: false,
                msg: check.msg
            });
            return;
        }

        doc["title"] = utils.removeExcessWhitespaces(fields.title);
        doc["abstract"] = fields.abstract.trim();
        doc["status"] = fields.status.trim();
        doc["currentversion"] = fields.currentversion.trim();
        doc["externalurl"] = fields.externalurl.trim();
        doc["repo"] = fields.repo.trim();
        doc["license"] = fields.license.trim();
        doc["licenseurl"] = fields.licenseurl.trim();

        let url = utils.generateURL(doc["title"]);
        let checkurl = utils.checkURL(url);

        if(!checkurl.test){
            reject({
                okay: false,
                msg: checkurl.msg
            });
            return;
        }

        utils.setUniqueURL(url, "dev").then(uniqueURL =>{
            doc["url"] = uniqueURL;            

            //Check cover image
            if(files.coverimg.size > 0){
                //Moving image do /upload/images/
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

            //Check categories
            let categories = [];
            if(fields.cat1.trim() !== ""){                
                categories.push(utils.removeExcessWhitespaces(fields.cat1));
            }
            if(fields.cat2.trim() !== ""){
                categories.push(utils.removeExcessWhitespaces(fields.cat2));
            }
            if(fields.cat3.trim() !== ""){
                categories.push(utils.removeExcessWhitespaces(fields.cat3));
            }

            //Check and remove repeated categories
            for(let i = 0; i < categories.length; i++){
                for(let j = categories.length; j > -1; j--){
                    if(i === j);
                    else{
                        if(categories[i] === categories[j]){
                            categories.splice(j, 1);
                        }
                    }
                }
            }

            //Insert project into database
            mongoClient.db().collection("dev").insertOne(doc).then(result =>{
                let id = result.insertedId;
                console.log("A2Dlog - Inserting data in DEV: ");
                console.log(result);

                //Insert into categories
                insertIntoCategories(categories, id).then(()=>{
                    resolve({
                        okay: true,
                        msg: "Projeto cadastrado com sucesso!"
                    });
                }).catch(rejection =>{
                    reject({
                        okay: false,
                        msg: "Categoria em formato inválido: ela deve possuir pelo menos uma palavra com, no mínimo, 3 caracteres."
                    });
                });
            });
        });

        
    });
}

function editProject(fields, files){
    return new Promise((resolve, reject)=>{
        let id = ObjectId(fields._id);
        let newurl = false;
        let doc = {};
        let calls = [];

        doc["overview"] = JSON.parse(fields.overview);
        doc["intro"] = JSON.parse(fields.intro);
        doc["manual"] = JSON.parse(fields.manual);
        doc["resources"] = JSON.parse(fields.resources);
        doc["changelog"] = JSON.parse(fields.changelog);

        let images = [];
        images = images.concat(
            listImages(doc["overview"].blocks),
            listImages(doc["intro"].blocks),
            listImages(doc["manual"].blocks),
            listImages(doc["resources"].blocks),
            listImages(doc["changelog"].blocks)
        );

        doc["images"] = images;
        doc["time"] = fields.time;
        doc["edit"] = fields.currenttime;

        let checkfields = validateFields(fields);

        if(!checkfields.isValid){
            reject({
                okay: false,
                msg: check.msg
            });
            return;
        }

        mongoClient.db().collection("dev").findOne({"_id": id}).then(olddoc =>{
            //Check cover image
            let oldcoverdelete = "";
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

                //Check if the project already had a cover image
                //If TRUE, delete old cover image
                //Do nothing if NO previous image was uploaded
                if(typeof olddoc.coverimg !== "undefined"){
                    oldcoverdelete = olddoc.coverimg;
                }
            }

            //Check if new TITLE is empty, use old TITLE if so
            if(fields.title.trim() === "" || fields.title.trim() === olddoc.title){
                doc["title"] = olddoc.title;
            }
            else{
                if(fields.title.length < 6){
                    reject({
                        okay: false,
                        msg: "Erro: o projeto deve ter um título com, pelo menos, seis caracteres."
                    });
                    return;
                }
                else{
                    doc["title"] = utils.removeExcessWhitespaces(fields.title);

                    let url = utils.generateURL(doc["title"]);
                    let checkurl = utils.checkURL(url);

                    if(!checkurl.test){
                        reject({
                            okay: false,
                            msg: checkurl.msg
                        });
                        return;
                    }
                    else{
                        newurl = true;
                        calls.push(utils.setUniqueURL(url, "dev", id));
                    }
                }
            }

            if(fields.abstract.trim() === ""){
                doc["abstract"] = olddoc.abstract;
            }
            else{
                doc["abstract"] = fields.abstract.trim();
            }

            if(fields.status.trim() === ""){
                doc["status"] = olddoc.status;
            }
            else{
                doc["status"] = fields.status.trim();
            }
            
            if(fields.currentversion.trim() === ""){
                doc["currentversion"] = olddoc.currentversion;
            }
            else{
                doc["currentversion"] = fields.currentversion.trim();
            }

            if(fields.externalurl.trim() === ""){
                doc["externalurl"] = "";
            }
            else{
                if(utils.validateURL(fields.externalurl.trim()) === null){
                    reject({
                        okay: false,
                        msg: "Você deve fornecer um URL válido para o link do projeto ou deixar o campo em branco."
                    });
                    return;
                }
                else{
                    doc["externalurl"] = fields.externalurl.trim();
                }
            }

            if(fields.repo.trim() === ""){
                doc["repo"] = "";
            }
            else{
                if(utils.validateURL(fields.repo.trim()) === null){
                    reject({
                        okay: false,
                        msg: "Você deve fornecer um URL válido para o link do repositório ou deixar o campo em branco."
                    });
                    return;
                }
                else{
                    doc["repo"] = fields.repo.trim();
                }
            }

            if(fields.license.trim() === ""){
                doc["license"] = olddoc.license;
            }
            else{
                doc["license"] = fields.license.trim();
            }

            if(fields.licenseurl.trim() === ""){
                doc["licenseurl"] = olddoc.licenseurl;
            }
            else{
                if(utils.validateURL(fields.licenseurl.trim()) === null){
                    reject({
                        okay: false,
                        msg: "Você deve fornecer um URL válido para a licença do projeto ou deixar o campo em branco."
                    });
                    return;
                }
                else{
                    doc["licenseurl"] = fields.licenseurl.trim();
                }
            }

            //Check project image list for changes
            let deleteimages = false;
            let dellist = olddoc.images;

            if(doc.images.length === 0 && olddoc.images.length > 0){
                //Delete all previous images, if they exist
                deleteimages = true;
            }
            else if(doc.images.length > 0){
                //Check images for deletion
                if(dellist.length > 0){                    
                    for(let i = 0; i < doc.images.length; i++){
                        for(let j = 0; j < dellist.length; j++){
                            if(doc.images[i] === dellist[j]){
                                dellist.splice(j,1);
                                j = dellist.length;
                            }
                        }
                    }
                    if(dellist.length > 0){
                        deleteimages = true;
                    }
                }
            }

            //Check categories
            if(fields.cat1.trim() === "" && fields.cat2.trim() === "" && fields.cat3.trim() === ""){
                reject({
                    okay: false,
                    msg: "O projeto deve possuir pelo menos uma categoria"
                });
                return;
            }

            let categories = [];
            if(fields.cat1.trim() !== ""){                
                categories.push(utils.removeExcessWhitespaces(fields.cat1));
            }
            if(fields.cat2.trim() !== ""){
                categories.push(utils.removeExcessWhitespaces(fields.cat2));
            }
            if(fields.cat3.trim() !== ""){
                categories.push(utils.removeExcessWhitespaces(fields.cat3));
            }

            //Check and remove repeated categories
            for(let i = 0; i < categories.length; i++){
                for(let j = categories.length; j > -1; j--){
                    if(i === j);
                    else{
                        if(categories[i] === categories[j]){
                            categories.splice(j, 1);
                        }
                    }
                }
            }

            findCategories(id).then(oldcategories =>{
                //Remove project ObjectId from deleted categories
                //Add project ObjetcId to new categories
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
                                deletedcategories.splice(index, 1);
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
                                newcategories.splice(index, 1);
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
                    }

                    mongoClient.db().collection("dev").updateOne({"_id": id}, {$set: doc}).then(result =>{
                        console.log('A2Dlog - UPDATE in DEV project:');
                        console.log(result);

                        //Delete old cover image?
                        if(oldcoverdelete !== ""){
                            deleteCover(oldcoverdelete);
                        }

                        if(deleteimages){
                            deleteFiles(dellist);
                        }

                        resolve({
                            okay: true,
                            msg: "Projeto atualizado com sucesso!"
                        });
                        return;
                    })
                }).catch(rejection =>{
                    console.log("A2Dlog - Error updating DEV project: ");
                    console.log(rejection);
                    reject({
                        okay: false,
                        msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                    });
                    return;
                })


            });//findCategories(id)


                        
        });//mongoClient.db().collection("dev").findOne({"_id": id})
    });//return new Promise()
}

module.exports = {
    delete(id){
        id = ObjectId(id);
        let deletedimages = [];
        let coverimg = "";
        return new Promise((resolve, reject)=>{

            mongoClient.db().collection("dev").findOne({ _id: id}).then(doc =>{
                if(typeof doc.coverimg !== "undefined"){
                    coverimg = doc.coverimg;
                }
                deletedimages = doc.images;
                findCategories(id).then(categories =>{
                    removeFromCategories(categories, id).then(()=>{
                        mongoClient.db().collection("dev").deleteOne({_id: id}).then(response =>{
                            console.log(response);
                            if(coverimg !== ""){
                                deleteCover(coverimg);
                            }
                            deleteFiles(deletedimages);
                            resolve({
                                okay: true,
                                msg: "Projeto removido com sucesso!"
                            });
                            return;
                        }).catch(error =>{
                            console.log("A2Dlog - Error removing DEV project: ");
                            console.log(error);
                            reject({
                                okay: false,
                                msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                            });
                            return;
                        });
                    });//removeFromCategories(categories, id)
                });//findCategories(id)
            });//mongoClient.db().collection("dev").findOne({ _id: id})
        });//return new Promise()
    },

    getCategories(excludeURL = false, excludeProjects = false){
        let projection = {};
        projection["_id"] = 0;
        if(excludeURL){
            projection["url"] = 0;
        }
        if(excludeProjects){
            projection["projects"] = 0;
        }

        return new Promise((resolve, reject)=>{
            let cursor = mongoClient.db().collection("devcategories").find().project(projection).sort({"name": 1});
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
            })
        })

    },

    getCategoryName(url){
        return new Promise((resolve, reject) =>{
            mongoClient.db().collection("devcategories").findOne({"url": url}, {"name": 1}).then(category =>{
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

    getCategoryProjects(url, page = 1, resultsPerPage = 10){
        return new Promise((resolve, reject)=>{
            if(page < 1){
                reject({
                    okay: false,
                    msg: "Página inválida para esta categoria."
                });
                return;
            }

            mongoClient.db().collection("devcategories").findOne({"url": url}).then(category =>{
                if(!category){
                    reject({
                        okay: false,
                        msg: "Não foi possível encontrar nenhum projeto com esse endereço."
                    });
                    return;
                }

                let length = category.projects.length;
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
                let projectsToFind = [];
                for(let i = skip; i > limiter; i--){
                    projectsToFind.push(category.projects[i]);
                }

                let cursor = mongoClient.db().collection("dev").find({"_id": {$in: projectsToFind}}).sort({"title": 1, "time": -1}).project({"title": 1, "url": 1, "abstract": 1, "time": 1, "currentversion": 1, "edit": 1});

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
                        return;
                    });
                }).catch(error =>{
                    console.log(error);
                    reject({
                        okay: false,
                        msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                    });
                    return;
                });
                
            })
        });
    },

    getData(page, resultsPerPage = 10, omitid = false){
        return new Promise((resolve, reject)=>{            
            let total = 0;
            let totalpages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*resultsPerPage;

            retrieveData(resultsPerPage, skipped).then(result =>{
                total = result.total;
                totalpages = Math.ceil(total/resultsPerPage);
                data["pages"] = totalpages;
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
                });//setCategories
            }).catch(error =>{
                console.log(`A2Dlog - Error retrieving DEV projects at page ${page}: ${error}`);
                reject({
                    okay: false,
                    msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                });
                return;
            });
        });//return new Promise()
    },

    getLiteData(page, resultsPerPage = 10, orderByTitle = true){
        return new Promise((resolve, reject)=>{
            let total = 0;
            let totalpages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*resultsPerPage;

            retrieveLiteData(resultsPerPage, skipped, orderByTitle).then(result =>{
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
                    
                });//setCategories()
            }).catch(error =>{
                console.log(`A2Dlog - Error retrieving DEV projects at page ${page}: ${error}`);
                reject({
                    okay: false,
                    msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                });
                return;
            });//retrieveLiteData()

        });//return new Promise()
    },

    getProject(url){
        return new Promise((resolve, reject)=>{
            mongoClient.db().collection("dev").findOne({"url": url}).then(result =>{
                if(result){
                    let doc = result;
                    setCategory(doc).then(()=>{
                        delete doc["_id"];
                        resolve({
                            okay: true,
                            doc
                        });
                        return;
                    });
                }
                else{
                    reject({
                        okay: false,
                        msg: "Erro: não foi possível encontrar um projeto com este endereço."
                    });
                    return;
                }
            })
        });
    },

    getProjectListing(){
        return new Promise((resolve, reject)=>{
            let crs = mongoClient.db().collection("dev").find().sort({"title": 1, "_id": 1}).project({"title": 1, "url": 1, "_id": 0});

            crs.toArray().then(docs =>{
                resolve({
                    okay: true,
                    docs
                });
                return;
            }).catch(error =>{
                console.log(`A2Dlog - Error retrieving DEV project listing: ${error}`);
                reject({
                    okay: false,
                    msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                });
                return;
            });
        });
    },

    save(fields, files){
        return new Promise((resolve, reject)=>{
            //SAVE OR EDIT DEV PROJECT?
            //SAVE PROJECT
            if(fields._id === ""){
                saveProject(fields, files).then(result =>{
                    resolve(result);
                    return;
                }).catch(rejection=>{
                    reject(rejection);
                    return;
                });
            }
            //EDIT PROJECT
            else{
                editProject(fields, files).then(result =>{
                    resolve(result);
                    return;
                }).catch(rejection =>{
                    reject(rejection);
                    return;
                });
            }
        });
    }
}


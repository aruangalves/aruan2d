const fs = require('fs');
const path = require('path');
const mongoClient = require('./db');
const { ObjectId } = require('mongodb');
const projectpath = require('./projectpath');

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
                console.log(`A2Dlog - Error while deleting file: "${fullpath}". Error: ${error}`);
            }
        });
    }
}

module.exports = {
    retrieve(){
        return new Promise((resolve,reject)=>{
            mongoClient.db().collection("about").findOne().then(doc =>{
                if(doc){                    
                    resolve({doc, status: true});
                    return;
                }
                else{                    
                    resolve({status: false});
                    return;
                }
            }).catch(error =>{
                console.log("A2Dlog - Error while retriveing data from page ABOUT: " +error);
                reject({status: false});
                return;
            });
        });
        
    },

    save(fields, files){
        return new Promise((resolve, reject)=>{
            let doc = {};
            let data = JSON.parse(fields.data);
            doc["data"] = data;
            //List uploaded images
            let images = listImages(data.blocks);
            doc["images"] = images;
            //SAVE OR EDIT ABOUT?
            //SAVE
            if(fields._id === ""){
                if(files.img.size > 0){
                    //Moving and renaming image to /upload/images/avatar.extension
                    let ext = path.parse(files.img.filepath).ext;
                    fs.rename(
                        files.img.filepath,
                        projectpath.imagepath +"avatar" +ext,
                        function(error){
                            console.log("A2Dlog - Error while moving profile avatar: ", error);
                            reject({
                                okay: false,
                                msg: "Erro interno do servidor, pro favor tente novamente mais tarde."
                            });
                            return;
                        }
                    );
                    doc["img"] = "/upload/images/avatar" +ext;

                    mongoClient.db().collection("about").insertOne(doc).then(result =>{
                        console.log("A2Dlog - Inserting data to section ABOUT: ");
                        console.log(result);
                        resolve({
                            okay: true,
                            msg: "Seção atualizada com sucesso!"
                        });
                        return;
                    });
                }
                else{
                    reject({
                        okay: false,
                        msg: "Você deve inserir uma imagem de perfil."
                    });
                    return;
                }
            }
            //EDIT
            else{
                mongoClient.db().collection("about").findOne({ _id: ObjectId(fields._id)}).then(result =>{
                    let olddoc = result;
                    if(files.img.size > 0){
                        //Moving and renaming image to /upload/images/avatar.extension
                        let ext = path.parse(files.img.filepath).ext;
                        fs.rename(
                            files.img.filepath,
                            projectpath.imagepath +"avatar" +ext,
                            function(error){
                                console.log("A2Dlog - Error while moving profile avatar: ", error);
                                reject({
                                    okay: false,
                                    msg: "Erro interno do servidor, pro favor tente novamente mais tarde."
                                });
                                return;
                            }
                        );
                        doc["img"] = "/upload/images/avatar" +ext;
                    }
                    else{
                        doc["img"] = olddoc.img;
                    }
                    let deletefiles = false;
                    if(doc.images.length === 0){
                        //DELETE ALL IMAGES STORED
                        if(olddoc.images.length > 0){
                            deletefiles = true;
                        }
                    }
                    else if(doc.images.length > 0){
                        //CHECK IMAGES FOR DELETION
                        if(olddoc.images.length > 0){
                            deletefiles = true;
                            for(let i = 0; i < doc.images.length; i++){
                                for(let j = 0; j < olddoc.images.length; j++){
                                    if(doc.images[i] === olddoc.images[j]){
                                        olddoc.images.splice(j,1);
                                        j = olddoc.images.length;
                                    }
                                }
                            }
                            
                        }
                    }

                    mongoClient.db().collection("about").updateOne({"_id": ObjectId(fields._id)}, {$set: doc}).then(result =>{
                        console.log(result);                        
                        if(deletefiles){
                            deleteFiles(olddoc.images);
                        }
                        resolve({
                            okay: true,
                            msg: "Seção atualizada com sucesso!"
                        });
                        return;
                    }).catch(error =>{
                        console.log("A2Dlog - Error while updating ABOUT section: ", error);
                        reject({
                            okay: false,
                            msg: "Erro interno do servidor, pro favor tente novamente mais tarde."
                        });
                        return;
                    });


                });
                
            }


        });
        
    }
}
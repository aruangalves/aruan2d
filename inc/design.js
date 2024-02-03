var mongoClient = require('./db');
var projectpath = require('./projectpath');
var fs = require('fs');
var path = require('path');
const { ObjectId } = require('mongodb');

async function retrieveData(collection, perpage, skipped, omitid = false){


    let crs = mongoClient.db().collection(collection).find().sort({ "date": -1, "_id": 1}).limit(perpage).skip(skipped);    
    let docs = await crs.toArray();    
    let total = 0;
    total = await mongoClient.db().collection(collection).estimatedDocumentCount();
    if(omitid){
        docs.forEach(doc =>{
            delete doc["_id"];
        });
    }
    let result = {
        docs, total
    };
    return result;    
}

async function updateDoc(collection, id, fields){    
    mongoClient.db().collection(collection).updateOne({ "_id": id}, { $set: fields}, function(result){
        return result;
    });
}

function moveImage(imagefile){
    let basename = path.parse(imagefile.filepath).base;
    let imagepath = `/upload/images/${basename}`;                                
    fs.rename(imagefile.filepath,
        projectpath.imagepath +basename,
        function(error){
            if(error){
                return {ack: false, output: error};
                
            }
        }
    );
    return {ack: true, output: imagepath};
    
}

function formatDelFile(delfile, type){
    let delpath = "";
    switch(type){
        case 'image':
            delpath = projectpath.imagepath +delfile;
            console.log('A2Dlog - File for deletion: ', delpath);
            return delpath;        
        case 'video':
            delpath = projectpath.videopath +delfile;
            console.log('A2Dlog - File for deletion: ', delpath);
            return delpath;                
        case 'thumb':
            delpath = projectpath.thumbpath +delfile;
            console.log('A2Dlog - File for deletion: ', delpath);
            return delpath;
    }
}

function deleteFiles(deletedfiles){
    for(let i = 0; i < deletedfiles.length; i++){
        fs.unlink(deletedfiles[i].toString(), function(error){
            if(error){
                console.log(`A2Dlog - Error deleting file: ${deletedfiles[i]} `, error);
            }
        });
    }
}

function checkCommonFields(fields, type){
    if(fields[type +'title'] === ""){
        return {isValid: false, msg: 'Você deve inserir um título.'};
    }
    if(fields[type +'date'] === ""){
        return {isValid: false, msg: 'Você deve inserir uma data.'};
    }
    if(fields[type +'desc'] === ""){
        return {isValid: false, msg: 'Você deve inserir uma descrição.'};
    }
    return {isValid: true, msg: ""};
}

module.exports = {
    getData(collection, page){
        //collection: logo, print, art or vid        
        return new Promise((resolve, reject) =>{
            let total = 0;
            let perpage = 10;            
            let pages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*perpage;

            retrieveData(collection, perpage, skipped).then(result =>{                
                total = result.total;
                pages = Math.ceil(total/perpage);
                data['pages'] = pages;                
                data['rows'] = result.docs;                
                resolve(data);
                return;
            })
            .catch(err =>{
                console.log(`A2Dlog - Error retrieving data from collection ${collection}: `, err);
                reject({error: "Erro interno do servidor, por favor tente novamente mais tarde."});
                return;
            });
        });


    },
    
    getData(collection, page, itemsperpage = 10, omitid = false){
        //collection: logo, print, art or vid        
        return new Promise((resolve, reject) =>{
            let total = 0;                       
            let pages = 0;
            let data = {};
            let skipped = (parseInt(page)-1)*itemsperpage;

            retrieveData(collection, itemsperpage, skipped, omitid).then(result =>{                
                total = result.total;
                pages = Math.ceil(total/itemsperpage);
                data['pages'] = pages;                
                data['rows'] = result.docs;                
                resolve(data);
                return;
            })
            .catch(err =>{
                console.log(`A2Dlog - Error retrieving data from collection ${collection}: `, err);
                reject({error: "Erro interno do servidor, por favor tente novamente mais tarde."});                        
                return;
            });
        });


    },

    save(fields, files, type){
        //type = 'logo','print','art' or 'vid'
        return new Promise((resolve, reject) =>{
            //CREATE new or UPDATE design item?
            //CREATE new design item
            if(fields[type +'id'] === ""){
                //CREATE NEW ART
                console.log('A2Dlog - Form fields: ');
                console.log(fields);
                if(type === 'vid'){
                    if(files.vidfile.size > 0){

                        if(files.vidthumb.size > 0){
                            let check = checkCommonFields(fields, type);
                            if(check.isValid === false){
                                reject({msg: check.msg});
                            }
                            else{
                                //UPLOAD OF VIDEO FORM FIELDS AND DATA...
                                let basename = path.parse(files.vidfile.filepath).base;
                                let video = `/upload/videos/${basename}`;
                                fs.rename(files.vidfile.filepath,
                                    projectpath.videopath +basename,
                                    function(error){
                                        if(error){
                                            console.log('A2Dlog - Error moving video file: ', error);                                            
                                            reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                            return;
                                        }
                                    }
                                );
                                basename = path.parse(files.vidthumb.filepath).base;
                                let thumb = `/upload/videos/thumbs/${basename}`;
                                fs.rename(files.vidthumb.filepath,
                                    projectpath.thumbpath +basename,
                                    function(error){
                                        if(error){
                                            console.log('A2Dlog - Error moving video thumbnail file: ', error);
                                            reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                            return;
                                        }
                                    }
                                );                                
                                fields.thumb = thumb;
                                //FINISH VIDEO UPLOAD HERE
                                
                                let doc = {
                                    vid: video,
                                    title: fields.vidtitle,
                                    date: fields.viddate,
                                    desc: fields.viddesc,
                                    thumb: thumb
                                };
                                mongoClient.db().collection(type).insertOne(doc).then(result=>{
                                    console.log('A2Dlog - Inserting video data into database: ');
                                    console.log(result);
                                        
                                    resolve({msg: "Vídeo cadastrado com sucesso!"});                                        
                                    return;
                                }).catch(error =>{
                                    console.log('A2Dlog - Error inserting video data into database: ', error);
                                        
                                    reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});                                        
                                    return;
                                });                                    
                                    
                                
                            }

                        }
                        else{
                            reject({msg: "Você deve incluir uma thumbnail para o vídeo."});
                        }

                    }
                    else{
                        reject({msg: "Você deve incluir um arquivo de vídeo"});
                    }

                }
                else{
                    //CHECK MAIN IMAGE UPLOAD
                    if(files[type +'img'].size > 0){

                        let check = checkCommonFields(fields, type);
                        if(check.isValid === false){
                            reject({msg: check.msg});
                        }
                        else{
                            //CHECKING GALLERY UPLOAD                            
                            if(type === 'logo' || type === 'print'){
                                let gallery = [];
                                let gallerycount = parseInt(fields[type +'gno']); 
                                if(gallerycount > 0){                                                                       
                                    for(let i = 1; i <= gallerycount; i++){                                        
                                        if(files[type +'gi' +i].size > 0 && fields[type +'gt' +i] !== ""){
                                            let basename = path.parse(files[type +'gi' +i].filepath).base;
                                            let name = path.parse(files[type +'gi' +i].filepath).name;
                                            let gfile = `/upload/images/${basename}`;
                                            fs.rename(files[type +'gi' +i].filepath,
                                                projectpath.imagepath +basename,
                                                function(error){
                                                    if(error){
                                                        console.log(`A2Dlog - Error moving image from gallery #${i} of ${type}: `, error);
                                                        reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                                        return;
                                                    }
                                                }
                                            );
                                            gallery.push({
                                                item: name,
                                                image: gfile,
                                                desc: fields[type +'gt' +i]
                                            });                                            
                                        }
                                        else{
                                            reject({msg: `Você deve inserir uma imagem e uma descrição para o item #${i} da galeria.`});
                                        }
                                    }
                                    
                                }
                                fields.gallery = gallery;
                            }
                            //ART DOES NOT HAVE GALLERY, SKIP CHECK
                            let basename = path.parse(files[type +'img'].filepath).base;
                            let imagepath = `/upload/images/${basename}`;                                
                            fs.rename(files[type +'img'].filepath,
                                projectpath.imagepath +basename,
                                function(error){
                                    if(error){
                                        console.log(`A2Dlog - Error moving main image of ${type}`, error);
                                        reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                        return;
                                    }
                                }
                            );
                            //FINISH LOGO, PRINT AND ART UPDATE HERE
                            let doc = {
                                img: imagepath,
                                title: fields[type +'title'],
                                date: fields[type +'date'],
                                desc: fields[type +'desc']
                            };
                            if(type === 'logo' || type === 'print'){
                                if(fields.gallery.length > 0){
                                    doc["gallery"] = fields.gallery;
                                    doc["glen"] = fields.gallery.length;
                                }
                            }
                            
                            mongoClient.db().collection(type).insertOne(doc).then(result =>{
                                console.log(result);
                                let output = "";
                                if(type === 'logo') output = 'Logo cadastrada com sucesso!';
                                else if(type === 'print') output = 'Material gráfico cadastrado com sucesso!';
                                else if(type === 'art') output = 'Arte cadastrada com sucesso!';
                                    
                                resolve({msg: output});                                    
                                return;
                            }).catch(error =>{
                                console.log(error);
                                    
                                reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});                                    
                                    return;
                            });                                
                            
                        }                        
                    }
                    else{
                        reject({msg: "Você deve incluir uma imagem principal."});
                    }                    
                }                
            }
            else{
            //UPDATE design item
                let id = ObjectId(fields[type +'id']);
                let doc = {};
                let deletedfiles = [];
                if(fields[type +'title'] !== ""){
                    doc["title"] = fields[type +'title'];
                }
                if(fields[type +'date'] !== ""){
                    doc["date"] = fields[type +'date'];
                }
                if(fields[type +'desc'] !== ""){
                    doc["desc"] = fields[type +'desc'];
                }

                //VIDEO UPDATE
                if(type === 'vid'){

                    let changevideo = false;
                    let changethumb = false;            
                    if(files.vidfile.size > 0){
                        let basename = path.parse(files.vidfile.filepath).base;
                        let video = `/upload/videos/${basename}`;
                        fs.rename(
                            files.vidfile.filepath,
                            projectpath.videopath +basename,
                            function(error){
                                if(error){
                                    console.log('A2Dlog - Error moving video file: ', error);
                                    reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                    return;
                                }
                            }
                        );
                        doc["vid"] = video;
                        changevideo = true;                     
                    }
                    if(files.vidthumb.size > 0){
                        let basename = path.parse(files.vidthumb.filepath).base;
                        let thumb = `/upload/videos/thumbs/${basename}`;
                        fs.rename(
                            files.vidthumb.filepath,
                            projectpath.thumbpath +basename,
                            function(error){
                                if(error){
                                    console.log('A2Dlog - Error moving video thumbnail file: ', error);
                                    reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                    return;
                                }
                            }
                        );
                        doc["thumb"] = thumb;
                        changethumb = true;
                    }

                    if(changevideo || changethumb){
                        mongoClient.db().collection(type).findOne({ "_id": id}).then(result =>{
                            let delfile = "";
                            let basename = ""
                            if(changevideo){
                                basename = result.vid.toString();
                                delfile = formatDelFile(path.parse(basename).base, 'video');                                
                                deletedfiles.push(delfile);
                            }
                            if(changethumb){
                                basename = result.thumb.toString();
                                delfile = formatDelFile(path.parse(basename).base, 'thumb');                                
                                deletedfiles.push(delfile);
                            }

                            updateDoc(type, id, doc).then(result =>{
                                console.log("A2Dlog - Video successfully updated: ", result);
                                deleteFiles(deletedfiles);
                                resolve({msg: "Vídeo atualizado com sucesso!"});
                                return;
                                

                            }).catch(error =>{
                                console.log("A2Dlog - Error updating video: ", error);
                                reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                return;
                            });

                        });
                    }
                    else{
                        updateDoc(type, id, doc).then(result =>{
                            console.log("A2Dlog - Video successfully updated: ", result);
                            resolve({msg: "Vídeo atualizado com sucesso!"});
                            return;
                        }).catch(error =>{
                            console.log("A2Dlog - Error updating video: ", error);
                            reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                            return;
                        });;
                    }


                    
                }
                //UPDATE LOGO, PRINT OR ART
                else{                    
                    //CHECK LOGO OR PRINT FOR GALLERY ITEMS FOR UPDATE
                    if(type === 'logo' || type === 'print'){
                        let gallery = [];
                        let deletegallery = false;
                        mongoClient.db().collection(type).findOne({ "_id": id}).then(result =>{                            
                            //NO GALLERY IN DATABASE, JUST INSERT NEW ITEMS INTO GALLERY IF THEY EXIST
                            if(typeof result.gallery === "undefined"){
                                let newgallerycount = parseInt(fields[type +'gno']);
                                if(newgallerycount > 0){
                                    for(let i = 1; i<= newgallerycount; i++){
                                        if(files[type +'gi' +i].size > 0 && fields[type +'gt' +i] !== ""){
                                            let basename = path.parse(files[type +'gi' +i].filepath).base;
                                            let name = path.parse(files[type +'gi' +i].filepath).name;
                                            let gfile = `/upload/images/${basename}`;
                                            fs.rename(
                                                files[type +'gi' +i].filepath,
                                                projectpath.imagepath +basename,
                                                function(error){
                                                    if(error){
                                                        console.log(`A2Dlog - Error moving image from gallery #${i} of ${type}: `, error);
                                                        reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                                        return;
                                                    }
                                                }
                                            );
                                            gallery.push({
                                                item: name,
                                                image: gfile,
                                                desc: fields[type +'gt' +i]
                                            });
                                        }
                                        else{
                                            reject({msg: `Você deve inserir uma imagem e uma descrição para o item #${i} da galeria.`});
                                            return;
                                        }
                                    }
                                    doc["gallery"] = gallery;
                                    doc["glen"] = newgallerycount;

                                }
                            }
                            //GALLERY ALREADY IN DATABASE, CHECK FOR CHANGES
                            else{
                                //CHECK IF ANY GALLERY ITEM WAS DELETED FROM FORM
                                let oldgallery = result.gallery;                                
                                let newgallerycount = parseInt(fields[type +'gno']);
                                

                                if(newgallerycount === 0){
                                    //IT HAD ITEMS IN GALLERY, BUT ALL ITEMS MUST BE DELETED
                                    deletegallery = true;
                                }
                                else{
                                    //THERE ARE ITEMS IN NEW GALLERY                                    
                                    for(let i = 1; i<= newgallerycount; i++){
                                        let name = "";
                                        let gfile = "";                                    
                                        let basename = "";
                                        let hiddenid = fields[type +'gh' +i];
                                        console.log("A2Dlog - Evaluating file form field: ", i);
                                        if(hiddenid !== ""){
                                        //REPLACE NEW IMAGE ON GALLERY ITEM
                                            if(files[type +'gi' +i].size > 0){
                                                console.log(`O campo ${i} tem um arquivo novo.`);
                                                basename = path.parse(files[type +'gi' +i].filepath).base;
                                                name = path.parse(files[type +'gi' +i].filepath).name;
                                                gfile = `/upload/images/${basename}`;
                                                fs.rename(
                                                    files[type +'gi' +i].filepath,
                                                    projectpath.imagepath +basename,
                                                    function(error){
                                                        if(error){
                                                            console.log(`Erro ao mover imagem da galeria #${i} de ${type}: `, error);
                                                            reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                                            return;
                                                        }
                                                    }
                                                );
    
                                                //SET OLD IMAGE FOR DELETION ON GALLERY ITEM                                                
                                                //SET GALLERY ITEM DESCRIPTION (If form field was empty, just keep the old description from database)                                                
                                                let text = "";
                                                for(let j = 0; j < oldgallery.length; j++){
                                                    if(oldgallery[j].item === hiddenid){
                                                        let delfile = formatDelFile(path.parse(oldgallery[j].image).base, 'image');                                                        
                                                        deletedfiles.push(delfile);
                                                        if(fields[type +'gt' +i] !== ""){
                                                            text = fields[type +'gt' +i]
                                                        }
                                                        else{
                                                            text = oldgallery[j].desc;
                                                        }
                                                        oldgallery.splice(j,1);
                                                        j = oldgallery.length;
                                                    }
                                                }                                                
                                                gallery.push({
                                                    item: name,
                                                    image: gfile,
                                                    desc: text
                                                });
    
                                            }
                                            //KEEP EXISTING IMAGE FOR GALLERY ITEM
                                            else{
                                                console.log(`A2Dlog - Field ${i} has an existing file.`);
                                                for(let j = 0; j < oldgallery.length; j++){
                                                    if(oldgallery[j].item === hiddenid){                                                        
                                                        let text = "";
                                                        if(fields[type +'gt' +i] !== ""){
                                                            text = fields[type +'gt' +i];
                                                        }
                                                        else{
                                                            text = oldgallery[j].desc;
                                                        }
                                                        gallery.push({
                                                            item: oldgallery[j].item,
                                                            image: oldgallery[j].image,
                                                            desc: text
                                                        });
                                                        oldgallery.splice(j,1);
                                                        j = oldgallery.length;
                                                    }
                                                }
                                            }
                                        }
                                        else{
                                        //ALL ITEMS FOR GALLERY ARE NEW, VALIDATE THEM
                                            if(files[type +'gi' +i].size > 0 && fields[type +'gt' +i] !== ""){
                                                let basename = path.parse(files[type +'gi' +i].filepath).base;
                                                let name = path.parse(files[type +'gi' +i].filepath).name;
                                                let gfile = `/upload/images/${basename}`;
                                                fs.rename(
                                                    files[type +'gi' +i].filepath,
                                                    projectpath.imagepath +basename,
                                                    function(error){
                                                        if(error){
                                                            console.log(`A2Dlog - Error moving image from gallery #${i} of ${type}: `, error);
                                                            reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                                            return;
                                                        }
                                                    }
                                                );
                                                gallery.push({
                                                    item: name,
                                                    image: gfile,
                                                    desc: fields[type +'gt' +i]
                                                });
                                            }
                                            else{
                                                reject({msg: `Você deve inserir uma imagem e uma descrição para o item #${i} da galeria.`});
                                                return;
                                            }
                                        }
                                    }
                                    //SET THE REMAINDER OLD GALLERY ITEMS FOR DELETION, THESE ARE NOT USED BY ANY NEW GALLERY ITEMS
                                    if(oldgallery.length > 0){
                                        let delfile = "";
                                        for(let i = 0; i < oldgallery.length; i++){
                                            delfile = formatDelFile(path.parse(oldgallery[i].image).base, 'image');                                                        
                                            deletedfiles.push(delfile);
                                        }
                                    }
                                    doc["gallery"] = gallery;
                                    doc["glen"] = newgallerycount;
                                }                                
                            }

                            //CHANGE MAIN IMAGE FOR LOGO OR PRINT?

                            if(files[type +'img'].size> 0){
                                let response = moveImage(files[type +'img']);
                                if(response.ack === true){
                                    doc["img"] = response.output;
                                    let basename = result.img.toString();
                                    let delfile = formatDelFile(path.parse(basename).base, 'image');                                        
                                    deletedfiles.push(delfile);
                                }
                                else{
                                    console.log(`A2Dlog - Error moving main image of ${type}`, response.output);
                                    reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                    return;
                                }                                    
                            }

                            if(deletegallery){
                                mongoClient.db().collection(type).updateOne({"_id": id}, {$set: doc, $unset: { "gallery": "", "glen": ""}}).then(result =>{
                                    console.log(result);
                                    deleteFiles(deletedfiles);
                                    if(type === "logo"){
                                        resolve({msg: "Logo atualizada com sucesso!"});
                                    }
                                    else{
                                        resolve({msg: "Material gráfico atualizado com sucesso!"});
                                    }                                        
                                    return;

                                }).catch(error =>{
                                    console.log(`A2Dlog - Error updating document ${fields[type +'id']} from collection ${type}: `, error);
                                    reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                    return;
                                });
                            }
                            else{
                                mongoClient.db().collection(type).updateOne({"_id": id}, {$set: doc}).then(result =>{
                                    console.log(result);
                                    deleteFiles(deletedfiles);
                                    let message = "";
                                    if(type === "logo"){
                                        message = "Logo atualizada com sucesso!";
                                    }
                                    else{
                                        message = "Material gráfico atualizado com sucesso!";
                                    }
                                    resolve({msg: message});
                                    return;

                                }).catch(error =>{
                                    console.log(`A2Dlog - Error updating document ${fields[type +'id']} from collection ${type}: `, error);
                                    reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                    return;
                                });
                            }
                            //mongoClient.db().collection(type).updateOne({_id: id},{$pull: {"gallery": {$in: oldgallery}}});
                            
                        });
                    }
                    //ART UPDATE
                    else{
                        if(files[type +'img'].size> 0){
                            let response = moveImage(files[type +'img']);
                            if(response.ack === true){
                                doc["img"] = response.output;
                                mongoClient.db().collection(type).findOne({ "_id": id}).then(result =>{
                                    let basename = result.img.toString();
                                    let delfile = formatDelFile(path.parse(basename).base, 'image');                                    
                                    deletedfiles.push(delfile);
                                });                                
                            }
                            else{
                                console.log(`A2Dlog - Error moving main image from ${type}`, response.output);
                                reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                                return;
                            }                                    
                        }

                        mongoClient.db().collection(type).updateOne({"_id": id}, {$set: doc}).then(result =>{
                            console.log(result);
                            deleteFiles(deletedfiles);
                            resolve({msg: "Arte atualizada com sucesso!"});
                            return;

                        }).catch(error =>{
                            console.log(`A2Dlog - Error updating document ${fields[type +'id']} from collection ${type}: `, error);
                            reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                            return;
                        });
                    }
                    //FINISH UPDATE FOR LOGO, PRINT OR ART
                }                
            }            
        });
    },

    delete(id, type){
        return new Promise((resolve, reject) =>{
            let deletedfiles = [];
            let message = "";
            let basename = "";
            mongoClient.db().collection(type).findOne({ _id: ObjectId(id)}).then(result =>{            
                if(type === 'vid'){
                    basename = result.vid.toString();
                    let delfile = formatDelFile(path.parse(basename).base, 'video');                
                    deletedfiles.push(delfile);
                    basename = result.thumb.toString();
                    delfile = formatDelFile(path.parse(basename).base, 'thumb');                
                    deletedfiles.push(delfile);
                    message = "Vídeo removido com sucesso!";
                }
                else{
                    basename = result.img.toString();          
                    let delfile = formatDelFile(path.parse(basename).base, 'image');                
                    deletedfiles.push(delfile);
                    if(typeof result.gallery !== 'undefined'){
                        for(let i = 0; i < result.gallery.length; i++){
                            basename = result.gallery[i].image.toString();
                            formatDelFile(path.parse(basename).base, 'image');                        
                            deletedfiles.push(delfile);
                        }
                    }
                }
                mongoClient.db().collection(type).deleteOne({ _id: ObjectId(id)}).then(response =>{
                    console.log(response);
                    deleteFiles(deletedfiles);
                    if(type === 'logo'){
                        message = "Logo removida com sucesso!";
                    }
                    else if(type === 'print'){
                        message = "Material gráfico removido com sucesso!";
                    }
                    else if(type === 'art'){
                        message = "Arte removida com sucesso!";
                    }
                    resolve({msg: message});
                    return;
                });
            }).catch(error =>{
                console.log(`A2Dlog - Error removing document ${id} from collection ${type}: `, error);
                reject({msg: "Erro interno do servidor, por favor tente novamente mais tarde."});
                return;
            });
        });
        

    }

    
};
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const projectpath = require('./projectpath');
const utils = require('./utils');

module.exports = {
    saveFromURL(imageUrl){
        return new Promise((resolve, reject)=>{
            fetch(imageUrl).then(result =>{
                let ext = path.parse(imageUrl).ext;
                let date = String(new Date().valueOf());
                let filename = utils.pseudoRandomName(8) +date;
                let filepath = projectpath.resourcepath +filename +ext;
                result.body.pipe(fs.createWriteStream(filepath).on("finish", function(){
                    let relativepath = `/upload/resources/${filename}${ext}`;
                    resolve({
                        success: 1,
                        file: {
                            url: relativepath
                        }
                    });
                    return;
                }));
            }).catch(err =>{
                console.log(`A2Dlog - Error saving imagem from link: "${url}"
                \nErro: ${err}`);
                reject({success: 0, file: { url: ""}});
                return;
            });
        });
    },

    saveFromUpload(imageFile){
        return new Promise((resolve, reject) =>{

            let basename = path.parse(imageFile.filepath).base;
            let relativepath = `/upload/resources/${basename}`;
            fs.rename(
                imageFile.filepath,
                projectpath.resourcepath +basename,
                function(error){
                    if(error){
                        console.log('A2Dlog - Error moving video file: ', error);
                        reject({success: 0, file: { url: ""}});
                        return;
                    }
                    resolve({
                        success: 1,
                        file: {
                            url: relativepath
                        }
                    });
                    return;
                }
            );
        });
    }
};
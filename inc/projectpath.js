const path = require('path');
const radix = path.join(__dirname, '..');
const pathavatar = path.join(__dirname, '..', '/public/images/dashbrd/');
const pathimage = path.join(__dirname, '..', '/public/upload/images/');
const pathvideo = path.join(__dirname, '..', '/public/upload/videos/');
const paththumb = path.join(__dirname, '..', '/public/upload/videos/thumbs/');
const pathresource = path.join(__dirname, '..', '/public/upload/resources/');
const pathupload = path.join(__dirname, '..', '/public/upload/')

module.exports = {    
    rootpath : radix,
    avatarpath: pathavatar,
    imagepath : pathimage,
    videopath : pathvideo,
    thumbpath : paththumb,
    resourcepath: pathresource, 
    uploadpath: pathupload,                   
    
    showPaths(){
        console.log('Project folder: ' +radix);
        console.log('Avatar: ' +pathavatar);
        console.log('Images: ' +pathimage);
        console.log('Videos: ' +pathvideo);
        console.log('Video thumbnails: ' +paththumb);
        console.log('Resources: ' +pathresource);        
    }
};
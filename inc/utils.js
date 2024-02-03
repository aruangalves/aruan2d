const mongoClient = require('./db');

module.exports = {
    validateEmail(email){
      return email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    },

    validateURL(url){
      return url.match(/^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i);
    },

    pseudoRandomName(length) {
      let result           = '';
      let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }, 

  generateURLNew(text){
    let url;
    url = text.toLowerCase();
    let re = /"|'|!|@|²|³|\$|£|%|¢|¨|¬|&|\*|\(|\)|-|\||\\|_|\+|=|´|`|\{|\[|ª|\^|~|\}|\]|º|<|,|\.|>|;|:|\?|\/|°|\n|\r|[\b]|\f|\t|\v/g;
    url = url.replaceAll(re,"");
    re = /ã|â|á|à|ä/g;
    url = url.replaceAll(re,"a");
    re = /ê|é|è|ë/g;
    url = url.replaceAll(re,"e");
    re = /î|í|ì|ï/g;
    url = url.replaceAll(re,"i");
    re = /ô|õ|ó|ò|ö/g;
    url = url.replaceAll(re,"o");
    re = /û|ú|ù|ü/g;
    url = url.replaceAll(re,"u");
    re = /ý|ÿ/g;
    url = url.replaceAll(re,"y");
    url = url.replaceAll("ç","c");
    url = url.replaceAll(" ", "-");
    return url;
  },

  generateURL(text){
    let url;
    url = text.toLowerCase();
    let re = /"|'|!|@|²|³|\$|£|%|¢|¨|¬|&|\*|\(|\)|-|\||\\|_|\+|=|´|`|\{|\[|ª|\^|~|\}|\]|º|<|,|\.|>|;|:|\?|\/|°|\n|\r|[\b]|\f|\t|\v/g;
    url = url.replace(re,"");
    re = /ã|â|á|à|ä/g;
    url = url.replace(re,"a");
    re = /ê|é|è|ë/g;
    url = url.replace(re,"e");
    re = /î|í|ì|ï/g;
    url = url.replace(re,"i");
    re = /ô|õ|ó|ò|ö/g;
    url = url.replace(re,"o");
    re = /û|ú|ù|ü/g;
    url = url.replace(re,"u");
    re = /ý|ÿ/g;
    url = url.replace(re,"y");
    re = /ç/g;
    url = url.replace(re,"c");
    re = /\s/g;
    url = url.replace(re, "-");
    return url;
  },

  checkURL(url, length = 6, naming = "o título"){
    if(url.length < length){
      return {
        test: false,
        msg: `Erro: ${naming} deve conter pelo menos ${length} caracteres.`
      };
    }
    else if(/^(.)\1+$/.test(url) && url.charAt(0) === "-"){
      return {
        test: false,
        msg: `Erro: ${naming} deve possuir pelo menos uma palavra.`
      };
    }
    else if(/[a-zA-Z]/.test(url)){
      return {
        test: true        
      };
    }
    else{
      return {
        test: false,
        msg: `Erro: ${naming} deve possuir pelo menos uma palavra.`
      };
    }
  },

  setUniqueURL(url, collection, id = ""){
    return new Promise((resolve, reject)=>{
      let re = new RegExp(`^${url}`);
      let crs = mongoClient.db().collection(collection).find({"url": {$regex: re}});
      crs.toArray().then(docs =>{
        if(docs.length === 0){
          resolve(url);
          return;          
        }
        let links = [];
        let highest = 1;
        if(id === ""){
          docs.forEach(doc =>{
            links.push(doc.url);            
          });
        }
        else{
          docs.forEach(doc =>{            
            if(doc._id.toString() !== id.toString()){              
              console.log(doc);
              links.push(doc.url);
            }
          });
        }
        
        if(links.length === 0){
          resolve(url);
        }
        else{
          links.forEach(link =>{
            let index = link.lastIndexOf("-");
            let substring = link.substring(index+1);
            let compare = parseInt(substring);
            if(!isNaN(compare)){
              if(compare > highest){
                highest = compare;
              }
            }
          })
  
          ++highest;
          url = url +"-" + highest.toString();  
          resolve(url);          
        }
        return;

        
      });
    });    
  },

  indexOfObjectIdArray(id, idList){
    id = id.toString();
    let idNames = [];
    for(let i = 0; i < idList.length; i++){
      idNames.push(idList[i].toString());
    }

    return idNames.indexOf(id);
  },

  removeExcessWhitespaces(text){
    return text.replace(/\s\s+/g, " ").trim();
  }
};
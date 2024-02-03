var pass = require('./pass');
var utils = require('./utils');
var mongoClient = require('./db');

var fs = require('fs');
var path = require('path');
const projectpath = require('./projectpath');

function registerAttempt(wasSuccessful, email, type = "login"){
  //types = login, passchange, emailchange
  return new Promise((resolve, reject) => {
    let date = new Date().getTime();
    let doc = {
      success : wasSuccessful,
      email: email,
      time: date,
      type: type
    };
    mongoClient.db().collection("attempts").insertOne(doc).then(result =>{
      let attempttext = "UNSUCCESSFUL";
      if(wasSuccessful){
        attempttext = "SUCCESSFUL";
      }
      console.log("A2Dlog - Recording " +attempttext +" " +type +" attempt :");
      console.log(result);
      resolve();
    }).catch(error =>{
      console.log("A2Dlog - Error while recording  " +type +" attempt: ");
      console.log(error);
      reject();
    });
  });
  

}

module.exports = {
    login(email, password){
        return new Promise((resolve, reject) => {          

          mongoClient.db().collection("manager").findOne({ email: email }).then( (res, err) =>{

            if(err){
              console.log(err);
              reject({msg: 'Erro ao se conectar com o servidor, por favor tente novamente.'});
            }
            else{
              if(res === null){
                reject({msg: 'E-mail ou senha incorretos.'});                      
              }
              else{   

                pass.validatePassword(password, res['salt'], res['password']).then(isValid =>{
                  registerAttempt(isValid, email, "login").then(()=>{
                      if(isValid){ 
                        let id = res['_id'].toString();                            
                        resolve({
                          id: id,
                          email: res['email'],
                          name: res['name'],
                          avatar: res['avatar']
                        });
                      }
                      else{
                        reject({msg: 'E-mail ou senha incorretos.'});                          
                      }
                  }).catch(() =>{
                    reject({msg: 'Erro ao se conectar com o servidor, por favor tente novamente.'});
                  });
                  
                });
              }
            }
            
          });//mongoClient.db().collection("manager").findOne
            
        });//return new Promise((resolve, reject)
    },//login(email, password)

    

    changePassword(email, oldpass, newpass, newpassconf){
      return new Promise((resolve, reject) =>{
        if(newpass !== newpassconf){
          reject({
            okay: false,
            msg: 'Os dois campos da nova senha devem ser iguais.'
          });
          return;
        }
        else{
          mongoClient.db().collection("manager").findOne({ email: email}).then((res, err) =>{
            if(err){
              console.log(err);                
              reject({
                okay: false,
                msg: 'Erro ao se conectar com o servidor, por favor tente novamente.'
              });
              return;
            }
            else{
              pass.validatePassword(oldpass, res['salt'], res['password']).then(isValid =>{
                if(isValid){
                  pass.setPassword(newpass).then(output =>{
                    let values = { $set: { password: output['hash'], salt: output['salt']}};
                    mongoClient.db().collection("manager").updateOne({email: email}, values).then((result, error) =>{
                      if(error){
                        console.log(error);
                        reject({
                          okay: false,
                          msg: 'Erro ao se conectar com o servidor, por favor tente novamente.'
                        });
                         return;
                      }
                      else{
                        registerAttempt(true, email, "passchange").then(()=>{
                          console.log(result);
                          resolve({
                            okay: true,
                            msg: 'Senha alterada com sucesso.'
                          });
                          return;
                        }).catch(()=>{
                          reject({
                            okay: false,
                            msg: 'Erro ao se conectar com o servidor, por favor tente novamente.'
                          })
                        });
                        
                      }                        
                    });//mongoClient.db().collection("manager").updateOne()
                  }).catch(err =>{
                    console.log(err);                      
                    reject({
                      okay: false,
                      msg: 'Erro ao se conectar com o servidor, por favor tente novamente.'
                    });
                    return;
                  });//pass.setPassword(newpass)
                }
                else{
                  reject({
                    okay: false,
                    msg: 'Sua senha atual está incorreta.'
                  });
                  return;
                }


              });//pass.validatePassword()
            }              
          });//mongoClient.db().collection("manager").findOne()          
        }//else

      });//return new Promise((resolve, reject)
    },//changePassword(oldpass, newpass, newpassconf)

    changeProfile(fields, files){
      return new Promise((resolve, reject)=>{
        let changes = {};
        let deleteOldAvatar = false;
        let newEmail = false;
        let email = fields.email.trim();
        let newName = false;
        let name = fields.name.trim();
      
        if(email !== ""){
          if(utils.validateEmail(email) !== null){
            changes["email"] = email;
            newEmail = true;
          }
          else{
            reject({
              okay: false,
              msg: "Digite um e-mail válido."
            })
            return;
          }
        }

        if(name !== ""){
          changes["name"] = name;
          newName = true;
        }

        if(files.avatar.size > 0){
          let basename = path.parse(files.avatar.filepath).base;
          let avatar = `/images/dashbrd/${basename}`;
          fs.rename(
            files.avatar.filepath,
            projectpath.avatarpath +basename,
            function(error){
              if(error){
                console.log('Erro ao mover arquivo de avatar: ', error);
                reject({
                  okay: false,
                  msg: "Erro interno do servidor, por favor tente novamente mais tarde."
                });
                return;
              }
            });
            changes["avatar"] = avatar;
            deleteOldAvatar = true;            
        }

        mongoClient.db().collection("manager").updateOne({"email": fields.oldemail}, {$set: changes}).then((result, error)=>{
          if(error){
            console.log(error);
            reject({
              okay: false,
              msg: "Erro interno do servidor, por favor tente novamente mais tarde."
            });
            return;
          }
          else{
            if(deleteOldAvatar){
              let delname = path.parse(fields.oldavatar).base;
              let delpath = projectpath.avatarpath +delname;
              fs.unlink(delpath, function(error){
                if(error){
                  console.log(`Erro ao apagar o arquivo: "${delpath}". Erro: ${error}`)
                }
              });
            }
            console.log(result);            
            let response = {
              okay: true,
              msg: "Perfil atualizado com sucesso!",
              newAvatar: deleteOldAvatar,
              newName,
              newEmail
            }
            if(response.newAvatar){
              response["avatar"] = changes["avatar"];
            }
            if(newName){
              response["name"] = changes["name"];
            }
            if(newEmail){
              response["email"] = changes["email"];
              registerAttempt(true, email, "emailchange").then(()=>{
                resolve(response);
                return;
              }).catch(()=>{
                resolve(response);
                return;
              });
            }            
            resolve(response);
            return;
          }
        });
      });
      
    }
};
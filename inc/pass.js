let crypto = require('crypto');

module.exports = {

    setPassword(password){
        return new Promise((resolve, reject)=>{
            let salt = crypto.randomBytes(16).toString('hex');

            crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) =>{
                if(err){
                    reject(err);
                }
                else{
                    let hash = derivedKey.toString('hex');
                    output = {
                        salt, hash
                    }
                    resolve(output);
                }
            });

        });
    },

    validatePassword(password, salt, hash){
        return new Promise((resolve, reject) =>{
            crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) =>{
                if(err){
                    reject(err);
                }
                else{
                    let key = derivedKey.toString('hex');
                    resolve(key === hash);
                }
            });
        });
    }

};
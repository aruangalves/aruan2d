let btnProfile = document.querySelector('#dash-changeprofile');
let btnPass = document.querySelector('#dash-changepassword');

let modalProfile = document.querySelector('#profile-modal');
let modalPass = document.querySelector('#password-modal');

let cancelProfileModal = document.querySelector("#profile-form-cancel");
let cancelPasswordModal = document.querySelector("#pass-form-cancel");

let formProfile = document.querySelector('#profile-form');
let formPass = document.querySelector('#pass-form');

let modalProfileListener = function(event){
    if(event.target === modalProfile){
        modalProfile.style.display = "none";
        formProfile.reset();
        formProfile.querySelector('#profile-form-error').innerHTML = "";
        window.removeEventListener('click', modalProfileListener);
    }
};

let modalPasswordListener = function(event){
    if(event.target === modalPass){
        modalPass.style.display = "none";
        formPass.reset();
        resetPassErrors();
        window.removeEventListener('click', modalPasswordListener);
    }
};

cancelProfileModal.addEventListener('click', e=>{
    modalProfile.style.display = "none";
    formProfile.reset();
    formProfile.querySelector('#profile-form-error').innerHTML = "";
    window.removeEventListener('click', modalProfileListener);
});

cancelPasswordModal.addEventListener('click', e=>{
    modalPass.style.display = "none";
    formPass.reset();
    resetPassErrors();
    window.removeEventListener('click', modalPasswordListener);
});

btnProfile.addEventListener('click', e=>{
    window.addEventListener('click',modalProfileListener);
    modalProfile.style.display = "block";
});

btnPass.addEventListener('click', e=>{
    window.addEventListener('click', modalPasswordListener);
    modalPass.style.display = "block";
});

function resetPassErrors(){
    formPass.querySelector('#oldpass-form-error').innerHTML = "";
    formPass.querySelector('#newpass-form-error').innerHTML = "";
    formPass.querySelector('#confpass-form-error').innerHTML = "";
}

formProfile.addEventListener('submit', e=>{
    e.preventDefault();
    let formData = new FormData(formProfile);
    let isValid = true;

    if(formData.get("email") !== ""){
        if(formData.get("email").match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === null){            
            formProfile.querySelector('#profile-form-error').innerHTML = "Você deve digitar um e-mail válido.";
            isValid = false;
        }
        else{
            formProfile.querySelector('#profile-form-error').innerHTML = "";
        }
    }

    if(isValid){
        fetch(formProfile.action, {
            method: formProfile.method,
            body: formData
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            if(result.okay){
                modalProfile.style.display = "none";
                formProfile.reset();
                formProfile.querySelector('#profile-form-error').innerHTML = "";
                window.removeEventListener('click', modalProfileListener);
                let notifySnack = document.querySelector('.mdl-js-snackbar');
                notifySnack.MaterialSnackbar.showSnackbar({
                    message: result.msg,
                    timeout: 2000
                });
                setTimeout(()=>{
                    window.location.reload();
                }, '3000');
            }
            else{
                formProfile.querySelector('#profile-form-error').innerHTML = result.msg;
            }
        });
    }    
});

formPass.addEventListener('submit', e=>{
    e.preventDefault();
    let formData = new FormData(formPass);
    let isValid = true;

    if(formData.get("oldpassword") === ""){
        formPass.querySelector('#oldpass-form-error').innerHTML = "Você deve digitar sua senha antiga.";
        isValid = false;
    }
    else{
        formPass.querySelector('#oldpass-form-error').innerHTML = "";
    }

    if(formData.get("newpassword") === ""){
        formPass.querySelector('#newpass-form-error').innerHTML = "Você deve digitar uma senha nova.";
        isValid = false;
    }
    else{
        formPass.querySelector('#newpass-form-error').innerHTML = "";
    }

    if(formData.get("confpassword") === ""){
        formPass.querySelector('#confpass-form-error').innerHTML = "Você deve confirmar sua senha nova.";
        isValid = false;
    }
    else{
        formPass.querySelector('#confpass-form-error').innerHTML = "";
    }

    if(formData.get("newpassword") !== formData.get("confpassword")){
        formPass.querySelector('#pass-form-error').innerHTML = "Os campos de senha nova e confirmação não coincidem, tente novamente.";
        isValid = false;
    }
    else{
        formPass.querySelector('#pass-form-error').innerHTML = "";
    }

    if(isValid){
        fetch(formPass.action, {
            method: formPass.method,
            body: formData
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            if(result.okay){
                modalPass.style.display = "none";
                formPass.reset();
                formPass.querySelector('#pass-form-error').innerHTML = "";
                window.removeEventListener('click', modalPasswordListener);
                let notifySnack = document.querySelector('.mdl-js-snackbar');
                notifySnack.MaterialSnackbar.showSnackbar({
                    message: result.msg,
                    timeout: 2000
                });
                setTimeout(()=>{
                    window.location.reload();
                },'3000');
            }
            else{
                formPass.querySelector('#pass-form-error').innerHTML = result.msg;
            }
        });
    }
});

let inputText = formProfile.querySelector('#prof-name');
let inputEmail = formProfile.querySelector('#prof-email');

let textflag = false;
let emailflag = false;

inputText.addEventListener('click', e =>{ 
    if(!textflag){
        inputText.select();
    }    
});

inputEmail.addEventListener('click', e =>{
    if(!emailflag){
        inputEmail.select();
    }    
});

inputText.addEventListener('focus', e=>{
    setTimeout(()=>{
        textflag = true;
    }, 200);    
});

inputText.addEventListener('blur', e=>{    
    textflag = false;
});

inputEmail.addEventListener('focus', e=>{
    setTimeout(()=>{
        emailflag = true;
    }, 200);    
});

inputEmail.addEventListener('blur', e=>{
    emailflag = false;
})
import { editorController } from "./editorController.js";

const editorContainer = document.querySelector('#editor');
let data = {};
if(typeof editorContainer.dataset.row !== "undefined"){
    data = JSON.parse(editorContainer.dataset.row);
}

const control = new editorController();

const form = document.querySelector(".dash-about form");
const submitBtn = document.querySelector("#about-submit");

control.initEditor("editor", data).then(()=>{

    submitBtn.disabled = false;
    form.addEventListener("submit", e=>{
        e.preventDefault();
        submitForm(form);
    });

}).catch(error=>{
    console.log(error);
});

function submitForm(formEl){    

    control.save("editor").then(data =>{
        let formData = new FormData(formEl);
        let isValid = true;
        let isUpdate = true;

        if(formData.get("_id") === ""){
            isUpdate = false;
        }

        if(!isUpdate){
            if(formData.get("img").size === 0){
                isValid = false;
                formEl.querySelector('.form-error-img').innerHTML = "Você deve inserir uma imagem de perfil.";
            }
            else{
                formEl.querySelector('.form-error-img').innerHTML = "";
            }
        }        

        formData.append("data",JSON.stringify(data));

        if(isValid){
            //FORM SUBMIT
            fetch(formEl.action, {
                method: formEl.method,
                body: formData
            })
            .then(function(response){
                return response.json();
            })
            .then(function(result){                
                if(result.okay){
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
                    formEl.querySelector('.form-error-total').innerHTML = result.msg;                    
                }
            })
        }
    });
}

new ImagePreview('#img', '#imgpreview');

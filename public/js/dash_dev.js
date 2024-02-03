import { editorController } from "./editorController.js";

const editorControl = new editorController();
const form = document.querySelector("#dash-form form");

const formdiv = document.querySelector("#dash-form");
const postdiv = document.querySelector("#dash-list");

const newProjectBtn = document.querySelector("#newproject-btn");
const submitBtn = document.querySelector("#dev-submit");
const cancelBtn = document.querySelector("#dev-cancel");

let totalpages = 0;
let currentpage = 1;
let startnav = true;

let editorInit = [
    editorControl.initEditor("editor-overview"),
    editorControl.initEditor("editor-intro"),
    editorControl.initEditor("editor-manual"),
    editorControl.initEditor("editor-resources"),
    editorControl.initEditor("editor-changelog")
];

//TABLE RELATED FUNCTIONS
function fetchTable(page){
    fetch(`/dashbrd/dev/${page}`)
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        if(result.okay){
            totalpages = result.pages;
            currentpage = page;
            tableNav(page, totalpages);
            tableRows(result.rows);
        }
        else{
            console.log(result.msg);
        }
    })
}

function tableNav(page, pagestotal){
    let firstBtn = document.querySelector("#dev-page-first");
    let prevBtn = document.querySelector("#dev-page-prev");
    let noForm = document.querySelector("#dev-page-form");
    let noInput = document.querySelector("#dev-page-no");
    let totalEl = document.querySelector("#dev-page-total");
    let nextBtn = document.querySelector("#dev-page-next");
    let lastBtn = document.querySelector("#dev-page-last");

    noInput.value = page;
    noInput.max = pagestotal;

    totalEl.innerHTML = pagestotal;

    if(page < 2){
        firstBtn.disabled = true;
        prevBtn.disabled = true;
    }
    else{
        firstBtn.disabled = false;
        prevBtn.disabled = false;
    }

    if(page === pagestotal || pagestotal === 0){
        nextBtn.disabled = true;
        lastBtn.disabled = true;
    }
    else{
        nextBtn.disabled = false;
        lastBtn.disabled = false;
    }

    if(pagestotal < 2){
        noInput.disabled = true;
    }
    else{
        noInput.disabled = false;
    }

    if(startnav){
        startnav = false;

        firstBtn.addEventListener('click', e=>{
            fetchTable(1);
        });

        prevBtn.addEventListener('click', e=>{
            fetchTable(currentpage-1);
        });

        nextBtn.addEventListener('click', e=>{
            fetchTable(currentpage+1);
        });

        lastBtn.addEventListener('click', e=>{
            fetchTable(totalpages);
        });

        noForm.addEventListener('submit', e=>{
            e.preventDefault();
            let no = parseInt(noInput.value, 10);
            if(no !== currentpage){
                fetchTable(no);
            }
        });
    }
}

function tableRows(rows){
    let tbody = document.querySelector("#dev-projects tbody");
    tbody.innerHTML = "";

    rows.forEach(row =>{
        let tr = document.createElement('tr');
        let lastmodified = row.time;
        if(typeof row.edit !== "undefined"){
            lastmodified = row.edit;
        }
        lastmodified = PrettyDate.shortDate(lastmodified);

        tr.innerHTML = `
            <td>${row.title}</td>
            <td>${row.currentversion}</td>
            <td>${lastmodified}</td>
            <td>${row.status}</td>
            <td>${row.abstract}</td>
            <td class="tdactions">
                <button type="button" class="dash-tbtn btn-edit mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--accent"><i class="material-icons">edit</i> Editar</button>
                <button type="button" class="dash-tbtn btn-delete mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored"><i class="material-icons">delete</i>Excluir</button>
            </td>
        `;

        tr.dataset.row = JSON.stringify(row);
        tbody.appendChild(tr);

        let editBtn = tr.querySelector(".btn-edit");
        let delBtn = tr.querySelector(".btn-delete");

        editBtn.addEventListener('click', e=>{
            editEntry(e);
        });

        delBtn.addEventListener('click', e=>{
            deleteEntry(e);
        });
    });
}

function deleteEntry(e){   
    let dataset = getDataset(e) ;
    let id = dataset._id;
    let msg = "Deseja realmente excluir este projeto?";
    if(confirm(msg)){
        fetch(`/dashbrd/dev/${id}`, {
            method: 'DELETE'
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            displaySnackbar(result.msg);
            if(result.okay){
                setTimeout(()=>{
                    window.location.reload();
                },'2500');                
            }
        }).catch(function(error){
            console.log(error);
        })
    }
}

function editEntry(e){
    let dataset = getDataset(e);
    clearForm();

    form.querySelector("#_id").value = dataset._id;
    form.querySelector("#title").value = dataset.title;
    form.querySelector("#time").value = dataset.time;
    form.querySelector("#abstract").value = dataset.abstract;

    let status = form.querySelector("#status")
    let options = status.options.length;

    for(let i = 0; i < options; i++){
        if(dataset.status.trim() === status.options[i].text.trim()){
            status.options.selectedIndex = i;
            i = options;
        }
    }

    form.querySelector("#currentversion").value = dataset.currentversion;
    form.querySelector("#externalurl").value = dataset.externalurl;
    form.querySelector("#repo").value = dataset.repo;
    form.querySelector("#license").value = dataset.license;
    form.querySelector("#licenseurl").value = dataset.licenseurl;

    for(let i = 0; i < dataset.categories.length; i++){
        if(i > 2);
        else{
            let no = i+1;
            form.querySelector(`#cat${no}`).value = dataset.categories[i].name;
             
        }        
    }

    if(typeof dataset.cover !== "undefined"){
        form.querySelector("#coverpreview").src = dataset.coverimg;
    }

    editorControl.render("editor-overview", dataset.overview);
    editorControl.render("editor-intro", dataset.intro);
    editorControl.render("editor-manual", dataset.manual);
    editorControl.render("editor-resources", dataset.resources);
    editorControl.render("editor-changelog", dataset.changelog);

    formdiv.classList.remove("hide");
    form.scrollIntoView({behavior : "smooth"});
}

function getDataset(e){
    let entry = e.composedPath().find(el =>{
        return (el.tagName.toLowerCase() === 'tr');
    });

    return JSON.parse(entry.dataset.row);
}

/*FORM RELATED FUNCTIONS ****/
Promise.all(editorInit).then(()=>{
    submitBtn.disabled = false;
    form.addEventListener("submit", e=>{
        e.preventDefault();
        submitForm(form);        
    });

    newProjectBtn.addEventListener("click", e=>{
        formdiv.classList.remove("hide");
        clearForm();
        formdiv.scrollIntoView({behavior : "smooth"});        
    });

    cancelBtn.addEventListener("click", e=>{
        formdiv.classList.add("hide");
        clearForm();
        postdiv.scrollIntoView({behavior: "smooth"});        
    });
}).catch(error =>{    
    console.log(error);
});

function clearForm(){
    form.reset();
    editorControl.clear("editor-overview");
    editorControl.clear("editor-intro");
    editorControl.clear("editor-manual");
    editorControl.clear("editor-resources");
    editorControl.clear("editor-changelog");

    formdiv.querySelector("#coverpreview").src = "/upload/images/post-test2.jpg";
    let errormsgs = form.querySelectorAll(".form-error");
    [...errormsgs].forEach(errormsg =>{
        errormsg.innerHTML = "";
    });
}

function submitForm(formEl){
    let editorSave = [
        editorControl.save("editor-overview"),
        editorControl.save("editor-intro"),
        editorControl.save("editor-manual"),
        editorControl.save("editor-resources"),
        editorControl.save("editor-changelog")
    ];

    Promise.all(editorSave).then(saved =>{
        //saved[0..4] from each EditorJS instance        
        let formData = new FormData(formEl);

        let isValid = true;        

        let currenttime = new Date();
        formData.append("currenttime", PrettyDate.generateDateString(currenttime));

        //get editors data
        formData.append("overview", JSON.stringify(saved[0]));
        formData.append("intro", JSON.stringify(saved[1]));
        formData.append("manual", JSON.stringify(saved[2]));
        formData.append("resources", JSON.stringify(saved[3]));
        formData.append("changelog", JSON.stringify(saved[4]));

        if(formData.get("title") === ""){
            isValid = false;
            formEl.querySelector(".form-error-title").innerHTML = "Você deve digitar um título";
        }
        else{
            formEl.querySelector(".form-error-title").innerHTML = "";
        }

        if(formData.get("time") === ""){
            isValid = false;
            formEl.querySelector(".form-error-time").innerHTML = "Você deve inserir uma data";
        }

        if(formData.get("abstract") === ""){
            isValid = false;
            formEl.querySelector(".form-error-abstract").innerHTML = "Você deve digitar um sumário.";
        }
        else{
            formEl.querySelector(".form-error-abstract").innerHTML = "";
        }

        if(formData.get("status") === ""){
            isValid = false;
            formEl.querySelector(".form-error-status").innerHTML = "Você deve selecionar uma opção.";
        }
        else{
            formEl.querySelector(".form-error-status").innerHTML = "";
        }

        if(formData.get("currentversion") === ""){
            isValid = false;
            formEl.querySelector(".form-error-currentversion").innerHTML = "Você deve informar a versão atual";
        }
        else{
            formEl.querySelector(".form-error-currentversion").innerHTML = "";
        }

        //externalurl and repo can be left empty
        //in first case externalurl will be automatically set to the dev project URL, in the second case the field will be skipped when the page is delivered to user
        //if they aren't empty, it will check if each is a valid URL
        if(formData.get("externalurl") !== ""){
            if(validateURL(formData.get("externalurl")) === null){
                isValid = false;
                formEl.querySelector(".form-error-externalurl").innerHTML = "Você deve fornecer um URL válido ou deixar o campo em branco.";
            }
            else{
                formEl.querySelector(".form-error-externalurl").innerHTML = "";
            }
        }
        else{
            formEl.querySelector(".form-error-externalurl").innerHTML = "";
        }

        if(formData.get("repo") !== ""){
            if(validateURL(formData.get("repo")) === null){
                isValid = false;
                formEl.querySelector(".form-error-repo").innerHTML = "Você deve fornecer um URL válido ou deixar o campo em branco.";
            }
            else{
                formEl.querySelector(".form-error-repo").innerHTML = "";
            }
        }
        else{
            formEl.querySelector(".form-error-repo").innerHTML = "";
        }

        if(formData.get("license") === ""){
            isValid = false;
            formEl.querySelector(".form-error-license").innerHTML = "Você deve informar a licença";
        }
        else{
            formEl.querySelector(".form-error-license").innerHTML = "";
        }

        if(validateURL(formData.get("licenseurl")) === null){
            isValid = false;
            formEl.querySelector(".form-error-licenseurl").innerHTML = "Você deve fornecer o URL para a licença.";
        }
        else{
            formEl.querySelector(".form-error-licenseurl").innerHTML = "";
        }

        if(formData.get("cat1") === "" && formData.get("cat2") === "" && formData.get("cat3") === ""){
            isValid = false;
            formEl.querySelector(".form-error-categories").innerHTML = "Você deve incluir pelo menos uma categoria.";
        }
        else{
            formEl.querySelector(".form-error-categories").innerHTML = "";
        }

        if(isValid){
            //FORM SUBMIT
            fetch(formEl.action, {
                method: formEl.method,
                body: formData
            }).then(function(response){
                return response.json();
            }).then(function(result){
                if(result.okay){                    
                    displaySnackbar(result.msg);
                    setTimeout(()=>{
                        window.location.reload();
                    }, '2500');
                }
                else{
                    formEl.querySelector('.form-error-total').innerHTML = result.msg;
                }
            })
        }
        
        
    }).catch(error =>{
        console.log(error);
    });
}

/****FORM RELATED FUNCTIONS (END) */

//MISC FUNCTIONS (only apply to DEV page)
function validateURL(url){
    return url.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i);
}

//CATEGORY RELATED FUNCTIONS
function fetchCategories(){
    fetch("/dashbrd/devcategories")
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        if(result.okay){            
            let docs = result.docs;
            let container = document.querySelector("#devcategories");
            docs.forEach(doc =>{
                let category = document.createElement("button");
                category.type = "button";
                category.classList.add("mdl-chip");
                let span = document.createElement("span");
                span.classList.add("mdl-chip__text");
                span.innerHTML = doc.name;
                category.appendChild(span);
                category.addEventListener('click', e=>{
                    let text = category.querySelector("span").innerText;
                    let firstEmpty = -1;
                    text = editorController.removeExcessWhitespaces(text);
                    let alreadySelected = false;
                    for(let i = 1; i < 4; i++){
                        let cat = form.querySelector(`#cat${i}`).value;
                        cat = editorController.removeExcessWhitespaces(cat);
                        if(cat === "" && firstEmpty === -1){
                            firstEmpty = i;
                        }
                        if(cat === text){
                            alreadySelected = true;                            
                        }
                    }
                    if(!alreadySelected){
                        if(firstEmpty !== -1){
                            let cat = form.querySelector(`#cat${firstEmpty}`);
                            cat.value = editorController.removeExcessWhitespaces(text);
                            displaySnackbar("Categoria adicionada.", 1500);
                        }
                        else{
                            displaySnackbar("Todas as categorias estão preenchidas, apague uma categoria antes de inserir.", 2500);
                        }
                    }
                    else{
                        displaySnackbar("Seu projeto já possui essa categoria.", 2500);
                    }
                });
                container.appendChild(category);
            });
            
        }
        else{
            console.log(result.msg);
        }
    });
}

//SNACKBAR FUNCTION
function displaySnackbar(msg, duration = 2000){
    let notifySnack = document.querySelector('.mdl-js-snackbar');
    notifySnack.MaterialSnackbar.showSnackbar({
        message: msg,
        timeout: duration
    });
}

//FUNCTION EXECUTION
fetchTable(currentpage);
fetchCategories();
new ImagePreview("#coverimg", "#coverpreview", "/upload/images/post-test2.jpg");
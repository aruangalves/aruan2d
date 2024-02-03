import { editorController } from "./editorController.js";

const editorControl = new editorController();
const form = document.querySelector("#dash-form-div form");

const formdiv = document.querySelector("#dash-form-div");
const postdiv = document.querySelector("#dash-form-list");

const newpostBtn = document.querySelector("#newpost-btn");
const submitBtn = document.querySelector("#blog-submit");
const cancelBtn = document.querySelector("#blog-cancel");
const refBtn = document.querySelector("#refadd");
const catBtn = document.querySelector("#catadd");
let counter = {
    ref: 0,
    cat: 0
};
let totalpages = 0;
let currentpage = 1;
let startnav = true;

//TABLE RELATED FUNCTIONS
function fetchTable(page){
    fetch(`/dashbrd/blog/${page}`)
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
    });
}

function tableNav(page, pagestotal){
    let firstBtn = document.querySelector("#blog-page-first");
    let prevBtn = document.querySelector("#blog-page-prev");
    let noForm = document.querySelector("#blog-page-form");    
    let noInput = document.querySelector("#blog-page-no");
    let totalEl = document.querySelector("#blog-page-total");
    let nextBtn = document.querySelector("#blog-page-next");
    let lastBtn = document.querySelector("#blog-page-last");

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
    let tbody = document.querySelector("#blog-posts tbody");
    tbody.innerHTML = "";

    rows.forEach(row =>{
        let tr = document.createElement('tr');
        let time = new Date(row.time);
        let date = PrettyDate.fullDate(time);
        
        let categories = "";        
        let commastop = row.categories.length - 1;
        for(let i = 0; i < row.categories.length; i++){
            categories = categories + row.categories[i].name;
            if(i < commastop){
                categories = categories + ", ";
            }
        }        

        tr.innerHTML = `
            <td>${row.title}</td>
            <td>${date}</td>
            <td>${categories}</td>
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
    let dataset = getDataset(e);
    let id = dataset._id;
    let msg = "Deseja realmente excluir este post?";
    if(confirm(msg)){
        fetch(`/dashbrd/blog/${id}`, {
            method: 'DELETE'
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            let notifySnack = document.querySelector('.mdl-js-snackbar');
            notifySnack.MaterialSnackbar.showSnackbar({
                message: result.msg,
                timeout: 2000
            });
            if(result.okay){
                setTimeout(()=>{
                    window.location.reload();
                },'2500');                
            }
        }).catch(function(error){
            console.log(error);
        });
    }
}

function editEntry(e){
    let dataset = getDataset(e);    
    clearForm();

    form.querySelector("#_id").value = dataset._id;
    form.querySelector("#title").value = dataset.title;    

    if(typeof dataset.cover !== "undefined"){
        form.querySelector("#coverpreview").src = dataset.coverimg;
    }

    editorControl.render("editor", dataset.data);

    if(typeof dataset.references !== "undefined"){        
        dataset.references.forEach(ref =>{
            addItem("ref", refBtn, ref);
        });
    }

    dataset.categories.forEach(cat =>{
        addItem("cat", catBtn, cat.name);
    });

    formdiv.classList.remove("hide");        
    form.scrollIntoView({behavior: "smooth"});
}

function getDataset(e){
    let entry = e.composedPath().find(el => {
        return (el.tagName.toLowerCase() === 'tr');
    });

    return JSON.parse(entry.dataset.row);
};

//FORM RELATED FUNCTIONS
editorControl.initEditor("editor").then(()=>{
    submitBtn.disabled = false;    
    form.addEventListener("submit", e=>{
        e.preventDefault();
        submitForm(form);
    });

    newpostBtn.addEventListener("click", e=>{
        formdiv.classList.remove("hide");
        clearForm();
        form.scrollIntoView({behavior: "smooth"});
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
    counter["ref"] = 0;
    counter["cat"] = 0;
    form.querySelector("#refno").value = 0;
    form.querySelector("#catno").value = 0;
    catBtn.disabled = false;
    while(refBtn.previousElementSibling !== null){
        refBtn.previousElementSibling.remove();
    }
    while(catBtn.previousElementSibling !== null){
        catBtn.previousElementSibling.remove();
    }
    form.reset();   
    editorControl.clear("editor");
    formdiv.querySelector("#coverpreview").src = "/upload/images/post-test3.jpg";
    form.querySelector(".form-error-title").innerHTML = "";
    form.querySelector('.form-error-total').innerHTML = "";
}

refBtn.addEventListener("click", e=>{
    addItem("ref", refBtn);
});

catBtn.addEventListener("click", e=>{
    addItem("cat", catBtn);
});

function addItem(type, button, content = ""){
    let item = document.createElement("div");
    item.classList.add("dash-form-gitem");
    ++counter[type];
    if(type === "cat" && counter[type] === 10){
        button.disabled = true;
    }
    let elementCounter = document.querySelector(`#${type}no`);
    elementCounter.value = counter[type];
    item.innerHTML = `
        <label class="dash-flabel" for="${type}${counter[type]}">${counter[type]}.</label>
        <input type="text" id="${type}${counter[type]}" name="${type}${counter[type]}" class="dash-finput">
        <button type="button" class="dash-fitem-remove mdl-button mdl-js-button"><i class="material-icons">cancel</i></button>
        <span class="form-error" id="form-error-${type}${counter[type]}"></span>
    `;
    button.parentElement.insertBefore(item, button);
    let delbtn = item.querySelector("button");
    delbtn.addEventListener("click", e=>{
        --counter[type];
        if(type === "cat" && counter[type] < 10){
            button.disabled = false;
        }
        elementCounter.value = counter[type];
        if(delbtn.parentElement.previousElementSibling !== null){
            delbtn.parentElement.previousElementSibling.scrollIntoView({behavior: "smooth"});
        }
        else{
            delbtn.parentElement.parentElement.scrollIntoView({behavior: "smooth"});
        }
        delbtn.parentElement.remove();
        reorderItems(type);
    });
    if(content === ""){
        item.scrollIntoView({alignToTop: false, behavior: "smooth"});
    }
    else{
        item.querySelector("input").value = content;
    }    
}

function reorderItems(type){
    let container = formdiv.querySelector(`#dash-${type}container`);    
    let items = container.querySelectorAll('.dash-form-gitem');
    let count = 1;
    [...items].forEach(item =>{
        let label = item.querySelector(".dash-flabel");
        label.htmlFor = `${type}${count}`;
        label.innerHTML = count + ".";
        let text = item.querySelector("input");
        text.id = `${type}${count}`;
        text.name = `${type}${count}`;
        let span = item.querySelector("span");
        span.id = `form-error-${type}${count}`;
        ++count;
    });
}

function submitForm(formEl){
    editorControl.save("editor").then(data =>{

        let formData = new FormData(formEl);
        formData.append("data", JSON.stringify(data));
        let abstract = editorController.generateAbstract(data);
        formData.append("abstract", abstract);

        let time = new Date().getTime();

        formData.append("time", time.toString());
        let isValid = true;
        let no = 0;
                
        if(formData.get("title") === ""){
            isValid = false;            
            formEl.querySelector(".form-error-title").innerHTML = "Você deve inserir um título.<br>";
        }
        else{
            formEl.querySelector(".form-error-title").innerHTML = "";
        }

        no = parseInt(formData.get("refno"));
        if(no > 0){
            ++no;
            for(let i = 1; i < no; i++){
                if(formData.get("ref" +i) === ""){
                    isValid = false;
                    formEl.querySelector(`#form-error-ref${i}`).innerHTML = "Você deve preencher esta referência.";
                }
                else{
                    formEl.querySelector(`#form-error-ref${i}`).innerHTML = "";
                }
            }
        }

        no = parseInt(formData.get("catno"));
        let categories = [];
        if(no < 1){
            isValid = false;
            formEl.querySelector('.form-error-total').innerHTML = "O post deve possuir pelo menos uma categoria.";
        }
        else if(no > 10){
            isValid = false;
            formEl.querySelector('.form-error-total').innerHTML = "O post deve possuir no máximo dez categorias.";
        }
        else{
            formEl.querySelector('.form-error-total').innerHTML = "";
            ++no;
            for(let i = 1; i < no; i++){
                let cati = formData.get("cat" +i);
                cati = editorController.removeExcessWhitespaces(cati);
                if(cati === ""){
                    isValid = false;
                    formEl.querySelector(`#form-error-cat${i}`).innerHTML = "Você deve preencher esta categoria";
                }
                else if(cati.length < 3){
                    isValid = false;
                    formEl.querySelector(`#form-error-cat${i}`).innerHTML = "A categoria deve conter pelo menos três caracteres.";
                }
                else{
                    formEl.querySelector(`#form-error-cat${i}`).innerHTML = "";
                    for(let j = 0; j < categories.length; j++){
                        let catj = categories[j];
                        catj = editorController.removeExcessWhitespaces(catj);
                        if(catj === cati){
                            isValid = false;
                            formEl.querySelector('.form-error-total').innerHTML = "Você deve retirar as categorias repetidas.";
                            j = categories.length;
                        }
                    }
                    categories.push(formData.get("cat" +i));
                }
            }
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
                    let notifySnack = document.querySelector('.mdl-js-snackbar');
                    notifySnack.MaterialSnackbar.showSnackbar({
                        message: result.msg,
                        timeout: 2000
                    });
                    setTimeout(()=>{
                        window.location.reload();
                    },'2500');
                }
                else{
                    formEl.querySelector('.form-error-total').innerHTML = result.msg;
                }
            });
        }
    });    
}

//CATEGORY RELATED FUNCTIONS
function fetchCategories(){
    fetch("/dashbrd/blogcategories")
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        if(result.okay){
            let docs = result.docs;
            let container = document.querySelector("#blogcategories");
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
                    text = editorController.removeExcessWhitespaces(text);
                    if(!formdiv.classList.contains("hide")){
                        let alreadySelected = false;
                        for(let i = 1; i <= counter["cat"]; i++){
                            let cat = form.querySelector(`#cat${i}`).value;
                            cat = editorController.removeExcessWhitespaces(cat);
                            if(cat === text){
                                alreadySelected = true;
                                i = counter["cat"] + 1;
                            }
                        }
                        if(alreadySelected){
                            let notifySnack = document.querySelector('.mdl-js-snackbar');
                            notifySnack.MaterialSnackbar.showSnackbar({
                                message: "Seu post já possui essa categoria.",
                                timeout: 2500
                            });
                        }
                        else if(counter["cat"] >= 10){
                            let notifySnack = document.querySelector('.mdl-js-snackbar');
                            notifySnack.MaterialSnackbar.showSnackbar({
                                message: "Você já atingiu o limite de categorias, exclua uma categoria antes de adicionar.",
                                timeout: 3000
                            });
                        }
                        else{
                            addItem("cat", catBtn, text);
                        }
                    }
                    else{
                        let notifySnack = document.querySelector('.mdl-js-snackbar');
                            notifySnack.MaterialSnackbar.showSnackbar({
                                message: "Crie ou edite um post antes de selecionar a categoria.",
                                timeout: 2500
                            });
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

//FUNCTION EXECUTION
fetchTable(currentpage);
fetchCategories();
new ImagePreview("#coverimg", "#coverpreview", "/upload/images/post-test3.jpg");
/*Creation button*/
let createlogo  = document.querySelector('#dash-design-btn-logo');
let createprint = document.querySelector('#dash-design-btn-printable');
let createart   = document.querySelector('#dash-design-btn-art');
let createvideo = document.querySelector('#dash-design-btn-video');

function openForm(formquery, otherforms, othergalleries){
    let show = document.querySelector(formquery);
    show.classList.remove('hide');    
    let others = 0;
    otherforms.forEach((form) =>{
        if(othergalleries[others] === false){
            resetForm(form, form +' input[type="hidden"]');
        }
        else{
            resetForm(form, form +' input[type="hidden"]', othergalleries[others]);
        }
        ++others;        
    });
    show.scrollIntoView({behavior: 'smooth'});
};

createlogo.addEventListener('click', e=>{
    let otherforms = ['.dash-design-form-printable', '.dash-design-form-art', '.dash-design-form-video'];
    let othergalleries = ['#printgno', false, false];
    openForm('.dash-design-form-logo', otherforms, othergalleries);
});

createprint.addEventListener('click', e=>{
    let otherforms = ['.dash-design-form-logo', '.dash-design-form-art', '.dash-design-form-video'];
    let othergalleries = ['#logogno', false, false];
    openForm('.dash-design-form-printable', otherforms, othergalleries);
});

createart.addEventListener('click', e=>{
    let otherforms = ['.dash-design-form-logo', '.dash-design-form-printable', '.dash-design-form-video'];
    let othergalleries = ['#logogno', '#printgno', false];
    openForm('.dash-design-form-art', otherforms, othergalleries);
});

createvideo.addEventListener('click', e=>{
    let otherforms = ['.dash-design-form-logo', '.dash-design-form-printable', '.dash-design-form-art'];
    let othergalleries = ['#logogno', '#printgno', false];
    openForm('.dash-design-form-video', otherforms, othergalleries);
});

/*Form reset button*/
let resetlogo  = document.querySelector('#logocancel');
let resetprint = document.querySelector('#printcancel');
let resetart   = document.querySelector('#artcancel');
let resetvid   = document.querySelector('#vidcancel');

function resetForm(formquery, id, gallery){
    let hide = document.querySelector(formquery);
    hide.classList.add('hide');
    let formEl = document.querySelector(formquery +' form');    
    formEl.reset();
    let errWarns = formEl.querySelectorAll('.form-error');
    [...errWarns].forEach(errWarn =>{
        errWarn.innerHTML = "";
    });
    let errInputs = formEl.querySelectorAll('.formitem-error');
    [...errInputs].forEach(errInput => {
        errInput.classList.remove('formitem-error');
    });
    let imgEl = document.querySelector(formquery +' form .dash-form-img');
    imgEl.src = "/images/preview.jpg";
    let idEl = document.querySelector(id);
    idEl.value = "";
    if(typeof gallery !== 'undefined'){        
        galleryEl = document.querySelector(gallery);        
        galleryEl.value = 0;
    }
    gcounter = 0;
    let gitems = document.querySelectorAll('.dash-form-gitem');
    [...gitems].forEach(gitem => {gitem.remove();});
}

resetlogo.addEventListener('click', e=>{
    resetForm('.dash-design-form-logo', '#logoid', '#logogno');
});

resetprint.addEventListener('click', e=>{
    resetForm('.dash-design-form-printable', '#printid', '#printgno');
});

resetart.addEventListener('click', e=>{
    resetForm('.dash-design-form-art', '#artid');
});

resetvid.addEventListener('click', e=>{
    resetForm('.dash-design-form-video', '#vidid');
});


/* GALLERY ****/
let gcounter = 0;

/*Add gallery buttons */
let btnsGallery = document.querySelectorAll('.dash-gallery-btn');
[...btnsGallery].forEach(btn =>{
    btn.addEventListener('click', e=>{        
        let gitem = document.createElement('div');
        gitem.classList.add('dash-form-gitem');
        ++gcounter;
        let naming = 'logo';
        if(btn.id === 'printaddgallery'){
            naming = 'print';
        }
        let galcounter = document.querySelector(`#${naming}gno`);
        galcounter.value = gcounter;
        gitem.innerHTML = `
            <h5>Imagem #${gcounter}</h5>
            <input type="hidden" id="${naming}gh${gcounter}" name="${naming}gh${gcounter}" value="">
            <label class="dash-label" for="${naming}gi${gcounter}">Arquivo:</label>
            <input type="file" id="${naming}gi${gcounter}" name="${naming}gi${gcounter}" class="${naming}gitemimg dash-file" accept="image/jpeg,image/png,image/webp,image/gif">
            <span class="form-error" id="form-error-${naming}-gi${gcounter}"></span>
            <label class="dash-label" for="${naming}gt${gcounter}">Descrição:</label>
            <input type="text" id="${naming}gt${gcounter}" name="${naming}gt${gcounter}" class="${naming}gitemtext dash-input">
            <span class="form-error" id="form-error-${naming}-gt${gcounter}"></span>
            <button type="button" class="dash-gitem-remove mdl-button mdl-js-button"><i class="material-icons">cancel</i> Excluir</button>
        `;
        btn.parentElement.insertBefore(gitem, btn);
        let delbtn = gitem.querySelector('button');
        delbtn.addEventListener('click', e=>{
            --gcounter;
            galcounter.value = gcounter;
            if(delbtn.parentElement.previousElementSibling !== null){                
                delbtn.parentElement.previousElementSibling.scrollIntoView({behavior: 'smooth'});
            }
            else{
                let elclosest = gitem.closest('form');
                elclosest.querySelector('textarea').scrollIntoView({behavior: 'smooth'});
            }
            delbtn.parentElement.remove();
            reordergitems(naming);
        });
        gitem.scrollIntoView({alignToTop: false, behavior: 'smooth'});

        
    });
});

function reordergitems(naming){
    let gitems = document.querySelectorAll('.dash-form-gitem');
    let gcount = 1;
    [...gitems].forEach(gitem =>{
        gitem.querySelector('h5').innerHTML = `Imagem #${gcount}`;
        let labels = gitem.querySelectorAll('label');        
        labels[0].htmlFor = `${naming}gi${gcount}`;
        labels[1].htmlFor = `${naming}gt${gcount}`;
        let inputs = gitem.querySelectorAll('input');
        inputs[0].id = `${naming}gh${gcount}`;
        inputs[0].name = `${naming}gh${gcount}`
        inputs[1].id = `${naming}gi${gcount}`;
        inputs[1].name = `${naming}gi${gcount}`;
        inputs[2].id = `${naming}gt${gcount}`;
        inputs[2].name = `${naming}gt${gcount}`;
        let spans = gitem.querySelectorAll('span');
        spans[0].id = `form-error-${naming}-gi${gcount}`;
        spans[1].id = `form-error-${naming}-gt${gcount}`;
        ++gcount;
    });
}


/**** GALLERY END */

/*FORM HANDLERS****/
const logoForm = document.querySelector('.dash-design-form-logo form');

logoForm.addEventListener("submit", e=>{
    e.preventDefault();
    submitForm(logoForm, 'logo');    
});

const printForm = document.querySelector('.dash-design-form-printable form');
printForm.addEventListener("submit", e=>{
    e.preventDefault();
    submitForm(printForm, 'print');
});

const artForm = document.querySelector('.dash-design-form-art form');
artForm.addEventListener("submit", e=>{
    e.preventDefault();
    submitForm(artForm, 'art');
});

const vidForm = document.querySelector('.dash-design-form-video form');
vidForm.addEventListener("submit", e=>{
    e.preventDefault();    
    submitForm(vidForm, 'vid');
});

function submitForm(form, name){    
    let formData = new FormData(form);
    let isUpdate = false;
    let errormsg = "";
    let isValid = true;
    
    
    if(formData.get(name +'id') !== ""){
        isUpdate = true;
    }
    
    if(isUpdate){        
        if(name === 'logo' || name === 'print'){
            if(formData.get(name +'gno') !== null && formData.get(name +'gno') > 0){
                let gamount = parseInt(formData.get(name +'gno')) + 1;
                for(let i = 1; i < gamount; i++){
                    if(formData.get(name +'gh' +i) === ""){
                        //Este é um campo novo, validar normalmente
                        if(formData.get(name +'gi' +i).size === 0){
                            errormsg = errormsg +`Você deve inserir uma imagem para este item da galeria.<br>`;
                            isValid = false;                    
                        }
                        form.querySelector(`#form-error-${name}-gi${i}`).innerHTML = errormsg;
                        errormsg = "";
                        if(formData.get(name +'gt' +i) === ""){
                            errormsg = errormsg +`Você deve inserir uma descrição para este item  da galeria.<br>`;
                            isValid = false;
                            form.querySelector(`#${name}gt${i}`).classList.add('formitem-error');
                        }
                        else{
                            form.querySelector(`#${name}gt${i}`).classList.remove('formitem-error');
                        }
                        form.querySelector(`#form-error-${name}-gt${i}`).innerHTML = errormsg;
                        errormsg = "";
                    }                    
                }
            }
        }        
    }
    else{        
        form.querySelector('.form-error-total').innerHTML = "";
        
        //DATA VALIDATION
        if(formData.get(name +'file') !== null){
            if(formData.get(name +'file').size === 0){
                errormsg = errormsg +'Você deve incluir um arquivo de vídeo.<br>';
                isValid = false;                
            }            
            form.querySelector('.form-error-file').innerHTML = errormsg;    
        }
        errormsg = "";

        if(formData.get(name +'img') !== null){
            if(formData.get(name +'img').size === 0){
                errormsg = errormsg +'Você deve incluir uma imagem principal.<br>';
                isValid = false;                
            }            
            form.querySelector('.form-error-img').innerHTML = errormsg;    
        }        
        errormsg = "";

        if(formData.get(name +'title') === ""){
            errormsg = errormsg +'Você deve inserir um título.<br>';
            isValid = false;
            form.querySelector(`#${name}title`).classList.add('formitem-error');
        }
        else{
            form.querySelector(`#${name}title`).classList.remove('formitem-error');
        }
        
        form.querySelector('.form-error-title').innerHTML = errormsg;
        errormsg = "";

        if(formData.get(name +'date') === ""){
            errormsg = errormsg +'Você deve inserir uma data.<br>';
            isValid = false;
            form.querySelector(`#${name}date`).classList.add('formitem-error');
        }
        else{
            form.querySelector(`#${name}date`).classList.remove('formitem-error');
        }
        form.querySelector('.form-error-date').innerHTML = errormsg;
        errormsg = "";
        
        if(formData.get(name +'desc') === ""){
            errormsg = errormsg +'Você deve inserir uma descrição.<br>';
            isValid = false;
            form.querySelector(`#${name}desc`).classList.add('formitem-error');
        }
        else{
            form.querySelector(`#${name}desc`).classList.remove('formitem-error');
        }
        form.querySelector('.form-error-desc').innerHTML = errormsg;
        errormsg = "";

        if(formData.get(name +'gno') !== null && formData.get(name +'gno') > 0){

            let gamount = parseInt(formData.get(name +'gno')) + 1;                        
            for(let i = 1; i < gamount; i++){              
                if(formData.get(name +'gi' +i).size === 0){
                    errormsg = errormsg +`Você deve inserir uma imagem para este item da galeria.<br>`;
                    isValid = false;                    
                }
                form.querySelector(`#form-error-${name}-gi${i}`).innerHTML = errormsg;
                errormsg = "";
                if(formData.get(name +'gt' +i) === ""){
                    errormsg = errormsg +`Você deve inserir uma descrição para este item  da galeria.<br>`;
                    isValid = false;
                    form.querySelector(`#${name}gt${i}`).classList.add('formitem-error');
                }
                else{
                    form.querySelector(`#${name}gt${i}`).classList.remove('formitem-error');
                }
                form.querySelector(`#form-error-${name}-gt${i}`).innerHTML = errormsg;
                errormsg = "";
            }

        }        

        if(formData.get(name +'thumb') !== null){
            if(formData.get(name +'thumb').size === 0){
                errormsg = errormsg +'Você deve incluir uma thumbnail para o vídeo.<br>';
                isValid = false;
            }
            form.querySelector('.form-error-thumb').innerHTML = errormsg;    
        }        
    }

    if(isValid){
        //FORM SUBMIT
        fetch(form.action,{
            method: form.method,
            body: formData
        })
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            if(typeof data.okay === 'undefined'){
                form.querySelector('.form-error-total').innerHTML = data.error;
            }
            else{
                let notifySnack = document.querySelector('.mdl-js-snackbar');
                notifySnack.MaterialSnackbar.showSnackbar({
                    message: data.okay,
                    timeout: 2000
                });
                setTimeout(()=>{
                    window.location.reload();
                },'3000');
            }
        })
        .catch(function(err){
            alert(err);
            console.log(err);
        });
    }
    else{
        form.querySelector('.form-error-total').innerHTML = '<i>Verifique os erros no formulário e tente novamente.</i>';
    }
}
/****FORM HANDLERS END*/

/*FETCHING TABLE DATA ****/
let pages = {};
pages['logo']  = 0;
pages['print'] = 0;
pages['art']   = 0;
pages['vid']   = 0;

let pg = {};
pg['logo']  = 1;
pg['print'] = 1;
pg['art']   = 1;
pg['vid']   = 1;

//create button listeners only once
let startnav = {};
startnav['logo']  = true;
startnav['print'] = true;
startnav['art'] = true;
startnav['vid'] = true;


function fetchTable(type, page){

    fetch(`/dashbrd/design/${type}/${page}`)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if(typeof data.error !== 'undefined'){
            console.log(data.error);
        }
        else{
            pages[type] = data.pages;
            pg[type] = page;
            tableNav(type, page, pages[type]);            
            tableRows(type, data.rows);
        }
    });
}

function tableNav(type, page, totalpages){
    //TODO: Handle input on page no
    let first = document.querySelector(`#${type}-page-first`);
    let prev = document.querySelector(`#${type}-page-prev`);
    let noForm = document.querySelector(`#${type}-page-form`);
    let no = document.querySelector(`#${type}-page-no`);    
    let total = document.querySelector(`.${type}-page-total`);
    let next = document.querySelector(`#${type}-page-next`);
    let last = document.querySelector(`#${type}-page-last`);    

    no.value = page;
    no.max = totalpages;
    total.innerHTML = totalpages;

    if(page === 1){
        first.disabled = true;
        prev.disabled = true;        
    }
    else{
        first.disabled = false;
        prev.disabled = false;
    }

    if(page === totalpages || totalpages === 0){
        next.disabled = true;
        last.disabled = true;
    }
    else{
        next.disabled = false;
        last.disabled = false;
    }

    if(totalpages < 2){
        no.disabled = true;
    }
    else{
        no.disabled = false;
    }

    if(startnav[type]){
        startnav[type] = false;
        first.addEventListener('click', e=>{
            fetchTable(type, 1);            
        });
        prev.addEventListener('click', e=>{
            fetchTable(type, pg[type]-1);
        });
        next.addEventListener('click', e=>{
            fetchTable(type, pg[type]+1);
        });
        last.addEventListener('click', e=>{
            fetchTable(type, pages[type]);
        });
        noForm.addEventListener('submit', e=>{
            e.preventDefault();
            let numbering = parseInt(no.value, 10);
            if(numbering !== pg[type]){
                fetchTable(type, numbering);
            }
        });
    }
};

function tableRows(type, rows){
    let tbody = document.querySelector(`.table-${type} tbody`);
    tbody.innerHTML = "";
    rows.forEach(row =>{
        let tr = document.createElement('tr');
        let img;
        let inner = "";
        if(type === 'vid'){
            img = row.thumb;
        }
        else{
            img = row.img;
        }

        let date = PrettyDate.shortDate(row.date);

        inner = `
            <td><img class="dash-table-img" src="${img}"></td>
            <td>${row.title}</td>
            <td>${date}</td>
            <td>${row.desc}</td>
        `;

        if(type === 'logo' || type === 'print'){
            if(typeof row.gallery === 'undefined'){
                inner = inner + `<td>Não</td>`;
            }
            else{
                inner = inner + `<td>Sim</td>`;
            }
        }
        if(type === 'vid'){
            inner = inner + 
            `<td><a class="dash-tlink" target="_blank" href="${row.vid}"><button type="button" class="dash-tbtn mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised"><i class="material-icons">play_arrow</i>Abrir</button></a></td>`;
        }

        inner = inner +`
            <td class="tdactions">
                <button type="button" class="dash-tbtn btn-edit mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--accent"><i class="material-icons">edit</i> Editar</button>
                <button type="button" class="dash-tbtn btn-delete mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored"><i class="material-icons">delete</i>Excluir</button>
            </td>
        `;

        //Appending data to HTML and the dataset
        tr.innerHTML = inner;
        tr.dataset.row = JSON.stringify(row);

        tbody.appendChild(tr);

        //Adding events to edit and delete buttons
        let editbtn = tr.querySelector('.btn-edit');
        let delbtn = tr.querySelector('.btn-delete');

        editbtn.addEventListener('click', e=>{
            editEntry(e, type);
        });
        delbtn.addEventListener('click', e=>{
            deleteEntry(e, type);
        });
    });
}

fetchTable('logo', 1);
fetchTable('print', 1);
fetchTable('art', 1);
fetchTable('vid', 1);

function editEntry(e, type){
    let dataset = getDataset(e);
    let form;
    let gallery = false;
    if(type === 'logo'){        
        resetForm('.dash-design-form-logo', '#logoid', '#logogno');        
        createlogo.click();
        form = logoForm;
        form.querySelector(`.dash-form-img`).src = dataset.img;
        if(typeof dataset.gallery !== 'undefined'){
            gallery = true;
        }
    }
    else if(type === 'print'){        
        resetForm('.dash-design-form-printable', '#printid', '#printgno');
        createprint.click();
        form = printForm;
        form.querySelector(`.dash-form-img`).src = dataset.img;
        if(typeof dataset.gallery !== 'undefined'){
            gallery = true;
        }
    }
    else if(type === 'art'){
        resetForm('.dash-design-form-art', '#artid');
        createart.click();
        form = artForm;
        form.querySelector(`.dash-form-img`).src = dataset.img;
    }
    else if(type === 'vid'){
        resetForm('.dash-design-form-video', '#vidid');
        createvideo.click();
        form = vidForm;
        form.querySelector(`.dash-form-img`).src = dataset.thumb;
    }

    form.querySelector(`#${type}id`).value = dataset._id;
    form.querySelector(`#${type}title`).value = dataset.title;
    form.querySelector(`#${type}date`).value = dataset.date;
    form.querySelector(`#${type}desc`).value = dataset.desc;    

    if(gallery){
        gcounter = dataset.glen;
        let galcounter = document.querySelector(`#${type}gno`);
        galcounter.value = dataset.glen;
        let no = 1;
        dataset.gallery.forEach(item =>{
            let gitem = addGItem(type, item, no);
            let btn = form.querySelector('.dash-gallery-btn');
            btn.parentElement.insertBefore(gitem, btn);
            let delbtn = gitem.querySelector('button');
            delbtn.addEventListener('click', e=>{
                --gcounter;
                galcounter.value = gcounter;
                if(delbtn.parentElement.previousElementSibling !== null){                
                    delbtn.parentElement.previousElementSibling.scrollIntoView({behavior: 'smooth'});
                }
                else{
                    let elclosest = gitem.closest('form');
                    elclosest.querySelector('textarea').scrollIntoView({behavior: 'smooth'});
                }
                delbtn.parentElement.remove();
                reordergitems(type);
            });
            ++no;
            
        });
    }

}

function addGItem(type, item, no){
	let gitem = document.createElement('div');
	gitem.classList.add('dash-form-gitem');	
	gitem.innerHTML = `
		<h5>Imagem #${no}</h5>
        <input type="hidden" id="${type}gh${no}" name="${type}gh${no}" value="${item.item}">
        <img class="dash-form-img" src="${item.image}">
        <label class="dash-label" for="${type}gi${no}">Arquivo:</label>
        <input type="file" id="${type}gi${no}" name="${type}gi${no}" class="${type}gitemimg dash-file" accept="image/jpeg,image/png,image/webp,image/gif">
        <span class="form-error" id="form-error-${type}-gi${no}"></span>
        <label class="dash-label" for="${type}gt${no}">Descrição:</label>
        <input type="text" id="${type}gt${no}" name="${type}gt${no}" class="${type}gitemtext dash-input" value="${item.desc}">
        <span class="form-error" id="form-error-${type}-gt${no}"></span>
        <button type="button" class="dash-gitem-remove mdl-button mdl-js-button"><i class="material-icons">cancel</i> Excluir</button>
	`;
    return gitem;
}

function deleteEntry(e, type){
    let dataset = getDataset(e);
    let id = dataset._id;
    let msg = 'Deseja realmente excluir esta logo?';
    if(type === 'print'){
        msg = 'Deseja realmente excluir este material gráfico?';
    }
    else if(type === 'art'){
        msg = 'Deseja realmente excluir esta arte?';
    }
    else if (type === 'vid'){
        msg = 'Deseja realmente excluir este vídeo?';
    }
    if(confirm(msg)){
        fetch(`/dashbrd/design/${type}/${id}`, {
            method: 'DELETE'
        })
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            let notifySnack = document.querySelector('.mdl-js-snackbar');
            if(typeof data.error === 'undefined'){                
                notifySnack.MaterialSnackbar.showSnackbar({
                    message: data.okay,
                    timeout: 2000
                });
                setTimeout(()=>{
                    window.location.reload();
                },'3000');
            }
            else{
                notifySnack.MaterialSnackbar.showSnackbar({
                    message: data.error,
                    timeout: 3000
                });
            }
        })
        .catch(function(err){
            console.log(err);
        });        
    }
}

function getDataset(e){
    let entry = e.composedPath().find(el => {
        return (el.tagName.toLowerCase() === 'tr');
    });

    return JSON.parse(entry.dataset.row);
};

/****FETCHING TABLE DATA END */


/*Form image previews****/
new ImagePreview('#logoimg', '.dash-design-form-logo .dash-form-img');
new ImagePreview('#printimg', '.dash-design-form-printable .dash-form-img');
new ImagePreview('#artimg', '.dash-design-form-art .dash-form-img');
new ImagePreview('#vidthumb', '.dash-design-form-video .dash-form-img');
/****Form image previews END*/

/*Snackbar handler****/
let snack = document.querySelector('.mdl-snackbar__text');    
if(snack.innerHTML !== ""){        
    let msg = snack.textContent;    

    let materialhang = setInterval(snackavailable, 300);
    let stillhanging = true;
    
    function snackavailable(){
        if(typeof MaterialSnackbar === 'undefined' && !MaterialSnackbar);
        else{  
            stillhanging = false;
        }
        if(!stillhanging){
            let notifySnack = document.querySelector('.mdl-js-snackbar');
            notifySnack.MaterialSnackbar.showSnackbar({
                message: snack.innerHTML,
                timeout: 3000
            });            
            clearInterval(materialhang);
        }
    }    

}
/****Snackbar handler END*/
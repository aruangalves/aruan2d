import { editorController } from "./editorController.js";

let front = new frontController();

//header
let title = document.querySelector("#dev-project-title");
let projectdate = document.querySelector("#dev-project-date");
let cover = document.querySelector(".dev-project-header");

//aside
let status = document.querySelector("#dev-project-status");
let version = document.querySelector("#dev-project-version");
let link = document.querySelector("#dev-project-link");
let repo = document.querySelector("#dev-project-repo");
let license = document.querySelector("#dev-project-license");
let categories = document.querySelector("#dev-project-categories");

//content
let overview = document.querySelector("#dev-project-overview");
let intro = document.querySelector("#dev-project-intro");
let manual = document.querySelector("#dev-project-manual");
let resources = document.querySelector("#dev-project-resources");
let changelog = document.querySelector("#dev-project-changelog");

let retrieve = document.querySelector("#dev-project-retrieve");
let project = JSON.parse(retrieve.dataset.row);

if(!project.okay){
    console.log(project.msg);
}
else{    

    let doc = project.doc;
    //render project    
    if(typeof doc.coverimg !== "undefined"){
        cover.style.backgroundImage = `url(${doc.coverimg})`;
    }
    title.innerHTML = doc.title;
    let data = "";
    if(typeof doc.edit !== "undefined"){
        data = `Última modificação: ${PrettyDate.longDate(doc.edit)} | `;
    }
    data = data + `Data de criação: ${PrettyDate.longDate(doc.time)}`;
    projectdate.innerHTML = data;

    status.innerHTML = doc.status;
    version.innerHTML = doc.currentversion;
    link.innerHTML = `<a class="dev-project-asidelink" href="${doc.externalurl}">Acessar</a>`;
    repo.innerHTML = `<a class="dev-project-asidelink" href="${doc.repo}">Acessar</a>`;
    license.innerHTML = `<a class="dev-project-asidelink" href="${doc.licenseurl}">${doc.license}</a>`;
    let category = "";
    for(let i = 0; i < doc.categories.length; i++){
        category = category + `<a class="dev-project-asidelink dev-project-category" href="/dev/categories/${doc.categories[i].url}">${doc.categories[i].name}</a>`;
        if(i < doc.categories.length-1){
            category = category + ", ";
        }
    }
    categories.innerHTML = category;

    editorController.parse(doc.overview, overview);
    editorController.parse(doc.intro, intro);
    editorController.parse(doc.manual, manual);
    editorController.parse(doc.resources, resources);
    editorController.parse(doc.changelog, changelog);

    front.setImageClickEvents(overview);
    front.setImageClickEvents(intro);
    front.setImageClickEvents(manual);
    front.setImageClickEvents(resources);
    front.setImageClickEvents(changelog);

    setCodeHighlighting(overview);
    setCodeHighlighting(intro);
    setCodeHighlighting(manual);
    setCodeHighlighting(resources);
    setCodeHighlighting(changelog);
    
    retrieve.remove();
}
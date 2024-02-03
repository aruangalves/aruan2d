export class devController extends frontController{
    constructor(type = "dev"){
        super();

        this.currentpage = 1;
        this.totalpages = 1;
        this.projectsContainer = document.querySelector(".dev-projects");

        this.firstBtn = document.querySelector("#page-first");
        this.prevBtn = document.querySelector("#page-previous");
        this.noForm = document.querySelector(".page-number");
        this.noInput = document.querySelector("#page-input");
        this.totalEl = document.querySelector("#page-total");
        this.nextBtn = document.querySelector("#page-next");
        this.lastBtn = document.querySelector("#page-last");        

        this.navStarted = false;
        this.categoryURL = [];
        
        if(type === "category"){
            this.setCategoryURL();
            this.startCategoryNavigation();
            this.getCategoryProjects(this.currentpage);
        }
        else{
            this.startNavigation();
            this.getProjects(this.currentpage);
        }
        this.getCategories();
        this.getListing();
    }

    setCategoryURL(){
        let path = window.location.pathname;
        if(path.charAt(0) === '/'){
            path = path.substring(1);
        }
        this.categoryURL = path.split('/');
    }

    getCategories(){
        let self = this;
        fetch(`/dev/categories`)
        .then(function(response){
            return response.json();
        })
        .then(function(results){
            if(results.okay){
                let docs = results.docs;
                let container = document.querySelector(".dev-categories");
                for(let i = 0; i < docs.length; i++){
                    let a = document.createElement("a");
                    a.href="/dev/categories/" +docs[i].url;
                    a.classList.add("dev-cat-btn");
                    let span = document.createElement("span");
                    span.innerHTML = docs[i].name;
                    a.appendChild(span);
                    container.appendChild(a);
                }
            }
            else{
                console.log("Não foi possível recuperar a lista de categorias de DEV.");
            }
        })
    }

    getCategoryProjects(page){
        let self = this;
        if(this.categoryURL[0] === 'dev' && this.categoryURL[1] === 'categories' && this.categoryURL.length > 2){
            let url = this.categoryURL[2];
            if(page < 0){
                page = 1;
            }
            else if(page > this.totalpages){
                page = this.totalpages;
            }

            fetch(`/dev/categories/${url}/${page.toString()}`)
            .then(function(response){
                return response.json();
            })
            .then(function(results){
                if(!results.okay){
                    console.log(results.msg);
                }
                else{
                    let rows = results.rows;

                    self.currentpage = page;
                    self.totalpages = results.pages;
                    self.setNavigation();

                    self.projectsContainer.innerHTML = "";
                    for(let i = 0; i < rows.length; i++){
                        self.renderLiteProject(rows[i]);
                        if(i !== rows.length-1){
                            let divider = document.createElement("hr");
                            divider.classList.add("dev-hr");
                            self.projectsContainer.appendChild(divider);
                        }
                    }

                }
            })
        }
    }

    getListing(){
        let self = this;

        fetch(`/dev/listing`)
        .then(function(response){
            return response.json();            
        })
        .then(function(results){
          if(results.okay){
            let docs = results.docs;
            let itemshading = true;
            docs.forEach( doc =>{                
                let container = "";
                container = self.setListingContainer(doc.title);

                if(container === ""){
                    console.log(`Erro: o item ${title} não foi classificado corretamente.`);                    
                }
                else{
                    let div = document.querySelector(container);
                    let item = document.createElement("a");
                    item.innerHTML = doc.title;
                    item.href = "/dev/project/" +doc.url;
                    item.classList.add("dev-alphai");
                    if(itemshading){
                        item.classList.add("dev-alpha-a");
                        itemshading = false;
                    }
                    else{
                        item.classList.add("dev-alpha-ao");
                        itemshading = true;
                    }
                    div.appendChild(item);
                }                
            });
          }
          else{
            console.log("Não foi possível recuperar a lista de projetos.");
          }
        });        
    }

    getProjects(page){
        let self = this;
        fetch(`/dev/${page}`)
        .then(function(response){
            return response.json();
        })
        .then(function(results){
            if(!results.okay){
                console.log("Não foi possível recuperar os projetos de DEV.");                
            }
            else{
                let rows = results.rows;

                self.currentpage = page;
                self.totalpages = results.pages;
                self.setNavigation();

                self.projectsContainer.innerHTML = "";

                for(let i = 0; i < rows.length; i++){
                    self.renderLiteProject(rows[i]);
                    if(i !== rows.length-1){
                        let divider = document.createElement("hr");
                        divider.classList.add("dev-hr");
                        self.projectsContainer.appendChild(divider);
                    }
                }                
            }
        });//then(function(results){});
    }

    setListingContainer(title){
        let container = "";        

        switch(true){
            case /^[^a-záàãâäéèêëíìîïóòõôöúùûüýÿçñ]/i.test(title):
                container = ".d0-items";
            break;
            case /^[aáàãâä]/i.test(title):
                container = ".da-items";
            break;
            case /^b/i.test(title):
                container = ".db-items";
            break;
            case /^[cç]/i.test(title):
                container = ".dc-items";
            break;
            case /^d/i.test(title):
                container = ".dd-items";
            break;
            case /^[eéèêë]/i.test(title):
                container = ".de-items";
            break;
            case /^f/i.test(title):
                container = ".df-items";
            break;
            case /^g/i.test(title):
                container = ".dg-items";
            break;
            case /^h/i.test(title):
                container = ".dh-items";
            break;
            case /^[iíìîï]/i.test(title):
                container = ".di-items";
            break;
            case /^j/i.test(title):
                container = ".dj-items";
            break;
            case /^k/i.test(title):
                container = ".dk-items";
            break;
            case /^l/i.test(title):
                container = ".dl-items";
            break;
            case /^m/i.test(title):
                container = ".dm-items";
            break;
            case /^[nñ]/i.test(title):
                container = ".dn-items";
            break;
            case /^[oóòõôö]/i.test(title):
                container = ".do-items";
            break;
            case /^p/i.test(title):
                container = ".dp-items";
            break;
            case /^q/i.test(title):
                container = ".dq-items";
            break;
            case /^r/i.test(title):
                container = ".dr-items";
            break;
            case /^s/i.test(title):
                container = ".ds-items";
            break;
            case /^t/i.test(title):
                container = ".dt-items";
            break;
            case /^[uúùûü]/i.test(title):
                container = ".du-items";
            break;
            case /^v/i.test(title):
                container = ".dv-items";
            break;
            case /^w/i.test(title):
                container = ".dw-items";
            break;
            case /^x/i.test(title):
                container = ".dx-items";
            break;
            case /^[yýÿ]/i.test(title):
                container = ".dy-items";
            break;
            case /^z/i.test(title):
                container = ".dz-items";
            break;
        }

        return container;
    }

    setNavigation(){
        this.noInput.value = this.currentpage;
        this.noInput.max = this.totalpages;

        this.totalEl.innerHTML = this.totalpages;

        if(this.currentpage < 2){
            this.firstBtn.disabled = true;
            this.prevBtn.disabled = true;
        }
        else{
            this.firstBtn.disabled = false;
            this.prevBtn.disabled = false;
        }

        if(this.currentpage === this.totalpages || this.totalpages === 0){
            this.nextBtn.disabled = true;
            this.lastBtn.disabled = true;
        }
        else{
            this.nextBtn.disabled = false;
            this.lastBtn.disabled = false;
        }

        if(this.totalpages < 2){
            this.noInput.disabled = true;
        }
        else{
            this.noInput.disabled = false;
        }
    }

    startCategoryNavigation(){
        if(!this.navStarted){
            this.navStarted = true;
            
            this.firstBtn.disabled = true;
            this.prevBtn.disabled = true;
            this.noInput.disabled = true;
            this.totalEl.innerHTML = "1";
            this.nextBtn.disabled = true;
            this.lastBtn.disabled = true;

            this.firstBtn.addEventListener("click", e=>{
                this.getCategoryProjects(1);
            });
            this.prevBtn.addEventListener("click", e=>{
                this.getCategoryProjects(this.currentpage-1);
            });
            this.noForm.addEventListener("submit", e=>{
                e.preventDefault();
                let no = parseInt(this.noInput.value, 10);   
                if(no !== this.currentpage){
                    this.getCategoryProjects(no);
                }                
            });
            this.nextBtn.addEventListener("click", e=>{
                this.getCategoryProjects(this.currentpage+1);
            });
            this.lastBtn.addEventListener("click", e=>{
                this.getCategoryProjects(this.totalpages);
            });
        }
        else{
            console.log("Os botões de navegação já foram inicializados. Não é possível evocar este método uma segunda vez.");
        }
    }

    startNavigation(){
        if(!this.navStarted){
            this.navStarted = true;
            
            this.firstBtn.disabled = true;
            this.prevBtn.disabled = true;
            this.noInput.disabled = true;
            this.totalEl.innerHTML = "1";
            this.nextBtn.disabled = true;
            this.lastBtn.disabled = true;

            this.firstBtn.addEventListener("click", e=>{
                this.getProjects(1);
            });
            this.prevBtn.addEventListener("click", e=>{
                this.getProjects(this.currentpage-1);
            });
            this.noForm.addEventListener("submit", e=>{
                e.preventDefault();
                let no = parseInt(this.noInput.value, 10);   
                if(no !== this.currentpage){
                    this.getProjects(no);
                }                
            });
            this.nextBtn.addEventListener("click", e=>{
                this.getProjects(this.currentpage+1);
            });
            this.lastBtn.addEventListener("click", e=>{
                this.getProjects(this.totalpages);
            });
        }
        else{
            console.log("Os botões de navegação já foram inicializados. Não é possível evocar este método uma segunda vez.");
        }
    }

    findListingPredecessor(container){
        let predecessor = "";
        switch(container){            
            case ".da-items":
                predecessor = ".d0-items";
            break;
            case ".db-items":
                predecessor = ".da-items";
            break;
            case ".dc-items":
                predecessor = ".db-items";
            break;
            case ".dd-items":
                predecessor = ".dc-items";
            break;
            case ".de-items":
                predecessor = ".dd-items";
            break;
            case ".df-items":
                predecessor = ".de-items";
            break;
            case ".dg-items":
                predecessor = ".df-items";
            break;
            case ".dh-items":
                predecessor = ".dg-items";
            break;
            case ".di-items":
                predecessor = ".dh-items";
            break;
            case ".dj-items":
                predecessor = ".di-items";
            break;
            case ".dk-items":
                predecessor = ".dj-items";
            break;
            case ".dl-items":
                predecessor = ".dk-items";
            break;
            case ".dm-items":
                predecessor = ".dl-items";
            break;
            case ".dn-items":
                predecessor = ".dm-items";
            break;
            case ".do-items":
                predecessor = ".dn-items";
            break;
            case ".dp-items":
                predecessor = ".do-items";
            break;
            case ".dq-items":
                predecessor = ".dp-items";
            break;
            case ".dr-items":
                predecessor = ".dq-items";
            break;
            case ".ds-items":
                predecessor = ".dr-items";
            break;
            case ".dt-items":
                predecessor = ".ds-items";
            break;
            case ".du-items":
                predecessor = ".dt-items";
            break;
            case ".dv-items":
                predecessor = ".du-items";
            break;
            case ".dw-items":
                predecessor = ".dv-items";
            break;
            case ".dx-items":
                predecessor = ".dw-items";
            break;
            case ".dy-items":
                predecessor = ".dx-items";
            break;
            case ".dz-items":
                predecessor = ".dy-items";
            break;
        }
        return predecessor;
    }

    renderLiteProject(row){
        let project = document.createElement("div");
        project.classList.add("dev-intro");

        let head = document.createElement("div");
        head.classList.add("dev-head");

        let heada = document.createElement("a");
        heada.classList.add("dev-head-a");
        heada.href = "/dev/project/" +row.url;

        let h2 = document.createElement("h2");
        h2.innerHTML = row.title +" . ";
        h2.classList.add("dev-title");
        heada.appendChild(h2);
        head.appendChild(heada);

        let subtitle = document.createElement("div");
        subtitle.classList.add("dev-subtitle");
        let text = PrettyDate.longDate(row.time) + " | ";
        if(typeof row.edit !== "undefined"){
            text = text + "Última atualização: " + PrettyDate.shortDate(row.edit) + " | ";
        }
        text = text + "Versão: " +row.currentversion;
        subtitle.innerHTML = text;
        head.appendChild(subtitle);

        project.appendChild(head);

        let sep1 = document.createElement("div");
        sep1.classList.add("dev-intro-sep1");
        project.appendChild(sep1);

        let sep2 = document.createElement("div");
        sep2.classList.add("dev-intro-sep2");
        project.appendChild(sep2);

        let overview = document.createElement("div");
        overview.classList.add("dev-overview");
        let categories = "<b>CATEGORIAS:</b> ";
        for(let i = 0; i < row.categories.length; i++){
            categories = categories + `<a href="/dev/categories/${row.categories[i].url}">${row.categories[i].name.toLowerCase()}</a>`;
            if(i < row.categories.length - 1){
                categories = categories + ", ";
            }
            else{
                categories = categories + ".<br>";
            }
        }
        overview.innerHTML = `<p>${row.abstract}</p>` + categories;

        project.appendChild(overview);

        let bottom = document.createElement("div");
        bottom.classList.add("dev-bottom");
        let bottomlink = document.createElement("a");
        bottomlink.classList.add("dev-bottom-link");
        bottomlink.href = "/dev/project/" +row.url;
        bottomlink.innerHTML = `Acessar página do projeto <span class="material-icons">keyboard_double_arrow_right</span>`;
        bottom.appendChild(bottomlink);
        project.appendChild(bottom);
        bottom = document.createElement("div");
        bottom.classList.add("dev-bottom-deco");
        project.appendChild(bottom);

        this.projectsContainer.appendChild(project);
    }
}
class frontController{
    constructor(isIndex = false){

        this.modal = document.querySelector('#modal-search');
        this.modalFigure = document.querySelector('#modal-article-figure');
        this.modalDesign = document.querySelector('#modal-design');

        this.searchBtn = document.querySelector('#search-button');
        this.searchForm = document.querySelector('#search-form');  
        this.searchInfo = document.querySelector('#search-info');
        this.searchContainer = document.querySelector('#search-container');
        this.searchAmount = document.querySelector('#search-amount');
        this.searchPlural = document.querySelector('#search-plural');
        this.searchTerm = document.querySelector('#search-term');
        this.searchLoading = document.querySelector('#search-loading');
        this.searchMore = document.querySelector('#search-more');
        this.searchStarted = false;
        this.searchBlogSkip = 0;
        this.searchDevSkip = 0;
        this.searchBlogTotal = 0;
        this.searchDevTotal = 0;

        this.initModals();        
        this.initExpandable();
        this.initDevMenus();  
        this.initSearch();

        this.windowModalStd = e =>{
            this.windowModal(e, this.modal, this.windowModalStd);
        }
    
        this.windowModalFigure = e =>{
            this.windowModal(e, this.modalFigure, this.windowModalFigure);
        }
    
        this.windowModalDesign = e =>{
            this.windowModal(e, this.modalDesign, this.windowModalDesign);
        }

        if(isIndex){
            this.iblog = document.querySelectorAll(".iblog");
            
            this.idev = document.querySelectorAll(".index-dev-item");            
            this.initIndex();
        }

    }

    initIndex(){
        let self = this;
        fetch(`/recent`)
        .then(function(response){
            return response.json();
        })
        .then(function(results){
            if(!results.okay){
                console.log("Não foi possível recuperar a listagem com projetos e posts recentes.");
            }
            else{
                self.setIndexBlog(results.blog);
                self.setIndexDev(results.dev);
            }
        });
    }

    setIndexBlog(rows){
        let size = rows.length;        

        if(size < 1) return;

        switch(size){
            case 1:
                this.iblog[0].classList.add("mdl-cell--12-col");
                this.iblog[0].classList.remove("mdl-cell--8-col");
                break;
            case 2:
                this.iblog[1].classList.add("mdl-cell--8-col-tablet");
                break;
            case 3:
                this.iblog[2].classList.add("mdl-cell--12-col-desktop");
                break;
        }
        //BLOG ELEMENTS:
        //Background image: .iblog-img
        //Date: .iblog-date
        //Title: .iblog-title
        //Abstract: .iblog-text
        //Link: .iblog-link
        //Categories: .iblog-cat
        //Each individual category as: <a class="index-cat-link" href="#">cat1</a>
        for(let i = 0; i < size; i++){            
            if(typeof rows[i].coverimg !== "undefined"){                
                this.iblog[i].querySelector(".iblog-img").style.backgroundImage = `url(${rows[i].coverimg})`;                
            }
            let time = new Date(rows[i].time);
            this.iblog[i].querySelector(".iblog-date").innerHTML = PrettyDate.fullDate(time);
            let title = this.iblog[i].querySelector(".iblog-title");
            title.innerHTML = rows[i].title;
            title.href = "blog/post/" +rows[i].url;
            this.iblog[i].querySelector(".iblog-text").innerHTML = rows[i].abstract;            
            this.iblog[i].querySelector(".iblog-link").href = "blog/post/" +rows[i].url;
            let categories = "";
            let compliment = "";
            if(i === 3) compliment = "2";
            for(let j = 0; j < rows[i].categories.length; j++){
                categories = categories + `<a class="index-cat-link${compliment}" href="/blog/categories/${rows[i].categories[j].url}">${rows[i].categories[j].name}</a>`;
                if(j < rows[i].categories.length - 1){
                    categories = categories + ", ";
                }
                else{
                    categories = categories + "."
                }
            }
            this.iblog[i].querySelector(".iblog-cat").innerHTML = categories;
            this.iblog[i].classList.remove("hide");
        }
    }

    setIndexDev(rows){
        //DEV ELEMENTS:
        //Title: .idev-title
        //Creation date: .idev-date
        //Last edit date: .idev-update
        //Version: .idev-ver
        //Abstract: .idev-desc
        //Link: .idev-link
        //Categories: .idev-cat
        //Each individual category as: <a class="index-cat-link2" href="#">categoria 1</a>
        for(let i = 0; i < rows.length; i++){
            let title = this.idev[i].querySelector(".idev-title");
            title.innerHTML = rows[i].title;
            title.href = "/dev/project/" +rows[i].url;
            this.idev[i].querySelector(".idev-date").innerHTML = PrettyDate.longDate(rows[i].time);
            if(typeof rows[i].edit !== "undefined"){
                this.idev[i].querySelector(".idev-update").innerHTML = PrettyDate.longDate(rows[i].edit);
            }
            else{
                this.idev[i].querySelector(".idev-update").classList.add("hide");
            }
            this.idev[i].querySelector(".idev-desc").innerHTML = rows[i].abstract;
            this.idev[i].querySelector(".idev-link").href = "/dev/project/" +rows[i].url;
            this.idev[i].querySelector(".idev-ver").innerHTML = "Versão: " +rows[i].currentversion;
            let catlength = rows[i].categories.length;
            let categories = "";
            for(let j = 0; j < catlength; j++){
                categories = categories + `<a class="index-cat-link2" href="/dev/categories/${rows[i].categories[j].url}">${rows[i].categories[j].name}</a>`;
                if(j < catlength - 1){
                    categories = categories + ", ";
                }
                else{
                    categories = categories + ".";
                }
            }
            this.idev[i].querySelector(".idev-cat").innerHTML = categories;
            this.idev[i].classList.remove("hide");
        }
    }

    imageModal(image, figureModal){
        figureModal.querySelector('.modal-figure-img').src = image.src;
        figureModal.querySelector('.modal-figure-caption').innerHTML = image.nextElementSibling.innerHTML;
        figureModal.querySelector('#modal-figure-expand').href = image.src;
        figureModal.style.display = 'block';      
        window.addEventListener('click', this.windowModalFigure);      
    }

    windowModal(e, modal, caller){         
        if(e.target === modal){
            modal.style.display = "none";
            window.removeEventListener('click', caller);            
        }
    }

    initModals(){

        //SEARCH MODAL        
        this.searchBtn.addEventListener('click', e=>{
            this.resetSearch();
            this.modal.style.display = 'block';
            window.addEventListener('click', this.windowModalStd);
        });

        this.modal.querySelector('#modal-close').addEventListener('click', e=>{
            this.modal.style.display = 'none';
            window.removeEventListener('click', this.windowModalStd);
        });

        this.modalFigure.querySelector('#modal-figure-close').addEventListener('click',e=>{
        this.modalFigure.style.display = 'none';
        window.removeEventListener('click',this.windowModalFigure);
        });

        this.modalDesign.querySelector('#modal-design-close').addEventListener('click', e=>{
        this.modalDesign.style.display = 'none';
        window.removeEventListener('click',this.windowModalDesign);
        });

    }

    setImageClickEvents(imagesContainerEl){
        let images = imagesContainerEl.querySelectorAll('.article-image');

        if(images.length > 0){
            [...images].forEach(image=>{
                image.addEventListener('click', e=>{
                    this.imageModal(image, this.modalFigure);
                });
            });
        }
    }

    initExpandable(){        
        let expandables = document.querySelectorAll('.expandable');

        let expandablehandler = function(e, expandable){
            let expButton = expandable.querySelector('.expandable-button');          
            if(expButton.innerHTML === 'add'){
                expButton.innerHTML = 'horizontal_rule';
            }
            else{
                expButton.innerHTML = 'add';
            }  

            let expAction = expandable.querySelector('.expandable-action');
            if(expAction.innerHTML === 'ampliar'){
                expAction.innerHTML = 'fechar';
            }
            else{
                expAction.innerHTML = 'ampliar';
            }


            let expContent = expandable.querySelector('.expandable-content');
            if(expContent.classList.contains('hide')){
                expContent.classList.toggle('hide');                
                var contentHeight = expContent.scrollHeight;                        
                expContent.style.maxHeight = contentHeight + 'px';                  
            }
            else{                
                let delay = setTimeout(()=>{
                    expContent.classList.toggle('hide');
                    clearTimeout(delay);
                },500);
                expContent.style.maxHeight = '0px';
            }
        }

        if(expandables.length>0){
        [...expandables].forEach(expandable=>{        
            expandable.addEventListener('click',e => {expandablehandler(e, expandable)});        
        });
        }

        let expandablemenus = document.querySelectorAll('.expandablemenu');

        if(expandablemenus.length > 0){
            [...expandablemenus].forEach(expandable=>{
                expandable.querySelector('.expandable-header').addEventListener('click', e=>{expandablehandler(e, expandable)});
            });
        }
    }

    initDevMenus(){
        let btnAlpha = document.querySelector('#dev-alpha-btn');
        let btnCat = document.querySelector('#dev-cat-btn');

        if(btnAlpha === null && btnCat === null);
        else{
            function btnControl(e, btn, otherBtn, expandable, otherExpandable,timing){                
                if(btn.classList.contains('dev-active')){
                    btn.classList.remove('dev-active');
                    expandable.style.maxHeight = '0px';
                    let delay = setTimeout(()=>{
                        expandable.classList.add('hide');
                        clearTimeout(delay);
                    },timing);
                    
                }
                else{
                    btn.classList.add('dev-active');                    
                    expandable.classList.remove('hide');
                    expandable.style.maxHeight = expandable.scrollHeight + 'px';                    
                }   
                otherBtn.classList.remove('dev-active');
                otherExpandable.style.maxHeight = '0px';             
                otherExpandable.classList.add('hide');
            }

            let devAlpha = document.querySelector('.dev-alpha');
            let devCat = document.querySelector('.dev-categories');

            btnAlpha.addEventListener('click', e=> {btnControl(e, btnAlpha,btnCat,devAlpha,devCat, 900)});
            btnCat.addEventListener('click', e=> {btnControl(e, btnCat,btnAlpha,devCat,devAlpha, 400)});
        }
    }

    initSearch(){
        if(!this.searchStarted){
            this.searchStarted = true;
            this.searchForm.addEventListener("submit", e=>{
                e.preventDefault();
                this.searchDevSkip = 0;
                this.searchDevTotal = 0;
                this.searchBlogSkip = 0;
                this.searchBlogTotal = 0;
                this.searchInfo.classList.add("hide");
                this.searchContainer.innerHTML = "";
                this.searchMore.classList.add("hide");           
                this.searchMore.disabled = true;
                this.submitSearch();
            });
            this.searchInfo.classList.add("hide");
            this.searchContainer.innerHTML = "";
            this.searchLoading.classList.remove("is-active");
            this.searchMore.classList.add("hide");           
            this.searchMore.disabled = true;
            this.searchMore.addEventListener("click", e=>{
                this.submitSearch();
            });       
        }
    }

    submitSearch(){
        let self = this;     
        let formData = new FormData(this.searchForm);
        formData.append("skipDev", this.searchDevSkip);
        formData.append("skipBlog", this.searchBlogSkip);


        this.searchLoading.classList.add("is-active");

        fetch(this.searchForm.action, {
            method: this.searchForm.method,
            body: formData
        }).then(function(response){
            return response.json();
        }).then(function(result){
            if(!result.okay){
                this.searchContainer.innerHTML = result.msg;
                self.searchInfo.classList.add("hide");                                
                self.searchMore.classList.add("hide");
                self.searchMore.disabled = true;
                self.searchBlogSkip = 0;
                self.searchDevSkip = 0;
                self.searchBlogTotal = 0;
                self.searchDevTotal = 0;
            }
            else{
                if(self.searchDevSkip === 0 && self.searchBlogSkip === 0){
                    self.searchDevTotal = result.totalDev;
                    self.searchBlogTotal = result.totalBlog;

                    let total = result.totalDev + result.totalBlog;

                    self.searchPlural.innerHTML = "s";
                    if(total === 1){
                        self.searchPlural.innerHTML = "";
                    }

                    self.searchAmount.innerHTML = total;
                    self.searchTerm.innerHTML = formData.get("search");
                    self.searchInfo.classList.remove("hide");                    
                }
                self.searchDevSkip = result.skipDev;
                self.searchBlogSkip = result.skipBlog;
                
                result.rows.forEach(row =>{                    
                    let searchItem = document.createElement("div");
                    searchItem.classList.add("search-item");
                    let url = "/blog/post/" +row.url;
                    if(row.tag === "DEV"){
                        url = "/dev/project/" +row.url;
                    }
                    searchItem.innerHTML = `
                        <span class="search-tag">${row.tag}</span>
                        <a class="search-link" href="${url}">${row.title}</a>
                        <p class="search-asbstract">${row.abstract}</p>
                    `;
                    self.searchContainer.appendChild(searchItem);
                });

                if(self.searchDevSkip < self.searchDevTotal || self.searchBlogSkip < self.searchBlogTotal){
                    self.searchMore.disabled = false;
                    self.searchMore.classList.remove("hide");
                }
                else{
                    self.searchMore.disabled = true;
                    self.searchMore.classList.add("hide");
                }
            }
            self.searchLoading.classList.remove("is-active");
        })
    }

    resetSearch(){
        this.searchForm.reset();
        this.searchInfo.classList.add("hide");
        this.searchContainer.innerHTML = "";
        this.searchLoading.classList.remove("is-active");
        this.searchMore.classList.add("hide");
        this.searchMore.disabled = true;
        this.searchBlogSkip = 0;
        this.searchDevSkip = 0;
        this.searchBlogTotal = 0;
        this.searchDevTotal = 0;
    }


}
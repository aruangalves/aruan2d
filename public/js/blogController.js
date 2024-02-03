import { editorController } from "./editorController.js";

export class blogController extends frontController{
    constructor(type = "blog"){        
        super();

        this.currentpage = 1;
        this.totalpages = 1;
        this.articlesContainer = document.querySelector(".articles-column");

        this.firstBtn = document.querySelectorAll(".page-first");
        this.prevBtn = document.querySelectorAll(".page-previous");
        this.noForm = document.querySelectorAll(".page-number");
        this.noInput = document.querySelectorAll(".page-input");
        this.totalEl = document.querySelectorAll(".page-total");
        this.nextBtn = document.querySelectorAll(".page-next");
        this.lastBtn = document.querySelectorAll(".page-last");

        this.years = [];
        this.newestMonth = 0;
        this.oldestMonth = 0;
        this.timeoutDuration = 200;
        
        this.navStarted = false;

        this.categoryURL = [];        

        if(type === "blog"){
            this.startNavigation();
            this.getPosts(this.currentpage);
            this.getCategories();
            this.getHistory();
        }
        else if(type === "category"){
            this.setCategoryURL();            
            this.startCategoryNavigation();
            this.getCategoryPosts(this.currentpage);
            this.getCategories();
            this.getHistory();
        }
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
        fetch(`/blog/categories`)
        .then(function(response){
            return response.json();
        })
        .then(function(results){
            if(results.okay){
                let docs = results.docs;
                let container = document.querySelector("#blog-categories");
                for(let i = 0; i < docs.length; i++){
                    let a = document.createElement("a");
                    a.href = "/blog/categories/" +docs[i].url;
                    let div = document.createElement("div");
                    div.classList.add("categories-element");
                    div.innerHTML = docs[i].name;
                    a.appendChild(div);
                    container.appendChild(a);
                    if(i < docs.length-1){
                        let hr = document.createElement("hr");
                        container.appendChild(hr);
                    }
                }
            }
            else{
                console.log("Não foi possível recuperar a lista de categorias do BLOG.");
            }
        });
    }

    getPosts(page){
        let self = this;        
        fetch(`/blog/${page}`)
        .then(function(response){
            return response.json();
        })
        .then(function(results){
            if(results.okay){
                
                let rows = results.rows;

                self.currentpage = page;
                self.totalpages = results.pages;
                self.setNavigation();

                self.articlesContainer.innerHTML = "";
                for(let i = 0; i < rows.length; i++){
                    let article = document.createElement("article");
                    article.classList.add("article", "mdl-shadow--4dp");
                    self.renderPost(rows[i], article);
                    self.articlesContainer.appendChild(article);
                    if(i < rows.length-1){
                        let br = document.createElement("br");
                        self.articlesContainer.appendChild(br);
                    }
                }
                
            }
            else{
                console.log("Não foi possível recuperar os posts do BLOG.")
            }
        })
    }

    getCategoryPosts(page){  
        let self = this;              
        if(this.categoryURL[0] === 'blog' && this.categoryURL[1] === 'categories' && this.categoryURL.length > 2){
            let url = this.categoryURL[2];
            if(page < 0){
                page = 1;
            }
            else if(page > this.totalpages){
                page = this.totalpages;
            }

            fetch(`/blog/categories/${url}/${page.toString()}`)
            .then(function(response){
                return response.json();
            })
            .then(function(results){
                if(results.okay){
                    let rows = results.rows;

                    self.currentpage = page;
                    self.totalpages = results.pages;
                    self.setNavigation();

                    self.articlesContainer.innerHTML = "";
                    for(let i = 0; i < rows.length; i++){
                        let article = document.createElement("article");
                        article.classList.add("article", "mdl-shadow--4dp");
                        self.renderPost(rows[i], article);
                        self.articlesContainer.appendChild(article);
                        if(i < rows.length-1){
                            let br = document.createElement("br");
                            self.articlesContainer.appendChild(br);
                        }
                    }

                }
                else{
                    console.log(results.msg);
                }
            });
            //window.location.href = '/blog/categories/' +url +'/' +page.toString();
        }
        else{
            console.log("Categoria inválida, não foi possível obter os posts dentro da URL especificada");
        }
    }

    renderCategoryPage(){
        let dataEl = document.querySelector("#blog-progress");
        let data =  JSON.parse(dataEl.dataset.row);
        if(data.okay){
            this.totalpages = data.pages;
            if(this.categoryURL.length > 3){
                let pagecheck = parseInt(this.categoryURL[3]);
                if(!isNaN(pagecheck)){
                    this.currentpage = pagecheck;
                }
                else{
                    this.currentpage = 1;
                }
            }
            this.startCategoryNavigation();        
            this.setNavigation();
            this.articlesContainer.innerHTML = "";
            for(let i = 0; i < data.rows.length; i++){
                let article = document.createElement("article");
                article.classList.add("article", "mdl-shadow--4dp");
                this.renderPost(data.rows[i], article);
                this.articlesContainer.appendChild(article);
                if(i < data.rows.length-1){
                    let br = document.createElement("br");
                    this.articlesContainer.appendChild(br);
                }
            }
        }
        else{
            this.articlesContainer.innerHTML = `<h3>${data.msg}</h3>`;
        }
        
    }

    renderPost(doc, articleEl){        

        //ARTICLE HEADER / COVER
        let cover = document.createElement("figure");
        cover.classList.add("article-cover");
        if(typeof doc.coverimg === "undefined"){
            cover.style.backgroundImage = `url(/upload/images/post-test3.jpg)`;
        }
        else{
            cover.style.backgroundImage = `url(${doc.coverimg})`;
        }
        let coverdiv = document.createElement("div");        
        let title = document.createElement("h1");
        title.classList.add("article-cover-title");
        let titlelink = document.createElement("a");
        titlelink.href = "/blog/post/" +doc.url;
        titlelink.innerHTML = doc.title;
        title.appendChild(titlelink);
        coverdiv.appendChild(title);
        let coverdate = document.createElement("p");
        coverdate.classList.add("article-cover-date");
        let time = new Date(doc.time);
        if(typeof doc.edit === "undefined"){
            coverdate.innerHTML = PrettyDate.fullDate(time);
        }
        else{
            let datestring = PrettyDate.fullDate(time);
            time = new Date(doc.edit);
            datestring = datestring +" | Editado: " +PrettyDate.fullDate(time);
            coverdate.innerHTML = datestring;
        }
        coverdiv.appendChild(coverdate);
        let hr = document.createElement("hr");
        coverdiv.appendChild(hr);
        cover.appendChild(coverdiv);
        articleEl.appendChild(cover);

        //ARTICLE HEADER/BODY SEPARATORS
        let separator = document.createElement("div");
        separator.classList.add("article-header-decoration");        
        separator.innerHTML = '<div class="article-header-dleft"></div><div class="article-header-dright"></div>';
        articleEl.appendChild(separator);

        //ARTICLE BODY
        let articleContent = document.createElement("div");
        articleContent.classList.add("article-content");
        editorController.parse(doc.data, articleContent);

        //SET IMAGE MODALS
        this.setImageClickEvents(articleContent);

        //SET CODE HIGHLIGHTING
        setCodeHighlighting(articleContent);

        //ASSIGN CITATION LINKS
        let citations = articleContent.querySelectorAll(".article-reference-link");
        for(let i = 0; i < citations.length; i++){
                let no = i+1;
                let identifier = doc.url +"-cite-" +no.toString();
                citations[i].id = identifier;
                let refnumber = citations[i].innerHTML;
                citations[i].href = "#" +doc.url +"-ref-" +refnumber;
        }


        articleEl.appendChild(articleContent);

        //BIBLIOGRAPHY
        if(typeof doc.references !== "undefined"){            
            let refseparator = document.createElement("hr");            
            articleEl.appendChild(refseparator);
            let olrefs = document.createElement("ol");
            olrefs.classList.add("article-reference");
            for(let i = 0; i < doc.references.length; i++){
                let no = i+1;
                no = no.toString();
                let li = document.createElement("li");
                let identifier = doc.url + "-ref-" +no;
                li.id = identifier;
                li.innerHTML = doc.references[i];
                //ADD CROSS REFERENCE HERE
                for(let j = 0; j < citations.length; j++){
                    if(citations[j].innerHTML === no){
                        let cite = document.createElement("a");
                        cite.classList.add("article-reference-link");
                        cite.href = "#" +citations[j].id;
                        li.appendChild(cite);
                    }
                }
                olrefs.appendChild(li);
            }
            articleEl.appendChild(olrefs);
        }

        //CATEGORIES
        let catseparator = document.createElement("hr");
        catseparator.classList.add("article-categories");
        articleEl.appendChild(catseparator);

        let catsection = document.createElement("section");
        catsection.classList.add("article-categories");

        let cattitle = document.createElement("div");
        cattitle.classList.add("article-categories");
        cattitle.innerHTML = "Categorias ";
        catsection.appendChild(cattitle);

        let catlist = document.createElement("ul");
        catlist.classList.add("article-categories");        
        for(let i = 0; i < doc.categories.length; i++){            
            let li = document.createElement("li");
            let catunit = document.createElement("a");
            catunit.classList.add("article-tag");
            catunit.href = "/blog/categories/" +doc.categories[i].url;
            catunit.innerHTML = doc.categories[i].name;
            li.appendChild(catunit);
            catlist.appendChild(li);
        }
        catsection.appendChild(catlist);
        articleEl.appendChild(catsection);
    }

    startNavigation(){
        if(!this.navStarted){
            this.navStarted = true;
            this.firstBtn[0].disabled = true;
            this.firstBtn[1].disabled = true;
            this.prevBtn[0].disabled = true;
            this.prevBtn[1].disabled = true;
            this.noInput[0].disabled = true;
            this.noInput[1].disabled = true;
            this.totalEl[0].innerHTML = "1";
            this.totalEl[1].innerHTML = "1";
            this.nextBtn[0].disabled = true;
            this.nextBtn[1].disabled = true;
            this.lastBtn[0].disabled = true;
            this.lastBtn[1].disabled = true;

            this.firstBtn[0].addEventListener('click', e=>{
                this.getPosts(1);
            });
            this.firstBtn[1].addEventListener('click', e=>{
                this.getPosts(1);
            });
            this.prevBtn[0].addEventListener('click', e=>{
                this.getPosts(this.currentpage-1);
            });
            this.prevBtn[1].addEventListener('click', e=>{
                this.getPosts(this.currentpage-1);
            });

            this.noForm[0].addEventListener('submit', e=>{
                e.preventDefault();
                let no = parseInt(this.noInput[0].value, 10);      
                if(no !== this.currentpage){                    
                    this.getPosts(no);
                }                
            });

            this.noForm[1].addEventListener('submit', e=>{
                e.preventDefault();                
                let no = parseInt(this.noInput[1].value, 10);      
                if(no !== this.currentpage){                    
                    this.getPosts(no);
                }                
            });

            this.nextBtn[0].addEventListener('click', e=>{
                this.getPosts(this.currentpage+1);
            });
            this.nextBtn[1].addEventListener('click', e=>{
                this.getPosts(this.currentpage+1);
            });
            this.lastBtn[0].addEventListener('click', e=>{
                this.getPosts(this.totalpages);
            });
            this.lastBtn[1].addEventListener('click', e=>{
                this.getPosts(this.totalpages);
            });
        }
        else{
            console.log("Os botões de navegação já foram inicializados. Não é possível evocar este método uma segunda vez.");
        }
        


    }

    startCategoryNavigation(){
        if(!this.navStarted){
            this.navStarted = true;
            this.firstBtn[0].disabled = true;
            this.firstBtn[1].disabled = true;
            this.prevBtn[0].disabled = true;
            this.prevBtn[1].disabled = true;
            this.noInput[0].disabled = true;
            this.noInput[1].disabled = true;
            this.totalEl[0].innerHTML = "1";
            this.totalEl[1].innerHTML = "1";
            this.nextBtn[0].disabled = true;
            this.nextBtn[1].disabled = true;
            this.lastBtn[0].disabled = true;
            this.lastBtn[1].disabled = true;

            this.firstBtn[0].addEventListener('click', e=>{
                this.getCategoryPosts(1);
            });
            this.firstBtn[1].addEventListener('click', e=>{
                this.getCategoryPosts(1);
            });
            this.prevBtn[0].addEventListener('click', e=>{
                this.getCategoryPosts(this.currentpage-1);
            });
            this.prevBtn[1].addEventListener('click', e=>{
                this.getCategoryPosts(this.currentpage-1);
            });        

            this.noForm[0].addEventListener('submit', e=>{
                e.preventDefault();  
                let no = parseInt(this.noInput[0].value, 10);   
                if(no !== this.currentpage){
                    this.getCategoryPosts(no);
                }                
            });

            this.noForm[1].addEventListener('submit', e=>{
                e.preventDefault();
                let no = parseInt(this.noInput[1].value, 10);   
                if(no !== this.currentpage){
                    this.getCategoryPosts(no);
                }
            });

            this.nextBtn[0].addEventListener('click', e=>{
                this.getCategoryPosts(this.currentpage+1);
            });
            this.nextBtn[1].addEventListener('click', e=>{
                this.getCategoryPosts(this.currentpage+1);
            });
            this.lastBtn[0].addEventListener('click', e=>{
                this.getCategoryPosts(this.totalpages);
            });
            this.lastBtn[1].addEventListener('click', e=>{
                this.getCategoryPosts(this.totalpages);
            });
        }
        else{
            console.log("Os botões de navegação já foram inicializados. Não é possível evocar este método uma segunda vez.");
        }
    }

    setNavigation(){
        this.noInput[0].value = this.currentpage;
        this.noInput[1].value = this.currentpage;
        this.noInput[0].max = this.totalpages;
        this.noInput[1].max = this.totalpages;

        this.totalEl[0].innerHTML = this.totalpages;
        this.totalEl[1].innerHTML = this.totalpages;

        

        if(this.currentpage < 2){
            this.firstBtn[0].disabled = true;
            this.firstBtn[1].disabled = true;
            this.prevBtn[0].disabled = true;
            this.prevBtn[1].disabled = true;    
        }
        else{
            this.firstBtn[0].disabled = false;
            this.firstBtn[1].disabled = false;
            this.prevBtn[0].disabled = false;
            this.prevBtn[1].disabled = false;
        }

        if(this.currentpage >= this.totalpages || this.totalpages === 0){
            this.nextBtn[0].disabled = true;
            this.nextBtn[1].disabled = true;
            this.lastBtn[0].disabled = true;
            this.lastBtn[1].disabled = true;
        }
        else{
            this.nextBtn[0].disabled = false;
            this.nextBtn[1].disabled = false;
            this.lastBtn[0].disabled = false;
            this.lastBtn[1].disabled = false;
        }

        if(this.totalpages < 2){
            this.noInput[0].disabled = true;
            this.noInput[1].disabled = true;
        }
        else{
            this.noInput[0].disabled = false;
            this.noInput[1].disabled = false;
        }

        
        
        

    }

    getHistory(){
        let self = this;
        fetch(`/blog/history`)
        .then(function(response){
            return response.json();
        })
        .then(function(results){
            if(results.okay){                
                self.years = results.years;
                self.newestMonth = results.newestMonth;
                self.oldestMonth = results.oldestMonth;                
                let posts = results.posts;
                /**
                 * HIERARCHY OF HISTORY ELEMENTS:
                 * +posting-history (ID: posting-history)
                 * +--posting-year (ID:ph-YYYY)
                 * +--posting-year-group (ID: pg-YYYY)
                 *    +--posting-month (ID: ph-YYYY-MM)
                 *    +--posting-month-group (ID: pg-YYYY-MM)
                 *       +--posts/separators
                 * Classes to use:
                 * Is expanded (shows group?): posting-exp / posting-not-exp
                 * Is loaded (has posts?): posting-rdy
                */
               let historyContainer = document.querySelector("#posting-history");
               historyContainer.innerHTML = "";
               //if history only has a single year of posts
               if(self.years.length < 2){
                    let postingYear = document.createElement("div");
                    postingYear.innerHTML = self.years[0].toString();
                    self.appendExpImg(postingYear);
                    postingYear.classList.add("posting-year", "posting-exp");                    
                    postingYear.id = `ph-${self.years[0].toString()}`;

                    let postingYearGroup = document.createElement("div");
                    postingYearGroup.classList.add("posting-year-group");
                    postingYearGroup.id = `pg-${self.years[0].toString}`;
                    self.yearExpandEvent(postingYear, postingYearGroup);
                    //we need both newestMonth and oldesMonth to see where the year begins and ends                    
                    
                    for(let j = self.newestMonth; j >= self.oldestMonth; j--){
                        let month = self.assignMonthString(j);                        

                        let postingMonth = document.createElement("div");
                        postingMonth.innerHTML = self.assignMonthName(j);
                        self.appendExpImg(postingMonth);
                        postingMonth.classList.add("posting-month");
                        postingMonth.id = `ph-${self.years[0].toString()}-${month}}`;
                        
                        let postingMonthGroup = document.createElement("div");
                        postingMonthGroup.classList.add("posting-month-group");
                        postingMonthGroup.id = `pg-${self.years[0].toString()}-${month}}`;
                        //if it's first month, we need to add post list
                        if(j === self.newestMonth){
                            postingMonth.classList.add("posting-rdy","posting-exp");
                            for(let k = 0; k < posts.length; k++){
                                let postlink = document.createElement("a");
                                postlink.classList.add("history-element");
                                postlink.innerHTML = posts[k].title;
                                postlink.href = "/blog/post/" +posts[k].url;
                                postingMonthGroup.appendChild(postlink);
                                if(k < posts.length-1){
                                    let hr = document.createElement("hr");
                                    postingMonthGroup.appendChild(hr);
                                }
                            }
                        }
                        else{
                            postingMonth.classList.add("posting-not-exp");
                            postingMonthGroup.classList.add("hide");
                        }
                        self.monthExpandEvent(postingMonth, postingMonthGroup);
                        postingYearGroup.appendChild(postingMonth);
                        postingYearGroup.appendChild(postingMonthGroup);
                    }
                    historyContainer.appendChild(postingYear);
                    historyContainer.appendChild(postingYearGroup);
                }
               //if history has more than one year
               else{
                    for(let i = 0; i < self.years.length; i++){                        
                        let startingvalue = 11;
                        let endingvalue = 0;

                        let postingYear = document.createElement("div");
                        postingYear.innerHTML = self.years[i].toString();
                        self.appendExpImg(postingYear);
                        postingYear.classList.add("posting-year","posting-not-exp");
                        postingYear.id = `ph-${self.years[i].toString()}`;

                        let postingYearGroup = document.createElement("div");
                        postingYearGroup.classList.add("posting-year-group","hide");
                        postingYearGroup.id = `pg-${self.years[i].toString()}`;
                        self.yearExpandEvent(postingYear, postingYearGroup);
                        //if it's first year, we need to know newestMonth to see where to start
                        //if it's last year, we need to check oldestMonth of publications to see where to end
                        //every other year in-between you simply generate every month
                        if(i === 0){
                            startingvalue = self.newestMonth;
                            postingYear.classList.remove("posting-not-exp");
                            postingYear.classList.add("posting-exp");
                            postingYearGroup.classList.remove("hide");
                        }                        
                        else if(i === self.years.length - 1){
                            endingvalue = self.oldestMonth;
                        }
                        
                        for(let j = startingvalue; j >= endingvalue; j--){
                            let month = self.assignMonthString(j);
                            let postingMonth = document.createElement("div");
                            postingMonth.innerHTML = self.assignMonthName(j);
                            self.appendExpImg(postingMonth);
                            postingMonth.classList.add("posting-month","posting-not-exp");
                            postingMonth.id = `ph-${self.years[i].toString()}-${month}}`;
                            
                            let postingMonthGroup = document.createElement("div");
                            postingMonthGroup.classList.add("posting-month-group","hide");
                            postingMonthGroup.id = `pg-${self.years[i].toString()}-${month}}`;

                            //fill in first group with data
                            if(i === 0 && j === self.newestMonth){
                                postingMonth.classList.remove("posting-not-exp");
                                postingMonth.classList.add("posting-exp", "posting-rdy");
                                postingMonthGroup.classList.remove("hide");
                                for(let k = 0; k < posts.length; k++){
                                    let postlink = document.createElement("a");
                                    postlink.classList.add("history-element");
                                    postlink.innerHTML = posts[k].title;
                                    postlink.href = "/blog/post/" +posts[k].url;
                                    postingMonthGroup.appendChild(postlink);
                                    if(k < posts.length-1){
                                        let hr = document.createElement("hr");
                                        postingMonthGroup.appendChild(hr);
                                    }
                                }
                            }
                            self.monthExpandEvent(postingMonth, postingMonthGroup);
                            postingYearGroup.appendChild(postingMonth);
                            postingYearGroup.appendChild(postingMonthGroup);
                        }
                        historyContainer.appendChild(postingYear);
                        historyContainer.appendChild(postingYearGroup);
                    }                   
                }               
            }
            else{
                console.log(results.msg);
            }
        });
    }

    appendExpImg(parentEl){
        let expimg = document.createElement("img");
        expimg.src = "/images/exp.png";
        expimg.classList.add("posting-img");
        parentEl.appendChild(expimg);
    }

    yearExpandEvent(postingYearEl, postingYearGroup){
        postingYearEl.addEventListener("click", e=>{
            if(postingYearGroup.classList.contains("hide")){
                postingYearEl.classList.remove("posting-not-exp");
                postingYearEl.classList.add("posting-exp");
                setTimeout(()=>{
                    postingYearGroup.classList.remove("hide");
                },this.timeoutDuration);
                
            }
            else{
                postingYearEl.classList.remove("posting-exp");
                postingYearEl.classList.add("posting-not-exp");
                setTimeout(()=>{
                    postingYearGroup.classList.add("hide");
                },this.timeoutDuration);
                
            }
        });
    }

    monthExpandEvent(postingMonthEl, postingMonthGroupEl){
        postingMonthEl.addEventListener("click", e=>{
            if(postingMonthEl.classList.contains("posting-rdy")){
                if(postingMonthGroupEl.classList.contains("hide")){
                    postingMonthEl.classList.remove("posting-not-exp");
                    postingMonthEl.classList.add("posting-exp");
                    setTimeout(()=>{
                        postingMonthGroupEl.classList.remove("hide");
                    }, this.timeoutDuration);
                    
                }
                else{
                    postingMonthEl.classList.remove("posting-exp");
                    postingMonthEl.classList.add("posting-not-exp");
                    setTimeout(()=>{
                        postingMonthGroupEl.classList.add("hide");
                    }, this.timeoutDuration);
                    
                }
            }
            else{
                postingMonthGroupEl.innerHTML = "Carregando...";
                let id = postingMonthEl.id;
                //ph-YYYY-MM
                //0123456789
                let year = id.substring(3,7);
                let month = id.substring(8,10);
                fetch(`blog/history/${year}/${month}`)
                .then(function(response){
                    return response.json();
                })
                .then(function(results){
                    if(results.okay){
                        let posts = results.posts;
                        postingMonthGroupEl.innerHTML = "";
                        if(posts.length === 0){
                            let span = document.createElement("span");
                            span.innerHTML = "----";
                            span.classList.add("history-element");
                            postingMonthGroupEl.appendChild(span);
                        }
                        else{
                            for(let k = 0; k < posts.length; k++){
                                let postlink = document.createElement("a");
                                postlink.classList.add("history-element");
                                postlink.innerHTML = posts[k].title;
                                postlink.href = "/blog/post/" +posts[k].url;
                                postingMonthGroupEl.appendChild(postlink);
                                if(k < posts.length-1){
                                    let hr = document.createElement("hr");
                                    postingMonthGroupEl.appendChild(hr);
                                }
                            }
                        }
                        
                        postingMonthEl.classList.remove("posting-not-exp");
                        postingMonthEl.classList.add("posting-exp");                        
                        postingMonthEl.classList.add("posting-rdy");                        
                        postingMonthGroupEl.classList.remove("hide");
                    }
                    else{
                        console.log(results.msg);
                    }
                });
            }
        });
    }

    assignMonthString(month){
        let monthString = "";
        if(month < 10){
            monthString = "0" +month.toString();
        }
        else{
            monthString = month.toString();
        }
        return monthString;
    }

    assignMonthName(month){
        switch(month){
            case 11:
                return "Dezembro";
            case 10:
                return "Novembro";
            case 9:
                return "Outubro";
            case 8:
                return "Setembro";
            case 7:
                return "Agosto";
            case 6:
                return "Julho";
            case 5:
                return "Junho";
            case 4:
                return "Maio";
            case 3:
                return "Abril";
            case 2:
                return "Março";
            case 1:
                return "Fevereiro";
            case 0:
                return "Janeiro";
        }
    }

}
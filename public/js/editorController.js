export class editorController{
    constructor(){ 
        this.editors = {};       
    }

    initEditor(element, loadeddata = {}){
        return new Promise((resolve, reject)=>{
            let config = {
                holder: element,
                data: loadeddata,
                tools: {
                    header: Header,
                    underline: Underline,
                    table: {
                        class: Table,
                        inlineToolbar: true,
                        config: {
                            rows: 2,
                            cols: 3,
                        },
                    },
                    code: CodeTool,                    
                    list: {
                        class: List,
                        inlineToolbar: true,
                        config: {
                            defaultStyle: 'unordered'
                        }
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            endpoints:{
                                byFile: "/dashbrd/uploadimage",
                                byUrl: "/dashbrd/fetchimage"
                            }
                        }
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true
                    },
                    reference: Reference,
                    caption: {
                        class: Caption,
                        inlineToolbar: true
                    }
                }
            }            

            if(Object.keys(loadeddata).length === 0){
                delete config.data;
                config.placeholder = 'Digite o seu texto aqui...';                
            }
            let editor = new EditorJS(config);

            editor.isReady.then(()=>{
                console.log("EditorJS is ready for use in element: " +element);
                this.editors[element] = editor;
                resolve();
            }).catch(error =>{
                console.log("EditorJS initialization failed: " +error);
                reject(error);
            });
            
        });                
    }

    clear(element){
        this.editors[element].clear();
    }

    render(element, data){
        this.editors[element].render(data);
    }

    save(element){
        return new Promise((resolve, reject)=>{
            this.editors[element].save().then((data) =>{
                resolve(data);
            }).catch((error) =>{                
                console.log("Error saving data from EditorJS in element: " +element +" ---> " +error);
                reject(error);
            });
        });
                
    }

    static parse(data, container){
        let captions = {};
        data.blocks.forEach(block =>{
            if(block.type === "paragraph"){
                let p = document.createElement("p");
                p.classList.add("article-text");
                p.innerHTML = block.data.text;
                container.appendChild(p);
            }
            else if(block.type === "header"){
                let level = block.data.level;
                let h = document.createElement(`h${level}`);
                h.classList.add("article-header");
                h.innerHTML = block.data.text;
                container.appendChild(h);
            }
            else if(block.type === "list"){
                let list;
                if(block.data.style === "unordered"){
                    list = document.createElement("ul");
                }
                else{
                    list = document.createElement("ol");
                }
                list.classList.add("article-list");
                let items = block.data.items;
                items.forEach(item =>{
                    let li = document.createElement("li");
                    li.innerHTML = item;
                    list.appendChild(li);
                });
                container.appendChild(list);
            }
            else if(block.type === "quote"){
                let quote = document.createElement("p");
                quote.classList.add("article-quote");
                quote.innerHTML = block.data.quote;
                let author = document.createElement("p");
                author.classList.add("article-quote-author");
                author.innerHTML = block.data.author;
                container.appendChild(quote);
                container.appendChild(author);
            }
            else if(block.type === "code"){
                let pre = document.createElement("pre");
                pre.classList.add(`article-code`);
                let code = document.createElement("code");
                code.classList.add(`language-${block.data.languageCode}`);                
                let inner = block.data.code;                
                inner.replaceAll('<','&lt;');
                inner.replaceAll('>','&gt;');
                code.textContent = inner;                
                pre.appendChild(code);
                container.appendChild(pre);                
            }
            else if(block.type === "table"){
                let table = document.createElement("table");
                table.classList.add("article-table");
                let i = 0;
                if(block.data.withHeadings === true){
                    i = 1;

                    let thead = document.createElement("thead");
                    thead.classList.add('article-thead');
                    let tr = document.createElement("tr");
                    
                    let items = block.data.content[0];
                    items.forEach(item =>{
                        let th = document.createElement("th");
                        th.innerHTML = item;
                        tr.appendChild(th);
                    });
                    thead.appendChild(tr);
                    table.appendChild(thead);
                }
                let tbody = document.createElement("tbody");
                tbody.classList.add('article-tbody');
                for(;i < block.data.content.length; i++){
                    let tr = document.createElement("tr");
                    let row = block.data.content[i];
                    row.forEach(item =>{
                        let td = document.createElement("td");
                        td.innerHTML = item;
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                }
                table.appendChild(tbody);
                container.appendChild(table);
            }
            else if(block.type === "image"){
                let figure = document.createElement("figure");
                figure.classList.add("article-figure");
                let img = document.createElement("img");
                img.classList.add("article-image");
                img.loading = "lazy";
                img.alt = block.data.caption;
                img.src = block.data.file.url;
                let figcaption = document.createElement("figcaption");
                figcaption.innerHTML = block.data.caption;
                figure.appendChild(img);
                figure.appendChild(figcaption);
                container.appendChild(figure);                
            }
            else if(block.type === "caption"){
                let caption = document.createElement("p");
                caption.classList.add("article-caption");
                let text = "";
                if(block.data.title !== ""){
                    if(typeof captions[block.data.title] === "undefined"){
                        captions[block.data.title] = 1;                        
                    }
                    else{
                        ++captions[block.data.title];
                    }
                    text = block.data.title +" " +captions[block.data.title].toString() +". ";
                }
                text = text + block.data.caption;
                caption.innerHTML = text;
                container.appendChild(caption);
            }
        });

        let references = container.querySelectorAll(".editor-reference-link");
        [...references].forEach(reference =>{
            reference.outerHTML = '<a class="article-reference-link" href="#default">' +reference.innerHTML +'</a>';
        });
    }

    static generateAbstract(data){
        let abstract = "";
        let temp = document.createElement("p");
        for(let i = 0; i < data.blocks.length; i++){
            if(abstract.length > 512){
                i = data.blocks.length;
            }
            else{
                if(data.blocks[i].type === "paragraph" || data.blocks[i].type === "header"){
                    temp.innerHTML = data.blocks[i].data.text;
                    abstract = abstract + temp.innerText +" ";
                }
            }
        }
        temp.remove();
        abstract = abstract.trim();
        if(abstract.length > 512){
            abstract = abstract.substring(0, 513);
        }
        return abstract;
    }

    static removeExcessWhitespaces(text){
        return text.replace(/\s\s+/g, " ").trim();
    }

}
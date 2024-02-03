class designController extends frontController{
    constructor(){
        super();
        //this.videoPlayer();
        //this.initThumbnails();

        this.videoContainer = document.querySelector('.video-container');
        
        this.pages = {
            logo: 0,
            print: 0,
            art: 0,
            vid: 0
        };

        this.pg = {
            logo: 1,
            print: 1,
            art: 1,
            vid: 1
        };

        this.count = {
            logo: 0,
            print: 0
        };

        this.initMoreBtn('logo');
        this.initMoreBtn('print');
        this.initMoreBtn('art');
        this.initMoreBtn('vid');

        this.fetchData('logo', 1);
        this.fetchData('print', 1);
        this.fetchData('art', 1);
        this.fetchData('vid', 1);
    }

    getPg(type){
        return this.pg[type];
    }

    setPg(type, value){
        this.pg[type] = value;
    }

    getPages(type){
        return this.pages[type];
    }

    setPages(type, value){
        this.pages[type] = value;
    }

    fetchData(type, page){
        let self = this;      
        let btn = document.querySelector(`#more-${type}`);
        btn.disabled = true;
        btn.classList.add('hide');
        let spinner = document.querySelector(`#spinner-${type}`);
        spinner.classList.add('is-active');
        fetch(`/design/${type}/${page}`)
        .then(function(response){
            return response.json();
        })
        .then(function(data){ 
            self.setPg(type, page);            
            self.setPages(type, data.pages);
            if(page === self.pages[type]){                
                btn.disabled = true;
                btn.classList.add('hide');
            }
            else{
                btn.disabled = false;
                btn.classList.remove('hide');
            }        
            self.dataRows(type, data.rows);
            spinner.classList.remove('is-active');
        });
    }

    dataRows(type, rows){
        let anchor = document.querySelector(`#more-${type}`);
        let grid = document.querySelector(`#showcase-${type}`);
        if(type === 'logo' || type === 'print'){
            rows.forEach(row =>{                
                this.logoprintAdd(row, grid, type);
                this.count[type]++;                
            });            
        }
        else if(type === 'art'){
            rows.forEach(row =>{
                let div = document.createElement('div');
                div.classList.add("mdl-shadow--2dp", "design-cell");
                let img = document.createElement('img');
                img.classList.add("card-image", "design-image");
                img.loading = "lazy";
                img.src = row.img;
                img.alt = row.title;
                img.dataset.row = JSON.stringify(row);

                div.appendChild(img);
                this.initDesignImage(img);
                grid.appendChild(div);                                
            });
        }
        else if(type === 'vid'){
            anchor = document.querySelector(".video-thumbnails");
            rows.forEach(row =>{
                let div = document.createElement('div');                
                div.classList.add("video-item");

                let videothumb = document.createElement('img');
                videothumb.classList.add("video-thumb");
                videothumb.loading = "lazy";
                videothumb.src = row.thumb;
                videothumb.alt = row.title;
                videothumb.dataset.row = JSON.stringify(row);

                div.appendChild(videothumb);
                //Generate handler for click event on thumbnail
                this.videoEvent(videothumb);
                anchor.appendChild(div);                
            });
        }
    };

    logoprintAdd(row, anchor, type){

                //TITLE
                let h2 = document.createElement('h2');
                h2.classList.add("design-showcase-header");
                h2.innerHTML = row.title;                
                anchor.appendChild(h2);
                //anchor.parentElement.insertBefore(h2,anchor);

                //CONTAINER FOR IMAGE AND TEXT
                let div = document.createElement('div');                
                if(this.count[type] % 2 !== 0){
                    div.classList.add("design-showcase-inv");
                }
                else{
                    div.classList.add("design-showcase");
                }

                let img = document.createElement('img');
                img.classList.add("design-highlight");
                img.loading = "lazy";
                img.src = row.img;
                img.alt = row.title;

                let p = document.createElement('p');
                p.innerHTML = row.desc;

                div.appendChild(img);
                div.appendChild(p);
                anchor.appendChild(div);
                //anchor.parentElement.insertBefore(div,anchor);

                //GALLERY
                if(typeof row.gallery !== 'undefined'){ 
                    let div = document.createElement('div');
                    div.classList.add("design-thumbnails");

                    let heading = document.createElement('h5');
                    heading.innerHTML = "Galeria de imagens";

                    div.appendChild(heading);

                    let container = document.createElement('div');
                    container.classList.add("design-thumbnails-container");
                    row.gallery.forEach( item =>{
                        let thumb = document.createElement('div');
                        thumb.classList.add("design-thumb");
                        thumb.innerHTML = `
                            <img src="${item.image}" loading="lazy">
                            <span class="hide">${item.desc}</span>
                        `;
                        container.appendChild(thumb);                        
                        
                    });
                    //GENERATE THUMBNAIL CLICK EVENTS
                    this.initGallery(container);
                    div.appendChild(container);
                    let bottom = document.createElement('div');
                    bottom.classList.add("design-thumbnails-bottom");
                    let amount = parseInt(row.glen);
                    if(amount > 4){                        
                        let thumbpages = Math.ceil(amount/4);
                        for(let i = 0; i < thumbpages; i++){
                            let button = document.createElement('button');
                            button.classList.add("design-thumb-button");
                            if(i === 0){
                                button.classList.add("design-thumb-button-active");
                            }
                            bottom.appendChild(button);
                        }
                    }
                    //GENERATE PAGING BUTTONS EVENT
                    this.initGalleryButtons(bottom, container);
                    div.appendChild(bottom);
                    anchor.appendChild(div);
                    //anchor.parentElement.insertBefore(div, anchor);
                }

                let footer = document.createElement('hr');                
                footer.classList.add("design-footer");
                footer.classList.add(`${type}-design-footer`);
                anchor.appendChild(footer);
    }

    initMoreBtn(type){
        let btn = document.querySelector(`#more-${type}`);
        btn.addEventListener('click', e=>{
            this.fetchData(type, this.pg[type]+1);
        });
    }

    initDesignImage(image){
        image.addEventListener('click', e=>{
            let img = this.modalDesign.querySelector('.modal-design-image');          
            img.src = image.src;
            img.style.maxWidth = '100%';
            img.style.maxHeight = 'auto';            
            this.modalDesign.querySelector('#modal-design-expand').href = image.src;
            let data = JSON.parse(image.dataset.row);          
            this.modalDesign.querySelector('.modal-design-title').innerHTML = data['title'];
            let date = data['date'];
            date = PrettyDate.longDate(date);
            this.modalDesign.querySelector('.modal-design-date').innerHTML = date;
            this.modalDesign.querySelector('.modal-design-text').innerHTML = data['desc'];            
            this.modalDesign.style.display = 'block';
            this.modalDesign.querySelector('.modal-box').scrollIntoView();
            window.addEventListener('click', this.windowModalDesign);
        });
    }

    initThumbnails(){
        /*DESIGN THUMBNAILS*/

        /*If there's less than 4 thumbnails, center the thumbs on container*/
        let designThumbnailContainers = document.querySelectorAll('.design-thumbnails-container');
        if(designThumbnailContainers.length > 0){
        [...designThumbnailContainers].forEach(thumbnail =>{        
            if(thumbnail.childElementCount < 4){
            thumbnail.style.justifyContent = 'center';
            }
        });
        }

        /*Now we need to set the paging on any container with for than 4 thumbnails*/
        let designThumbnails = document.querySelectorAll('.design-thumbnails');

        if(designThumbnails.length > 0){
        [...designThumbnails].forEach(thumbnail =>{
            let container = thumbnail.querySelector('.design-thumbnails-container');        
            let qty = container.childElementCount;
            if(qty > 4){           
            let pages = Math.ceil(qty/4);
            let bottom = thumbnail.querySelector('.design-thumbnails-bottom');
            bottom.innerHTML = '';
            /*Creating each page button and setting the first page button as active*/
            for(var i = 0; i < pages; i++){            
                var newButton = document.createElement('button');
                newButton.classList.add('design-thumb-button');
                if(i === 0){              
                newButton.classList.add('design-thumb-button-active');
                }
                bottom.appendChild(newButton);
            }

            /*After creating buttons, now we need to set their behaviors*/
            let buttons = bottom.querySelectorAll('.design-thumb-button');
                        
            [...buttons].forEach(button=>{                                                
                button.addEventListener('click', e=>{
                /*Width is thumbnail container width + 1 rem (14 pixels)
                **We need to check on width each time to make it responsive
                */                                                                      
                let width = container.clientWidth+14;              
                /*Discover page number of button*/
                var j = 0;
                var el = button;
                while(el = el.previousElementSibling){
                    j++;
                }              
                container.style.transform = `translateX(-${j*width}px)`;
                /*Set clicked button as the active button while setting all
                    others as inactive*/
                let btns = bottom.querySelectorAll('.design-thumb-button');
                [...btns].forEach(btn =>{
                    btn.classList.remove('design-thumb-button-active');
                });
                button.classList.add('design-thumb-button-active');
                });            
            });
            }
        });
        }

        /*Now setting up all modals for the thumbnails*/
        let thumbImages = document.querySelectorAll('.design-thumb img');    

        if(thumbImages.length > 0){
            [...thumbImages].forEach(image=>{
            image.addEventListener('click',e=>{
            this.imageModal(image, this.modalFigure);
            });
        });
        }    
        /****END DESIGN THUMBNAILS*/
    }

    initGallery(container){
        /*If there's less than 4 thumbnails, center the thumbs on container*/
        if(container.childElementCount < 4){
            container.style.justifyContent = 'center';
        }

        let thumbs = container.querySelectorAll('.design-thumb img');

        [...thumbs].forEach(thumb =>{
            thumb.addEventListener('click', e=>{
                this.imageModal(thumb, this.modalFigure);
            });
        });

    }

    initGalleryButtons(bottom, container){
        let buttons = bottom.querySelectorAll('.design-thumb-button');

        [...buttons].forEach(button =>{
            button.addEventListener('click', e=>{
                /*Width is thumbnail container width + 1 rem (14 pixels)
                **We need to check on width each time to make it responsive
                */                                                                      
                let width = container.clientWidth+17;              
                /*Discover page number of button*/
                var j = 0;
                var el = button;
                while(el = el.previousElementSibling){
                    j++;
                }              
                container.style.transform = `translateX(-${j*width}px)`;
                /*Set clicked button as the active button while setting all
                    others as inactive*/
                let btns = bottom.querySelectorAll('.design-thumb-button');
                [...btns].forEach(btn =>{
                    btn.classList.remove('design-thumb-button-active');
                });
                button.classList.add('design-thumb-button-active');
            })
        });
    }

    videoPlayer(){
        let videoContainer = document.querySelector('.video-container');
        let videos = document.querySelectorAll('.video-thumb');

        if(videos.length > 0){
            [...videos].forEach(video =>{
                video.addEventListener('click', e=>{
                    let data = JSON.parse(video.dataset.row);
                    let videoPlayer = videoContainer.querySelector('.video-player');
                    videoPlayer.src = data['videosrc'];
                    videoContainer.querySelector('.video-title').innerHTML = data['title'];
                    videoContainer.querySelector('.video-date').innerHTML = data['date'];
                    videoContainer.querySelector('.video-description').innerHTML = data['text'];                    

                    videoPlayer.load();
                    videoPlayer.addEventListener('loadedmetadata', e=>{                                                          
                        videoContainer.style.display = 'block';          
                        videoContainer.style.height = videoContainer.scrollHeight + 'px';
                        videoContainer.scrollIntoView();
                    });

                    videoPlayer.addEventListener('loadeddata', e=>{
                        let delay = setTimeout(()=>{                        
                            videoPlayer.play();
                            videoContainer.scrollIntoView();
                            clearTimeout(delay);
                            
                        },550);                        
                    });
                    
                                      
                    
                    let closeVideo = videoContainer.querySelector('.video-close');
                    
                    closeVideo.addEventListener('click',e=>{
                        videoPlayer.pause();                        
                        videoContainer.style.display = 'none';
                        videoContainer.style.height = '0px';
                    });
                    
                });
            });
        }
    }

    videoEvent(video){
        //Video equals to a .video-thumb img element
        video.addEventListener('click', e=>{
            let data = JSON.parse(video.dataset.row);
            let videoPlayer = this.videoContainer.querySelector('.video-player');
            videoPlayer.src = data['vid'];
            this.videoContainer.querySelector('.video-title').innerHTML = data['title'];
            let date = PrettyDate.longDate(data['date']);
            this.videoContainer.querySelector('.video-date').innerHTML = date;
            this.videoContainer.querySelector('.video-description').innerHTML = data['desc'];                    

            videoPlayer.load();
            videoPlayer.addEventListener('loadedmetadata', e=>{                                                          
                this.videoContainer.style.display = 'block';          
                this.videoContainer.style.height = this.videoContainer.scrollHeight + 'px';
                this.videoContainer.scrollIntoView();
            });

            videoPlayer.addEventListener('loadeddata', e=>{
                let delay = setTimeout(()=>{                        
                    videoPlayer.play();
                    this.videoContainer.scrollIntoView();
                    clearTimeout(delay);
                    
                },550);                        
            });
            
                              
            
            let closeVideo = this.videoContainer.querySelector('.video-close');
            
            closeVideo.addEventListener('click',e=>{
                videoPlayer.pause();                        
                this.videoContainer.style.display = 'none';
                this.videoContainer.style.height = '0px';
            });
            
        });
    }
}
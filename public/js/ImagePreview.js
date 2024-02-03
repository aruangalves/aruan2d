class ImagePreview{
    constructor(inputElement, imageElement, defaultImg = "/images/preview.jpg"){

        this.inputElement = document.querySelector(inputElement);
        this.imageElement = document.querySelector(imageElement);
        this.defaultImg = defaultImg;

        this.initInputEvent();

    }

    initInputEvent(){
        this.inputElement.addEventListener("change", e=>{
            if(this.inputElement.files.length == 0){
                this.imageElement.src = this.defaultImg;
            }
            else{
                this.reader(this.inputElement.files[0]).then(result =>{
                    this.imageElement.src = result;
                }).catch(err =>{
                    console.log(err);
                });
            }
        });
    }

    reader(file){
        return new Promise((resolve, reject)=>{
            let reader = new FileReader();

            reader.onload = () =>{
                resolve(reader.result);
            }

            reader.onerror = () =>{
                reject("Não foi possível ler o conteúdo da imagem.");
            }

            reader.readAsDataURL(file);
        });
    }
}
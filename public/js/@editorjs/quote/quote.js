class Quote{
    constructor({data}){
        this.data = data;
        this.wrapper = undefined;        
        
        let stylesheet = document.createElement("style");
        stylesheet.innerHTML = this.style();           
        document.getElementsByTagName("head")[0].appendChild(stylesheet);
    }

    static get toolbox(){        
        return {
            title: "Quote",
            icon: `<svg
                    width="17"
                    height="15"
                    viewBox="0 0 44.979166 39.687501"         
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:svg="http://www.w3.org/2000/svg">
                    <g><g>
                        <path
                            d="m 20.801237,12.267223 q 0,1.423925 -1.057774,2.441015 -1.037431,0.996748 -2.461357,0.996748 -1.973154,0 -3.152978,-1.647685 -1.037432,-1.46461 -1.037432,-3.519131 0,-5.8787795 7.01792,-8.4215041 v 0.996748 q -1.932471,0.7119629 -3.173321,2.2579395 -1.342558,1.6476855 -1.342558,3.6208398 0,0.6916211 0.305127,0.6916211 0.101709,0 0.305127,-0.1423926 0.650937,-0.4678613 1.647685,-0.4678613 1.220508,0 2.115547,0.9967476 0.834014,0.956065 0.834014,2.196915 z m -9.784404,0 q 0,1.423925 -1.0577738,2.441015 -1.0374316,0.996748 -2.4613574,0.996748 -1.9731543,0 -3.1529785,-1.647685 -1.0374317,-1.46461 -1.0374317,-3.519131 0,-5.8787795 7.0179204,-8.4215041 v 0.996748 Q 8.3927408,3.8253768 7.1518912,5.3713534 5.8093326,7.0190389 5.8093326,8.9921932 q 0,0.6916211 0.305127,0.6916211 0.101709,0 0.305127,-0.1423926 0.6509374,-0.4678613 1.6476855,-0.4678613 1.2205078,0 2.1155469,0.9967476 0.834014,0.956065 0.834014,2.196915 z"
                            
                            id="path22540" />
                        <path
                            d="m 41.67192,29.211939 q 0,5.87878 -7.017919,8.421504 v -0.996748 q 1.912128,-0.711963 3.17332,-2.257939 1.322217,-1.647686 1.322217,-3.62084 0,-0.386494 -0.122051,-0.569571 -0.06103,-0.12205 -0.162735,-0.12205 -0.12205,0 -0.325468,0.142392 -0.67128,0.467862 -1.627344,0.467862 -1.24085,0 -2.115547,-0.996748 -0.834014,-0.935723 -0.834014,-2.196914 0,-1.423926 1.037432,-2.420674 1.037432,-1.01709 2.481699,-1.01709 1.973155,0 3.132637,1.647685 1.057773,1.484952 1.057773,3.519131 z m -9.784404,0 q 0,5.87878 -7.01792,8.421504 v -0.996748 q 1.912129,-0.711963 3.173321,-2.257939 1.322216,-1.647686 1.322216,-3.62084 0,-0.386494 -0.12205,-0.569571 -0.06103,-0.12205 -0.162735,-0.12205 -0.122051,0 -0.325469,0.142392 -0.671279,0.467862 -1.627343,0.467862 -1.24085,0 -2.115547,-0.996748 -0.834014,-0.935723 -0.834014,-2.196914 0,-1.423926 1.037432,-2.420674 1.037431,-1.01709 2.481699,-1.01709 1.973154,0 3.132637,1.647685 1.057773,1.484952 1.057773,3.519131 z"
                            
                            id="path22542" />
                    </g></g>
                    </svg>`
        };
    }        
    
    render(){
        let wrapper = document.createElement('div');
        wrapper.classList.add('editor-quote-wrapper');
        let quote = document.createElement('div');
        quote.contentEditable = true;
        quote.classList.add('editor-quote');
        let author = document.createElement('div');
        author.classList.add('editor-quote-author');
        author.contentEditable = true;

        wrapper.appendChild(quote);
        wrapper.appendChild(author);        

        quote.innerHTML = this.data && this.data.quote ? this.data.quote : "Quote";
        author.innerText = this.data && this.data.author ? this.data.author : "Author";

        return wrapper;
    }

    save(blockContent){
        let quote = blockContent.querySelector('.editor-quote').innerHTML;
        let author = blockContent.querySelector('.editor-quote-author').innerText;
        return {
            quote: quote,
            author: author
        };
    }

    style(){
        return `
            .editor-quote-wrapper{
                display: block;
            }
            
            .editor-quote,.editor-quote-author, .editor-quote:active, .editor-quote-author:active{
                border: none;
                border-image-width: 0;
                background-color: none;
            }
            
            .editor-quote{    
                text-align: center;    
                font-size: 150%;
                line-height: 1.05;
                padding-bottom: 1.2rem;
            }
            
            .editor-quote:before{
                content: open-quote;    
                margin-right: 1px;
                font-size: 150%;
                font-weight: bolder;
                color: var(--darkred);
            }
            
            .editor-quote:after{
                content: close-quote;    
                margin-left: 1px;
                font-size: 150%;
                font-weight: bolder;
                color: var(--darkred);
            }
            
            .editor-quote-author{
                text-align: center;
                margin-top: -18px;
                margin-left: 2%;    
                font-weight: 600;
                margin-bottom: 0;
            }
            
            .editor-quote-author:before{
                content: "- ";
            }
        `;
    }


}
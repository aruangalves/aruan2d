class Reference {

    static get isInline(){
        return true;
    }

    static get sanitize(){
        return {
            sup: {
                class: 'editor-reference-link'
            }
        }
    }
    
    get state(){
        return this._state;
    }

    set state(state){
        this._state = state;

        this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
    }

    static get shortcut(){
        return 'CMD+Q';
    }

    constructor({api}){
        this.api = api;
        this.button = null;
        this._state = false;

        this.tag = 'sup';
        this.class = 'editor-reference-link';

        let stylesheet = document.createElement("style");
        stylesheet.innerHTML = `
            .editor-reference-link{
                color: #941b10;                                
            }
            .editor-reference-link:before{
                color: black;
                content: "[";
            }
            .editor-reference-link:after{    
                color: black;
                content: "]";    
            }
        `;
        document.getElementsByTagName("head")[0].appendChild(stylesheet);
    }

    render(){
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = `<svg
        width="16"
        height="16"
        viewBox="0 0 5.2916665 5.2916668"   
        id="svg5"   
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">    
       <g
          inkscape:label="ref"
          inkscape:groupmode="layer"
          id="layer1"
          sodipodi:insensitive="true">
         <image
            width="5.8677711"
            height="5.8677711"
            preserveAspectRatio="none"
            xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAnElE QVRIie2VwQ2DMAxFH0iwE0KcOgCbsAUqrNXOQugW4UAOEKyohqCqiC9ZOdjxc+wogR8oB3rAAB+g iQ3oAOtZHRMwuKQF8BBgIXv7yRIBYD2fFWJCWuVMlZvV0gJK5gqXVsUESPFSm4POewaHAPcMLgYY 0ff/K2leT99eGkARo1qpRcatwft9RC37W7T5cCRlwJP5JKfM4L80AesDTud8PN75AAAAAElFTkSu QmCC "
            id="image866"
            x="-0.35870323"
            y="-0.19120827"
            style="stroke-width:1.08218;image-rendering:crisp-edges" />
       </g>
     </svg>`;
        this.button.classList.add(this.api.styles.inlineToolButton);

        return this.button;
    }

    surround(range){
        //let el = this.api.selection.findParentTag(this.tag, this.class);

        //el ? this.unwrap(range) : this.wrap(range);

        if(this.state){
            this.unwrap(range);
            return;
        }

        this.wrap(range);

        

    }

    wrap(range){
        let selectedText = range.extractContents();
        let reference = document.createElement(this.tag);
        reference.classList.add(this.class);

        reference.appendChild(selectedText);

        range.insertNode(reference);

        this.api.selection.expandToTag(reference);
    }

    unwrap(range){
        let reference = this.api.selection.findParentTag(this.tag, this.class);
        let text = range.extractContents();

        reference.remove();

        range.insertNode(text);
    }

    checkState(){

        let mark = this.api.selection.findParentTag(this.tag, this.class);

        this.state = !!mark;
        /* let text = selection.anchorNode;

        if(!text){
            return;
        }

        let anchorElement = text instanceof Element ? text : text.parentElement;

        this._state = !!anchorElement.closest('.article-reference-link'); */
    }
}
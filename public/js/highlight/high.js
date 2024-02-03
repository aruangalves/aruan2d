let head = document.getElementsByTagName('head')[0];
let link = document.createElement('link');
link.rel  = 'stylesheet';
link.type = 'text/css';
link.href = '/js/highlight/styles/default.min.css';
head.appendChild(link);

function setCodeHighlighting(containerEl){
    let codes = containerEl.querySelectorAll('pre code');
    if(codes.length > 0){
        [...codes].forEach(code =>{
            hljs.highlightElement(code);
        });
    }
}
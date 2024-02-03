import { blogController } from "./blogController.js";

let articleEl = document.querySelector("#single-post");
let data = JSON.parse(articleEl.dataset.row);
let blog = new blogController("singlePost");

if(data.okay){
    blog.renderPost(data.doc, articleEl);
}
else{
    console.log(data.msg);
}
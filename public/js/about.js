import { editorController } from "./editorController.js";

const aboutDiv = document.querySelector('#about-content');
let data = JSON.parse(aboutDiv.dataset.row);

editorController.parse(data, aboutDiv);
front.setImageClickEvents(aboutDiv);
setCodeHighlighting(aboutDiv);
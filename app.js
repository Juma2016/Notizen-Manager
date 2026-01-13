
const STORAGE_KEY = "my_notes_v1";

const API_URL = "/api/notebooks";



let notebooks = [];
let selectedNotebook = null;
let notes = [];
let editingNoteId = null;

function show(el){
  el.classList.remove("hidden");
}
function hide(el){
  el.classList.add("hidden");
}
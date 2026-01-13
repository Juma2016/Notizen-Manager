
const STORAGE_KEY = "my_notes_v1";

const API_URL = "/api/notebooks";

const notebookGrid = document.getElementById("notebookGrid");
const notesSection = document.getElementById("notesSection");
const notesList = document.getElementById("notesList");
const selectedNotebookName = document.getElementById("selectedNotebookName");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const backBtn = document.getElementById("backBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const cancelBtn = document.getElementById("cancelBtn");

const errorBanner = document.getElementById("errorBanner");
const errorText = document.getElementById("errorText");
const retryBtn = document.getElementById("retryBtn");

const toastEl = document.getElementById("toast");


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

function toast(msg) {
  toastEl.textContent = msg;
  show(toastEl);
  setTimeout(() => hide(toastEl), 1200);
}

function now() {
  return new Date().toISOString();
}

function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

async function loadNotebooksFromServer() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("API failed");
  const data = await res.json();

  if (!Array.isArray(data)) throw new Error("Bad JSON");

  return data
    .filter(x => x && typeof x.id === "string" && typeof x.title === "string")
    .map(x => ({ id: x.id, title: x.title }));
}
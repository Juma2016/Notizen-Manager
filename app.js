
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
function renderNotebooks() {
  const term = (searchInput.value || "").toLowerCase().trim();

  const filtered = notebooks.filter(nb =>
    nb.title.toLowerCase().includes(term)
  );

  notebookGrid.innerHTML = "";

  filtered.forEach(nb => {
    const count = notes.filter(n => n.notebookId === nb.id).length;

    const card = document.createElement("div");
    card.className = "card" + (nb.id === selectedNotebookId ? " selected" : "");
    card.dataset.id = nb.id;

    card.innerHTML = `
      <div class="card-head">
        <h3 class="card-title">${nb.title}</h3>
        <span class="badge">${count} notes</span>
      </div>
      <div class="card-actions">
        <button class="link open">Open</button>
      </div>
    `;

    notebookGrid.appendChild(card);
  });
}

function renderNotes() {
  if (!selectedNotebookId) {
    hide(notesSection);
    return;
  }
  show(notesSection);

  const nb = notebooks.find(x => x.id === selectedNotebookId);
  selectedNotebookName.textContent = nb ? nb.title : "Unknown";

  const term = (searchInput.value || "").toLowerCase().trim();

  const list = notes
    .filter(n => n.notebookId === selectedNotebookId)
    .filter(n => {
      if (!term) return true;
      return (n.title + " " + n.content).toLowerCase().includes(term);
    })
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  notesList.innerHTML = "";

  if (list.length === 0) show(emptyState);
  else hide(emptyState);

  list.forEach(n => {
    const div = document.createElement("div");
    div.className = "note";
    div.dataset.id = n.id;

    div.innerHTML = `
      <div class="meta">
        <h3>${escapeHtml(n.title)}</h3>
        <div>
          <button class="link icon edit">✎</button>
          <button class="danger icon delete">🗑</button>
        </div>
      </div>
      <p>${escapeHtml(n.content)}</p>
    `;

    notesList.appendChild(div);
  });
}






function renderAll() {
  renderNotebooks();
  renderNotes();
}

function openModalCreate() {
  editingNoteId = null;
  modalTitle.textContent = "New Note";
  noteTitle.value = "";
  noteContent.value = "";
  show(modalBackdrop);
  noteTitle.focus();
}

function openModalEdit(note) {
  editingNoteId = note.id;
  modalTitle.textContent = "Edit Note";
  noteTitle.value = note.title;
  noteContent.value = note.content;
  show(modalBackdrop);
  noteTitle.focus();
}

function closeModal() {
  hide(modalBackdrop);
  editingNoteId = null;
}

function createNote(title, content) {
  notes.push({
    id: "n-" + Date.now(),
    notebookId: selectedNotebookId,
    title,
    content,
    updatedAt: now()
  });
  saveNotes();
  toast("Created");
  renderAll();
}

function updateNote(id, title, content) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  n.title = title;
  n.content = content;
  n.updatedAt = now();
  saveNotes();
  toast("Updated");
  renderAll();
}

function deleteNote(id) {
  if (!confirm("Delete note?")) return;
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  toast("Deleted");
  renderAll();
}

retryBtn.addEventListener("click", init);

searchInput.addEventListener("input", () => {
  renderAll();
});

notebookGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  selectedNotebookId = card.dataset.id;
  renderAll();
});

backBtn.addEventListener("click", () => {
  selectedNotebookId = null;
  renderAll();
});

addNoteBtn.addEventListener("click", openModalCreate);
emptyAddBtn.addEventListener("click", openModalCreate);

cancelBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const t = noteTitle.value.trim();
  const c = noteContent.value.trim();

  if (t.length < 2 || c.length < 2) {
    alert("Please write title and content (at least 2 chars).");
    return;
  }

  if (!selectedNotebookId) {
    alert("Please select a notebook first.");
    return;
  }

  if (editingNoteId) updateNote(editingNoteId, t, c);
  else createNote(t, c);

  closeModal();
});

notesList.addEventListener("click", (e) => {
  const noteEl = e.target.closest(".note");
  if (!noteEl) return;

  const id = noteEl.dataset.id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  if (e.target.classList.contains("edit")) {
    openModalEdit(note);
  }

  if (e.target.classList.contains("delete")) {
    deleteNote(id);
  }
});

function showError(msg) {
  errorText.textContent = msg;
  show(errorBanner);
}

function hideError() {
  hide(errorBanner);
  errorText.textContent = "";
}

async function init() {
  try {
    hideError();

    notes = loadNotes();

    notebooks = await loadNotebooksFromServer();

    selectedNotebookId = null;

    renderAll();
  } catch (err) {
    showError("Failed to load notebooks from server. Click retry.");
    notebookGrid.innerHTML = "";
    hide(notesSection);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();



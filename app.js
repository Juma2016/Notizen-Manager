const KEY = "notes_manager_v1";

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
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const errTitle = document.querySelector('[data-testid="err-title"]');
const errContent = document.querySelector('[data-testid="err-content"]');
const cancelBtn = document.getElementById("cancelBtn");

const errorBanner = document.getElementById("errorBanner");
const errorText = document.getElementById("errorText");
const retryBtn = document.getElementById("retryBtn");

const toastEl = document.getElementById("toast");

let data = null;
let selectedNotebookId = null;
let editingNoteId = null;

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function toast(msg) {
  toastEl.textContent = msg;
  show(toastEl);
  setTimeout(() => hide(toastEl), 1200);
}

function save() {
  localStorage.setItem(KEY, JSON.stringify({ data, selectedNotebookId }));
}

function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function defaultData() {
  const nbId = "nb-1";
  return {
    notebooks: [{ id: nbId, name: "My Notebook" }],
    notes: [{ id: "n-1", notebookId: nbId, title: "Welcome", content: "This is your first note!" }]
  };
}

async function loadSeedOrDefault() {
  try {
    const res = await fetch("./seed.json");
    if (!res.ok) return defaultData();
    const json = await res.json();
    if (!Array.isArray(json.notebooks) || !Array.isArray(json.notes)) return defaultData();
    return json;
  } catch {
    return defaultData();
  }
}

function clearErrors() {
  hide(errorBanner);
  errTitle.textContent = ""; hide(errTitle);
  errContent.textContent = ""; hide(errContent);
}

function openModal(title = "", content = "", noteId = null) {
  editingNoteId = noteId;
  noteTitle.value = title;
  noteContent.value = content;
  hide(errTitle); hide(errContent);
  show(modalBackdrop);
  noteTitle.focus();
}

function closeModal() {
  hide(modalBackdrop);
  editingNoteId = null;
}

function renderNotebooks() {
  const term = (searchInput.value || "").toLowerCase().trim();

  const list = data.notebooks.filter(nb => nb.name.toLowerCase().includes(term));

  notebookGrid.innerHTML = list.map(nb => {
    const count = data.notes.filter(n => n.notebookId === nb.id).length;
    return `
      <div class="card ${nb.id === selectedNotebookId ? "selected" : ""}" data-id="${nb.id}">
        <div class="card-head">
          <h3 class="card-title">${nb.name}</h3>
          <span class="badge">${count} notes</span>
        </div>
        <div class="card-actions">
          <button class="link open">Open</button>
          <button class="danger icon delete-notebook">🗑</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderNotes() {
  if (!selectedNotebookId) return;

  const nb = data.notebooks.find(x => x.id === selectedNotebookId);
  selectedNotebookName.textContent = nb ? nb.name : "";

  const term = (searchInput.value || "").toLowerCase().trim();

  const list = data.notes
    .filter(n => n.notebookId === selectedNotebookId)
    .filter(n => (n.title + " " + n.content).toLowerCase().includes(term));

  notesList.innerHTML = list.map(n => `
    <div class="note" data-id="${n.id}">
      <div class="meta">
        <h3>${n.title}</h3>
        <div>
          <button class="link icon edit">✎</button>
          <button class="danger icon delete-note">🗑</button>
        </div>
      </div>
      <p>${n.content}</p>
    </div>
  `).join("");

  if (list.length === 0) show(emptyState);
  else hide(emptyState);
}

function renderAll() {
  renderNotebooks();
  if (selectedNotebookId) {
    show(notesSection);
    renderNotes();
  } else {
    hide(notesSection);
  }
}

function selectNotebook(id) {
  selectedNotebookId = id;
  save();
  renderAll();
}

function deleteNotebook(id) {
  const nb = data.notebooks.find(x => x.id === id);
  if (!nb) return;

  if (!confirm(`Delete "${nb.name}" and all its notes?`)) return;

  data.notebooks = data.notebooks.filter(x => x.id !== id);
  data.notes = data.notes.filter(n => n.notebookId !== id);
  selectedNotebookId = data.notebooks[0]?.id || null;

  save();
  renderAll();
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  data.notes = data.notes.filter(n => n.id !== id);
  save();
  renderAll();
}

function validateForm() {
  let ok = true;

  if (noteTitle.value.trim().length < 2) {
    errTitle.textContent = "Title must be at least 2 characters.";
    show(errTitle);
    ok = false;
  } else hide(errTitle);

  if (noteContent.value.trim().length < 2) {
    errContent.textContent = "Content must be at least 2 characters.";
    show(errContent);
    ok = false;
  } else hide(errContent);

  return ok;
}

function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!validateForm()) return;

  if (!selectedNotebookId) {
    selectedNotebookId = data.notebooks[0]?.id || null;
    if (!selectedNotebookId) return;
  }

  if (editingNoteId) {
    const n = data.notes.find(x => x.id === editingNoteId);
    if (n) { n.title = title; n.content = content; }
    toast("Note updated");
  } else {
    data.notes.push({
      id: "n-" + Date.now(),
      notebookId: selectedNotebookId,
      title,
      content
    });
    toast("Note created");
  }

  save();
  closeModal();
  renderAll();
}

retryBtn.addEventListener("click", init);
searchInput.addEventListener("input", renderAll);

addNoteBtn.addEventListener("click", () => openModal());
emptyAddBtn.addEventListener("click", () => openModal());

backBtn.addEventListener("click", () => {
  selectedNotebookId = null;
  save();
  renderAll();
});

cancelBtn.addEventListener("click", closeModal);

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveNote();
});

notebookGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const id = card.dataset.id;

  if (e.target.classList.contains("delete-notebook")) {
    deleteNotebook(id);
    return;
  }
  selectNotebook(id);
});

notesList.addEventListener("click", (e) => {
  const item = e.target.closest(".note");
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.classList.contains("edit")) {
    const n = data.notes.find(x => x.id === id);
    if (n) openModal(n.title, n.content, id);
  }

  if (e.target.classList.contains("delete-note")) {
    deleteNote(id);
  }
});

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

async function init() {
  try {
    clearErrors();

    const saved = load();
    if (saved && saved.data) {
      data = saved.data;
      selectedNotebookId = saved.selectedNotebookId || null;
    } else {
      data = await loadSeedOrDefault();
      selectedNotebookId = data.notebooks[0]?.id || null;
      save();
    }

    renderAll();
  } catch {
    errorText.textContent = "Could not load data.";
    show(errorBanner);
  }
}

init();

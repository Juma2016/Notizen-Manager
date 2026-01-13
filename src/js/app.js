const notebookGrid = document.getElementById("notebookGrid");

const notesSection = document.getElementById("notesSection");
const selectedNotebookName = document.getElementById("selectedNotebookName");
const notesList = document.getElementById("notesList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const backBtn = document.getElementById("backBtn");

const errorBanner = document.getElementById("errorBanner");
const errorText = document.getElementById("errorText");
const retryBtn = document.getElementById("retryBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const cancelBtn = document.getElementById("cancelBtn");

const errTitle = document.querySelector('[data-testid="err-title"]');
const errContent = document.querySelector('[data-testid="err-content"]');

const toast = document.getElementById("toast");

let notebooks = [];           
let selectedNotebookId = null;  
let editingNoteId = null;        
let searchText = "";             

const STORAGE_KEY = "notes_manager_notes";


function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 1500);
}

function showError(msg) {
  errorText.textContent = msg || "Could not load data.";
  errorBanner.classList.remove("hidden");
}

function hideError() {
  errorBanner.classList.add("hidden");
}

function openModal(isEdit) {
  modalTitle.textContent = isEdit ? "Edit Note" : "New Note";
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");
  noteTitle.focus();
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");
  noteForm.reset();
  editingNoteId = null;
  clearValidation();
}

function clearValidation() {
  errTitle.classList.add("hidden");
  errTitle.textContent = "";
  errContent.classList.add("hidden");
  errContent.textContent = "";
}

function formatDate(ms) {
  return new Date(ms).toLocaleString();
}

function makeId() {
  return Date.now().toString();
}


function loadAllNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveAllNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function getNotesForSelectedNotebook() {
  const all = loadAllNotes();
  return all
    .filter(n => n.notebookId === selectedNotebookId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

async function loadNotebooks() {
  hideError();

  const urls = ["/api/notebooks", "/notebooks.json", "/backend/notebooks.json"];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("not array");

      notebooks = data;
      renderNotebooks();
      return;
    } catch (e) {
    }
  }

  showError("Failed to load notebooks.json. Click Reload.");
}


function renderNotebooks() {
  notebookGrid.innerHTML = "";

  notebooks.forEach(nb => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-head">
        <h3 class="card-title">${nb.title}</h3>
        <span class="badge">open</span>
      </div>
      <p class="preview">Click to view notes</p>
      <div class="card-actions">
        <span class="badge">ID: ${nb.id}</span>
        <span class="icon">→</span>
      </div>
    `;

    card.addEventListener("click", () => {
      selectedNotebookId = nb.id;
      selectedNotebookName.textContent = nb.title;
      notesSection.classList.remove("hidden");
      searchInput.value = "";
      searchText = "";
      renderNotes();
    });

    notebookGrid.appendChild(card);
  });
}

function renderNotes() {
  if (!selectedNotebookId) return;

  let notes = getNotesForSelectedNotebook();

  const q = searchText.trim().toLowerCase();
  if (q) {
    notes = notes.filter(n => {
      return (
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
      );
    });
  }

  notesList.innerHTML = "";

  if (notes.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <div class="meta">
        <h3>${note.title}</h3>
        <span class="badge">${formatDate(note.updatedAt)}</span>
      </div>
      <p>${note.content}</p>
      <div class="card-actions" style="margin-top:10px;">
        <button class="link" data-action="edit">Edit</button>
        <button class="danger" data-action="delete">Delete</button>
      </div>
    `;

    div.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editingNoteId = note.id;
      noteTitle.value = note.title;
      noteContent.value = note.content;
      openModal(true);
    });

    div.querySelector('[data-action="delete"]').addEventListener("click", () => {
      const ok = confirm("Delete this note?");
      if (!ok) return;

      const all = loadAllNotes();
      const newAll = all.filter(n => n.id !== note.id);
      saveAllNotes(newAll);

      renderNotes();
      showToast("Deleted");
    });

    notesList.appendChild(div);
  });
}


noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  clearValidation();

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  let ok = true;
  if (title.length < 2) {
    errTitle.textContent = "Title must be at least 2 characters.";
    errTitle.classList.remove("hidden");
    ok = false;
  }
  if (content.length < 2) {
    errContent.textContent = "Content must be at least 2 characters.";
    errContent.classList.remove("hidden");
    ok = false;
  }
  if (!ok) return;

  const all = loadAllNotes();
  const now = Date.now();

  if (editingNoteId) {
    const idx = all.findIndex(n => n.id === editingNoteId);
    if (idx !== -1) {
      all[idx].title = title;
      all[idx].content = content;
      all[idx].updatedAt = now; 
    }
    saveAllNotes(all);
    showToast("Updated");
  } else {
    const newNote = {
      id: makeId(),
      notebookId: selectedNotebookId,
      title,
      content,
      updatedAt: now
    };
    all.push(newNote);
    saveAllNotes(all);
    showToast("Saved");
  }

  closeModal();
  renderNotes();
});

searchInput.addEventListener("input", (e) => {
  searchText = e.target.value;
  renderNotes();
});

addNoteBtn.addEventListener("click", () => {
  if (!selectedNotebookId) {
    showToast("Select a notebook first");
    return;
  }
  editingNoteId = null;
  noteForm.reset();
  openModal(false);
});

emptyAddBtn.addEventListener("click", () => {
  if (!selectedNotebookId) return;
  editingNoteId = null;
  noteForm.reset();
  openModal(false);
});

backBtn.addEventListener("click", () => {
  notesSection.classList.add("hidden");
  selectedNotebookId = null;
});

cancelBtn.addEventListener("click", closeModal);

retryBtn.addEventListener("click", loadNotebooks);

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
    closeModal();
  }
});

loadNotebooks();

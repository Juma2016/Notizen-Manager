const searchInput = document.getElementById("searchInput") || document.getElementById("search");
const notebookSelect = document.querySelector("select");
const notesList = document.getElementById("notesList") || document.getElementById("notes");
const emptyState = document.getElementById("emptyState") || null;
const addNoteBtn = document.getElementById("addNoteBtn") || document.querySelector("button");
const modalBackdrop = document.getElementById("modalBackdrop") || null;
const modalTitle = document.getElementById("modalTitle") || null;
const noteForm = document.getElementById("noteForm") || document.querySelector("form");
const noteTitle = document.getElementById("noteTitle") || document.querySelector("input");
const noteContent = document.getElementById("noteContent") || document.querySelector("textarea");
const cancelBtn = document.getElementById("cancelBtn") || null;
const errTitle = document.querySelector('[data-testid="err-title"]') || null;
const errContent = document.querySelector('[data-testid="err-content"]') || null;
const toast = document.getElementById("toast") || null;

let notebooks = [];
let selectedNotebookId = "";
let editingNoteId = null;
let searchText = "";

const STORAGE_KEY = "notes_manager_notes";

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 1500);
}

function openModal(isEdit) {
  if (!modalBackdrop) return;
  if (modalTitle) modalTitle.textContent = isEdit ? "Edit Note" : "New Note";
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");
  noteTitle.focus();
}

function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");
  noteForm.reset();
  editingNoteId = null;
  if (errTitle) errTitle.classList.add("hidden");
  if (errContent) errContent.classList.add("hidden");
}

function makeId() {
  return Date.now().toString();
}

function formatDate(ms) {
  return new Date(ms).toLocaleString();
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

function getNotes() {
  return loadAllNotes().filter(n => n.notebookId === selectedNotebookId);
}

async function loadNotebooks() {
  const urls = ["/api/notebooks", "/backend/notebooks.json", "/notebooks.json"];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error();
      notebooks = data;
      renderNotebookDropdown();
      return;
    } catch {}
  }
}

function renderNotebookDropdown() {
  if (!notebookSelect) return;
  notebookSelect.innerHTML = `<option value="">Select a notebook...</option>`;
  notebooks.forEach(nb => {
    const opt = document.createElement("option");
    opt.value = nb.id;
    opt.textContent = nb.title;
    notebookSelect.appendChild(opt);
  });
}

function renderNotes() {
  const notes = getNotes().filter(n => {
    if (!searchText) return true;
    return (
      (n.title || "").toLowerCase().includes(searchText) ||
      (n.content || "").toLowerCase().includes(searchText)
    );
  });

  notesList.innerHTML = "";

  if (emptyState) {
    if (notes.length === 0) emptyState.classList.remove("hidden");
    else emptyState.classList.add("hidden");
  }

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <h3>${note.title}</h3>
      <small>${formatDate(note.updatedAt)}</small>
      <p>${note.content}</p>
      <button data-action="edit">Edit</button>
      <button data-action="delete">Delete</button>
    `;

    div.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editingNoteId = note.id;
      noteTitle.value = note.title;
      noteContent.value = note.content;
      openModal(true);
    });

    div.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm("Delete this note?")) return;
      saveAllNotes(loadAllNotes().filter(n => n.id !== note.id));
      renderNotes();
      showToast("Deleted");
    });

    notesList.appendChild(div);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", e => {
    searchText = e.target.value.toLowerCase();
    renderNotes();
  });
}

if (notebookSelect) {
  notebookSelect.addEventListener("change", e => {
    selectedNotebookId = e.target.value;
    renderNotes();
  });
}

if (addNoteBtn) {
  addNoteBtn.addEventListener("click", () => {
    if (!selectedNotebookId) return;
    editingNoteId = null;
    noteForm.reset();
    openModal(false);
  });
}

if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

if (noteForm) {
  noteForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    if (title.length < 2 || content.length < 2) return;

    const all = loadAllNotes();
    const now = Date.now();

    if (editingNoteId) {
      const idx = all.findIndex(n => n.id === editingNoteId);
      if (idx !== -1) {
        all[idx].title = title;
        all[idx].content = content;
        all[idx].updatedAt = now;
      }
    } else {
      all.push({
        id: makeId(),
        notebookId: selectedNotebookId,
        title,
        content,
        updatedAt: now
      });
    }

    saveAllNotes(all);
    closeModal();
    renderNotes();
    showToast("Saved");
  });
}

loadNotebooks();

// app.js — Sprint 1 DoD compliant
// Single-file frontend logic (no dead buttons, validation, error UI, persistence)

const STORAGE_KEY = "notes_manager_state_v1";

let state = null;
let editingNoteId = null;

// ===== DOM =====
const notebookGrid = document.querySelector("#notebookGrid");
const notesSection = document.querySelector("#notesSection");
const notesList = document.querySelector("#notesList");
const selectedNotebookName = document.querySelector("#selectedNotebookName");
const emptyState = document.querySelector("#emptyState");

const searchInput = document.querySelector("#searchInput");
const addNoteBtn = document.querySelector("#addNoteBtn");
const emptyAddBtn = document.querySelector("#emptyAddBtn");
const backBtn = document.querySelector("#backBtn");

// modal
const modalBackdrop = document.querySelector("#modalBackdrop");
const noteForm = document.querySelector("#noteForm");
const noteTitle = document.querySelector("#noteTitle");
const noteContent = document.querySelector("#noteContent");
const errTitle = document.querySelector('[data-testid="err-title"]');
const errContent = document.querySelector('[data-testid="err-content"]');
const cancelBtn = document.querySelector("#cancelBtn");

// error banner
const errorBanner = document.querySelector("#errorBanner");
const errorText = document.querySelector("#errorText");
const retryBtn = document.querySelector("#retryBtn");

// toast
const toastEl = document.querySelector("#toast");

// ===== Utils =====
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function preview(text, max = 110) {
  const t = (text ?? "").trim();
  return t.length <= max ? t : t.slice(0, max - 1) + "…";
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function now() { return Date.now(); }

function toast(msg) {
  toastEl.textContent = msg;
  show(toastEl);
  setTimeout(() => hide(toastEl), 1400);
}

function showError(msg) {
  errorText.textContent = msg;
  show(errorBanner);
}
function hideError() {
  hide(errorBanner);
}

// ===== Storage =====
function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = safeParse(raw);
  if (!parsed) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return parsed;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureShape(s) {
  if (!s || typeof s !== "object") return null;
  if (!Array.isArray(s.notebooks)) return null;
  if (!Array.isArray(s.notes)) return null;
  if (!s.ui || typeof s.ui !== "object") s.ui = {};
  if (!("selectedNotebookId" in s.ui)) s.ui.selectedNotebookId = null;
  return s;
}

async function loadSeedOrThrow() {
  // seed.json must be next to index.html
  const res = await fetch("./seed.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load seed.json (${res.status})`);
  const data = await res.json();
  const shaped = ensureShape(data);
  if (!shaped) throw new Error("seed.json has an invalid structure.");
  return shaped;
}

// ===== Render =====
function renderNotebooks() {
  const term = (searchInput.value || "").trim().toLowerCase();

  const items = state.notebooks
    .map(nb => {
      const notes = state.notes
        .filter(n => n.notebookId === nb.id)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      const last = notes[0];
      const pv = last ? preview(`${last.title}: ${last.content}`, 110) : "No notes yet…";
      return { ...nb, count: notes.length, pv };
    })
    .filter(nb =>
      nb.name.toLowerCase().includes(term) ||
      nb.pv.toLowerCase().includes(term)
    );

  notebookGrid.innerHTML = items.map(nb => `
    <article class="card ${state.ui.selectedNotebookId === nb.id ? "selected" : ""}"
             data-notebook-id="${nb.id}">
      <div class="card-head">
        <h3 class="card-title">${escapeHtml(nb.name)}</h3>
        <span class="badge">${nb.count} notes</span>
      </div>
      <p class="preview">${escapeHtml(nb.pv)}</p>
      <div class="card-actions">
        <button class="link open-notes">Open</button>
        <button class="danger icon delete-notebook" title="Delete notebook">🗑</button>
      </div>
    </article>
  `).join("");
}

function renderNotes() {
  const nbId = state.ui.selectedNotebookId;
  if (!nbId) return;

  const term = (searchInput.value || "").trim().toLowerCase();

  const notes = state.notes
    .filter(n => n.notebookId === nbId)
    .filter(n => (n.title + " " + n.content).toLowerCase().includes(term))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  notesList.innerHTML = notes.map(n => `
    <article class="note" data-note-id="${n.id}">
      <div class="meta">
        <h3>${escapeHtml(n.title)}</h3>
        <div>
          <button class="link icon edit-note" title="Edit">✎</button>
          <button class="danger icon delete-note" title="Delete">🗑</button>
        </div>
      </div>
      <p>${escapeHtml(preview(n.content, 140))}</p>
    </article>
  `).join("");

  notes.length === 0 ? show(emptyState) : hide(emptyState);
}

function openNotebook(notebookId, scroll = true) {
  state.ui.selectedNotebookId = notebookId;
  saveState();

  const nb = state.notebooks.find(n => n.id === notebookId);
  selectedNotebookName.textContent = nb ? nb.name : "";

  show(notesSection);
  renderNotes();
  renderNotebooks();

  if (scroll) notesSection.scrollIntoView({ behavior: "smooth" });
}

function renderAll() {
  renderNotebooks();
  state.ui.selectedNotebookId ? openNotebook(state.ui.selectedNotebookId, false)
                              : hide(notesSection);
}

// ===== Modal / Validation =====
function clearValidation() {
  errTitle.textContent = "";
  errContent.textContent = "";
  hide(errTitle); hide(errContent);
}

function validateForm() {
  const titleOk = noteTitle.checkValidity();
  const contentOk = noteContent.checkValidity();

  if (!titleOk) { errTitle.textContent = noteTitle.validationMessage; show(errTitle); }
  else hide(errTitle);

  if (!contentOk) { errContent.textContent = noteContent.validationMessage; show(errContent); }
  else hide(errContent);

  return titleOk && contentOk;
}

function openModal({ title = "", content = "" } = {}, noteId = null) {
  editingNoteId = noteId;
  noteTitle.value = title;
  noteContent.value = content;
  clearValidation();
  show(modalBackdrop);
  modalBackdrop.setAttribute("aria-hidden", "false");
  noteTitle.focus();
}

function closeModal() {
  hide(modalBackdrop);
  modalBackdrop.setAttribute("aria-hidden", "true");
  clearValidation();
}

function createOrUpdateNote() {
  const nbId = state.ui.selectedNotebookId || state.notebooks[0]?.id;
  if (!nbId) return;

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (editingNoteId) {
    const n = state.notes.find(x => x.id === editingNoteId);
    if (n) { n.title = title; n.content = content; n.updatedAt = now(); }
    toast("Note updated");
  } else {
    state.notes.push({ id: uid("note"), notebookId: nbId, title, content, updatedAt: now() });
    toast("Note created");
  }

  saveState();
  closeModal();
  openNotebook(nbId, false);
}

// ===== Delete =====
function deleteNotebook(notebookId) {
  const nb = state.notebooks.find(n => n.id === notebookId);
  if (!nb) return;

  if (!confirm(`Delete notebook "${nb.name}"? All notes inside will be deleted.`)) return;

  state.notebooks = state.notebooks.filter(n => n.id !== notebookId);
  state.notes = state.notes.filter(n => n.notebookId !== notebookId);
  state.ui.selectedNotebookId = state.notebooks[0]?.id || null;

  saveState();
  renderAll();
  toast("Notebook deleted");
}

function deleteNote(noteId) {
  if (!confirm("Delete this note?")) return;
  state.notes = state.notes.filter(n => n.id !== noteId);
  saveState();
  renderNotes();
  renderNotebooks();
  toast("Note deleted");
}

// ===== Events =====
retryBtn.addEventListener("click", () => init());

searchInput.addEventListener("input", () => renderAll());

addNoteBtn.addEventListener("click", () => {
  if (!state.ui.selectedNotebookId)
    state.ui.selectedNotebookId = state.notebooks[0]?.id || null;
  openModal();
});

emptyAddBtn.addEventListener("click", () => openModal());

backBtn.addEventListener("click", () => {
  state.ui.selectedNotebookId = null;
  saveState();
  hide(notesSection);
  renderNotebooks();
});

cancelBtn.addEventListener("click", closeModal);

// close modal by backdrop or ESC
modalBackdrop.addEventListener("click", e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modalBackdrop.classList.contains("hidden")) closeModal();
});

noteForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!validateForm()) return;
  createOrUpdateNote();
});

notebookGrid.addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.notebookId;

  if (e.target.closest(".delete-notebook")) {
    e.stopPropagation();
    deleteNotebook(id);
    return;
  }
  openNotebook(id);
});

notesList.addEventListener("click", e => {
  const noteEl = e.target.closest(".note");
  if (!noteEl) return;
  const noteId = noteEl.dataset.noteId;

  if (e.target.closest(".edit-note")) {
    e.stopPropagation();
    const n = state.notes.find(x => x.id === noteId);
    if (n) openModal({ title: n.title, content: n.content }, noteId);
    return;
  }
  if (e.target.closest(".delete-note")) {
    e.stopPropagation();
    deleteNote(noteId);
  }
});

// ===== Init =====
async function init() {
  try {
    hideError();
    state = ensureShape(loadState());
    if (!state) {
      state = await loadSeedOrThrow();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    if (state.ui.selectedNotebookId &&
        !state.notebooks.some(n => n.id === state.ui.selectedNotebookId)) {
      state.ui.selectedNotebookId = state.notebooks[0]?.id || null;
      saveState();
    }
    renderAll();
  } catch (err) {
    showError(err?.message || "Could not load data.");
  }
}

init();

const notebookDropdown = document.getElementById("notebookDropdown");
const notesSection = document.getElementById("notesSection");
const notesList = document.getElementById("notesList");
const notebookName = document.getElementById("notebookName");
const addNoteInSection = document.getElementById("addNoteInSection");
const modal = document.getElementById("modal");
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const cancelButton = document.getElementById("cancelButton");
const searchInput = document.getElementById("search");

let notebooks = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let selectedNotebookId = null;
let editNoteId = null;

fetch("/backend/notebooks.json")
  .then(res => res.json())
  .then(data => {
    notebooks = data;
    fillNotebookDropdown();
  })
  .catch(() => alert("Failed to load notebooks"));

function fillNotebookDropdown() {
  notebooks.forEach(nb => {
    const option = document.createElement("option");
    option.value = nb.id;
    option.textContent = nb.title;
    notebookDropdown.appendChild(option);
  });
}

notebookDropdown.addEventListener("change", () => {
  selectedNotebookId = notebookDropdown.value;
  const nb = notebooks.find(n => n.id === selectedNotebookId);
  notebookName.textContent = nb.title;
  notesSection.classList.remove("hidden");
  renderNotes();
});

function renderNotes() {
  notesList.innerHTML = "";

  const filtered = notes.filter(n => n.notebookId === selectedNotebookId);

  filtered.forEach(note => {
    const div = document.createElement("div");
    div.className = "note-item";

    div.innerHTML = `
      <div class="note-header">
        <strong>${note.title}</strong>
        <div class="note-actions">
          <button class="edit-note">Edit</button>
          <button class="delete-note">Delete</button>
        </div>
      </div>
      <p>${note.content}</p>
    `;

    div.querySelector(".edit-note").onclick = () => openEdit(note);
    div.querySelector(".delete-note").onclick = () => deleteNote(note.id);

    notesList.appendChild(div);
  });
}

addNoteInSection.onclick = () => openCreate();
cancelButton.onclick = closeModal;

function openCreate() {
  editNoteId = null;
  titleInput.value = "";
  contentInput.value = "";
  modal.classList.remove("hidden");
}

function openEdit(note) {
  editNoteId = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

noteForm.addEventListener("submit", e => {
  e.preventDefault();

  if (!titleInput.value || !contentInput.value) return;

  if (editNoteId) {
    const note = notes.find(n => n.id === editNoteId);
    note.title = titleInput.value;
    note.content = contentInput.value;
    note.updatedAt = Date.now();
  } else {
    notes.push({
      id: Date.now().toString(),
      notebookId: selectedNotebookId,
      title: titleInput.value,
      content: contentInput.value,
      updatedAt: Date.now()
    });
  }

  saveNotes();
  closeModal();
  renderNotes();
});

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = notes.filter(n =>
    n.notebookId === selectedNotebookId &&
    n.title.toLowerCase().includes(q)
  );

  notesList.innerHTML = "";
  filtered.forEach(n => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `<strong>${n.title}</strong><p>${n.content}</p>`;
    notesList.appendChild(div);
  });
});
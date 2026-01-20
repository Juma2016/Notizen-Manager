const notebookDropdown = document.getElementById("notebookDropdown");
const notesSection = document.getElementById("notesSection");
const notesList = document.getElementById("notesList");
const notebookName = document.getElementById("notebookName");
const addNoteInSection = document.getElementById("addNoteInSection");
const modal = document.getElementById("modal");
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const tagsInput = document.getElementById("tags");
const cancelButton = document.getElementById("cancelButton");
const searchInput = document.getElementById("search");

let notebooks = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

notes.forEach((n) => {
  if (!Array.isArray(n.tags)) {
    n.tags = [];
  }
});

let selectedNotebookId = null;
let editNoteId = null;

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

fetch("http://localhost:3000/api/notebooks")
  .then((res) => res.json())
  .then((data) => {
    notebooks = data;
    fillNotebookDropdown();
  })
  .catch(() => {
    const reload = confirm("Failed to load notebooks. Click OK to reload the page.");
    if (reload) {
      location.reload();
    }
  });

function fillNotebookDropdown() {
  notebooks.forEach((nb) => {
    const option = document.createElement("option");
    option.value = nb.id;
    option.textContent = nb.title;
    notebookDropdown.appendChild(option);
  });
}

notebookDropdown.addEventListener("change", () => {
  const selectedValue = notebookDropdown.value;

  if (selectedValue === "" || selectedValue === "select") {
    selectedNotebookId = null;
    notesSection.classList.add("hidden");
    searchInput.value = "";
    return;
  }

  selectedNotebookId = selectedValue;
  const nb = notebooks.find((n) => n.id === selectedNotebookId);
  notebookName.textContent = nb.title;
  notesSection.classList.remove("hidden");
  addNoteInSection.style.display = "block";
  searchInput.value = "";

  renderNotes();
});

function renderNotes() {
  notesList.innerHTML = "";

  const searchTerm = searchInput.value.trim();
  let filteredNotes;

  if (searchTerm) {
    filteredNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  } else {
    filteredNotes = notes.filter((n) => n.notebookId === selectedNotebookId);
  }

  if (filteredNotes.length === 0) {
    if (searchTerm) {
      notesList.innerHTML =
        '<p class="no-results">Keine Ergebnisse gefunden</p>';
    } else if (selectedNotebookId) {
      notesList.innerHTML =
        '<p class="no-results">Noch keine Notizen in diesem Notizbuch</p>';
    }
  } else {
    filteredNotes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note-item";

      div.innerHTML = `
      <div class="note-header">
        <div>
          <strong data-testid="note-title">${note.title}</strong>
          <p class="note-date">${formatDate(note.updatedAt)}</p>
        </div>
        <div class="note-actions">
          <button class="edit-note">Edit</button>
          <button class="delete-note">Delete</button>
        </div>
      </div>
      <p data-testid="note-content">${note.content}</p>
      ${note.tags && note.tags.length ? `<p class="note-tags" data-testid="note-tags">${note.tags.map(t => `#${t}`).join(" ")}</p>` : ""}
    `;

      div.querySelector(".edit-note").onclick = () => openEdit(note);
      div.querySelector(".delete-note").onclick = () => deleteNote(note.id);

      notesList.appendChild(div);
    });
  }
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  if (!selectedNotebookId && !q) {
    notesSection.classList.add("hidden");
    return;
  }

  if (!selectedNotebookId && q) {
    notesSection.classList.remove("hidden");
    notebookName.textContent = "Suchergebnisse";
    addNoteInSection.style.display = "none";
  }

  if (selectedNotebookId && q) {
    addNoteInSection.style.display = "none";
  }

  if (selectedNotebookId && !q) {
    addNoteInSection.style.display = "block";
    const nb = notebooks.find((n) => n.id === selectedNotebookId);
    notebookName.textContent = nb.title;
  }

  let filtered;

  if (q) {
    filtered = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  } else {
    filtered = notes.filter((n) => n.notebookId === selectedNotebookId);
  }

  notesList.innerHTML = "";

  if (filtered.length === 0) {
    if (q) {
      notesList.innerHTML =
        '<p class="no-results">Keine Ergebnisse gefunden</p>';
    } else if (selectedNotebookId) {
      notesList.innerHTML =
        '<p class="no-results">Noch keine Notizen in diesem Notizbuch</p>';
    }
    return;
  }

  filtered.forEach((n) => {
    const div = document.createElement("div");
    div.className = "note-item";

    div.innerHTML = `
      <div class="note-header">
        <div>
          <strong data-testid="note-title">${n.title}</strong>
          <p class="note-date">${formatDate(n.updatedAt)}</p>
        </div>
        <div class="note-actions">
          <button class="edit-note">Edit</button>
          <button class="delete-note">Delete</button>
        </div>
      </div>
      <p data-testid="note-content">${n.content}</p>
      ${n.tags && n.tags.length ? `<p class="note-tags" data-testid="note-tags">${n.tags.map(t => `#${t}`).join(" ")}</p>` : ""}
    `;

    div.querySelector(".edit-note").onclick = () => openEdit(n);
    div.querySelector(".delete-note").onclick = () => deleteNote(n.id);

    notesList.appendChild(div);
  });
});

addNoteInSection.onclick = () => {
  if (!selectedNotebookId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }
  openCreate();
};

cancelButton.onclick = closeModal;

function openCreate() {
  editNoteId = null;
  titleInput.value = "";
  contentInput.value = "";
  tagsInput.value = "";
  modal.classList.remove("hidden");
}

function openEdit(note) {
  editNoteId = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  tagsInput.value = Array.isArray(note.tags) ? note.tags.join(", ") : "";
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!titleInput.value || !contentInput.value) return;

  if (!selectedNotebookId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }

  const tagsArray = tagsInput.value
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const uniqueTags = [...new Set(tagsArray)];

  if (editNoteId) {
    const note = notes.find((n) => n.id === editNoteId);
    note.title = titleInput.value;
    note.content = contentInput.value;
    note.updatedAt = Date.now();
    note.tags = uniqueTags;
  } else {
    notes.push({
      tags: uniqueTags,
      id: Date.now().toString(),
      notebookId: selectedNotebookId,
      title: titleInput.value,
      content: contentInput.value,
      updatedAt: Date.now(),
    });
  }

  saveNotes();
  closeModal();
  renderNotes();
});

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  renderNotes();
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

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
const sortSelect = document.getElementById("sort-select");

let notebooks = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let selectedNotebookId = null;
let editNoteId = null;
let currentSort = "date-desc";

fetch("http://localhost:3000/api/notebooks")
  .then((res) => res.json())
  .then((data) => {
    notebooks = data;
    fillNotebookDropdown();
  })
  .catch(() => {
    const reload = confirm(
      "Failed to load notebooks. Click OK to reload the page.",
    );
    if (reload) location.reload();
  });

function sortNotes(notesArray, sortType, order) {
  if (!notesArray || notesArray.length === 0) return notesArray;

  const sorted = [...notesArray];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (sortType === "title") {
      // Titel sortieren (Groß-/Kleinschreibung ignorieren)
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      comparison = titleA.localeCompare(titleB);
    } else {
      // Datum sortieren (standardmäßig)
      const dateA = new Date(a.updatedAt || 0);
      const dateB = new Date(b.updatedAt || 0);
      comparison = dateA - dateB;
    }

    // Die Reihenfolge umkehren
    return order === "desc" ? -comparison : comparison;
  });

  return sorted;
}

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function viewNoteContent(note) {
  const titleElement = document.getElementById("viewNoteTitle");
  const contentElement = document.getElementById("viewNoteContent");

  const maxLength = 60;
  if (note.title.length > maxLength) {
    titleElement.textContent = note.title.substring(0, maxLength) + "...";
    titleElement.title = note.title;
  } else {
    titleElement.textContent = note.title;
    titleElement.title = "";
  }

  contentElement.textContent = note.content;

  document.getElementById("noteContentView").classList.remove("hidden");
}

function closeNoteView() {
  document.getElementById("noteContentView").classList.add("hidden");
}

document
  .getElementById("closeNoteView")
  .addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeNoteView();
  });

document
  .getElementById("noteContentView")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeNoteView();
    }
  });

document.addEventListener("keydown", function (e) {
  if (
    e.key === "Escape" &&
    !document.getElementById("noteContentView").classList.contains("hidden")
  ) {
    closeNoteView();
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

sortSelect.addEventListener("change", function () {
  currentSort = this.value;
  renderNotes();
});

notebookDropdown.addEventListener("change", () => {
  const value = notebookDropdown.value;

  if (!value) {
    selectedNotebookId = null;
    notesSection.classList.add("hidden");
    searchInput.value = "";
    return;
  }

  selectedNotebookId = value;
  const nb = notebooks.find((n) => n.id === selectedNotebookId);
  notebookName.textContent = nb.title;
  notesSection.classList.remove("hidden");
  addNoteInSection.style.display = "block";
  searchInput.value = "";

  renderNotes();
});

function highlightText(text, searchTerm) {
  if (!searchTerm) return text;
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function renderNotes() {
  notesList.innerHTML = "";

  const searchTerm = searchInput.value.trim().toLowerCase();
  let filteredNotes;

  if (searchTerm) {
    filteredNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm) ||
        n.content.toLowerCase().includes(searchTerm),
    );

    notesSection.classList.remove("hidden");
    notebookName.textContent = "Suchergebnisse";
    addNoteInSection.style.display = "none";
  } else {
    filteredNotes = notes.filter((n) => n.notebookId === selectedNotebookId);

    if (!selectedNotebookId) {
      notesSection.classList.add("hidden");
      return;
    }

    const nb = notebooks.find((n) => n.id === selectedNotebookId);
    notebookName.textContent = nb.title;
    addNoteInSection.style.display = "block";
  }

  if (filteredNotes.length > 0) {
    const [sortType, order] = currentSort.split("-");
    filteredNotes = sortNotes(filteredNotes, sortType, order);
  }

  if (filteredNotes.length === 0) {
    notesList.innerHTML = searchTerm
      ? '<p class="no-results">Keine Ergebnisse gefunden</p>'
      : '<p class="no-results">Noch keine Notizen in diesem Notizbuch</p>';
    return;
  }

  filteredNotes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.addEventListener("click", () => viewNoteContent(note));

    div.innerHTML = `
      <div class="note-header">
        <div>
          <strong data-testid="note-title">
            ${highlightText(note.title, searchTerm)}
          </strong>
          <p class="note-date">${formatDate(note.updatedAt)}</p>
        </div>
        <div class="note-actions">
          <button class="edit-note">Edit</button>
          <button class="delete-note">Delete</button>
        </div>
      </div>
       <div class="note-content">
       <p data-testid="note-content">${highlightText(note.content, searchTerm)}</p>
       <div class="version-wrapper"> 
          <p class="version-label">Versions: </p>
          <select name="Version Selector" class="note-version ${note.versions.length <= 0 ? "note-no-version" : ""}">
          ${showVersions(note.id)}
          </select>
      </div>
    `;

    div.querySelector(".edit-note").addEventListener("click", (e) => {
      e.stopPropagation();
      openEdit(note);
    });

    div.querySelector(".delete-note").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });

    const versionSelect = div.querySelector(".note-version");
    // Verhindert, dass Klicks auf das Select das Modal öffnen (Event Bubbling)
    versionSelect.addEventListener("click", (e) => e.stopPropagation());
    versionSelect.addEventListener("change", (e) => {
      const versionId = e.target.value;
      const version = note.versions.find((v) => v.versionId == versionId);
      if (version) {
        openEdit(version);
        versionSelect.value = "";
      }
    });

    notesList.appendChild(div);
  });
}

searchInput.addEventListener("input", () => {
  renderNotes();
});

function showVersions(noteId) {
  const noteToEdit = notes.find((note) => note.id == noteId);
  let options = `<option value="">Versions</option>`;

  if (noteToEdit && noteToEdit.versions.length > 0) {
    options += noteToEdit.versions
      .map(
        (val) =>
          `<option class="version-option" value="${val.versionId}">Created At: ${new Date(val.updatedAt).toLocaleDateString()}</option>`,
      )
      .join("");
  }
  return options;
}

addNoteInSection.onclick = () => {
  if (!selectedNotebookId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }
  openCreate();
};

cancelButton.onclick = closeModal;

// Zeichenlimit-Warnung für Titel
titleInput.addEventListener("input", function () {
  const maxLength = 50;
  const currentLength = this.value.length;
  const message = document.getElementById("titleLimitMessage");

  if (currentLength === maxLength) {
    message.classList.remove("hidden");
  } else {
    message.classList.add("hidden");
  }
});

// Auch beim Einfügen (Ctrl+V) prüfen
titleInput.addEventListener("paste", function () {
  setTimeout(() => {
    const maxLength = 50;
    const currentLength = this.value.length;
    const message = document.getElementById("titleLimitMessage");

    if (currentLength === maxLength) {
      message.classList.remove("hidden");
    } else {
      message.classList.add("hidden");
    }
  }, 10);
});

function openCreate() {
  editNoteId = null;
  titleInput.value = "";
  contentInput.value = "";

  const message = document.getElementById("titleLimitMessage");
  message.classList.add("hidden");

  modal.classList.remove("hidden");
}

function openEdit(note) {
  editNoteId = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;

  const message = document.getElementById("titleLimitMessage");
  if (note.title.length === 50) {
    message.classList.remove("hidden");
  } else {
    message.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  const message = document.getElementById("titleLimitMessage");
  message.classList.add("hidden");

  modal.classList.add("hidden");
}

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!titleInput.value || !contentInput.value) return;

  if (!selectedNotebookId && !editNoteId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }

  if (editNoteId) {
    const note = notes.find((n) => n.id === editNoteId);
    note.versions.push({
      versionId: note.versions.length + 1,
      id: note.id,
      notebookId: note.notebookId,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
    });
    note.title = titleInput.value;
    note.content = contentInput.value;
    note.updatedAt = Date.now();
  } else {
    notes.push({
      id: Date.now().toString(),
      notebookId: selectedNotebookId,
      title: titleInput.value,
      content: contentInput.value,
      updatedAt: Date.now(),
      versions: [],
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

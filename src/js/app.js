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
    titleElement.textContent = note.title.substring(0, maxLength) + '...';
    titleElement.title = note.title;
  } else {
    titleElement.textContent = note.title;
    titleElement.title = '';
  }
  
  contentElement.textContent = note.content;
  
  document.getElementById("noteContentView").classList.remove("hidden");
}

function closeNoteView() {
  document.getElementById("noteContentView").classList.add("hidden");
}

document.getElementById("closeNoteView").addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  closeNoteView();
});

document.getElementById("noteContentView").addEventListener('click', function(e) {
  if (e.target === this) {
    closeNoteView();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !document.getElementById("noteContentView").classList.contains("hidden")) {
    closeNoteView();
  }
});

fetch("http://localhost:3000/api/notebooks")
  .then((res) => res.json())
  .then((data) => {
    notebooks = data;
    fillNotebookDropdown();
  })
  .catch(() => {
    const reload = confirm("Failed to load notebooks. Click OK to reload the page.");
    if (reload) location.reload();
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
        n.content.toLowerCase().includes(searchTerm)
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
    div.addEventListener('click', () => viewNoteContent(note));

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
      <p data-testid="note-content">
        ${highlightText(note.content, searchTerm)}
      </p>
    `;

    div.querySelector(".edit-note").addEventListener('click', (e) => {
      e.stopPropagation();
      openEdit(note);
    });

    div.querySelector(".delete-note").addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });

    notesList.appendChild(div);
  });
}

searchInput.addEventListener("input", () => {
  renderNotes();
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

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!titleInput.value || !contentInput.value) return;

  if (!selectedNotebookId && !editNoteId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }

  if (editNoteId) {
    const note = notes.find((n) => n.id === editNoteId);
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
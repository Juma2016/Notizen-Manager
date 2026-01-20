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

const tagFilter = document.getElementById("tagFilter");

let notebooks = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

notes.forEach((n) => {
  if (!Array.isArray(n.tags)) n.tags = [];
});

let selectedNotebookId = null;
let editNoteId = null;

const selectedTags = new Set();
let allMode = false;
let lastTagClickValue = null;

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

function getAllTags() {
  const set = new Set();
  notes.forEach((n) => {
    if (Array.isArray(n.tags)) {
      n.tags.forEach((t) => {
        const clean = String(t).trim();
        if (clean) set.add(clean);
      });
    }
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

function renderTagDropdown() {
  if (!tagFilter) return;

  tagFilter.innerHTML = `<option value="">All tags</option>`;

  const allTags = getAllTags();
  allTags.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = `#${t}`;
    tagFilter.appendChild(opt);
  });

  const allowed = new Set(allTags);
  for (const t of Array.from(selectedTags)) {
    if (!allowed.has(t)) selectedTags.delete(t);
  }

  const allOpt = tagFilter.querySelector('option[value=""]');

  if (allMode) {
    if (allOpt) allOpt.selected = true;
    Array.from(tagFilter.options).forEach((opt) => {
      if (opt.value !== "") opt.selected = true;
    });
    return;
  }

  if (allOpt) allOpt.selected = false;
  Array.from(tagFilter.options).forEach((opt) => {
    if (opt.value !== "") opt.selected = selectedTags.has(opt.value);
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

  renderTagDropdown();
  renderNotes();
});

if (tagFilter) {
  tagFilter.addEventListener("mousedown", (e) => {
    if (e.target && e.target.tagName === "OPTION") {
      lastTagClickValue = e.target.value;
    }
  });

  tagFilter.addEventListener("change", () => {
    const allOpt = tagFilter.querySelector('option[value=""]');

    if (lastTagClickValue === "" && allOpt) {
      if (!allMode) {
        allMode = true;
        selectedTags.clear();
        allOpt.selected = true;
        Array.from(tagFilter.options).forEach((opt) => {
          if (opt.value !== "") opt.selected = true;
        });
      } else {
        allMode = false;
        selectedTags.clear();
        Array.from(tagFilter.options).forEach((opt) => (opt.selected = false));
      }

      lastTagClickValue = null;
      renderNotes();
      return;
    }

    if (allMode) {
      allMode = false;
      if (allOpt) allOpt.selected = false;
    }

    selectedTags.clear();
    Array.from(tagFilter.options).forEach((opt) => {
      if (opt.value && opt.selected) selectedTags.add(opt.value);
    });

    lastTagClickValue = null;
    renderNotes();
  });
}

function renderNotes() {
  notesList.innerHTML = "";

  const searchTerm = searchInput.value.trim();
  let filteredNotes;

  if (searchTerm) {
    filteredNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else {
    filteredNotes = notes.filter((n) => n.notebookId === selectedNotebookId);
  }

  if (!allMode && selectedTags.size > 0) {
    filteredNotes = filteredNotes.filter((n) => {
      const ntags = Array.isArray(n.tags) ? n.tags : [];
      for (const t of selectedTags) {
        if (!ntags.includes(t)) return false;
      }
      return true;
    });
  }

  if (filteredNotes.length === 0) {
    if (searchTerm) {
      notesList.innerHTML = '<p class="no-results">Keine Ergebnisse gefunden</p>';
    } else if (selectedNotebookId) {
      notesList.innerHTML = '<p class="no-results">Noch keine Notizen in diesem Notizbuch</p>';
    }
    return;
  }

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
      ${
        note.tags && note.tags.length
          ? `<p class="note-tags" data-testid="note-tags">${note.tags.map((t) => `#${t}`).join(" ")}</p>`
          : ""
      }
    `;

    div.querySelector(".edit-note").onclick = () => openEdit(note);
    div.querySelector(".delete-note").onclick = () => deleteNote(note.id);

    notesList.appendChild(div);
  });
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
    .split(",")
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
      updatedAt: Date.now()
    });
  }

  saveNotes();
  closeModal();

  renderTagDropdown();
  renderNotes();
});

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveNotes();

  renderTagDropdown();
  renderNotes();
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}
searchInput.addEventListener("input", (e) => {
  const query =e.target.value;
  console.log("Search query:", query);
});

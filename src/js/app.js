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
const sortSelect = document.getElementById("sort-select");


let notebooks = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

notes.forEach((n) => {
  if (!Array.isArray(n.tags)) n.tags = [];
});

let selectedNotebookId = null;
let editNoteId = null;


let currentSort = "date-desc";

function sortNotes(notesArray, sortType, order) {
  const sorted = [...notesArray];

  sorted.sort((a, b) => {
    let cmp = 0;

    if (sortType === "title") {
      cmp = String(a.title || "")
        .toLowerCase()
        .localeCompare(String(b.title || "").toLowerCase());
    } else {
      cmp = Number(a.updatedAt || 0) - Number(b.updatedAt || 0);
    }

    return order === "desc" ? -cmp : cmp;
  });

  return sorted;
}

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value || "date-desc";
    renderNotes();
  });
}


const selectedTags = new Set();
let allMode = false;
let lastTagClickValue = null;

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
  const tags = getAllTags();

  tags.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = `#${t}`;
    tagFilter.appendChild(opt);
  });

  const allOpt = tagFilter.querySelector('option[value=""]');

  if (allMode && allOpt) {
    allOpt.selected = true;
    Array.from(tagFilter.options).forEach((o) => {
      if (o.value) o.selected = true;
    });
  } else {
    Array.from(tagFilter.options).forEach((o) => {
      if (o.value) o.selected = selectedTags.has(o.value);
    });
  }
}

if (tagFilter) {
  tagFilter.addEventListener("mousedown", (e) => {
    if (e.target && e.target.tagName === "OPTION") {
      lastTagClickValue = e.target.value;
    }
  });

  tagFilter.addEventListener("change", () => {
    const allOpt = tagFilter.querySelector('option[value=""]');

    // toggle "All tags" mode
    if (lastTagClickValue === "" && allOpt) {
      allMode = !allMode;
      selectedTags.clear();
      Array.from(tagFilter.options).forEach((o) => (o.selected = allMode));
      lastTagClickValue = null;
      renderNotes();
      return;
    }

    allMode = false;
    selectedTags.clear();
    Array.from(tagFilter.options).forEach((o) => {
      if (o.value && o.selected) selectedTags.add(o.value);
    });

    renderNotes();
  });
}


function formatDate(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function highlightText(text, q) {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const r = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return safe.replace(r, "<mark>$1</mark>");
}


function viewNoteContent(note) {
  const titleElement = document.getElementById("viewNoteTitle");
  const contentElement = document.getElementById("viewNoteContent");

  if (!titleElement || !contentElement) return;

  const maxLength = 60;
  const title = String(note.title || "");
  if (title.length > maxLength) {
    titleElement.textContent = title.substring(0, maxLength) + "...";
    titleElement.title = title;
  } else {
    titleElement.textContent = title;
    titleElement.title = "";
  }

  contentElement.textContent = String(note.content || "");
  document.getElementById("noteContentView")?.classList.remove("hidden");
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
  document.getElementById("noteContentView")?.classList.add("hidden");
}

const closeBtn = document.getElementById("closeNoteView");
if (closeBtn) {
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeNoteView();
  });
}

const noteView = document.getElementById("noteContentView");
if (noteView) {
  noteView.addEventListener("click", function (e) {
    if (e.target === this) closeNoteView();
  });
}

document.addEventListener("keydown", (e) => {
  const v = document.getElementById("noteContentView");
  if (e.key === "Escape" && v && !v.classList.contains("hidden")) {
    closeNoteView();
  }
});

fetch("http://localhost:3000/api/notebooks")
  .then((r) => r.json())
  .then((data) => {
    notebooks = data;

    notebooks.forEach((nb) => {
      const o = document.createElement("option");
      o.value = nb.id;
      o.textContent = nb.title;
      notebookDropdown.appendChild(o);
    });
  })
  .catch(() => {
    const reload = confirm(
      "Failed to load notebooks. Click OK to reload the page.",
    );
    if (reload) location.reload();
  });


function renderNotes() {
  notesList.innerHTML = "";

  const q = searchInput.value.trim().toLowerCase();
  let filtered = selectedNotebookId
    ? notes.filter((n) => n.notebookId === selectedNotebookId)
    : [...notes];

  // search filter
  if (q) {
    filtered = filtered.filter(
      (n) =>
        String(n.title || "").toLowerCase().includes(q) ||
        String(n.content || "").toLowerCase().includes(q)
    );
  }

  // tag filter (AND)
  if (!allMode && selectedTags.size > 0) {
    filtered = filtered.filter((n) =>
      [...selectedTags].every((t) => (Array.isArray(n.tags) ? n.tags : []).includes(t))
    );
  }

  if (filtered.length > 0) {
    const [type, order] = (currentSort || "date-desc").split("-");
    filtered = sortNotes(filtered, type, order);
  }

  if (filtered.length === 0) {
    if (q) {
      notesList.innerHTML = '<p class="no-results">Keine Ergebnisse gefunden</p>';
    } else if (selectedNotebookId) {
      notesList.innerHTML =
        '<p class="no-results">Noch keine Notizen in diesem Notizbuch</p>';
    } else {
      notesList.innerHTML = '<p class="no-results">Keine Notizen vorhanden</p>';
    }
    return;
  }

  filtered.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note-item";

    div.addEventListener("click", () => viewNoteContent(note));

    div.innerHTML = `
      <div class="note-header">
        <div>
          <strong data-testid="note-title">${highlightText(note.title || "", q)}</strong>
          <p class="note-date">${formatDate(note.updatedAt)}</p>
        </div>
        <div class="note-actions">
          <button class="edit-note">Edit</button>
          <button class="delete-note">Delete</button>
        </div>
      </div>

      <p data-testid="note-content">${highlightText(note.content || "", q)}</p>

      ${
        Array.isArray(note.tags) && note.tags.length
          ? `<p class="note-tags" data-testid="note-tags">${note.tags
              .map((t) => `#${escapeHtml(t)}`)
              .join(" ")}</p>`
          : ""
      }
      <div class="note-content">
       <p data-testid="note-content">${note.content}</p>
       <div class="version-wrapper"> 
          <p class="version-label">Versions: </p>
          <select class="note-version ${note.versions.length <= 0 ? "note-no-version" : ""}">
          ${showVersions(note.id)}
          </select>
      </div>
    `;

    // prevent bubbling when clicking buttons
    div.querySelector(".edit-note").addEventListener("click", (e) => {
      e.stopPropagation();
      openEdit(note);
      div.querySelector(".edit-note").onclick = () => openEdit(note);
      div.querySelector(".delete-note").onclick = () => deleteNote(note.id);

      const versionSelect = div.querySelector(".note-version");
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

    div.querySelector(".delete-note").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });

    notesList.appendChild(div);
  });
}


searchInput.addEventListener("input", () => {
  const hasSearch = !!searchInput.value.trim();

  if (!selectedNotebookId && !hasSearch) {
    notesSection.classList.add("hidden");
    return;
  }

  if (!selectedNotebookId && hasSearch) {
    notesSection.classList.remove("hidden");
    notebookName.textContent = "Suchergebnisse";
    addNoteInSection.style.display = "none";
  }

  if (selectedNotebookId && hasSearch) {
    addNoteInSection.style.display = "none";
  }

  if (selectedNotebookId && !hasSearch) {
    addNoteInSection.style.display = "block";
    const nb = notebooks.find((n) => n.id === selectedNotebookId);
    notebookName.textContent = nb?.title || "Notizbuch";
  }

  renderNotes();
});

notebookDropdown.addEventListener("change", () => {
  selectedNotebookId = notebookDropdown.value || null;

  if (!selectedNotebookId) {
    notesSection.classList.add("hidden");
    searchInput.value = "";
    addNoteInSection.style.display = "block";
    return;
  }

  const nb = notebooks.find((n) => n.id === selectedNotebookId);
  notebookName.textContent = nb?.title || "";
  notesSection.classList.remove("hidden");
  addNoteInSection.style.display = "block";

  renderTagDropdown();
  renderNotes();
});

function showVersions(noteId) {
  const noteToEdit = notes.find((note) => note.id == noteId);
  if (!noteToEdit || noteToEdit.versions.length <= 0) {
    return "";
  }

  return (
    `<option value="">Versions</option>` +
    noteToEdit.versions
      .map(
        (val) =>
          `<option class="version-option" value="${val.versionId}">Created At: ${new Date(val.updatedAt).toLocaleDateString()}</option>`,
      )
      .join("")
  );
}

addNoteInSection.onclick = () => {
  if (!selectedNotebookId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }
  editNoteId = null;
  noteForm.reset();
  modal.classList.remove("hidden");
};

cancelButton.onclick = () => modal.classList.add("hidden");


function openEdit(note) {
  editNoteId = note.id;
  titleInput.value = note.title || "";
  contentInput.value = note.content || "";
  tagsInput.value = Array.isArray(note.tags) ? note.tags.join(", ") : "";
  modal.classList.remove("hidden");
}

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

  if (!selectedNotebookId) {
    alert("Bitte wähle zuerst ein Notizbuch aus");
    return;
  }

  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (editNoteId) {
    const n = notes.find((x) => x.id === editNoteId);
    if (!n) return;

    n.title = titleInput.value;
    n.content = contentInput.value;
    n.tags = tags;
    n.updatedAt = Date.now();
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
      tags,
      updatedAt: Date.now(),
      versions: [],
    });
  }

  saveNotes();
  modal.classList.add("hidden");
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

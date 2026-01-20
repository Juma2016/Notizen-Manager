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
    if (e.target.tagName === "OPTION") {
      lastTagClickValue = e.target.value;
    }
  });

  tagFilter.addEventListener("change", () => {
    const allOpt = tagFilter.querySelector('option[value=""]');

    if (lastTagClickValue === "" && allOpt) {
      allMode = !allMode;
      selectedTags.clear();
      Array.from(tagFilter.options).forEach(
        (o) => (o.selected = allMode)
      );
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
    minute: "2-digit",
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

function highlightText(text, q) {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const r = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return safe.replace(r, "<mark>$1</mark>");
}


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
  });


function renderNotes() {
  notesList.innerHTML = "";

  const q = searchInput.value.trim().toLowerCase();
  let filtered = selectedNotebookId
    ? notes.filter((n) => n.notebookId === selectedNotebookId)
    : [...notes];

  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }

  if (!allMode && selectedTags.size > 0) {
    filtered = filtered.filter((n) =>
      [...selectedTags].every((t) => n.tags.includes(t))
    );
  }

  if (filtered.length > 0) {
    const [type, order] = currentSort.split("-");
    filtered = sortNotes(filtered, type, order);
  }

  if (filtered.length === 0) {
    notesList.innerHTML = `<p class="no-results">Keine Ergebnisse</p>`;
    return;
  }

  filtered.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note-item";

    div.innerHTML = `
      <div class="note-header">
        <div>
          <strong>${highlightText(note.title, q)}</strong>
          <p class="note-date">${formatDate(note.updatedAt)}</p>
        </div>
        <div class="note-actions">
          <button class="edit-note">Edit</button>
          <button class="delete-note">Delete</button>
        </div>
      </div>
      <p>${highlightText(note.content, q)}</p>
      ${
        note.tags.length
          ? `<p class="note-tags">${note.tags
              .map((t) => `#${escapeHtml(t)}`)
              .join(" ")}</p>`
          : ""
      }
    `;

    div.querySelector(".edit-note").onclick = () => openEdit(note);
    div.querySelector(".delete-note").onclick = () => deleteNote(note.id);

    notesList.appendChild(div);
  });
}


searchInput.addEventListener("input", () => {
  if (!selectedNotebookId && !searchInput.value) {
    notesSection.classList.add("hidden");
    return;
  }
  notesSection.classList.remove("hidden");
  renderNotes();
});

notebookDropdown.addEventListener("change", () => {
  selectedNotebookId = notebookDropdown.value || null;
  if (!selectedNotebookId) {
    notesSection.classList.add("hidden");
    return;
  }
  const nb = notebooks.find((n) => n.id === selectedNotebookId);
  notebookName.textContent = nb?.title || "";
  notesSection.classList.remove("hidden");
  renderTagDropdown();
  renderNotes();
});

addNoteInSection.onclick = () => {
  editNoteId = null;
  noteForm.reset();
  modal.classList.remove("hidden");
};

cancelButton.onclick = () => modal.classList.add("hidden");


function openEdit(note) {
  editNoteId = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  tagsInput.value = note.tags.join(", ");
  modal.classList.remove("hidden");
}

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (editNoteId) {
    const n = notes.find((x) => x.id === editNoteId);
    n.title = titleInput.value;
    n.content = contentInput.value;
    n.tags = tags;
    n.updatedAt = Date.now();
  } else {
    notes.push({
      id: Date.now().toString(),
      notebookId: selectedNotebookId,
      title: titleInput.value,
      content: contentInput.value,
      tags,
      updatedAt: Date.now(),
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

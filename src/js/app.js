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
const titleLimitMessage = document.getElementById("titleLimitMessage");

const LS_KEY = "notes";

let notebooks = [];
let notes = [];
let selectedNotebookId = null;
let editNoteId = null;
let currentSort = "date-desc";

const selectedTags = new Set();
let allMode = false;
let lastTagClickValue = null;

function safeParseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeNote(n) {
  const note = { ...n };
  note.id = String(note.id ?? Date.now());
  note.notebookId = String(note.notebookId ?? "");
  note.title = String(note.title ?? "");
  note.content = String(note.content ?? "");
  note.updatedAt = Number(note.updatedAt ?? Date.now());
  note.tags = Array.isArray(note.tags) ? note.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  note.versions = Array.isArray(note.versions) ? note.versions : [];
  note.versions = note.versions.map((v) => ({
    versionId: Number(v.versionId ?? 0),
    parentId: String(v.parentId ?? note.id),
    title: String(v.title ?? ""),
    content: String(v.content ?? ""),
    tags: Array.isArray(v.tags) ? v.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    updatedAt: Number(v.updatedAt ?? 0),
  }));
  return note;
}

function loadNotes() {
  const raw = localStorage.getItem(LS_KEY);
  const parsed = safeParseJson(raw, []);
  notes = Array.isArray(parsed) ? parsed.map(normalizeNote) : [];
}

function saveNotes() {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

function formatDate(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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

function sortNotes(notesArray, sortType, order) {
  const sorted = [...notesArray];
  sorted.sort((a, b) => {
    let cmp = 0;
    if (sortType === "title") {
      cmp = String(a.title || "").toLowerCase().localeCompare(String(b.title || "").toLowerCase());
    } else {
      cmp = Number(a.updatedAt || 0) - Number(b.updatedAt || 0);
    }
    return order === "desc" ? -cmp : cmp;
  });
  return sorted;
}

function getAllTags() {
  const set = new Set();
  notes.forEach((n) => {
    (Array.isArray(n.tags) ? n.tags : []).forEach((t) => {
      const clean = String(t).trim();
      if (clean) set.add(clean);
    });
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
    return;
  }

  Array.from(tagFilter.options).forEach((o) => {
    if (o.value) o.selected = selectedTags.has(o.value);
  });
}

function getFilteredNotes() {
  const q = (searchInput?.value || "").trim().toLowerCase();

  const base =
    q.length > 0
      ? [...notes]
      : selectedNotebookId
        ? notes.filter((n) => n.notebookId === selectedNotebookId)
        : [...notes];

  let filtered = base;

  if (q) {
    filtered = filtered.filter(
      (n) =>
        String(n.title || "").toLowerCase().includes(q) ||
        String(n.content || "").toLowerCase().includes(q),
    );
  }

  if (!allMode && selectedTags.size > 0) {
    filtered = filtered.filter((n) =>
      [...selectedTags].every((t) => (Array.isArray(n.tags) ? n.tags : []).includes(t)),
    );
  }

  if (filtered.length > 0) {
    const [type, order] = (currentSort || "date-desc").split("-");
    filtered = sortNotes(filtered, type, order);
  }

  return { filtered, q };
}

function viewNoteContent(note) {
  const titleElement = document.getElementById("viewNoteTitle");
  const contentElement = document.getElementById("viewNoteContent");
  const wrapper = document.getElementById("noteContentView");

  if (!titleElement || !contentElement || !wrapper) return;

  const maxLength = 60;
  const title = String(note.title || "");

  titleElement.textContent = title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  titleElement.title = title.length > maxLength ? title : "";
  contentElement.textContent = String(note.content || "");
  wrapper.classList.remove("hidden");
}

function closeNoteView() {
  document.getElementById("noteContentView")?.classList.add("hidden");
}

function closeModal() {
  if (titleLimitMessage) titleLimitMessage.classList.add("hidden");
  modal?.classList.add("hidden");
}

function openCreate() {
  editNoteId = null;
  noteForm?.reset();
  if (titleLimitMessage) titleLimitMessage.classList.add("hidden");
  modal?.classList.remove("hidden");
}

function openEdit(note) {
  editNoteId = String(note.parentId ?? note.id);
  titleInput.value = String(note.title || "");
  contentInput.value = String(note.content || "");
  tagsInput.value = Array.isArray(note.tags) ? note.tags.join(", ") : "";
  if (titleLimitMessage) {
    if (titleInput.value.length >= 50) titleLimitMessage.classList.remove("hidden");
    else titleLimitMessage.classList.add("hidden");
  }
  modal?.classList.remove("hidden");
}

function buildVersionSelect(note) {
  const wrapper = document.createElement("div");
  wrapper.className = "version-wrapper";

  const label = document.createElement("p");
  label.className = "version-label";
  label.textContent = "Versions:";
  wrapper.appendChild(label);

  const select = document.createElement("select");
  select.className = `note-version ${note.versions.length <= 0 ? "note-no-version" : ""}`;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Versions";
  select.appendChild(placeholder);

  note.versions
    .slice()
    .sort((a, b) => Number(b.versionId) - Number(a.versionId))
    .forEach((v) => {
      const opt = document.createElement("option");
      opt.className = "version-option";
      opt.value = String(v.versionId);
      opt.textContent = `Created At: ${formatDate(v.updatedAt)}`;
      select.appendChild(opt);
    });

  select.addEventListener("change", (e) => {
    const versionId = String(e.target.value || "");
    if (!versionId) return;
    const version = note.versions.find((v) => String(v.versionId) === versionId);
    if (version) openEdit(version);
    select.value = "";
  });

  wrapper.appendChild(select);
  return wrapper;
}

function renderNotes() {
  if (!notesList) return;

  notesList.innerHTML = "";
  const { filtered, q } = getFilteredNotes();

  if (filtered.length === 0) {
    if (q) notesList.innerHTML = '<p class="no-results">Keine Ergebnisse gefunden</p>';
    else if (selectedNotebookId) notesList.innerHTML = '<p class="no-results">Noch keine Notizen in diesem Notizbuch</p>';
    else notesList.innerHTML = '<p class="no-results">Keine Notizen vorhanden</p>';
    return;
  }

  filtered.forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-item";
    card.addEventListener("click", () => viewNoteContent(note));

    const header = document.createElement("div");
    header.className = "note-header";

    const left = document.createElement("div");

    const title = document.createElement("strong");
    title.setAttribute("data-testid", "note-title");
    title.innerHTML = highlightText(note.title || "", q);

    const date = document.createElement("p");
    date.className = "note-date";
    date.textContent = formatDate(note.updatedAt);

    left.appendChild(title);
    left.appendChild(date);

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-note";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEdit(note);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "delete-note";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    header.appendChild(left);
    header.appendChild(actions);

    const preview = document.createElement("p");
    preview.setAttribute("data-testid", "note-content");
    preview.innerHTML = highlightText(note.content || "", q);

    const bottomRow = document.createElement("div");
    bottomRow.className = "note-content";

    const tagsWrap = document.createElement("div");
    tagsWrap.style.display = "flex";
    tagsWrap.style.flexDirection = "column";
    tagsWrap.style.gap = "6px";

    if (Array.isArray(note.tags) && note.tags.length) {
      const tagLine = document.createElement("p");
      tagLine.className = "note-tags";
      tagLine.setAttribute("data-testid", "note-tags");
      tagLine.innerHTML = note.tags.map((t) => `#${escapeHtml(t)}`).join(" ");
      tagsWrap.appendChild(tagLine);
    }

    bottomRow.appendChild(tagsWrap);

    if (Array.isArray(note.versions) && note.versions.length > 0) {
      bottomRow.appendChild(buildVersionSelect(note));
    }

    card.appendChild(header);
    card.appendChild(preview);
    card.appendChild(bottomRow);

    notesList.appendChild(card);
  });
}

function deleteNote(id) {
  notes = notes.filter((n) => String(n.id) !== String(id));
  saveNotes();
  renderTagDropdown();
  renderNotes();
}

function syncNotesSectionVisibility() {
  const q = (searchInput?.value || "").trim();

  if (!selectedNotebookId && !q) {
    notesSection?.classList.add("hidden");
    return;
  }

  notesSection?.classList.remove("hidden");

  if (q) {
    notebookName.textContent = "Suchergebnisse";
    if (addNoteInSection) addNoteInSection.style.display = selectedNotebookId ? "none" : "none";
    return;
  }

  if (selectedNotebookId) {
    const nb = notebooks.find((n) => String(n.id) === String(selectedNotebookId));
    notebookName.textContent = nb?.title || "Notizbuch";
    if (addNoteInSection) addNoteInSection.style.display = "block";
  }
}

async function loadNotebooks() {
  const res = await fetch("http://localhost:3000/api/notebooks");
  if (!res.ok) throw new Error("Failed to load notebooks");
  const data = await res.json();
  notebooks = Array.isArray(data) ? data : [];
}

function fillNotebookDropdown() {
  if (!notebookDropdown) return;

  notebookDropdown.innerHTML = '<option value="">Select a notebook...</option>';
  notebooks.forEach((nb) => {
    const option = document.createElement("option");
    option.value = nb.id;
    option.textContent = nb.title;
    notebookDropdown.appendChild(option);
  });
}

function initEvents() {
  if (sortSelect) {
    sortSelect.value = currentSort;
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value || "date-desc";
      renderNotes();
    });
  }

  if (tagFilter) {
    tagFilter.addEventListener("mousedown", (e) => {
      if (e.target && e.target.tagName === "OPTION") lastTagClickValue = e.target.value;
    });

    tagFilter.addEventListener("change", () => {
      const allOpt = tagFilter.querySelector('option[value=""]');

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

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      syncNotesSectionVisibility();
      renderNotes();
    });
  }

  if (notebookDropdown) {
    notebookDropdown.addEventListener("change", () => {
      selectedNotebookId = notebookDropdown.value || null;

      if (!selectedNotebookId) {
        if (searchInput) searchInput.value = "";
        if (addNoteInSection) addNoteInSection.style.display = "block";
        notesSection?.classList.add("hidden");
        selectedTags.clear();
        allMode = false;
        renderTagDropdown();
        renderNotes();
        return;
      }

      renderTagDropdown();
      syncNotesSectionVisibility();
      renderNotes();
    });
  }

  if (addNoteInSection) {
    addNoteInSection.addEventListener("click", () => {
      if (!selectedNotebookId) {
        alert("Bitte wähle zuerst ein Notizbuch aus");
        return;
      }
      openCreate();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => closeModal());
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
    if (e.key === "Escape" && v && !v.classList.contains("hidden")) closeNoteView();
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) closeModal();
  });

  if (titleInput) {
    titleInput.addEventListener("input", () => {
      if (!titleLimitMessage) return;
      if (titleInput.value.length >= 50) titleLimitMessage.classList.remove("hidden");
      else titleLimitMessage.classList.add("hidden");
    });

    titleInput.addEventListener("paste", () => {
      setTimeout(() => {
        if (!titleLimitMessage) return;
        if (titleInput.value.length >= 50) titleLimitMessage.classList.remove("hidden");
        else titleLimitMessage.classList.add("hidden");
      }, 0);
    });
  }

  if (noteForm) {
    noteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!titleInput.value.trim() || !contentInput.value.trim()) return;
      if (!selectedNotebookId) {
        alert("Bitte wähle zuerst ein Notizbuch aus");
        return;
      }

      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (editNoteId) {
        const existing = notes.find((x) => String(x.id) === String(editNoteId));
        if (!existing) return;

        const snapshot = {
          versionId: (existing.versions?.length || 0) + 1,
          parentId: existing.id,
          title: existing.title,
          content: existing.content,
          tags: existing.tags,
          updatedAt: existing.updatedAt,
        };

        existing.versions = Array.isArray(existing.versions) ? existing.versions : [];
        existing.versions.push(snapshot);

        existing.title = titleInput.value.trim();
        existing.content = contentInput.value;
        existing.tags = tags;
        existing.updatedAt = Date.now();
      } else {
        notes.push(
          normalizeNote({
            id: Date.now().toString(),
            notebookId: selectedNotebookId,
            title: titleInput.value.trim(),
            content: contentInput.value,
            tags,
            updatedAt: Date.now(),
            versions: [],
          }),
        );
      }

      saveNotes();
      closeModal();
      renderTagDropdown();
      renderNotes();
    });
  }
}

async function init() {
  loadNotes();
  initEvents();
  try {
    await loadNotebooks();
    fillNotebookDropdown();
  } catch {
    const reload = confirm("Failed to load notebooks. Click OK to reload the page.");
    if (reload) location.reload();
  }
}

init();

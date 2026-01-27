# Notes-Manager

A simple and modern notes management web application built with HTML, CSS and JavaScript. Manage your notes across different notebooks with an intuitive interface.

## Projektstruktur
```
NOTIZEN-MANAGER/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── backend/
│   ├── notebooks.js
│   └── notebooks.json
├── resources/
│   └── note.png
├── src/
│   └── js/
│       └── app.js
├── tests/
│   ├── createNotes.js
│   ├── filterobjects.js
│   ├── notebook.spec.js
│   └── tagObjects.js
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.js
├── README.md
└── style.css
```

## Tech Stack

| Tool | Purpose |
|------|----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js with Express (for notebooks API) |
| **Testing** | Playwright for end-to-end testing |
| **Storage** | localStorage for client-side persistence |

## Setup & Start

1. **Clone the repository:**
```bash
git clone https://github.com/Juma2016/Notizen-Manager
cd Notizen-Manager
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the backend server** (required for notebooks data):
```bash
npm run dev
```

4. **Open `index.html`** in your browser, use a local server or open `http://127.0.0.1:5500/index.html` 

## Features

### Sprint 1 Features
- **Notebook Selection:** Dropdown to select from available notebooks fetched from backend API
- **Note Management:** Create, edit, and delete personal notes
- **Real-time Search:** Filter notes by title or content with instant results
- **Persistent Storage:** Notes are saved in browser's localStorage

### Sprint 2 Features
- **Tags:** Add one or more tags to a note
- **Filter by tags:** Filter notes by selecting one or more specific tags
- **Sorting:** Sort notes by date or title (ascending or descending)
- **Versioning:** View previous versions of a note and save any version as new
- **Text Highlighting:** Highlight matching text when searching

## Testing

### Playwright Tests
**Run all tests:**
```bash
npm test
```

### Test Descriptions
- **Page Load:** Verifies application loads correctly by checking page title
- **Notebooks Load:** Tests backend API endpoint for notebook data
- **Create Note Persistence:** Tests note creation and persistence after reload
- **Edit → Content Updates:** Tests if edited text is saved persistently
- **Edit Updates Timestamp:** Verifies timestamp updates when editing notes
- **Search Functionality:** Tests search filtering across notebooks
- **Title Sorting:** Tests alphabetical sorting by title (ascending/descending)
- **Multi-Tag Filtering:** Tests filtering by single and multiple tags

## Reflection & Future Outlook

### Challenges & Learnings

<table border="1" cellpadding="8" cellspacing="0">
  <thead>
    <tr>
      <th>Member</th>
      <th>Reflection</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><em>Linda Kadyrova</em></td>
      <td>
        <strong>Early Challenges:</strong>
        <ul>
          <li>Initial difficulty understanding team GitHub workflow and communication practices</li>
          <li>Time-consuming familiarization with existing codebase and teammates' approaches</li>
          <li>Significant time spent resolving Git merge conflicts during parallel development</li>
        </ul>
        <strong>Team Coordination:</strong>
        <ul>
          <li>Communication gaps led to misunderstandings about feature specifications</li>
          <li>Challenges balancing workload and synchronizing parallel feature development</li>
        </ul>
        <strong>Key Learnings:</strong>
        <ul>
          <li>Critical importance of clear, proactive communication for team collaboration</li>
          <li>Value of frequent, smaller commits to avoid complex merge conflicts</li>
          <li>Essential role of thorough inline documentation for cross-team understanding</li>
        </ul>
      </td>
    </tr>
  <!-- Member 2 -->
<tr>
  <td><em>Maryam Taeid</em></td>
  <td>
    <strong>Early Challenges:</strong>
    <ul>
      <li>Implementing the tags/filter feature without breaking existing note rendering logic</li>
      <li>Dealing with unexpected UI behavior (e.g., tag selection getting stuck on “All tags”)</li>
      <li>Keeping HTML/CSS structure consistent while removing/adjusting parts of the UI</li>
    </ul>
    <strong>Team Coordination:</strong>
    <ul>
      <li>Synchronizing UI changes with teammates, JavaScript logic to avoid integration issues</li>
      <li>Aligning feature expectations (what exactly should be filtered/sorted and where it appears)</li>
      <li>Ensuring updates don’t conflict with automated tests and existing workflows</li>
    </ul>
    <strong>Key Learnings:</strong>
    <ul>
      <li>Small, incremental changes with quick testing reduce debugging time</li>
      <li>Clear ownership of files/features helps prevent overlap and merge conflicts</li>
      <li>UI changes should be validated against expected behavior and test cases early</li>
    </ul>
  </td>
</tr>
    <!-- Member 3 -->
    <tr>
      <td><em>Mario Shenouda</em></td>
      <td>
        <ul>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </td>
    </tr>
    <!-- Member 4 -->
    <tr>
      <td><em>Casper Zielinski</em></td>
      <td>
        <ul>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

### Identified Issues & Technical Debt

**What is unsatisfactory?**
- UI overloaded with filter functions, tag filtering, and multiple buttons
- Components could be better separated and organized

**What would we do differently?**
- Consider omitting versioning or storing it separately
- Streamline filtering interface to reduce complexity
- Implement better component separation and state management

**What is still completely missing?**
- **Backend Dependency**: Requires local backend server running for notebooks data
- **No Authentication**: All notes are stored locally in browser (no user accounts)
- **Image Support**: Currently text-only, no image upload capability
- **Export/Import**: No feature to export or import notes as files
- **No Rich Text**: Plain text formatting only (no bold, italics, etc.)
- **Trash/Archive:** Recover deleted notes instead of permanent deletion

**Reasons for not implementing:**
- Implementation was restricted by available time resources
- Prioritized core features over advanced functionality

## Authors

- [Linda Kadyrova](https://github.com/lindakadyrova)
- [Casper Zielinski](https://github.com/casper-zielinski)
- [Mario Shenouda](https://github.com/Juma2016)
- [Maryam Taeid](https://github.com/maryamtaeid)


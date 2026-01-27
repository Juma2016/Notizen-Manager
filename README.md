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

- **Notebook Selection**: Dropdown to select from available notebooks fetched from backend API
- **Note Management**: Create, edit, and delete personal notes
- **Real-time Search**: Filter notes by title or content with instant results
- **Persistent Storage**: Notes are saved in browser's localStorage

## Sprint 2 Features

- **Tags:** The user can add one or more tags to a note.  
- **Filter by tags:** The user can filter notes by selecting one or more specific tags.  
- **Sorting:** Notes can be sorted by date or title, in ascending or descending order.
- **Versioning:** The user can view previous versions of a note and save any version as a new note.
- **Text highlighting:** When searching, the matching text is highlighted in the results.

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

## Tests description

- **Page Load**: Verifies that the application loads correctly by checking the page title contains "Notes Manager"\
- **Notebooks Load**: Tests the backend API endpoint to ensure all notebooks are properly fetched and returned\
- **Create Note Persistence**: Tests the complete flow of creating a new note, verifying it appears in the list, and persists after page reload\
- **Edit > Content Updates**: Tests if the edited text is saved persistently\
- **Edit Updates Timestamp**: Verifies that editing a note updates both the content and the last modified timestamp\
- **Search Functionality**: Tests the search feature with various keywords to ensure it correctly filters notes across different notebooks\
- **Title Sorting**: Verifies that sorting notes alphabetically by title works correctly in both ascending and descending order\
- **Multi-Tag Filtering**: Tests the tag filtering functionality, including filtering by single and multiple tags across different notes.

## Known Limitations / Open Points

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

## Reflexion

### Linda Kadyrova
**Early Challenges:** The project started slowly due to initial difficulty in understanding the team's established GitHub workflow and communication practices. Familiarizing myself with the existing codebase and my teammates' implementation approaches took considerable time and delayed early progress. During parallel feature development, I also encountered some Git merge conflicts that required significant time to resolve properly.

**Team Coordination:** In the beginning occasional communication gaps within the team led to misunderstandings regarding feature specifications. Balancing the workload and synchronizing progress across parallel tasks proved to be a recurring challenge.

**Key Learnings:** Through this process, I learned the critical importance of clear and proactive communication for smooth team collaboration. I now recognize the value of committing smaller changes more frequently to avoid large, complex merge conflicts. Most importantly, this project underscored that thorough inline code comments and documentation are essential for effective cross-team understanding and efficient onboarding.

## Authors

- [Linda Kadyrova](https://github.com/lindakadyrova)
- [Casper Zielinski](https://github.com/casper-zielinski)
- [Mario Shenouda](https://github.com/Juma2016)
- [Maryam Taeid](https://github.com/maryamtaeid)




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
│   |── notebooks.json
├── src/
│   └── js/
│       └── app.js
├── tests/
│   ├── createNotes.js
│   ├── filterobjects.js
│   |── notebook.spec.js
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.js
├── README.md
|── style.css

```

## Tech Stack

| Tool | Purpose |
|------|----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js with Express (for notebooks API) |
| **Testing**| Playwright for end-to-end testing |
| **Storage**| localStorage for client-side persistence |
| **Testing** | Playwright for end-to-end testing |

## Setup & Start

1. Clone the repository:
```bash
git clone https://github.com/Juma2016/Notizen-Manager
cd Notizen-Manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server (required for notebooks data):
```bash
npm run dev
```

4. Open `index.html` in your browser or use a local server:

5. Access the application at `http://127.0.0.1:5500/index.html` or you choose one from the terminal 

## Sprint-1 Features

- **Notebook Selection**: Dropdown to select from available notebooks fetched from backend API
- **Note Management**: Create, edit, and delete personal notes
- **Real-time Search**: Filter notes by title or content with instant results
- **Persistent Storage**: Notes are saved in browser's localStorage

## Sprint-1 Features

- **Tags:** The user can add one or more tags to a note.  
- **Filter by tags:** The user can filter notes by selecting one or more specific tags.  
- **Sorting:** Notes can be sorted by date or title, in ascending or descending order.
- **Versioning:** The user can view previous versions of a note and save any version as a new note.
- **Text highlighting:** When searching, the matching text is highlighted in the results.

# Playwright tests

Run all playwrights tests
 ```
npm test
```

Generate test report
```
npx playwright show-report
```

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

- **Backend Dependency**: Requires local backend server running for notebooks data
- **No Authentication**: All notes are stored locally in browser (no user accounts)
- **No Sync**: Notes don't sync between devices or browsers
- **Image Support**: Currently text-only, no image upload capability
- **Export/Import**: No feature to export or import notes as files
- **No Rich Text**: Plain text formatting only (no bold, italics, etc.)

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


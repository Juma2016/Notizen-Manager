# Notes-Manager

A simple and modern notes management web application built with HTML, CSS and JavaScript. Manage your notes across different notebooks with an intuitive interface.

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
```bash
# Using Node.js with http-server
npx http-server
```

5. Access the application at `http://127.0.0.1:5500/index.html` or you choose one from the terminal 

## Sprint-1 Features

- **Notebook Selection**: Dropdown to select from available notebooks fetched from backend API
- **Note Management**: Create, edit, and delete personal notes
- **Real-time Search**: Filter notes by title or content with instant results
- **Persistent Storage**: Notes are saved in browser's localStorage
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Modern dark theme with gradient accents
- **Form Validation**: Required fields for note creation/editing
- **Date Formatting**: German locale timestamps (DD.MM.YYYY HH:mm:ss)
- **Line Break Support**: Preserves formatting with ellipsis truncation
- **Error Handling**: User feedback for failed backend requests
- **Empty States**: Clear messages when no notes/notebooks exist
- **Modal Interface**: Clean popup forms for note creation/editing

## Running Playwright Tests

To run the Playwright end-to-end tests:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npx test

# Generate test report
npx playwright show-report
```

## Known Limitations / Open Points

- **Backend Dependency**: Requires local backend server running for notebooks data
- **No Authentication**: All notes are stored locally in browser (no user accounts)
- **No Sync**: Notes don't sync between devices or browsers
- **Image Support**: Currently text-only, no image upload capability
- **No Categories/Tags**: Notes can only be organized by notebooks
- **Export/Import**: No feature to export or import notes as files
- **No Rich Text**: Plain text formatting only (no bold, italics, etc.)

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express (for notebooks API)
- **Testing**: Playwright for end-to-end testing
- **Storage**: localStorage for client-side persistence
- **Styling**: Custom CSS with modern design system

## Authors

- [Linda Kadyrova](https://github.com/lindakadyrova)
- [Casper Zielinski](https://github.com/casper-zielinski) 
- [Mario Shenouda](https://github.com/Juma2016)
- [Maryam Taeid](https://github.com/maryamtaeid)
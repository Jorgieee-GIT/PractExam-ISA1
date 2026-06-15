# Legislative Document Archiving Module

## Applicant Information
**Name:** Jorge Jose Abenojar

**Position Applied For:** Information Systems Analyst

**Submission Date:** June 15, 2026

---

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS | Styling, layout (Flexbox/Grid), responsive design |
| JavaScript  | All application logic, DOM manipulation, localStorage |

---

## How to Run the Application

### Option 1: Access the Live Application

1. Open any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).

2. Navigate to the following URL:

```text
https://moonvale-smp.s3.ap-southeast-1.amazonaws.com/Legislative+Tracking+and+Monitoring+Unit_Abenojar%2C+Jorge+Jose/index.html
```

3. The application will load automatically.

4. Click **Add Document** to create a new legislative record.

5. All records are automatically saved using the browser's localStorage.

---

### Option 2: Run from the GitHub Repository

1. Open the GitHub repository:

```text
https://github.com/Jorgieee-GIT/PractExam-ISA1
```

2. Click the **Code** button.

3. Select **Download ZIP**.

4. Extract the downloaded ZIP file to any location on your computer.

5. Open the extracted project folder.

6. Locate the file:

```text
index.html
```

7. Double-click `index.html` or open it using any modern web browser.

8. The application will launch immediately.

9. No installation, database server, internet connection, or additional software is required.

---

## Implemented Features

### CRUD
- **Create** — Add new Ordinance or Resolution records via a modal form
- **Read** — View all records in a sortable table; view full details in a modal
- **Update** — Edit any existing record via a pre-filled modal form
- **Delete** — Delete records with a confirmation dialog before execution

### Document Number Auto-Increment
- When adding a new document, selecting the document type automatically generates the next sequential document number (e.g., `0003-2026`) based on existing records of that type.
- The generated number is editable in case manual override is needed.
- Numbering is tracked **separately per document type** (Ordinances and Resolutions each have their own sequence).

### Search & Filter
- **Search** by document number or title
- **Filter** by document type (All / Ordinance / Resolution)

### Validation
- All fields are required before saving
- Document number must follow the format `0001-2026`
- Duplicate document numbers under the same document type are rejected
- Inline error messages highlight the specific invalid field(s)

### Data Persistence
- All records are stored in `localStorage` under the key `legDocs_v1`
- Data is automatically saved after every Create, Update, and Delete operation
- Data survives page refresh, browser close, and reopen (same browser/computer)
- Corrupted or missing localStorage data is handled gracefully

### User Experience
- Stats bar showing total records, ordinance count, and resolution count
- Color-coded badges for document types
- Toast notifications for successful add, edit, and delete operations
- Table sorted by date
- Escape key and backdrop click close any open modal
- Fully responsive layout for desktop and mobile screens

---

## Known Limitations

1. **Single-browser only** — Data stored in `localStorage` is tied to one browser on one device. Records cannot be shared across devices or browsers without an export/import feature.
2. **No export** — There is no built-in PDF or Excel export in this version.
3. **No user authentication** — The module is designed for single-user local use per the exam specifications.

---

## Submission
Submitted to: sangguniangpanlalawiganlaunion@gmail.com
Deadline: June 15, 2026, 5:00 PM

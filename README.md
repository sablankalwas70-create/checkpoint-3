# School Attendance System

A simple browser-based attendance tracker with a **Student Early Warning System**. Teachers can add students, record daily attendance, and instantly see which students have fallen below the attendance threshold.

Built with plain HTML, CSS and vanilla JavaScript (no frameworks, no build step).

## Features

- **Student management**: add students with an ID, name, email and class
- **Attendance recording**: mark a student Present or Absent for a given date
- **Attendance percentage**: calculated automatically for each student
- **Early warnings**: students below the threshold (default **75%**) are flagged in the table and in a dedicated Warnings section
- **Input validation**: regular-expression checks on IDs, names, emails, classes and dates, with friendly error messages
- **Duplicate protection**: unique student IDs, and no double-recording for the same student on the same date
- **No future dates**: attendance can't be recorded for a date that hasn't happened yet
- **Persistent data**: everything is saved as JSON in the browser's `localStorage`, so data survives a page refresh

## Getting Started

No installation needed.

1. Clone the repository:
   ```bash
   git clone https://github.com/sablankalwas70-create/checkpoint-3.git
   ```
2. Open the `ATTENDANCE SYSTEME` folder.
3. Double-click `index (2).html` to open it in your browser.

## How to Use

1. **Add a student**: fill in the Student Management form and click *Add Student*.
2. **Record attendance**: choose a student, pick a date, select *Present* or *Absent*, then click *Record Attendance*.
3. **Check warnings**: students whose attendance drops below 75% appear under *Early Warnings*.

A student with no records yet shows **No Data** instead of being flagged.

## Project Structure

```
ATTENDANCE SYSTEME/
├── index (2).html      # Page layout (students, attendance, warnings)
├── style.css           # Styling
├── app (1).js          # Entry point, starts the controller
├── controller (1).js   # AttendanceController: handles forms and updates the page
├── model (1).js        # Classes: Person, Student, Teacher, Administrator,
│                       #          ClassRoom, AttendanceRecord, Alert
├── service (1).js      # AttendanceManager (singleton) and warning threshold
├── validator.js        # Regex-based input validation
├── storage.js          # StorageService: save/load JSON via localStorage
└── tests.html          # In-browser unit tests
```

## Concepts Demonstrated

- **Object-oriented programming**: classes, inheritance (`Student`, `Teacher` and `Administrator` extend `Person`), private fields (`#attendanceRecords`), getters and setters
- **Singleton pattern**: `AttendanceManager`
- **JSON serialization**: custom `toJSON()` and `fromJSON()` methods
- **Regular expressions** for validation
- **Error handling**: storage and validation failures show messages instead of crashing
- **Security basics**: user input is escaped before being rendered as HTML

## Running the Tests

Open `tests.html` in your browser. Each test shows a green **PASS** or red **FAIL** with a summary at the top.

> **Note:** `tests.html` loads `model.js` and `service.js`, while the app files are named `model (1).js` and `service (1).js`. Rename the files (or update the `<script>` tags) so the names match.

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES2022)

## License

This project is open source. Add a license of your choice (for example, MIT) before publishing.

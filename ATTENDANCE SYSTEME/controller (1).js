class AttendanceController {

    constructor() {

        // Store students
        this.students = [];

        // Connect to AttendanceManager (singleton)
        this.attendanceManager = new AttendanceManager();

        // Get HTML elements
        this.studentForm = document.getElementById("studentForm");
        this.attendanceForm = document.getElementById("attendanceForm");
        this.studentList = document.getElementById("studentList");
        this.attendanceStudent = document.getElementById("attendanceStudent");
        this.warningList = document.getElementById("warningList");

        // Load saved students from JSON storage
        this.students = StorageService.load();

        if (StorageService.lastError) {
            alert(StorageService.lastError);
        }

        // Rebuild the manager's record list from the loaded students
        this.students.forEach(student =>
            student.attendanceRecords.forEach(
                record => this.attendanceManager.addRecord(record)
            )
        );

        // Start events and draw the page
        this.setupEvents();
        this.refreshView();
    }

    /**
     * Save all students to storage; warn the user if saving fails.
     */
    persist() {

        const result = StorageService.save(this.students);

        if (!result.ok) {
            alert(result.message);
        }
    }


    // ===============================
    // Helpers
    // ===============================

    // Prevent HTML injection from user-typed values
    escapeHTML(value) {

        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    }

    statusClass(status) {

        if (status === "Warning") return "status-warning";
        if (status === "Good") return "status-good";
        return "status-nodata";
    }


    // ===============================
    // Event Listeners
    // ===============================

    setupEvents() {

        this.studentForm.addEventListener(
            "submit",
            (event) => this.addStudent(event)
        );

        this.attendanceForm.addEventListener(
            "submit",
            (event) => this.recordAttendance(event)
        );
    }


    // ===============================
    // Add Student
    // ===============================

    addStudent(event) {

        event.preventDefault();

        const studentID =
            document.getElementById("studentID").value.trim();

        const studentName =
            document.getElementById("studentName").value.trim();

        const studentEmail =
            document.getElementById("studentEmail").value.trim();

        const classID =
            document.getElementById("classID").value.trim();


        // Validate with regular expressions; show every problem at once
        const check = Validator.validateStudent({
            studentID, name: studentName, email: studentEmail, classID
        });

        if (!check.valid) {
            alert(check.errors.join("\n"));
            return;
        }

        // Student IDs must be unique
        if (this.students.some(s => s.studentID === studentID)) {

            alert("A student with this ID already exists.");
            return;
        }


        // Create Student object
        const student = new Student(
            studentID,
            studentName,
            studentEmail,
            classID
        );


        // Store student
        this.students.push(student);
        this.persist();


        // Update page
        this.refreshView();


        // Clear form
        this.studentForm.reset();

        alert("Student added successfully!");
    }


    // ===============================
    // Display Students
    // ===============================

    displayStudents() {

        this.studentList.innerHTML = "";

        const threshold = this.attendanceManager.warningThreshold;

        this.students.forEach(student => {

            const row = document.createElement("tr");

            const percentage = student.calculateAttendancePercentage();
            const warning = student.getWarningStatus(threshold);

            row.innerHTML = `
                <td>${this.escapeHTML(student.studentID)}</td>
                <td>${this.escapeHTML(student.name)}</td>
                <td>${this.escapeHTML(student.email)}</td>
                <td>${this.escapeHTML(student.classID)}</td>
                <td>${percentage.toFixed(1)}%</td>
                <td class="${this.statusClass(warning)}">${warning}</td>
            `;

            this.studentList.appendChild(row);
        });
    }


    // ===============================
    // Display Warnings
    // ===============================

    displayWarnings() {

        this.warningList.innerHTML = "";

        const threshold = this.attendanceManager.warningThreshold;

        const flagged = this.students.filter(
            student => student.getWarningStatus(threshold) === "Warning"
        );

        if (flagged.length === 0) {

            this.warningList.innerHTML =
                '<p class="no-warnings">No warnings.</p>';
            return;
        }

        flagged.forEach(student => {

            const percentage = student.calculateAttendancePercentage();
            const absences = student.getAbsenceHistory().length;

            const alertObj = new Alert(
                "AL" + student.studentID,
                student.studentID,
                `${student.name} (${student.studentID}) has ` +
                `${percentage.toFixed(1)}% attendance ` +
                `with ${absences} absence(s).`,
                "Warning"
            );

            const div = document.createElement("div");
            div.className = "warning";

            const p = document.createElement("p");
            p.textContent = alertObj.displayAlert();

            div.appendChild(p);
            this.warningList.appendChild(div);
        });
    }


    // ===============================
    // Update Student Dropdown
    // ===============================

    updateStudentDropdown() {

        // Keep current selection if possible
        const current = this.attendanceStudent.value;

        this.attendanceStudent.innerHTML =
            '<option value="">Select Student</option>';

        this.students.forEach(student => {

            const option = document.createElement("option");

            option.value = student.studentID;
            option.textContent = `${student.studentID} - ${student.name}`;

            this.attendanceStudent.appendChild(option);
        });

        this.attendanceStudent.value = current;
    }


    // ===============================
    // Refresh everything on the page
    // ===============================

    refreshView() {

        this.displayStudents();
        this.updateStudentDropdown();
        this.displayWarnings();
    }


    // ===============================
    // Record Attendance
    // ===============================

    recordAttendance(event) {

        event.preventDefault();

        const studentID = this.attendanceStudent.value;

        const date = document.getElementById("date").value;

        const selected =
            document.querySelector('input[name="status"]:checked');


        // Validate input
        if (!studentID) {
            alert("Please select a student.");
            return;
        }

        if (!date) {
            alert("Please choose a date.");
            return;
        }

        if (!selected) {
            alert("Please choose Present or Absent.");
            return;
        }

        const status = selected.value;

        // Validate the date (format, real date, not in the future)
        const dateCheck = Validator.validateDate(date);

        if (!dateCheck.valid) {
            alert(dateCheck.errors.join("\n"));
            return;
        }


        // Find student
        const student = this.students.find(
            s => s.studentID === studentID
        );

        if (!student) {
            alert("Please select a student.");
            return;
        }


        // Don't allow two records for the same student and date
        if (student.hasRecordForDate(date)) {

            alert("Attendance for this student on this date is already recorded.");
            return;
        }


        // Create attendance record
        const recordID = "AR" + Date.now();

        const record = new AttendanceRecord(
            recordID,
            studentID,
            student.classID,
            date,
            status
        );


        // Add record to student and manager
        student.addAttendance(record);
        this.attendanceManager.addRecord(record);
        this.persist();


        // Calculate percentage
        const percentage = student.calculateAttendancePercentage();


        // Clear form
        this.attendanceForm.reset();


        // Refresh page first, then show message
        this.refreshView();


        if (percentage < this.attendanceManager.warningThreshold) {

            alert(
                `Attendance recorded!\n\n` +
                `Attendance: ${percentage.toFixed(1)}%\n` +
                `WARNING: Student has low attendance.`
            );

        } else {

            alert(
                `Attendance recorded!\n\n` +
                `Attendance: ${percentage.toFixed(1)}%`
            );
        }
    }
}

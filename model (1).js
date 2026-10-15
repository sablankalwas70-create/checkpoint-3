// ===============================
// Person Class
// ===============================

class Person {

    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    getDetails() {
        return `${this.id} - ${this.name} - ${this.email}`;
    }
}


// ===============================
// Student Class
// ===============================

class Student extends Person {

    // Private field
    #attendanceRecords = [];

    constructor(studentID, name, email, classID) {

        // Inheritance
        super(studentID, name, email);

        this.studentID = studentID;
        this.classID = classID;
    }

    addAttendance(record) {
        this.#attendanceRecords.push(record);
    }

    calculateAttendancePercentage() {

        if (this.#attendanceRecords.length === 0) {
            return 0;
        }

        const present = this.#attendanceRecords.filter(
            record => record.getStatus() === "Present"
        ).length;

        return (present / this.#attendanceRecords.length) * 100;
    }

    getAbsenceHistory() {

        return this.#attendanceRecords.filter(
            record => record.getStatus() === "Absent"
        );
    }

    getWarningStatus(threshold = 75) {

        // No records yet: don't flag a brand new student
        if (this.#attendanceRecords.length === 0) {
            return "No Data";
        }

        const percentage =
            this.calculateAttendancePercentage();

        if (percentage < threshold) {
            return "Warning";
        }

        return "Good";
    }

    hasRecordForDate(date) {

        return this.#attendanceRecords.some(
            record => record.date === date
        );
    }

    /**
     * Called automatically by JSON.stringify().
     * Needed because #attendanceRecords is private and would otherwise be skipped.
     * @returns {object} plain object safe to serialise
     */
    toJSON() {
        return {
            studentID: this.studentID,
            name: this.name,
            email: this.email,
            classID: this.classID,
            attendanceRecords: this.#attendanceRecords.map(r => r.toJSON())
        };
    }

    /**
     * Rebuild a Student (and its records) from parsed JSON.
     * @param {object} data - result of JSON.parse
     * @returns {Student}
     * @throws {Error} if the data is malformed
     */
    static fromJSON(data) {

        if (!data || typeof data !== "object" || !data.studentID) {
            throw new Error("Invalid student data.");
        }

        const student = new Student(
            data.studentID, data.name, data.email, data.classID
        );

        (data.attendanceRecords || []).forEach(r =>
            student.addAttendance(AttendanceRecord.fromJSON(r))
        );

        return student;
    }

    // Getter
    get attendanceRecords() {
        return this.#attendanceRecords;
    }
}


// ===============================
// Teacher Class
// ===============================

class Teacher extends Person {

    constructor(teacherID, name, email, subject) {

        super(teacherID, name, email);

        this.teacherID = teacherID;
        this.subject = subject;
        this.classes = [];
    }

    recordAttendance(student, record) {
        student.addAttendance(record);
    }

    viewClass() {
        return this.classes;
    }

    getStudentAttendance(student) {
        return student.attendanceRecords;
    }
}


// ===============================
// Administrator Class
// ===============================

class Administrator extends Person {

    constructor(adminID, name, email, role) {

        super(adminID, name, email);

        this.adminID = adminID;
        this.role = role;
    }

    addStudent(student, studentList) {
        studentList.push(student);
    }

    removeStudent(studentID, studentList) {

        const index = studentList.findIndex(
            student => student.studentID === studentID
        );

        if (index !== -1) {
            studentList.splice(index, 1);
        }
    }

    updateStudent(
        studentID,
        studentList,
        newName,
        newEmail
    ) {

        const student = studentList.find(
            student => student.studentID === studentID
        );

        if (student) {

            student.name = newName;
            student.email = newEmail;

        }
    }
}


// ===============================
// ClassRoom Class
// ===============================

class ClassRoom {

    constructor(
        classID,
        className,
        subject,
        teacher
    ) {

        this.classID = classID;
        this.className = className;
        this.subject = subject;
        this.teacher = teacher;
        this.students = [];
    }

    addStudent(student) {
        this.students.push(student);
    }

    removeStudent(studentID) {

        this.students = this.students.filter(
            student =>
                student.studentID !== studentID
        );
    }

    getStudents() {
        return this.students;
    }

    getClassAttendance() {

        if (this.students.length === 0) {
            return 0;
        }

        let total = 0;

        this.students.forEach(student => {

            total +=
                student.calculateAttendancePercentage();

        });

        return total / this.students.length;
    }
}


// ===============================
// AttendanceRecord Class
// ===============================

class AttendanceRecord {

    constructor(
        recordID,
        studentID,
        classID,
        date,
        status
    ) {

        this.recordID = recordID;
        this.studentID = studentID;
        this.classID = classID;
        this.date = date;
        this.status = status;
    }

    markPresent() {
        this.status = "Present";
    }

    markAbsent() {
        this.status = "Absent";
    }

    getStatus() {
        return this.status;
    }

    /** @returns {object} plain object for JSON.stringify() */
    toJSON() {
        return {
            recordID: this.recordID,
            studentID: this.studentID,
            classID: this.classID,
            date: this.date,
            status: this.status
        };
    }

    /**
     * Rebuild a record from parsed JSON.
     * @param {object} data
     * @returns {AttendanceRecord}
     * @throws {Error} if the data is malformed
     */
    static fromJSON(data) {

        if (
            !data ||
            !["Present", "Absent"].includes(data.status) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
        ) {
            throw new Error("Invalid attendance record.");
        }

        return new AttendanceRecord(
            data.recordID, data.studentID, data.classID, data.date, data.status
        );
    }
}


// ===============================
// Alert Class
// ===============================

class Alert {

    constructor(
        alertID,
        studentID,
        message,
        severity
    ) {

        this.alertID = alertID;
        this.studentID = studentID;
        this.message = message;
        this.date =
            new Date().toLocaleDateString();
        this.severity = severity;
    }

    createAlert() {

        return {
            studentID: this.studentID,
            message: this.message,
            severity: this.severity,
            date: this.date
        };
    }

    displayAlert() {
        return `${this.severity}: ${this.message}`;
    }

    dismissAlert() {
        return "Alert dismissed";
    }
}
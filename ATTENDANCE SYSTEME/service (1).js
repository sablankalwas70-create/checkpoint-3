class AttendanceManager {

    // Singleton
    static instance;


    constructor() {

        // Make sure only one manager exists
        if (AttendanceManager.instance) {

            return AttendanceManager.instance;
        }


        // Store attendance records
        this.records = [];


        // Default warning level
        this._warningThreshold = 75;


        // Save instance
        AttendanceManager.instance = this;
    }


    // ===============================
    // Getter
    // ===============================

    get warningThreshold() {

        return this._warningThreshold;
    }


    // ===============================
    // Setter
    // ===============================

    set warningThreshold(value) {

        if (
            value >= 0 &&
            value <= 100
        ) {

            this._warningThreshold = value;
        }
    }


    // ===============================
    // Add Record
    // ===============================

    addRecord(record) {

        this.records.push(record);
    }


    // ===============================
    // Get Student Attendance
    // ===============================

    getStudentAttendance(studentID) {

        return this.records.filter(
            record =>
                record.studentID === studentID
        );
    }


    // ===============================
    // Calculate Percentage
    // ===============================

    calculatePercentage(studentID) {

        const records =
            this.getStudentAttendance(
                studentID
            );


        if (records.length === 0) {

            return 0;
        }


        const present =
            records.filter(
                record =>
                    record.getStatus() === "Present"
            ).length;


        return (
            present /
            records.length
        ) * 100;
    }


    // ===============================
    // Get Absences
    // ===============================

    getAbsences(studentID) {

        return this.records.filter(
            record =>
                record.studentID === studentID &&
                record.getStatus() === "Absent"
        );
    }


    // ===============================
    // Check Warning
    // ===============================

    checkWarning(studentID) {

        const percentage =
            this.calculatePercentage(
                studentID
            );


        return (
            percentage <
            this._warningThreshold
        );
    }
}
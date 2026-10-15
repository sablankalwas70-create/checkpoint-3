/**
 * Validator
 * Central place for all input validation. Uses regular expressions
 * and returns user-friendly messages instead of throwing errors.
 */
class Validator {

    // Regular expressions (kept in one place so they are easy to review)
    static PATTERNS = {
        // 3-15 letters, digits or hyphens, e.g. "S001" or "2024-15"
        studentID: /^[A-Za-z0-9-]{3,15}$/,

        // Starts with a letter; letters, spaces, apostrophes, dots, hyphens; 2-50 chars
        name: /^[A-Za-z][A-Za-z\s'.-]{1,49}$/,

        // Simple email shape: something@domain.tld (no spaces)
        email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,

        // 1-20 letters, digits, spaces or hyphens, e.g. "Year 10-A"
        classID: /^[A-Za-z0-9][A-Za-z0-9\s-]{0,19}$/,

        // ISO date from <input type="date">: YYYY-MM-DD
        date: /^\d{4}-\d{2}-\d{2}$/
    };

    /**
     * Validate a student's details.
     * @param {{studentID:string, name:string, email:string, classID:string}} data
     * @returns {{valid:boolean, errors:string[]}} list of readable messages
     */
    static validateStudent(data) {

        const errors = [];
        const p = Validator.PATTERNS;

        if (!p.studentID.test(data.studentID || "")) {
            errors.push("Student ID must be 3-15 characters (letters, numbers or hyphens).");
        }

        if (!p.name.test(data.name || "")) {
            errors.push("Name must be 2-50 characters and use letters only (spaces, ' . - allowed).");
        }

        if (!p.email.test(data.email || "")) {
            errors.push("Please enter a valid email, e.g. name@example.com.");
        }

        if (!p.classID.test(data.classID || "")) {
            errors.push("Class must be 1-20 characters (letters, numbers, spaces or hyphens).");
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Validate an attendance date (format, real calendar date, not in the future).
     * @param {string} date - "YYYY-MM-DD"
     * @param {Date} [today] - injectable for testing
     * @returns {{valid:boolean, errors:string[]}}
     */
    static validateDate(date, today = new Date()) {

        if (!Validator.PATTERNS.date.test(date || "")) {
            return { valid: false, errors: ["Please choose a date in the format YYYY-MM-DD."] };
        }

        const parsed = new Date(date + "T00:00:00");
        const [y, m, d] = date.split("-").map(Number);

        // Catches impossible dates such as 2024-02-31 (JS would roll them over)
        if (
            isNaN(parsed.getTime()) ||
            parsed.getFullYear() !== y ||
            parsed.getMonth() + 1 !== m ||
            parsed.getDate() !== d
        ) {
            return { valid: false, errors: ["That date does not exist."] };
        }

        if (parsed > today) {
            return { valid: false, errors: ["Attendance cannot be recorded for a future date."] };
        }

        return { valid: true, errors: [] };
    }
}

/**
 * StorageService
 * Saves and loads students (and their attendance records) as JSON
 * in the browser's localStorage. Every method handles its own errors
 * and returns a friendly message rather than crashing the app.
 */
class StorageService {

    static KEY = "attendanceSystem.students";

    /**
     * Convert students to a JSON string and store it.
     * JSON.stringify() calls Student.toJSON() on each student.
     * @param {Student[]} students
     * @param {string} [key] - storage key (overridable for tests)
     * @returns {{ok:boolean, message:string}}
     */
    static save(students, key = StorageService.KEY) {

        try {
            const json = JSON.stringify(students);
            localStorage.setItem(key, json);
            return { ok: true, message: "Saved." };

        } catch (error) {
            // e.g. storage full, or storage disabled in private mode
            console.error("Save failed:", error);
            return {
                ok: false,
                message: "Your data could not be saved. Storage may be full or disabled in this browser."
            };
        }
    }

    /**
     * Read the JSON string back and rebuild Student objects.
     * Returns an empty list (never throws) if nothing is stored or the data is damaged.
     * @param {string} [key]
     * @returns {Student[]}
     */
    static load(key = StorageService.KEY) {

        StorageService.lastError = null;

        try {
            const json = localStorage.getItem(key);

            if (json === null) {
                return [];   // first visit: nothing saved yet
            }

            const data = JSON.parse(json);

            if (!Array.isArray(data)) {
                throw new Error("Stored data is not a list.");
            }

            return data.map(item => Student.fromJSON(item));

        } catch (error) {
            console.error("Load failed:", error);
            StorageService.lastError =
                "Saved data was unreadable, so the system started empty.";
            return [];
        }
    }

    /**
     * Remove saved data.
     * @param {string} [key]
     */
    static clear(key = StorageService.KEY) {

        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Clear failed:", error);
        }
    }
}

StorageService.lastError = null;

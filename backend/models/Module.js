const db = require('../config/db');

class Module {
    static async create(title, description, mentor_id) {
        return db.execute(
            'INSERT INTO modules (title, description, mentor_id) VALUES (?, ?, ?)',
            [title, description, mentor_id]
        );
    }

    static async getAll(role, userId) {
        let query = 'SELECT m.*, u.username as mentor_name FROM modules m LEFT JOIN users u ON m.mentor_id = u.id';
        let params = [];

        if (role === 'student') {
            query += ' JOIN student_modules sm ON m.id = sm.module_id WHERE sm.student_id = ? AND m.status = "active"';
            params = [userId];
        } else if (role === 'mentor') {
            query += ' WHERE m.mentor_id = ? OR m.mentor_id IS NULL';
            params = [userId];
        }
        // Admin sees all, no WHERE clause added

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(
            'SELECT m.*, u.username as mentor_name FROM modules m LEFT JOIN users u ON m.mentor_id = u.id WHERE m.id = ?',
            [id]
        );
        return rows[0];
    }

    static async assignToStudent(student_id, module_id) {
        return db.execute(
            'INSERT IGNORE INTO student_modules (student_id, module_id) VALUES (?, ?)',
            [student_id, module_id]
        );
    }

    static async updateStatus(id, status) {
        return db.execute(
            'UPDATE modules SET status = ? WHERE id = ?',
            [status, id]
        );
    }
}

module.exports = Module;

const db = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(username, email, hashedPassword, role_id) {
        return db.execute(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role_id]
        );
    }

    static async getRoles() {
        const [rows] = await db.execute('SELECT * FROM roles');
        return rows;
    }

    static async findRoleIdByName(name) {
        const [rows] = await db.execute('SELECT id FROM roles WHERE name = ?', [name]);
        return rows[0]?.id;
    }

    static async getAll() {
        const [rows] = await db.execute(
            'SELECT u.id, u.username, u.email, u.status, r.name as role FROM users u JOIN roles r ON u.role_id = r.id'
        );
        return rows;
    }

    static async updateStatus(id, status) {
        return db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    }

    static async updateProfile(id, username, email) {
        return db.execute('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id]);
    }

    static async updatePassword(id, hashedPassword) {
        return db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    }
}

module.exports = User;

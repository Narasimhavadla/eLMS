const db = require('../config/db');

class Lesson {
    static async create(moduleId, title, content, orderIndex, videoUrl, quizQuestions) {
        return db.execute(
            'INSERT INTO lessons (module_id, title, content, order_index, video_url, quiz_questions) VALUES (?, ?, ?, ?, ?, ?)',
            [moduleId, title, content, orderIndex || 0, videoUrl || null, quizQuestions || null]
        );
    }

    static async getByModuleId(moduleId) {
        const [rows] = await db.execute(
            'SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC',
            [moduleId]
        );
        return rows;
    }

    static async update(id, title, content, videoUrl, quizQuestions) {
        return db.execute(
            'UPDATE lessons SET title = ?, content = ?, video_url = ?, quiz_questions = ? WHERE id = ?',
            [title, content, videoUrl || null, quizQuestions || null, id]
        );
    }

    static async delete(id) {
        return db.execute('DELETE FROM lessons WHERE id = ?', [id]);
    }
}

module.exports = Lesson;

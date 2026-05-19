const db = require('../config/db');

class Progress {
    static async markComplete(studentId, lessonId) {
        return db.execute(
            'INSERT IGNORE INTO student_progress (student_id, lesson_id) VALUES (?, ?)',
            [studentId, lessonId]
        );
    }

    static async getModuleProgress(studentId, moduleId) {
        const [lessons] = await db.execute('SELECT id FROM lessons WHERE module_id = ?', [moduleId]);
        if (lessons.length === 0) return { percentage: 0, completed: 0, total: 0 };

        const lessonIds = lessons.map(l => l.id);
        const [completed] = await db.execute(
            `SELECT lesson_id FROM student_progress WHERE student_id = ? AND lesson_id IN (${lessonIds.map(() => '?').join(',')})`,
            [studentId, ...lessonIds]
        );

        const completedCount = completed.length;
        const totalLessons = lessons.length;
        const percentage = Math.round((completedCount / totalLessons) * 100);

        return { 
            percentage, 
            completed: completedCount, 
            total: totalLessons,
            completed_lessons: completed.map(c => c.lesson_id)
        };
    }

    static async getAllProgressForModule(moduleId) {
        const [lessons] = await db.execute('SELECT id FROM lessons WHERE module_id = ?', [moduleId]);
        if (lessons.length === 0) return [];

        const lessonIds = lessons.map(l => l.id);
        const [progress] = await db.execute(
            `SELECT u.username, u.email, COUNT(sp.lesson_id) as completed_count 
             FROM users u 
             JOIN student_modules sm ON u.id = sm.student_id 
             LEFT JOIN student_progress sp ON u.id = sp.student_id AND sp.lesson_id IN (${lessonIds.map(() => '?').join(',')})
             WHERE sm.module_id = ?
             GROUP BY u.id`,
            [...lessonIds, moduleId]
        );

        return progress.map(p => ({
            ...p,
            total_lessons: lessons.length,
            percentage: Math.round((p.completed_count / lessons.length) * 100)
        }));
    }
}

module.exports = Progress;

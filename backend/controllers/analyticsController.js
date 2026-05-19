const db = require('../config/db');

exports.getPlatformAnalytics = async (req, res) => {
    try {
        // 1. Fetch total counts
        const [studentCount] = await db.execute(
            `SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'student'`
        );
        const [mentorCount] = await db.execute(
            `SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'mentor'`
        );  
        const [moduleCount] = await db.execute(
            `SELECT COUNT(*) as count FROM modules`
        );
        const [lessonCount] = await db.execute(
            `SELECT COUNT(*) as count FROM lessons`
        );
        const [completionCount] = await db.execute(
            `SELECT COUNT(*) as count FROM student_progress`
        );

        // 2. Fetch enrollment overview (students per module)
        const [enrollments] = await db.execute(`
            SELECT m.id, m.title, COUNT(sm.student_id) as enrolled_students 
            FROM modules m 
            LEFT JOIN student_modules sm ON m.id = sm.module_id 
            GROUP BY m.id, m.title
            ORDER BY enrolled_students DESC
        `);

        // 3. Fetch recent student sign-ups (last 5)
        const [recentSignups] = await db.execute(`
            SELECT u.id, u.username, u.email, u.created_at 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'student'
            ORDER BY u.created_at DESC
            LIMIT 5
        `);

        // 4. Fetch recent lesson completions (last 5)
        const [recentCompletions] = await db.execute(`
            SELECT u.username, l.title as lesson_title, m.title as module_title, sp.completed_at
            FROM student_progress sp
            JOIN users u ON sp.student_id = u.id
            JOIN lessons l ON sp.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            ORDER BY sp.completed_at DESC
            LIMIT 5
        `);

        // 5. Fetch course completions and metrics (percentage completed lessons per module)
        const [courseMetrics] = await db.execute(`
            SELECT 
                m.id,
                m.title,
                COUNT(DISTINCT sm.student_id) as enrolled_students,
                (SELECT COUNT(*) FROM lessons l WHERE l.module_id = m.id) as total_lessons,
                COUNT(sp.id) as completed_lessons
            FROM modules m
            LEFT JOIN student_modules sm ON m.id = sm.module_id
            LEFT JOIN lessons l ON l.module_id = m.id
            LEFT JOIN student_progress sp ON sp.lesson_id = l.id AND sp.student_id = sm.student_id
            GROUP BY m.id, m.title
        `);

        res.json({
            summary: {
                students: studentCount[0].count,
                mentors: mentorCount[0].count,
                modules: moduleCount[0].count,
                lessons: lessonCount[0].count,
                completions: completionCount[0].count
            },
            enrollments,
            recentSignups,
            recentCompletions,
            courseMetrics
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

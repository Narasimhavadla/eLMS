const { Lesson, StudentProgress, StudentModule, User, Module } = require('../models');
const { Op } = require('sequelize');

exports.markLessonComplete = async (req, res) => {
    const { lesson_id } = req.body;
    try {
        await StudentProgress.findOrCreate({
            where: { student_id: req.user.id, lesson_id }
        });
        res.json({ message: 'Lesson marked as completed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModuleProgress = async (req, res) => {
    try {
        const lessons = await Lesson.findAll({
            where: { module_id: req.params.moduleId },
            attributes: ['id']
        });

        if (lessons.length === 0) {
            return res.json({ percentage: 0, completed: 0, total: 0 });
        }

        const lessonIds = lessons.map(l => l.id);
        const completed = await StudentProgress.findAll({
            where: {
                student_id: req.user.id,
                lesson_id: { [Op.in]: lessonIds }
            },
            attributes: ['lesson_id']
        });

        const completedCount = completed.length;
        const totalLessons = lessons.length;
        const percentage = Math.round((completedCount / totalLessons) * 100);

        res.json({
            percentage,
            completed: completedCount,
            total: totalLessons,
            completed_lessons: completed.map(c => c.lesson_id)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProgress = async (req, res) => {
    try {
        const lessons = await Lesson.findAll({
            where: { module_id: req.params.moduleId },
            attributes: ['id']
        });

        if (lessons.length === 0) {
            return res.json([]);
        }

        const lessonIds = lessons.map(l => l.id);

        // Get all students enrolled in this module
        const enrollments = await StudentModule.findAll({
            where: { module_id: req.params.moduleId },
            include: [{
                model: User,
                as: 'student',
                attributes: ['username', 'email']
            }]
        });

        const result = [];
        for (const enrollment of enrollments) {
            const completedCount = await StudentProgress.count({
                where: {
                    student_id: enrollment.student_id,
                    lesson_id: { [Op.in]: lessonIds }
                }
            });

            result.push({
                username: enrollment.student.username,
                email: enrollment.student.email,
                completed_count: completedCount,
                total_lessons: lessons.length,
                percentage: Math.round((completedCount / lessons.length) * 100)
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

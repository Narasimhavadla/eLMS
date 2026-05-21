const { User, Role, Module, Lesson, StudentModule, StudentProgress, sequelize } = require('../models');
const { fn, col, literal } = require('sequelize');

exports.getPlatformAnalytics = async (req, res) => {
    try {
        // 1. Fetch total counts
        const studentRole = await Role.findOne({ where: { name: 'student' } });
        const mentorRole = await Role.findOne({ where: { name: 'mentor' } });

        const studentCount = await User.count({ where: { role_id: studentRole.id } });
        const mentorCount = await User.count({ where: { role_id: mentorRole.id } });
        const moduleCount = await Module.count();
        const lessonCount = await Lesson.count();
        const completionCount = await StudentProgress.count();

        // 2. Fetch enrollment overview (students per module)
        const enrollments = await Module.findAll({
            attributes: [
                'id',
                'title',
                [fn('COUNT', col('moduleStudents.id')), 'enrolled_students']
            ],
            include: [{
                model: StudentModule,
                as: 'moduleStudents',
                attributes: []
            }],
            group: ['Module.id', 'Module.title'],
            order: [[literal('enrolled_students'), 'DESC']],
            raw: true
        });

        // 3. Fetch recent student sign-ups (last 5)
        const recentSignups = await User.findAll({
            where: { role_id: studentRole.id },
            attributes: ['id', 'username', 'email', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5,
            raw: true
        });

        // 4. Fetch recent lesson completions (last 5)
        const recentCompletions = await StudentProgress.findAll({
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['username']
                },
                {
                    model: Lesson,
                    as: 'lesson',
                    attributes: ['title'],
                    include: [{
                        model: Module,
                        as: 'module',
                        attributes: ['title']
                    }]
                }
            ],
            order: [['completed_at', 'DESC']],
            limit: 5
        });

        const formattedRecentCompletions = recentCompletions.map(rc => ({
            username: rc.student.username,
            lesson_title: rc.lesson.title,
            module_title: rc.lesson.module ? rc.lesson.module.title : null,
            completed_at: rc.completed_at
        }));

        // 5. Fetch course metrics
        const allModules = await Module.findAll({ raw: true });
        const courseMetrics = [];

        for (const mod of allModules) {
            const totalLessons = await Lesson.count({ where: { module_id: mod.id } });
            const enrolledStudents = await StudentModule.count({ where: { module_id: mod.id } });

            let completedLessons = 0;
            if (totalLessons > 0) {
                const lessonIds = (await Lesson.findAll({
                    where: { module_id: mod.id },
                    attributes: ['id'],
                    raw: true
                })).map(l => l.id);

                if (lessonIds.length > 0) {
                    const { Op } = require('sequelize');
                    completedLessons = await StudentProgress.count({
                        where: { lesson_id: { [Op.in]: lessonIds } }
                    });
                }
            }

            courseMetrics.push({
                id: mod.id,
                title: mod.title,
                enrolled_students: enrolledStudents,
                total_lessons: totalLessons,
                completed_lessons: completedLessons
            });
        }

        res.json({
            summary: {
                students: studentCount,
                mentors: mentorCount,
                modules: moduleCount,
                lessons: lessonCount,
                completions: completionCount
            },
            enrollments,
            recentSignups,
            recentCompletions: formattedRecentCompletions,
            courseMetrics
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const { Module, Lesson, User, StudentModule } = require('../models');

exports.createModule = async (req, res) => {
    const { title, description, mentor_id } = req.body;
    try {
        let assignedMentorId = (req.user.role === 'admin' && mentor_id !== undefined) ? mentor_id : req.user.id;
        if (assignedMentorId === 'all' || assignedMentorId === '' || assignedMentorId === null) {
            assignedMentorId = null;
        }
        const newModule = await Module.create({
            title,
            description,
            mentor_id: assignedMentorId
        });
        res.status(201).json({ id: newModule.id, title, description, mentor_id: assignedMentorId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModules = async (req, res) => {
    try {
        let whereClause = {};
        let includeClause = [{
            model: User,
            as: 'mentorUser',
            attributes: ['username']
        }];

        if (req.user.role === 'student') {
            // Get module IDs assigned to this student
            const studentModules = await StudentModule.findAll({
                where: { student_id: req.user.id },
                attributes: ['module_id']
            });
            const moduleIds = studentModules.map(sm => sm.module_id);
            const { Op } = require('sequelize');
            whereClause = { id: { [Op.in]: moduleIds }, status: 'active' };
        } else if (req.user.role === 'mentor') {
            const { Op } = require('sequelize');
            whereClause = {
                [Op.or]: [
                    { mentor_id: req.user.id },
                    { mentor_id: null }
                ]
            };
        }
        // Admin sees all, no WHERE clause

        const modules = await Module.findAll({
            where: whereClause,
            include: includeClause,
            raw: true,
            nest: true
        });

        // Map to match the old response format
        const result = modules.map(m => ({
            ...m,
            mentor_name: m.mentorUser ? m.mentorUser.username : null
        }));
        // Remove the nested mentorUser object
        result.forEach(m => delete m.mentorUser);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModuleById = async (req, res) => {
    try {
        const mod = await Module.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'mentorUser',
                attributes: ['username']
            }],
            raw: true,
            nest: true
        });
        if (!mod) return res.status(404).json({ message: 'Module not found' });
        
        const result = {
            ...mod,
            mentor_name: mod.mentorUser ? mod.mentorUser.username : null
        };
        delete result.mentorUser;
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addLesson = async (req, res) => {
    const { moduleId } = req.params;
    const { title, content, order_index, video_url, quiz_questions } = req.body;
    try {
        const lesson = await Lesson.create({
            module_id: moduleId,
            title,
            content,
            order_index: order_index || 0,
            video_url: video_url || null,
            quiz_questions: quiz_questions || null
        });
        res.status(201).json({ id: lesson.id, title, content, video_url, quiz_questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLesson = async (req, res) => {
    const { id } = req.params;
    const { title, content, video_url, quiz_questions } = req.body;
    try {
        await Lesson.update(
            {
                title,
                content,
                video_url: video_url || null,
                quiz_questions: quiz_questions || null
            },
            { where: { id } }
        );
        res.json({ message: 'Lesson updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.findAll({
            where: { module_id: req.params.moduleId },
            order: [['order_index', 'ASC']]
        });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        await Lesson.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Lesson deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.toggleModuleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        if (status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        await Module.update({ status }, { where: { id } });
        res.json({ message: `Module status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

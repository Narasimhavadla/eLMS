const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

exports.createModule = async (req, res) => {
    const { title, description, mentor_id } = req.body;
    try {
        let assignedMentorId = (req.user.role === 'admin' && mentor_id !== undefined) ? mentor_id : req.user.id;
        if (assignedMentorId === 'all' || assignedMentorId === '' || assignedMentorId === null) {
            assignedMentorId = null;
        }
        const [result] = await Module.create(title, description, assignedMentorId);
        res.status(201).json({ id: result.insertId, title, description, mentor_id: assignedMentorId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModules = async (req, res) => {
    try {
        const modules = await Module.getAll(req.user.role, req.user.id);
        res.json(modules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModuleById = async (req, res) => {
    try {
        const module = await Module.getById(req.params.id);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        res.json(module);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addLesson = async (req, res) => {
    const { moduleId } = req.params;
    const { title, content, order_index, video_url, quiz_questions } = req.body;
    try {
        const [result] = await Lesson.create(moduleId, title, content, order_index, video_url, quiz_questions);
        res.status(201).json({ id: result.insertId, title, content, video_url, quiz_questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLesson = async (req, res) => {
    const { id } = req.params;
    const { title, content, video_url, quiz_questions } = req.body;
    try {
        await Lesson.update(id, title, content, video_url, quiz_questions);
        res.json({ message: 'Lesson updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.getByModuleId(req.params.moduleId);
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        await Lesson.delete(req.params.id);
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
        await Module.updateStatus(id, status);
        res.json({ message: `Module status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

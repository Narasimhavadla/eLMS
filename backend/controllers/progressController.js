const Progress = require('../models/Progress');

exports.markLessonComplete = async (req, res) => {
    const { lesson_id } = req.body;
    try {
        await Progress.markComplete(req.user.id, lesson_id);
        res.json({ message: 'Lesson marked as completed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModuleProgress = async (req, res) => {
    try {
        const progress = await Progress.getModuleProgress(req.user.id, req.params.moduleId);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProgress = async (req, res) => {
    try {
        const progress = await Progress.getAllProgressForModule(req.params.moduleId);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

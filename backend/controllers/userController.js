const User = require('../models/User');
const Module = require('../models/Module');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await User.updateStatus(req.params.id, status);
        res.json({ message: 'User status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignModule = async (req, res) => {
    const { student_id, module_id } = req.body;
    try {
        await Module.assignToStudent(student_id, module_id);
        res.json({ message: 'Module assigned to student' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { username, email } = req.body;
    try {
        await User.updateProfile(req.user.id, username, email);
        res.json({ message: 'Profile updated successfully', user: { id: req.user.id, username, email, role: req.user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(req.user.id, hashedPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.impersonateUser = async (req, res) => {
    try {
        const [users] = await require('../config/db').execute(
            'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
            [req.params.id]
        );
        
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = users[0];
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

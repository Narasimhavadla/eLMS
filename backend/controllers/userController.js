const { User, Role, Module, StudentModule } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'status'],
            raw: true,
            nest: true
        });

        // Map to match old response format: { id, username, email, status, role }
        const result = users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            status: u.status,
            role: u.role.name
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await User.update({ status }, { where: { id: req.params.id } });
        res.json({ message: 'User status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignModule = async (req, res) => {
    const { student_id, module_id } = req.body;
    try {
        await StudentModule.findOrCreate({
            where: { student_id, module_id }
        });
        res.json({ message: 'Module assigned to student' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { username, email } = req.body;
    try {
        await User.update({ username, email }, { where: { id: req.user.id } });
        res.json({ message: 'Profile updated successfully', user: { id: req.user.id, username, email, role: req.user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Role, as: 'role', attributes: ['name'] }]
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashedPassword }, { where: { id: req.user.id } });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.impersonateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role, as: 'role', attributes: ['name'] }]
        });
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const roleName = user.role.name;
        const token = jwt.sign(
            { id: user.id, role: roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, role: roleName }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

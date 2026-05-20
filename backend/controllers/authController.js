const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Module = require('../models/Module');

exports.register = async (req, res) => {
    const { username, email, password, role_name, mentor_id } = req.body;
    try {
        console.log('Registering user:', { username, email, role_name, mentor_id });
        
        const role_id = await User.findRoleIdByName(role_name || 'student');
        if (!role_id) {
            console.error('Role not found:', role_name);
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        // Only save mentor_id if role is student
        const assignedMentorId = (role_name === 'student' && mentor_id) ? mentor_id : null;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await User.create(username, email, hashedPassword, role_id, assignedMentorId);
        
        // Auto-assign mentor's modules to the student
        if (role_name === 'student' && assignedMentorId) {
            const studentId = result.insertId;
            const mentorModules = await User.getModulesByMentor(assignedMentorId);
            for (const mod of mentorModules) {
                await Module.assignToStudent(studentId, mod.id);
            }
            console.log(`Auto-assigned ${mentorModules.length} modules from mentor ${assignedMentorId} to student ${studentId}`);
        }
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

exports.getMentors = async (req, res) => {
    try {
        const mentors = await User.getMentors();
        res.json(mentors);
    } catch (err) {
        console.error('Error fetching mentors:', err);
        res.status(500).json({ message: 'Error fetching mentors', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        if (user.status === 'inactive') return res.status(403).json({ message: 'Account is deactivated' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
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
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    const { username, email, password, role_name } = req.body;
    try {
        console.log('Registering user:', { username, email, role_name });
        
        const role_id = await User.findRoleIdByName(role_name || 'student');
        if (!role_id) {
            console.error('Role not found:', role_name);
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(username, email, hashedPassword, role_id);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error registering user', error: err.message });
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

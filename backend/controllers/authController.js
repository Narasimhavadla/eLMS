const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role, Module, StudentModule } = require('../models');

exports.register = async (req, res) => {
    const { username, email, password, role_name, mentor_id } = req.body;
    try {
        console.log('Registering user:', { username, email, role_name, mentor_id });
        
        const normalizedRoleName = (role_name || 'student').toLowerCase();
        const role = await Role.findOne({ where: { name: normalizedRoleName } });
        if (!role) {
            console.error('Role not found:', role_name);
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        // Only save mentor_id if role is student
        const assignedMentorId = (role_name === 'student' && mentor_id) ? mentor_id : null;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role_id: role.id,
            mentor_id: assignedMentorId
        });
        
        // Auto-assign mentor's modules to the student
        if (role_name === 'student' && assignedMentorId) {
            const mentorModules = await Module.findAll({
                where: { mentor_id: assignedMentorId, status: 'active' }
            });
            for (const mod of mentorModules) {
                await StudentModule.findOrCreate({
                    where: { student_id: newUser.id, module_id: mod.id }
                });
            }
            console.log(`Auto-assigned ${mentorModules.length} modules from mentor ${assignedMentorId} to student ${newUser.id}`);
        }
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            const fields = err.errors.map(e => e.path).join(', ');
            return res.status(400).json({ 
                message: `The following fields are already in use: ${fields}` 
            });
        }
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

exports.getMentors = async (req, res) => {
    try {
        const mentorRole = await Role.findOne({ where: { name: 'mentor' } });
        const mentors = await User.findAll({
            where: { role_id: mentorRole.id, status: 'active' },
            attributes: ['id', 'username', 'email']
        });
        res.json(mentors);
    } catch (err) {
        console.error('Error fetching mentors:', err);
        res.status(500).json({ message: 'Error fetching mentors', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'role', attributes: ['name'] }]
        });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        if (user.status === 'inactive') return res.status(403).json({ message: 'Account is deactivated' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
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
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'No user found with that email address' });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
        
        // Set code expiry (15 minutes from now)
        const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
        
        // Update user with reset code
        await user.update({
            reset_token: hashedCode,
            reset_token_expiry: resetCodeExpiry
        });

        console.log(`Password reset code for ${email}: ${resetCode}`);

        res.json({
            message: 'Password reset code has been generated',
            resetCode: resetCode // Display code to user
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Error processing forgot password request', error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { code, newPassword, confirmPassword } = req.body;
    try {
        if (!code) {
            return res.status(400).json({ message: 'Reset code is required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the code to find the user
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
        
        // Find user with valid reset code
        const user = await User.findOne({
            where: {
                reset_token: hashedCode,
                reset_token_expiry: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password and clear reset code
        await user.update({
            password: hashedPassword,
            reset_token: null,
            reset_token_expiry: null
        });

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Error resetting password', error: err.message });
    }
};

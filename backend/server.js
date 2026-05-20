const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const progressRoutes = require('./routes/progress');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Auto-migrate: add mentor_id column to users table if it doesn't exist
(async () => {
    try {
        const [columns] = await db.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'mentor_id'`,
            [process.env.DB_NAME]
        );
        if (columns.length === 0) {
            await db.execute(`ALTER TABLE users ADD COLUMN mentor_id INT NULL, ADD CONSTRAINT fk_users_mentor FOREIGN KEY (mentor_id) REFERENCES users(id)`);
            console.log('Migration: Added mentor_id column to users table');
        }
    } catch (err) {
        console.error('Migration error:', err.message);
    }
})();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Be explicit for security, though * works
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', database: 'Connected' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

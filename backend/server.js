const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const progressRoutes = require('./routes/progress');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');

const app = express();

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

// Sync all Sequelize models with alter: true for auto DB adjustment
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully (alter: true)');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database sync failed:', err.message);
});

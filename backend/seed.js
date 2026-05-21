const { sequelize, Role, User } = require('./models');
const bcrypt = require('bcryptjs');

async function setup() {
    try {
        // Sync all models with alter: true to create/update tables
        console.log('Syncing database tables...');
        await sequelize.sync({ alter: true });
        console.log('Tables synced successfully.');

        // Seed roles
        console.log('Checking roles...');
        const roleCount = await Role.count();
        if (roleCount === 0) {
            console.log('Seeding roles...');
            await Role.bulkCreate([
                { name: 'student' },
                { name: 'mentor' },
                { name: 'admin' }
            ]);
            console.log('Roles seeded successfully.');
        } else {
            console.log('Roles already exist.');
        }

        // Seed admin user
        console.log('Checking for admin user...');
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        const adminUser = await User.findOne({ where: { role_id: adminRole.id } });

        if (!adminUser) {
            console.log('Creating default admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'Admin User',
                email: 'admin@elms.com',
                password: hashedPassword,
                role_id: adminRole.id
            });
            console.log('Default admin user created (admin@elms.com / admin123).');
        } else {
            console.log('Admin user already exists.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Database setup failed:', err.message);
        process.exit(1);
    }
}

setup();

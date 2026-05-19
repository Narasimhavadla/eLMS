const db = require('./config/db');
const bcrypt = require('bcryptjs');

const tables = [
    `CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(20) NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
    )`,
    `CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        mentor_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        module_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS student_modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        module_id INT,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, module_id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (module_id) REFERENCES modules(id)
    )`,
    `CREATE TABLE IF NOT EXISTS student_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        lesson_id INT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, lesson_id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )`
];

async function setup() {
    try {
        console.log('Setting up database tables...');
        for (const sql of tables) {
            await db.execute(sql);
        }
        console.log('Tables created/verified.');

        console.log('Checking roles...');
        const [roles] = await db.execute('SELECT * FROM roles');
        if (roles.length === 0) {
            console.log('Seeding roles...');
            await db.execute("INSERT INTO roles (name) VALUES ('student'), ('mentor'), ('admin')");
            console.log('Roles seeded successfully.');
        } else {
            console.log('Roles already exist.');
        }

        console.log('Checking for admin user...');
        const [users] = await db.execute('SELECT u.* FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = "admin"');
        if (users.length === 0) {
            console.log('Creating default admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const [adminRole] = await db.execute('SELECT id FROM roles WHERE name = "admin"');
            await db.execute(
                'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
                ['Admin User', 'admin@elms.com', hashedPassword, adminRole[0].id]
            );
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

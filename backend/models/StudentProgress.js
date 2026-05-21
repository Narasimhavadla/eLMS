const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentProgress = sequelize.define('StudentProgress', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    completed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'student_progress',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'lesson_id']
        }
    ]
});

module.exports = StudentProgress;

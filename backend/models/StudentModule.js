const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentModule = sequelize.define('StudentModule', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    module_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'student_modules',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'module_id']
        }
    ]
});

module.exports = StudentModule;

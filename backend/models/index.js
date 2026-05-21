const sequelize = require('../config/db');
const Role = require('./Role');
const User = require('./User');
const Module = require('./Module');
const Lesson = require('./Lesson');
const StudentModule = require('./StudentModule');
const StudentProgress = require('./StudentProgress');

// ── Associations ──

// Role <-> User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// User (mentor) <-> User (student)  — self-referential
User.hasMany(User, { foreignKey: 'mentor_id', as: 'students' });
User.belongsTo(User, { foreignKey: 'mentor_id', as: 'mentor' });

// User (mentor) <-> Module
User.hasMany(Module, { foreignKey: 'mentor_id', as: 'mentorModules' });
Module.belongsTo(User, { foreignKey: 'mentor_id', as: 'mentorUser' });

// Module <-> Lesson
Module.hasMany(Lesson, { foreignKey: 'module_id', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

// User <-> Module  (many-to-many through StudentModule)
User.belongsToMany(Module, { through: StudentModule, foreignKey: 'student_id', otherKey: 'module_id', as: 'enrolledModules' });
Module.belongsToMany(User, { through: StudentModule, foreignKey: 'module_id', otherKey: 'student_id', as: 'enrolledStudents' });

// StudentModule explicit associations
User.hasMany(StudentModule, { foreignKey: 'student_id', as: 'studentModules' });
StudentModule.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Module.hasMany(StudentModule, { foreignKey: 'module_id', as: 'moduleStudents' });
StudentModule.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

// User <-> Lesson  (many-to-many through StudentProgress)
User.belongsToMany(Lesson, { through: StudentProgress, foreignKey: 'student_id', otherKey: 'lesson_id', as: 'completedLessons' });
Lesson.belongsToMany(User, { through: StudentProgress, foreignKey: 'lesson_id', otherKey: 'student_id', as: 'completedByStudents' });

// StudentProgress explicit associations
User.hasMany(StudentProgress, { foreignKey: 'student_id', as: 'progressRecords' });
StudentProgress.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Lesson.hasMany(StudentProgress, { foreignKey: 'lesson_id', as: 'progressRecords', onDelete: 'CASCADE' });
StudentProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

module.exports = {
    sequelize,
    Role,
    User,
    Module,
    Lesson,
    StudentModule,
    StudentProgress
};

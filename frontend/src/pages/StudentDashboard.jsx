import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faClock, faPlay, faSpinner, faTrophy, faRocket, faChevronRight, faMicrochip, faQuestionCircle, faCog, faBarChart, faAward,faGraduationCap } from '@fortawesome/free-solid-svg-icons';

const StudentDashboard = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentHour, setCurrentHour] = useState(new Date().getHours());

    useEffect(() => {
        fetchModules();
        setCurrentHour(new Date().getHours());
    }, []);

    const fetchModules = async () => {
        try {
            const res = await api.get('/modules');
            setModules(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        if (currentHour < 12) return 'Good Morning';
        if (currentHour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen -mt-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
        </div>
    );

    const completedModules = modules.filter(m => m.percentage === 100).length;
    const inProgressModules = modules.filter(m => m.percentage > 0 && m.percentage < 100).length;

    const platformOperations = [
        {
            id: 1,
            title: 'Study Assistant',
            description: 'AI-powered learning companion for your next study session.',
            icon: faMicrochip,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            action: 'Launch'
        },
        {
            id: 2,
            title: 'Quiz & Test',
            description: 'Practice quizzes and assessments for your modules.',
            icon: faQuestionCircle,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100',
            action: 'Launch'
        },
        {
            id: 3,
            title: 'Custom Learning',
            description: 'Customize your learning path to fit any meeting.',
            icon: faCog,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100',
            action: 'Launch'
        },
        {
            id: 4,
            title: 'Analytics',
            description: 'Track your learning progress and performance.',
            icon: faBarChart,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100',
            action: 'View'
        }
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Welcome Header Section */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[15rem] text-primary" />
                </div>
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
                            {getGreeting()}, Welcome to eLMS!
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Launch an AI assistant for your next learning session or explore advanced study tools.
                        </p>
                    </div>
                </div>
                
                <div className="relative z-10 flex flex-wrap gap-4">
                    <div className="bg-slate-50 rounded-xl px-6 py-4 border border-slate-200 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active</p>
                        <p className="text-3xl font-bold text-primary">{modules.length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-6 py-4 border border-slate-200 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Progress</p>
                        <p className="text-3xl font-bold text-blue-600">{inProgressModules}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-6 py-4 border border-slate-200 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
                        <p className="text-3xl font-bold text-emerald-600">{completedModules}</p>
                    </div>
                </div>
            </div>

            {/* Platform Operations Cards */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Platform Operations</h2>
                        <p className="text-slate-600 text-sm mt-1">Essential tools and features for your learning journey</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {platformOperations.map((operation) => (
                        <div
                            key={operation.id}
                            className={`group relative overflow-hidden rounded-2xl p-8 ${operation.bgColor} border-2 ${operation.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                        >
                            {/* Background gradient accent */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${operation.color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity`}></div>

                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${operation.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                                    <FontAwesomeIcon icon={operation.icon} className="text-2xl" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{operation.title}</h3>
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{operation.description}</p>

                                <button className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${operation.color} text-white font-semibold rounded-lg hover:shadow-lg transform transition-all active:scale-95 group-hover:pr-8`}>
                                    {operation.action}
                                    <FontAwesomeIcon icon={faChevronRight} className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Learning Curriculum Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Assigned Curriculum</h2>
                        <p className="text-slate-600 text-sm mt-1">Your current learning modules and progress</p>
                    </div>
                    {modules.length > 0 && (
                        <Link to="/my-learning" className="group text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            View All Progress
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </Link>
                    )}
                </div>

                {modules.length === 0 ? (
                    <div className="card-enterprise p-16 text-center flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 mb-4">
                            <FontAwesomeIcon icon={faBook} className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-4">No Assignments Yet</h3>
                        <p className="text-slate-600 text-sm mt-2 max-w-xs leading-relaxed">
                            Once your mentor assigns you to a learning module, it will be listed and accessible here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map(module => (
                            <Link 
                                key={module.id} 
                                to={`/module/${module.id}`}
                                className="group card-enterprise card-enterprise-hover p-6 flex flex-col justify-between min-h-[240px] rounded-2xl border-2 border-slate-200 hover:border-primary hover:shadow-xl transition-all"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <FontAwesomeIcon icon={faPlay} className="text-sm" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">INSTRUCTOR</span>
                                            <span className="text-xs font-semibold text-slate-650">{module.mentor_name || 'Assigned Mentor'}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors">{module.title}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{module.description}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-2">
                                            <span className="text-primary">{module.percentage || 0}% Complete</span>
                                            <span className="text-slate-400">Target 100%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500" 
                                                style={{ width: `${module.percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${module.percentage === 100 ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                        <FontAwesomeIcon 
                                            icon={module.percentage === 100 ? faCheckCircle : faClock} 
                                            className="text-sm" 
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <FontAwesomeIcon icon={faTrophy} className="text-lg" />
                    </div>
                    <p className="text-emerald-600 text-sm font-semibold mb-1">Total Achievements</p>
                    <p className="text-3xl font-bold text-emerald-900">{completedModules}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <FontAwesomeIcon icon={faRocket} className="text-lg" />
                    </div>
                    <p className="text-blue-600 text-sm font-semibold mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-blue-900">{inProgressModules}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <FontAwesomeIcon icon={faAward} className="text-lg" />
                    </div>
                    <p className="text-purple-600 text-sm font-semibold mb-1">Learning Streak</p>
                    <p className="text-3xl font-bold text-purple-900">12 Days</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

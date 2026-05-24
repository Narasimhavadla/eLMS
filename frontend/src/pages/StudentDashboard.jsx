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


        </div>
    );
};

export default StudentDashboard;

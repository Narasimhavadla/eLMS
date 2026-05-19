import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faClock, faPlay, faSpinner, faTrophy, faRocket, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const StudentDashboard = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModules();
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

    if (loading) return (
        <div className="flex justify-center items-center h-screen -mt-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
        </div>
    );

    const completedModules = modules.filter(m => m.percentage === 100).length;

    return (
        <div className="space-y-8">
            {/* Header Title Section */}
            <div className="border-b border-slate-200 pb-5">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Student Overview
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    My Learning Center
                </h1>
            </div>

            {/* Flat Statistics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="card-enterprise p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
                        <FontAwesomeIcon icon={faRocket} className="text-sm" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Modules</p>
                        <p className="text-xl font-bold text-slate-800">{modules.length}</p>
                    </div>
                </div>
                <div className="card-enterprise p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <FontAwesomeIcon icon={faTrophy} className="text-sm" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
                        <p className="text-xl font-bold text-slate-800">{completedModules}</p>
                    </div>
                </div>
                <div className="card-enterprise p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-655">
                        <FontAwesomeIcon icon={faBook} className="text-sm" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status Check</p>
                        <p className="text-sm font-bold text-slate-700">All Modules Normal</p>
                    </div>
                </div>
            </div>

            {/* Learning Curriculum Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Assigned Curriculum</h2>
                    <Link to="/my-learning" className="group text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:underline">
                        View Progress
                        <FontAwesomeIcon icon={faChevronRight} className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {modules.length === 0 ? (
                    <div className="card-enterprise p-16 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center text-slate-400 border border-slate-200 mb-4">
                            <FontAwesomeIcon icon={faBook} className="text-lg" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">No Assignments Yet</h3>
                        <p className="text-slate-450 text-xs mt-1.5 max-w-xs leading-relaxed">
                            Once your mentor assigns you to a learning module, it will be listed and accessible here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map(module => (
                            <Link 
                                key={module.id} 
                                to={`/module/${module.id}`}
                                className="card-enterprise card-enterprise-hover p-6 flex flex-col justify-between min-h-[220px]"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-9 h-9 bg-slate-50 text-slate-700 rounded border border-slate-200 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faPlay} className="text-xs" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">INSTRUCTOR</span>
                                            <span className="text-xs font-semibold text-slate-650">{module.mentor_name || 'Assigned Mentor'}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-850 mb-2 leading-tight">{module.title}</h3>
                                    <p className="text-slate-450 text-xs line-clamp-2 leading-relaxed">{module.description}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-1.5">
                                            <span className="text-primary">{module.percentage || 0}% Complete</span>
                                            <span className="text-slate-400">Target 100%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                                            <div 
                                                className="bg-primary h-full transition-all duration-500" 
                                                style={{ width: `${module.percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${module.percentage === 100 ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-450 bg-slate-50 border border-slate-150'}`}>
                                        <FontAwesomeIcon 
                                            icon={module.percentage === 100 ? faCheckCircle : faClock} 
                                            className="text-xs" 
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

import { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUsers, faBook, faSpinner, faChartLine, faUserPlus, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';

const MentorDashboard = () => {
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [newModule, setNewModule] = useState({ title: '', description: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewingProgress, setViewingProgress] = useState(null);
    const [moduleProgress, setModuleProgress] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [modRes, userRes] = await Promise.all([
                api.get('/modules'),
                api.get('/users')
            ]);
            setModules(modRes.data);
            setStudents(userRes.data.filter(u => u.role === 'student'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/modules', newModule);
            setShowModuleModal(false);
            setNewModule({ title: '', description: '' });
            fetchData();
        } catch (err) {
            alert('Failed to initialize module');
        }
    };

    const handleAssign = async (moduleId) => {
        try {
            await api.post('/users/assign', { student_id: selectedStudent.id, module_id: moduleId });
            setShowAssignModal(false);
            setSelectedStudent(null);
            alert('Curriculum assigned successfully');
        } catch (err) {
            alert('Assignment failed');
        }
    };

    const fetchProgress = async (moduleId) => {
        setViewingProgress(moduleId);
        try {
            const res = await api.get(`/progress/${moduleId}/all`);
            setModuleProgress(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredModules = modules.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudents = students.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen -mt-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Command Bar */}
            <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Mentor Console</span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Instructor Command Center</h1>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[280px]">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-xs" />
                        <input 
                            type="text" 
                            placeholder="Search modules or student names..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowModuleModal(true)}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-1.5" />
                        Create Module
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Modules Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curriculum Matrix</h2>
                        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.25 rounded font-medium">
                            {modules.length} Active
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {filteredModules.map(module => (
                            <div key={module.id} className="card-enterprise p-5 flex items-center justify-between group">
                                <div className="min-w-0 pr-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-sm font-bold text-slate-800 leading-none">{module.title}</h3>
                                        <span className="text-[9px] bg-slate-50 text-slate-450 px-1 rounded border border-slate-200 font-mono">#{module.id}</span>
                                    </div>
                                    <p className="text-xs text-slate-450 truncate">{module.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => fetchProgress(module.id)}
                                        className="w-8 h-8 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-slate-655 rounded flex items-center justify-center transition-colors cursor-pointer"
                                        title="View Student Progress"
                                    >
                                        <FontAwesomeIcon icon={faChartLine} className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredModules.length === 0 && (
                            <div className="card-enterprise p-12 text-center text-slate-400 text-xs font-semibold border-dashed">
                                No curriculum modules match your query.
                            </div>
                        )}
                    </div>

                    {/* Progress Detail Table */}
                    {viewingProgress && (
                        <div className="card-enterprise overflow-hidden animate-fade-in mt-6">
                            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider leading-none">Enrollment Progress Metrics</h3>
                                </div>
                                <button onClick={() => setViewingProgress(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                                </button>
                            </div>
                            <div className="p-4">
                                {moduleProgress.length === 0 ? (
                                    <div className="text-center py-6 text-slate-450 text-xs font-medium">
                                        No student enrollments exist for this learning module.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <th className="pb-2">Student</th>
                                                    <th className="pb-2">Completion Rate</th>
                                                    <th className="pb-2 text-right">Lesson Tracker</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {moduleProgress.map((p, idx) => (
                                                    <tr key={idx} className="text-xs text-slate-700 hover:bg-slate-50/50">
                                                        <td className="py-3">
                                                            <p className="font-bold text-slate-800">{p.username}</p>
                                                            <p className="text-[10px] text-slate-400">{p.email}</p>
                                                        </td>
                                                        <td className="py-3 w-1/3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 bg-slate-100 h-1.5 rounded overflow-hidden">
                                                                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${p.percentage}%` }}></div>
                                                                </div>
                                                                <span className="font-bold text-slate-800 text-[10px] whitespace-nowrap">{p.percentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-right font-medium text-[10px] text-slate-500">
                                                            {p.completed_count} / {p.total_lessons} units
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Students Roster (Compact Table/Matrix) */}
                <div className="space-y-4">
                    <div className="px-1">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Directory</h2>
                    </div>
                    <div className="card-enterprise divide-y divide-slate-150 overflow-hidden">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                <div className="min-w-0 pr-2">
                                    <div className="font-bold text-slate-800 text-xs truncate">{student.username}</div>
                                    <div className="text-[10px] text-slate-450 truncate">{student.email}</div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        setShowAssignModal(true);
                                    }}
                                    className="w-7 h-7 bg-white border border-slate-200 hover:border-slate-350 text-slate-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                                    title="Assign Module"
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="text-[10px]" />
                                </button>
                            </div>
                        ))}
                        {filteredStudents.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                No student records match search.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deploy Module Modal */}
            {showModuleModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-lg border border-slate-250 p-6 shadow-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Module</h2>
                            <button onClick={() => setShowModuleModal(false)} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateModule} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Module Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. Intermediate Web APIs"
                                    value={newModule.title}
                                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description / Objectives</label>
                                <textarea 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 border border-slate-250 rounded h-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
                                    placeholder="Enter descriptive goals and expectations..."
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowModuleModal(false)}
                                    className="flex-1 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Module Modal */}
            {showAssignModal && selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg rounded-lg border border-slate-250 p-6 shadow-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Assign Module</h2>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">TARGET: {selectedStudent.username}</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {modules.map(module => (
                                <button
                                    key={module.id}
                                    onClick={() => handleAssign(module.id)}
                                    className="w-full text-left p-3.5 rounded border border-slate-150 hover:border-primary hover:bg-slate-50 flex justify-between items-center cursor-pointer group"
                                >
                                    <div className="min-w-0 pr-3">
                                        <p className="font-bold text-slate-700 text-xs truncate group-hover:text-primary transition-colors">{module.title}</p>
                                        <p className="text-[8px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">ID: {module.id}</p>
                                    </div>
                                    <div className="w-6 h-6 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-450 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-colors">
                                        <FontAwesomeIcon icon={faPlus} className="text-[8px]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorDashboard;

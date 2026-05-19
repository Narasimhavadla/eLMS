import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faBook, 
    faUser, 
    faSpinner, 
    faSearch, 
    faTimes, 
    faBookOpen 
} from '@fortawesome/free-solid-svg-icons';

const AdminModules = () => {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Create Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newModule, setNewModule] = useState({ title: '', description: '', mentor_id: 'all' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [modulesRes, usersRes] = await Promise.all([
                api.get('/modules'),
                api.get('/users')
            ]);
            setModules(modulesRes.data);
            
            // Filter users to get only mentors
            const mentorUsers = usersRes.data.filter(u => u.role === 'mentor');
            setMentors(mentorUsers);
            
            // Default to 'all' for selection
            setNewModule(prev => ({ ...prev, mentor_id: 'all' }));
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/modules', {
                title: newModule.title,
                description: newModule.description,
                mentor_id: newModule.mentor_id === 'all' ? null : parseInt(newModule.mentor_id, 10)
            });
            setShowCreateModal(false);
            setNewModule({ title: '', description: '', mentor_id: 'all' });
            fetchData();
        } catch (err) {
            alert('Failed to initialize module');
        }
    };

    const toggleModuleStatus = async (moduleId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/modules/${moduleId}/status`, { status: newStatus });
            setModules(modules.map(m => m.id === moduleId ? { ...m, status: newStatus } : m));
        } catch (err) {
            alert('Failed to update module status');
        }
    };

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.mentor_name && m.mentor_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="border-b border-slate-200 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Administration</span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Global Curriculum</h1>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[280px]">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input 
                            type="text" 
                            placeholder="Search learning modules..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-1.5" />
                        New Module
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {filteredModules.map(mod => (
                    <div 
                        key={mod.id} 
                        onClick={() => navigate(`/module/${mod.id}`)}
                        className="card-enterprise p-5 bg-white flex flex-col justify-between hover:border-slate-355 transition-all cursor-pointer group min-h-[220px]"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors">
                                    <FontAwesomeIcon icon={faBook} className="text-sm" />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleModuleStatus(mod.id, mod.status);
                                    }}
                                    className={`px-2 py-0.5 border rounded-[3px] font-bold uppercase tracking-wider text-[8px] cursor-pointer transition-colors ${mod.status === 'active' ? 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {mod.status}
                                </button>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight group-hover:text-primary transition-colors">{mod.title}</h3>
                            <p className="text-[11px] text-slate-455 line-clamp-2 mt-1.5 leading-relaxed">{mod.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-slate-455 border-t border-slate-100 pt-3.5 mt-4">
                            <div className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[9px]" />
                                <span className="font-semibold text-slate-600">{mod.mentor_name || 'All Mentors'}</span>
                            </div>
                            <span className="text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                                Syllabus <FontAwesomeIcon icon={faBookOpen} className="text-[8px]" />
                            </span>
                        </div>
                    </div>
                ))}
                
                {filteredModules.length === 0 && (
                    <div className="col-span-full card-enterprise p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                            <FontAwesomeIcon icon={faBook} />
                        </div>
                        <p className="text-slate-750 text-xs font-bold">No active learning modules found.</p>
                        <p className="text-[10px] text-slate-400 mt-1">Initialize a module to begin drafting syllabus items.</p>
                    </div>
                )}
            </div>

            {/* Deploy Module Modal with Mentor Dropdown */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-lg border border-slate-250 p-6 shadow-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Initialize Module</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateModule} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Module Title</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. Master Course: Web Engineering Foundations"
                                    value={newModule.title}
                                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned Principal Mentor</label>
                                <select 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-855 border border-slate-250 rounded bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    value={newModule.mentor_id}
                                    onChange={(e) => setNewModule({...newModule, mentor_id: e.target.value})}
                                    required
                                >
                                    <option value="all">All Mentors (Universal Module)</option>
                                    {mentors.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.username} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description / Course Syllabus Objectives</label>
                                <textarea 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 border border-slate-250 rounded h-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
                                    placeholder="Outline syllabus core modules and graduation requirements..."
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Initialize Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminModules;

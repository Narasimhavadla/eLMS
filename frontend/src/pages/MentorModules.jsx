import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEye, faUserPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';

const MentorModules = () => {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    
    // Forms
    const [newModule, setNewModule] = useState({ title: '', description: '' });
    const [selectedStudentId, setSelectedStudentId] = useState('');

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
            
            const fetchedModules = modulesRes.data;
            const fetchedStudents = usersRes.data.filter(u => u.role === 'student');
            setStudents(fetchedStudents);

            // Fetch progress for each module to get enrollments and completion rates
            const modulesWithStats = await Promise.all(fetchedModules.map(async (mod) => {
                try {
                    const statsRes = await api.get(`/progress/${mod.id}/all`);
                    const studentsProgress = statsRes.data;
                    const enrollments = studentsProgress.length;
                    const totalPercentage = studentsProgress.reduce((sum, p) => sum + p.percentage, 0);
                    const avgCompletion = enrollments > 0 ? Math.round(totalPercentage / enrollments) : 0;
                    
                    return {
                        ...mod,
                        enrollments,
                        completionRate: `${avgCompletion}%`
                    };
                } catch (e) {
                    return {
                        ...mod,
                        enrollments: 0,
                        completionRate: '0%'
                    };
                }
            }));

            setModules(modulesWithStats);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/modules', newModule);
            setShowCreateModal(false);
            setNewModule({ title: '', description: '' });
            fetchData();
        } catch (err) {
            alert('Failed to create module');
        }
    };

    const handleAssignStudent = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedModule) return;
        try {
            await api.post('/users/assign', {
                student_id: selectedStudentId,
                module_id: selectedModule.id
            });
            setShowAssignModal(false);
            setSelectedStudentId('');
            setSelectedModule(null);
            fetchData();
            alert('Student successfully assigned to module!');
        } catch (err) {
            alert('Failed to assign student');
        }
    };

    const handleDeleteModule = async (id) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return;
        try {
            // If backend supports delete, otherwise just mock alert or handle
            await api.delete(`/modules/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete module (make sure backend endpoint exists)');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-in">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">My Curriculum</h1>
                    <p className="text-gray-500 mt-1">Manage and assign your course modules.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-bold transition-all shadow-premium flex items-center gap-2 self-start md:self-auto"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Create Module
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-in">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-600">Module Title</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Description</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Assigned Students</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Avg. Progress</th>
                                <th className="p-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {modules.map(mod => (
                                <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-gray-800">{mod.title}</p>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                                        {mod.description || 'No description provided'}
                                    </td>
                                    <td className="p-4 font-bold text-gray-600">
                                        {mod.enrollments} {mod.enrollments === 1 ? 'Student' : 'Students'}
                                    </td>
                                    <td className="p-4 font-medium text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full" 
                                                    style={{ width: mod.completionRate }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{mod.completionRate}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                        <button 
                                            onClick={() => navigate(`/module/${mod.id}`)}
                                            className="p-2 text-gray-400 hover:text-primary transition-colors" 
                                            title="View Curriculum"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedModule(mod); setShowAssignModal(true); }}
                                            className="p-2 text-gray-400 hover:text-emerald-500 transition-colors" 
                                            title="Assign Student"
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {modules.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        No modules found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Module Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-slide-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">New Module</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateModule} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Module Title</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                    placeholder="e.g. Intro to JavaScript"
                                    value={newModule.title}
                                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-24 resize-none"
                                    placeholder="Provide a brief summary of the course..."
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-premium"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Student Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-slide-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Assign to Module</h2>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Assign a student to the course: <span className="font-bold text-gray-800">{selectedModule?.title}</span>
                        </p>
                        <form onSubmit={handleAssignStudent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Student</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium bg-white"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a Student --</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.username} ({student.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => { setShowAssignModal(false); setSelectedModule(null); }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-premium"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MentorModules;

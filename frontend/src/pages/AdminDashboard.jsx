import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faBook, 
    faShieldAlt, 
    faToggleOn, 
    faToggleOff, 
    faSpinner, 
    faPlus, 
    faTrash, 
    faExternalLinkAlt, 
    faSearch, 
    faTimes,
    faBookOpen,
    faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
    const { impersonate } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newModule, setNewModule] = useState({ title: '', description: '', mentor_id: 'all' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, modRes] = await Promise.all([
                api.get('/users'),
                api.get('/modules')
            ]);
            setUsers(userRes.data);
            setModules(modRes.data);
            setNewModule(prev => ({ ...prev, mentor_id: 'all' }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert('Failed to update status');
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

    const handleImpersonate = async (userId) => {
        if (!window.confirm('Switch to this user session? You can return to admin by logging out.')) return;
        try {
            const res = await api.post(`/users/impersonate/${userId}`);
            impersonate(res.data);
            navigate('/');
        } catch (err) {
            alert('Impersonation failed');
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

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeMentors = users.filter(u => u.role === 'mentor');

    if (loading) return (
        <div className="flex justify-center items-center h-screen -mt-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            {/* Welcome Header Section */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[15rem] text-primary" />
                </div>
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
                            Welcome to eLMS, Administrator!
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Oversee platform operations, manage users, and ensure smooth system performance.
                        </p>
                    </div>
                </div>
                
                <div className="relative z-10 flex flex-wrap gap-4">
                    <div className="bg-slate-50 rounded-xl px-6 py-4 border border-slate-200 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Users</p>
                        <p className="text-3xl font-bold text-primary">{users.length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-6 py-4 border border-slate-200 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Modules</p>
                        <p className="text-3xl font-bold text-emerald-600">{modules.length}</p>
                    </div>
                </div>
            </div>

            {/* SaaS Header Command Strip */}
            <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">System Console</span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Platform Operations</h1>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[280px]">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-455 text-xs" />
                        <input 
                            type="text" 
                            placeholder="Search personnel or module name..."
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
                        Create Module
                    </button>
                </div>
            </div>

            {/* Core Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Personnel', val: users.length, icon: faUsers, bg: 'bg-blue-50 border-blue-100 text-blue-600' },
                    { label: 'Deployed Modules', val: modules.length, icon: faBook, bg: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                    { label: 'System Health', val: '99.9%', icon: faShieldAlt, bg: 'bg-slate-50 border-slate-200 text-slate-655' }
                ].map((stat, i) => (
                    <div key={i} className="card-enterprise p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded border flex items-center justify-center ${stat.bg}`}>
                            <FontAwesomeIcon icon={stat.icon} className="text-sm" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold text-slate-800 leading-none mt-1">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Directory Section */}
            <div className="card-enterprise overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex gap-6">
                        {['users', 'modules'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 pt-1 font-bold text-xs uppercase tracking-wider relative cursor-pointer ${activeTab === tab ? 'text-primary' : 'text-slate-455 hover:text-slate-750'}`}
                            >
                                {tab === 'users' ? 'User Matrix' : 'Curriculum Grid'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    {activeTab === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="pb-3 px-3">Personnel Profile</th>
                                        <th className="pb-3 px-3">Access Tier</th>
                                        <th className="pb-3 px-3">Verification</th>
                                        <th className="pb-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="text-xs text-slate-700 hover:bg-slate-50/30 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-500 font-bold text-sm">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 leading-none">{user.username}</div>
                                                        <div className="text-[10px] text-slate-400 mt-1">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider border ${user.role === 'admin' ? 'bg-slate-900 border-slate-955 text-white' : user.role === 'mentor' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${user.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                                    <div className={`w-1 h-1 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                    {user.status === 'active' ? 'Verified' : 'Locked'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    {user.role !== 'admin' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleImpersonate(user.id)}
                                                                className="w-7 h-7 bg-white border border-slate-200 hover:border-slate-350 text-slate-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                                                                title="Impersonate Identity"
                                                            >
                                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleUserStatus(user.id, user.status)}
                                                                className={`w-7 h-7 bg-white border border-slate-200 rounded flex items-center justify-center transition-colors text-base cursor-pointer ${user.status === 'active' ? 'text-emerald-600' : 'text-slate-300'}`}
                                                            >
                                                                <FontAwesomeIcon icon={user.status === 'active' ? faToggleOn : faToggleOff} className="text-sm" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="pb-3 px-3">Module Info</th>
                                        <th className="pb-3 px-3">Principal Mentor</th>
                                        <th className="pb-3 px-3">Status</th>
                                        <th className="pb-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredModules.map(module => (
                                        <tr key={module.id} className="text-xs text-slate-700 hover:bg-slate-50/30 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="font-bold text-slate-800 leading-none">{module.title}</div>
                                                <div className="text-[9px] text-slate-400 mt-1 font-mono">MODULE ID: {module.id}</div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-slate-50 border border-slate-200 text-slate-600 rounded flex items-center justify-center text-[9px] font-bold">M</div>
                                                    <div className="text-slate-655 font-medium">{module.mentor_name || 'All Mentors'}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <button 
                                                    onClick={() => toggleModuleStatus(module.id, module.status)}
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${module.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/70' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/50'}`}
                                                    title="Click to Toggle Status"
                                                >
                                                    <div className={`w-1 h-1 rounded-full mr-1.5 ${module.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                                    {module.status === 'active' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => navigate(`/module/${module.id}`)}
                                                        className="w-7 h-7 bg-white border border-slate-200 hover:border-slate-350 text-primary rounded flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Compose Syllabus"
                                                    >
                                                        <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Deploy Module Modal with Mentor Choice */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-lg border border-slate-250 p-6 shadow-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Module</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateModule} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Module Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Enter reference title..."
                                    value={newModule.title}
                                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned Mentor</label>
                                <select 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-855 border border-slate-250 rounded bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    value={newModule.mentor_id}
                                    onChange={(e) => setNewModule({...newModule, mentor_id: e.target.value})}
                                    required
                                >
                                    <option value="all">All Mentors (Universal Module)</option>
                                    {activeMentors.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.username} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description / Objectives</label>
                                <textarea 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 border border-slate-250 rounded h-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
                                    placeholder="Operational Summary..."
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
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faShieldAlt, 
    faToggleOn, 
    faToggleOff, 
    faSpinner, 
    faExternalLinkAlt 
} from '@fortawesome/free-solid-svg-icons';

const AdminUsers = () => {
    const { impersonate } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch user list', err);
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

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">User Directory</h1>
                </div>
                <div className="relative w-full md:w-[280px]">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input 
                        type="text" 
                        placeholder="Search personnel directory..." 
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-enterprise overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3 px-4">User Details</th>
                                <th className="py-3 px-4">Access Level</th>
                                <th className="py-3 px-4">Account Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="text-xs text-slate-700 hover:bg-slate-50/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 leading-none">{user.username}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border
                                            ${user.role === 'admin' ? 'bg-slate-900 border-slate-950 text-white' : 
                                              user.role === 'mentor' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                                              'bg-slate-50 border-slate-200 text-slate-600'}`}
                                        >
                                            {user.role === 'admin' && <FontAwesomeIcon icon={faShieldAlt} className="text-[8px]" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border
                                            ${user.status === 'active' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-rose-700 bg-rose-50 border-rose-100'}`}
                                        >
                                            <span className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {user.role !== 'admin' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleImpersonate(user.id)}
                                                        className="w-7 h-7 bg-white border border-slate-200 hover:border-slate-350 text-slate-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Impersonate User"
                                                    >
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleUserStatus(user.id, user.status)}
                                                        className={`w-7 h-7 bg-white border border-slate-200 rounded flex items-center justify-center transition-colors text-base cursor-pointer ${user.status === 'active' ? 'text-emerald-600' : 'text-slate-300'}`}
                                                        title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                                    >
                                                        <FontAwesomeIcon icon={user.status === 'active' ? faToggleOn : faToggleOff} className="text-sm" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-slate-400 text-xs font-semibold">
                                        No matching users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminUsers;

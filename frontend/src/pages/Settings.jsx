import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell, faShieldAlt, faSave, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showForgotModal, setShowForgotModal] = useState(false);
    
    // Profile form states
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    
    // Password form states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const res = await api.put('/users/profile', { username, email });
            updateUser(res.data.user);
            alert('Profile updated successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Confirm password does not match new password');
            return;
        }
        setPasswordSaving(true);
        try {
            await api.put('/users/password', { currentPassword, newPassword });
            alert('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <Layout>
            <div className="border-b border-slate-200 pb-5 mb-6">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Configuration</span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Account & Settings</h1>
            </div>

            <div className="bg-white rounded border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[550px] shadow-sm">
                {/* Settings Sidebar */}
                <div className="w-full md:w-56 bg-slate-50/50 border-r border-slate-200 p-4 shrink-0">
                    <nav className="space-y-1">
                        <TabButton 
                            active={activeTab === 'profile'} 
                            onClick={() => setActiveTab('profile')} 
                            icon={faUser} 
                            label="Profile details" 
                        />
                        <TabButton 
                            active={activeTab === 'notifications'} 
                            onClick={() => setActiveTab('notifications')} 
                            icon={faBell} 
                            label="Notifications" 
                        />
                        <TabButton 
                            active={activeTab === 'security'} 
                            onClick={() => setActiveTab('security')} 
                            icon={faShieldAlt} 
                            label="Security & Access" 
                        />
                    </nav>
                </div>

                {/* Settings Content Section */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'profile' && (
                        <div className="max-w-xl animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Profile Information</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">Control how your details appear to other personnel.</p>
                            </div>
                            
                            <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold">
                                    {username ? username.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUserCircle} />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Assigned Identity</span>
                                    <span className="text-xs font-bold text-slate-700">{user.role.toUpperCase()} ACCOUNT</span>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                                        <input 
                                            type="text" 
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Security Level</label>
                                        <input 
                                            type="text" 
                                            disabled
                                            value={user.role.toUpperCase()}
                                            className="w-full px-3 py-2 text-xs font-bold text-slate-450 border border-slate-200 bg-slate-100 rounded cursor-not-allowed uppercase"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Professional Bio</label>
                                    <textarea 
                                        rows="3"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Add a summary about your credentials..."
                                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={profileSaving}
                                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={profileSaving ? faUser : faSave} className={profileSaving ? 'animate-pulse' : ''} />
                                        {profileSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-xl animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Notification Subscriptions</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">Define your inbound message and alert preferences.</p>
                            </div>
                            
                            <div className="space-y-3">
                                <ToggleRow title="Email Notifications" description="Receive daily platform summaries and critical updates." defaultChecked={true} />
                                <ToggleRow title="Course Announcements" description="Updates from instructors regarding curriculum modifications." defaultChecked={true} />
                                <ToggleRow title="Platform Security Alerts" description="Instant notifications on new authentications or deactivations." defaultChecked={true} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-xl animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Access Security</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">Keep your account credentials verified and secure.</p>
                            </div>
                            
                            <div className="py-2">
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium text-slate-850 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium text-slate-850 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium text-slate-850 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={passwordSaving}
                                            className="bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            {passwordSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Forgot Password</h3>
                                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Request a password reset link to be sent to your email address.</p>
                                </div>
                                <button 
                                    onClick={() => setShowForgotModal(true)}
                                    className="bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-250 text-slate-600 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Request Reset Link
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                <div>
                                    <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Danger Zone</h3>
                                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Once you delete your account, all credentials and learning indexes will be completely erased. There is no rollback.</p>
                                </div>
                                <button className="bg-rose-50 border border-rose-150 hover:bg-rose-100 hover:border-rose-250 text-rose-600 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ForgotPasswordModal 
                isOpen={showForgotModal} 
                onClose={() => setShowForgotModal(false)} 
            />
        </Layout>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded font-semibold text-xs tracking-wide transition-all cursor-pointer ${
            active 
                ? 'bg-white text-primary shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
        }`}
    >
        <FontAwesomeIcon icon={icon} className={`text-xs shrink-0 ${active ? 'text-primary' : 'text-slate-400'}`} />
        <span>{label}</span>
    </button>
);

const ToggleRow = ({ title, description, defaultChecked }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between p-3.5 rounded border border-slate-150 bg-slate-50/20">
            <div className="pr-4">
                <p className="font-bold text-slate-700 text-xs">{title}</p>
                <p className="text-[10px] text-slate-450 mt-0.5">{description}</p>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${checked ? 'bg-primary' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
            </button>
        </div>
    );
};

export default Settings;

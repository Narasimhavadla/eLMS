import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, 
    faUsers, 
    faBookOpen, 
    faCog, 
    faSignOutAlt, 
    faGraduationCap,
    faChevronLeft,
    faChevronRight,
    faUserCircle
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: faHome, label: 'Dashboard' },
        ...(user.role === 'admin' ? [
            { path: '/users', icon: faUsers, label: 'User Directory' },
            { path: '/modules', icon: faBookOpen, label: 'Global Curriculum' }
        ] : []),
        ...(user.role === 'mentor' ? [
            { path: '/my-modules', icon: faBookOpen, label: 'My Curriculum' },
            { path: '/students', icon: faUsers, label: 'My Students' }
        ] : []),
        ...(user.role === 'student' ? [
            { path: '/my-learning', icon: faBookOpen, label: 'My Learning' }
        ] : []),
        { path: '/settings', icon: faCog, label: 'Settings' },
    ];

    return (
        <aside 
            className={`h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col sidebar-transition relative ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
        >
            {/* Logo / Brand Header */}
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
                {!collapsed ? (
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-base" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">eLMS</span>
                            <span className="text-[9px] font-semibold tracking-wider text-slate-450 uppercase">Enterprise</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white mx-auto">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-sm" />
                    </div>
                )}
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-3 py-2.5 rounded text-sm transition-colors relative group font-medium ${isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-2 bottom-2 w-0.75 bg-primary rounded-r"></div>
                            )}
                            <FontAwesomeIcon 
                                icon={item.icon} 
                                className={`text-base ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-primary' : 'text-slate-450 group-hover:text-slate-700'}`} 
                            />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Card */}
            <div className="p-3 border-t border-slate-150 bg-slate-50/50">
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded`}>
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border border-slate-300">
                        <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{user.username}</p>
                            <span className="inline-block text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5 bg-slate-250/60 px-1.5 py-0.25 rounded">{user.role}</span>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handleLogout}
                    className={`mt-2 w-full flex items-center px-3 py-2 rounded text-rose-650 hover:bg-rose-50 transition-colors font-medium text-xs ${collapsed ? 'justify-center' : ''}`}
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className={collapsed ? '' : 'mr-3'} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>

            {/* Collapse Toggle Trigger */}
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-4 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-700 hover:border-slate-350 cursor-pointer shadow-sm z-10"
            >
                <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
            </button>
        </aside>
    );
};

export default Sidebar;

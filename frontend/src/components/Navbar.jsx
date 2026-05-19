import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faGraduationCap, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 text-primary">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-2xl" />
                    <span className="text-xl font-bold tracking-tight text-gray-800">eLMS</span>
                </Link>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-2 text-gray-600">
                        <FontAwesomeIcon icon={faUserCircle} />
                        <span className="font-medium">{user.username}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                            {user.role}
                        </span>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors font-medium"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

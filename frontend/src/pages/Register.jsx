import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserTag, faGraduationCap, faChalkboardTeacher, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role_name: 'student',
        mentor_id: ''
    });
    const [mentors, setMentors] = useState([]);
    const [mentorsLoading, setMentorsLoading] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await api.get('/auth/mentors');
            setMentors(res.data);
        } catch (err) {
            console.error('Error fetching mentors:', err);
        } finally {
            setMentorsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'role_name' && value !== 'student') {
            // Clear mentor_id when switching away from student role
            setFormData({ ...formData, [name]: value, mentor_id: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate mentor selection for students
        if (formData.role_name === 'student' && !formData.mentor_id) {
            setError('Please select a mentor');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const isStudent = formData.role_name === 'student';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white p-4">
            <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4 shadow-lg">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join our e-learning community</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faUserTag} />
                            </span>
                            <select
                                name="role_name"
                                value={formData.role_name}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option value="student">Student</option>
                                <option value="mentor">Mentor</option>
                            </select>
                        </div>
                    </div>

                    {/* Mentor Selection - only visible for students */}
                    {isStudent && (
                        <div style={{ animation: 'slideDown 0.3s ease-out' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Mentor</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faChalkboardTeacher} />
                                </span>
                                {mentorsLoading ? (
                                    <div className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm">
                                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                        Loading mentors...
                                    </div>
                                ) : (
                                    <select
                                        name="mentor_id"
                                        value={formData.mentor_id}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                                        required
                                    >
                                        <option value="">-- Choose a Mentor --</option>
                                        {mentors.map(mentor => (
                                            <option key={mentor.id} value={mentor.id}>
                                                {mentor.username} ({mentor.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {mentors.length === 0 && !mentorsLoading && (
                                <p className="text-xs text-amber-600 mt-1">No mentors available yet. Please contact admin.</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transform transition-all active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline transition-all">
                        Sign in
                    </Link>
                </p>
            </div>

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                        max-height: 200px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;

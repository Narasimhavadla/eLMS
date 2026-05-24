import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faGraduationCap, faKey } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = () => {
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                code,
                newPassword,
                confirmPassword
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white p-4">
            <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
                {success ? (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4 shadow-lg">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mt-4">Success!</h2>
                        <p className="text-gray-600 mt-2">Your password has been reset successfully.</p>
                        <p className="text-gray-500 text-sm mt-4">Redirecting to login page...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4 shadow-lg">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-2xl" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
                            <p className="text-gray-500 mt-2">Enter your code and new password</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <FontAwesomeIcon icon={faKey} />
                                    </span>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength="6"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-center text-2xl tracking-widest font-bold"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Enter the 6-digit code you received</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <FontAwesomeIcon icon={faLock} />
                                    </span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <FontAwesomeIcon icon={faLock} />
                                    </span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transform transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:underline transition-all">
                                Log in here
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;

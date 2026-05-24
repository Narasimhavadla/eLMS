import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTimes, faSpinner, faCheckCircle, faCopy } from '@fortawesome/free-solid-svg-icons';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResetCode('');
        setLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setResetCode(res.data.resetCode);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(resetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGoToReset = () => {
        onClose();
        setResetCode('');
        navigate('/reset-password');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-lg" />
                    </button>
                </div>

                {resetCode ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-emerald-600" />
                        </div>
                        <p className="text-emerald-600 font-semibold mb-2">Code Generated!</p>
                        <p className="text-gray-600 text-sm mb-6">Use this code to reset your password</p>
                        
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-6">
                            <p className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wider">Your Reset Code</p>
                            <p className="text-4xl font-bold text-primary tracking-widest mb-3">{resetCode}</p>
                            <p className="text-gray-400 text-xs">Valid for 15 minutes</p>
                        </div>

                        <button
                            onClick={handleCopyCode}
                            className={`w-full py-2 mb-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                copied 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCopy} />
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>

                        <p className="text-gray-600 text-sm mb-4">
                            Now go to the reset password page and enter this code.
                        </p>

                        <button
                            onClick={handleGoToReset}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transform transition-all active:scale-95"
                        >
                            Go to Reset Password
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 text-sm mb-6">
                            Enter your email address and we'll generate a reset code for you.
                        </p>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transform transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Code'
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-500 mt-6">
                            Remember your password?{' '}
                            <button
                                onClick={onClose}
                                className="text-primary hover:underline font-semibold transition-all"
                            >
                                Back to Login
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;

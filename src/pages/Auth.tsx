import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertTriangle, CheckCircle, User, Mail, Lock, ShieldCheck, Eye, EyeOff, Rocket, Sparkles, Key, ArrowLeft } from 'lucide-react';
import './Auth.css';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signIn, signUp, resetPassword, updatePassword } = useAuth();

    // Determine auth mode from URL
    const getInitialMode = (): AuthMode => {
        const path = location.pathname;
        if (path === '/signup') return 'signup';
        if (path === '/forgot-password') return 'forgot-password';
        if (path === '/reset-password') return 'reset-password';
        return 'login';
    };

    const [mode, setMode] = useState<AuthMode>(getInitialMode());
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!email && mode !== 'reset-password') {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email) && mode !== 'reset-password') {
            setError('Please enter a valid email address');
            return;
        }

        if ((mode === 'login' || mode === 'signup') && !validatePassword(password)) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (mode === 'reset-password') {
            if (!validatePassword(password)) {
                setError('Password must be at least 6 characters');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const result = await signIn(email, password);
                if (result.success) {
                    navigate('/');
                } else {
                    setError(result.error || 'Failed to sign in');
                }
            } else if (mode === 'signup') {
                const result = await signUp(email, password, fullName);
                if (result.success) {
                    if (result.needsConfirmation) {
                        setSuccess('Account created! Please check your email to confirm your account.');
                        setEmail('');
                        setPassword('');
                        setConfirmPassword('');
                        setFullName('');
                    } else {
                        navigate('/');
                    }
                } else {
                    setError(result.error || 'Failed to create account');
                }
            } else if (mode === 'forgot-password') {
                const result = await resetPassword(email);
                if (result.success) {
                    setSuccess('Password reset link sent! Please check your email.');
                    setEmail('');
                } else {
                    setError(result.error || 'Failed to send reset email');
                }
            } else if (mode === 'reset-password') {
                const result = await updatePassword(password);
                if (result.success) {
                    setSuccess('Password updated successfully! Redirecting to login...');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError(result.error || 'Failed to update password');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderTitle = () => {
        switch (mode) {
            case 'signup':
                return 'Create Account';
            case 'forgot-password':
                return 'Reset Password';
            case 'reset-password':
                return 'New Password';
            default:
                return 'Welcome Back';
        }
    };

    const renderSubtitle = () => {
        switch (mode) {
            case 'signup':
                return 'Join GymFlow and start your fitness journey';
            case 'forgot-password':
                return 'Enter your email to receive a reset link';
            case 'reset-password':
                return 'Enter your new password below';
            default:
                return 'Sign in to continue your workout journey';
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <header className="auth-header">
                        <span className="auth-logo"><Activity size={48} /></span>
                        <h1 className="auth-title">{renderTitle()}</h1>
                        <p className="auth-subtitle">{renderSubtitle()}</p>
                    </header>

                    {error && (
                        <div className="auth-error">
                            <span className="auth-error-icon"><AlertTriangle size={20} /></span>
                            <p className="auth-error-message">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            <span className="auth-success-icon"><CheckCircle size={20} /></span>
                            <p className="auth-success-message">{success}</p>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <div className="form-group">
                                <label className="label">
                                    <span className="label-icon"><User size={16} /></span>
                                    Full Name (optional)
                                </label>
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        )}

                        {mode !== 'reset-password' && (
                            <div className="form-group">
                                <label className="label">
                                    <span className="label-icon"><Mail size={16} /></span>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className={`auth-input ${error && !email ? 'error' : ''}`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        )}

                        {(mode === 'login' || mode === 'signup' || mode === 'reset-password') && (
                            <div className="form-group">
                                <label className="label">
                                    <span className="label-icon"><Lock size={16} /></span>
                                    {mode === 'reset-password' ? 'New Password' : 'Password'}
                                </label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`auth-input ${error && password.length < 6 ? 'error' : ''}`}
                                        placeholder={mode === 'reset-password' ? 'Enter new password' : 'Enter your password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(mode === 'signup' || mode === 'reset-password') && (
                            <div className="form-group">
                                <label className="label">
                                    <span className="label-icon"><ShieldCheck size={16} /></span>
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className={`auth-input ${error && password !== confirmPassword ? 'error' : ''}`}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="forgot-password-link">
                                <Link to="/forgot-password" onClick={() => setMode('forgot-password')}>
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-btn auth-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    {mode === 'login' ? 'Signing in...' :
                                        mode === 'signup' ? 'Creating account...' :
                                            mode === 'forgot-password' ? 'Sending email...' :
                                                'Updating password...'}
                                </>
                            ) : (
                                <>
                                    <span>
                                        {mode === 'login' ? <Rocket size={18} /> :
                                            mode === 'signup' ? <Sparkles size={18} /> :
                                                mode === 'forgot-password' ? <Mail size={18} /> :
                                                    <Key size={18} />}
                                    </span>
                                    {mode === 'login' ? 'Sign In' :
                                        mode === 'signup' ? 'Create Account' :
                                            mode === 'forgot-password' ? 'Send Reset Link' :
                                                'Update Password'}
                                </>
                            )}
                        </button>
                    </form>

                    {mode === 'login' && (
                        <div className="auth-switch">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/signup" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    )}

                    {mode === 'signup' && (
                        <div className="auth-switch">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}

                    {(mode === 'forgot-password' || mode === 'reset-password') && (
                        <div className="back-to-login">
                            <Link to="/login" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                <ArrowLeft size={14} /> Back to login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { theme, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/schedule', label: 'Schedule', icon: '📅' },
        { path: '/workout', label: 'Workout AI', icon: '💪' },
        { path: '/journal', label: 'Journal', icon: '📝' },
        { path: '/saved-workouts', label: 'History', icon: '📂' },
    ];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setShowUserMenu(false);
        navigate('/');
    };

    const getUserInitials = () => {
        if (!user) return '?';
        const email = user.email || '';
        const name = user.user_metadata?.full_name || '';

        if (name) {
            return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email.charAt(0).toUpperCase();
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="nav-brand">
                        <span className="brand-icon">🏋️</span>
                        <span className="brand-text">GymFlow</span>
                    </Link>

                    <div className="nav-links">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="nav-actions">
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            <span className="theme-icon">
                                {theme === 'light' ? '🌙' : '☀️'}
                            </span>
                            <span className="theme-label">
                                {theme === 'light' ? 'Dark' : 'Light'}
                            </span>
                        </button>

                        {user ? (
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    aria-expanded={showUserMenu}
                                >
                                    <div className="user-avatar">
                                        {getUserInitials()}
                                    </div>
                                    <span className="user-email">{user.email}</span>
                                    <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-menu-dropdown">
                                        <div className="user-menu-header">
                                            <span className="user-menu-name">
                                                {user.user_metadata?.full_name || 'User'}
                                            </span>
                                            <span className="user-menu-email">{user.email}</span>
                                        </div>
                                        <div className="user-menu-divider"></div>
                                        <Link
                                            to="/saved-workouts"
                                            className="user-menu-item"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <span>📂</span> Saved Workouts
                                        </Link>
                                        <button
                                            className="user-menu-item danger"
                                            onClick={handleSignOut}
                                        >
                                            <span>🚪</span> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="auth-link">
                                <span className="auth-icon">👤</span>
                                <span className="auth-label">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>

            <footer className="footer">
                <p>© 2024 GymFlow - Your AI-Powered Fitness Companion</p>
            </footer>
        </div>
    );
};

export default Layout;

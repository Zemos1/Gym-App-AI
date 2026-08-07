import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    Calendar,
    Dumbbell,
    BookOpen,
    Clock,
    Activity,
    Moon,
    Sun,
    User,
    LogOut,
    ChevronUp,
    ChevronDown,
    Menu,
    X
} from 'lucide-react';
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { path: '/', label: 'Home', icon: <Home size={18} /> },
        { path: '/schedule', label: 'Schedule', icon: <Calendar size={18} /> },
        { path: '/workout', label: 'Workout', icon: <Dumbbell size={18} /> },
        { path: '/journal', label: 'Journal', icon: <BookOpen size={18} /> },
        { path: '/saved-workouts', label: 'Saved', icon: <Clock size={18} /> },
    ];

    // Close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setShowUserMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                const target = event.target as HTMLElement;
                if (!target.closest('.hamburger-btn')) {
                    setMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleSignOut = async () => {
        await signOut();
        setShowUserMenu(false);
        setMobileMenuOpen(false);
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
            <nav className="navbar" role="navigation" aria-label="Main navigation">
                <div className="nav-container">
                    {/* Logo / Brand */}
                    <Link to="/" className="nav-brand" aria-label="GymFlow Home">
                        <span className="brand-icon"><Activity size={22} /></span>
                        <span className="brand-text">GymFlow</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="nav-links-desktop">
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

                    {/* Right Actions */}
                    <div className="nav-actions">
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            <span className="theme-icon">
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            </span>
                        </button>

                        {user ? (
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    aria-expanded={showUserMenu}
                                    aria-label="User menu"
                                >
                                    <div className="user-avatar">
                                        {getUserInitials()}
                                    </div>
                                    <span className="user-email">{user.email}</span>
                                    <span className="dropdown-arrow">
                                        {showUserMenu ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </span>
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
                                            <Clock size={14} /> Saved Workouts
                                        </Link>
                                        <button
                                            className="user-menu-item danger"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut size={14} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="auth-link">
                                <span className="auth-icon"><User size={16} /></span>
                                <span className="auth-label">Sign In</span>
                            </Link>
                        )}

                        {/* Hamburger - Tablet only */}
                        <button
                            className="hamburger-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Tablet Slide-down Menu */}
                {mobileMenuOpen && (
                    <>
                        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
                        <div className="mobile-menu" ref={mobileMenuRef}>
                            <div className="mobile-menu-links">
                                {navItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`mobile-menu-link ${location.pathname === item.path ? 'active' : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="mobile-menu-icon">{item.icon}</span>
                                        <span className="mobile-menu-label">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                            {user && (
                                <div className="mobile-menu-footer">
                                    <div className="mobile-menu-divider"></div>
                                    <button
                                        className="mobile-menu-link danger"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>

            {/* Mobile Bottom Tab Bar */}
            <nav className="bottom-tab-bar" aria-label="Mobile navigation">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`tab-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="tab-icon">{item.icon}</span>
                        <span className="tab-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <main className="main-content">
                {children}
            </main>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} GymFlow &middot; Your Fitness Companion</p>
            </footer>
        </div>
    );
};

export default Layout;

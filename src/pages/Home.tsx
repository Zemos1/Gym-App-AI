import { Link } from 'react-router-dom';
import { Calendar, Dumbbell, BookOpen, Rocket, Activity, ArrowRight, Zap, Target, Droplets, Moon, Flame } from 'lucide-react';
import './Home.css';

const Home = () => {
    const features = [
        {
            icon: <Calendar size={24} />,
            title: 'Smart Scheduling',
            description: 'Plan your workout days with an intuitive calendar. Track streaks and stay consistent.',
            link: '/schedule',
        },
        {
            icon: <Dumbbell size={24} />,
            title: 'Custom Workouts',
            description: 'Get personalized workout plans tailored to your BMI, goals, and fitness level.',
            link: '/workout',
        },
        {
            icon: <BookOpen size={24} />,
            title: 'Progress Journal',
            description: 'Log daily activities and get insights on sleep, hydration, and workout patterns.',
            link: '/journal',
        },
    ];

    const capabilities = [
        { icon: <Target size={18} />, value: 'BMI-Based', label: 'Workout Plans' },
        { icon: <Flame size={18} />, value: '3 Goals', label: 'Lose · Maintain · Gain' },
        { icon: <Moon size={18} />, value: 'Sleep & Mood', label: 'Daily Tracking' },
        { icon: <Droplets size={18} />, value: 'Hydration', label: 'Water Intake Log' },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge animate-fade-in">
                        <Zap size={12} /> Personalized Fitness
                    </div>
                    <h1 className="hero-title animate-fade-in">
                        Your Fitness Journey,{' '}
                        <span className="highlight">Simplified</span>
                    </h1>
                    <p className="hero-subtitle animate-fade-in">
                        GymFlow helps you plan workouts, track progress, and build lasting habits 
                        with personalized programs designed for your goals.
                    </p>
                    <div className="hero-buttons animate-fade-in">
                        <Link to="/workout" className="btn btn-primary">
                            <Rocket size={16} /> Get Started
                        </Link>
                        <Link to="/schedule" className="btn btn-secondary">
                            <Calendar size={16} /> View Schedule
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card animate-pulse">
                        <div className="hero-icon"><Activity size={48} /></div>
                        <div className="hero-stats">
                            <span className="stat-value">+247%</span>
                            <span className="stat-label">Progress This Month</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    {capabilities.map((item, index) => (
                        <div key={index} className="stat-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <span className="stat-icon-inline">{item.icon}</span>
                            <span className="stat-value">{item.value}</span>
                            <span className="stat-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">Powerful tools to help you reach your fitness goals</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <Link
                            to={feature.link}
                            key={index}
                            className="feature-card animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="feature-icon-wrapper">
                                <span className="feature-icon">{feature.icon}</span>
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <span className="feature-link">
                                Explore <span className="arrow"><ArrowRight size={14} /></span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Start?</h2>
                    <p className="cta-subtitle">
                        Calculate your BMI, pick your goal, and get a full workout plan in seconds
                    </p>
                    <Link to="/workout" className="btn btn-primary cta-button">
                        <Dumbbell size={18} /> Generate Your Workout
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;

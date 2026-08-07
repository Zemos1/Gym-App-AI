import { Link } from 'react-router-dom';
import { Calendar, Dumbbell, BookOpen, Rocket, Activity, ArrowRight, Zap } from 'lucide-react';
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

    const stats = [
        { value: '1M+', label: 'Active Users' },
        { value: '50K+', label: 'Plans Generated' },
        { value: '98%', label: 'Satisfaction' },
        { value: '24/7', label: 'Available' },
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

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
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
                        Join thousands who have transformed their fitness routine with GymFlow
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

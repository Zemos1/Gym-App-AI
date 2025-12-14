import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const features = [
        {
            icon: '📅',
            title: 'Smart Scheduling',
            description: 'Plan your workout days with our intuitive calendar. Set reminders and track your gym streak.',
            link: '/schedule',
            color: '#4361ee',
        },
        {
            icon: '💪',
            title: 'AI Workout Generator',
            description: 'Get personalized workout plans based on your BMI using advanced OpenAI technology.',
            link: '/workout',
            color: '#00ff88',
        },
        {
            icon: '📝',
            title: 'AI Journal Analysis',
            description: 'Log your daily activities and let AI analyze patterns to help you improve.',
            link: '/journal',
            color: '#f59e0b',
        },
    ];

    const stats = [
        { value: '1M+', label: 'Active Users' },
        { value: '50K+', label: 'Workouts Generated' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'AI Support' },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title animate-fade-in">
                        Transform Your <span className="highlight">Fitness Journey</span> with AI
                    </h1>
                    <p className="hero-subtitle animate-fade-in">
                        GymFlow combines intelligent scheduling, personalized workout generation,
                        and AI-powered journaling to help you achieve your fitness goals faster than ever.
                    </p>
                    <div className="hero-buttons animate-fade-in">
                        <Link to="/workout" className="btn btn-primary">
                            <span>🚀</span> Get Started
                        </Link>
                        <Link to="/schedule" className="btn btn-secondary">
                            <span>📅</span> View Schedule
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card animate-pulse">
                        <div className="hero-icon">🏋️</div>
                        <div className="hero-stats">
                            <span className="stat-value">+247%</span>
                            <span className="stat-label">Progress</span>
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
                    <h2 className="section-title">Powerful Features</h2>
                    <p className="section-subtitle">Everything you need to crush your fitness goals</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <Link
                            to={feature.link}
                            key={index}
                            className="feature-card animate-fade-in"
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <div className="feature-icon-wrapper" style={{ '--feature-color': feature.color } as React.CSSProperties}>
                                <span className="feature-icon">{feature.icon}</span>
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <span className="feature-link">
                                Explore <span className="arrow">→</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Start Your Journey?</h2>
                    <p className="cta-subtitle">
                        Join thousands of users who have transformed their lives with GymFlow
                    </p>
                    <Link to="/workout" className="btn btn-primary cta-button">
                        <span>💪</span> Generate Your First Workout
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;

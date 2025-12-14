import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbHelpers, type WorkoutPlanRecord } from '../lib/supabase';
import './SavedWorkouts.css';

const SavedWorkouts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<WorkoutPlanRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadWorkouts();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadWorkouts = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await dbHelpers.getWorkoutPlans(user.id);

        if (!error && data) {
            setWorkouts(data as WorkoutPlanRecord[]);
        }
        setLoading(false);
    };

    const handleDelete = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this workout plan?')) return;

        setDeleting(planId);
        const { error } = await dbHelpers.deleteWorkoutPlan(planId);

        if (!error) {
            setWorkouts(workouts.filter(w => w.id !== planId));
        }
        setDeleting(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getGoalEmoji = (goal: string) => {
        switch (goal) {
            case 'lose': return '🔥';
            case 'gain': return '💪';
            default: return '⚖️';
        }
    };

    const getGoalLabel = (goal: string) => {
        switch (goal) {
            case 'lose': return 'Weight Loss';
            case 'gain': return 'Muscle Building';
            default: return 'Maintenance';
        }
    };

    // Not logged in state
    if (!user) {
        return (
            <div className="saved-workouts-page page-container">
                <header className="page-header">
                    <h1 className="page-title">📂 Saved Workouts</h1>
                    <p className="page-subtitle">Your personalized workout history</p>
                </header>

                <div className="auth-prompt">
                    <span className="auth-prompt-icon">🔐</span>
                    <h2 className="auth-prompt-title">Sign In to Save Workouts</h2>
                    <p className="auth-prompt-text">
                        Create an account to save your generated workout plans, track your progress,
                        and access your fitness history from any device.
                    </p>
                    <div className="auth-prompt-buttons">
                        <Link to="/login" className="btn btn-primary">
                            🚀 Sign In
                        </Link>
                        <Link to="/signup" className="btn btn-secondary">
                            ✨ Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="saved-workouts-page page-container">
                <header className="page-header">
                    <h1 className="page-title">📂 Saved Workouts</h1>
                    <p className="page-subtitle">Your personalized workout history</p>
                </header>

                <div className="loading-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-line title"></div>
                            <div className="skeleton-line date"></div>
                            <div className="skeleton-line description"></div>
                            <div className="skeleton-line description short"></div>
                            <div className="skeleton-tags">
                                <div className="skeleton-tag"></div>
                                <div className="skeleton-tag"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (workouts.length === 0) {
        return (
            <div className="saved-workouts-page page-container">
                <header className="page-header">
                    <h1 className="page-title">📂 Saved Workouts</h1>
                    <p className="page-subtitle">Your personalized workout history</p>
                </header>

                <div className="empty-state">
                    <span className="empty-state-icon">🏋️</span>
                    <h2 className="empty-state-title">No Saved Workouts Yet</h2>
                    <p className="empty-state-text">
                        Generate your first personalized workout plan to get started!
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/workout')}
                    >
                        🚀 Generate Workout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-workouts-page page-container">
            <header className="page-header">
                <h1 className="page-title">📂 Saved Workouts</h1>
                <p className="page-subtitle">
                    You have {workouts.length} saved workout plan{workouts.length !== 1 ? 's' : ''}
                </p>
            </header>

            <div className="workouts-grid">
                {workouts.map((workout) => (
                    <article key={workout.id} className="saved-workout-card animate-fade-in">
                        <div className="saved-workout-header">
                            <div>
                                <h3 className="saved-workout-title">{workout.title}</h3>
                                <span className="saved-workout-date">
                                    📅 {workout.created_at ? formatDate(workout.created_at) : 'Unknown date'}
                                </span>
                            </div>
                            <div className="saved-workout-actions">
                                <button
                                    className="saved-workout-btn delete"
                                    onClick={() => workout.id && handleDelete(workout.id)}
                                    disabled={deleting === workout.id}
                                >
                                    {deleting === workout.id ? '...' : '🗑️'}
                                </button>
                            </div>
                        </div>

                        <div className="saved-workout-meta">
                            <span className={`saved-workout-tag goal-${workout.goal}`}>
                                {getGoalEmoji(workout.goal)} {getGoalLabel(workout.goal)}
                            </span>
                            <span className="saved-workout-tag">
                                📊 BMI: {workout.bmi_value} ({workout.bmi_category})
                            </span>
                            <span className="saved-workout-tag">
                                🎯 {workout.fitness_level.charAt(0).toUpperCase() + workout.fitness_level.slice(1)}
                            </span>
                        </div>

                        <p className="saved-workout-description">{workout.description}</p>

                        <div className="saved-workout-exercises">
                            {workout.exercises.slice(0, 4).map((exercise, idx) => (
                                <span key={idx} className="exercise-mini-tag">
                                    {exercise.name}
                                </span>
                            ))}
                            {workout.exercises.length > 4 && (
                                <span className="exercise-mini-tag">
                                    +{workout.exercises.length - 4} more
                                </span>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default SavedWorkouts;

import { useState, useEffect } from 'react';
import { Calendar, Flame, CheckCircle, BarChart, ChevronLeft, ChevronRight, X, Check, HeartPulse, Dumbbell, Flower2, Bed, Zap } from 'lucide-react';
import './Schedule.css';

interface ScheduleItem {
    id: string;
    date: string;
    type: 'cardio' | 'strength' | 'flexibility' | 'rest' | 'hiit';
    title: string;
    duration: number;
    completed: boolean;
    notes: string;
}

const Schedule = () => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: 'strength' as ScheduleItem['type'],
        title: '',
        duration: 60,
        notes: '',
    });

    useEffect(() => {
        const saved = localStorage.getItem('gym-schedules');
        if (saved) {
            setSchedules(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('gym-schedules', JSON.stringify(schedules));
    }, [schedules]);

    const workoutTypes = [
        { value: 'cardio', label: 'Cardio', Icon: HeartPulse, color: '#ef4444' },
        { value: 'strength', label: 'Strength', Icon: Dumbbell, color: '#00ff88' },
        { value: 'flexibility', label: 'Flexibility', Icon: Flower2, color: '#8b5cf6' },
        { value: 'rest', label: 'Rest Day', Icon: Bed, color: '#6b7280' },
        { value: 'hiit', label: 'HIIT', Icon: Zap, color: '#f59e0b' },
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        return { daysInMonth, startingDay };
    };

    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getScheduleForDate = (date: string) => {
        return schedules.filter(s => s.date === date);
    };

    const handleDateClick = (day: number) => {
        const date = formatDate(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        setSelectedDate(date);
        setShowModal(true);
    };

    const handleAddSchedule = () => {
        if (!selectedDate || !formData.title) return;

        const newSchedule: ScheduleItem = {
            id: Date.now().toString(),
            date: selectedDate,
            type: formData.type,
            title: formData.title,
            duration: formData.duration,
            completed: false,
            notes: formData.notes,
        };

        setSchedules([...schedules, newSchedule]);
        setShowModal(false);
        setFormData({ type: 'strength', title: '', duration: 60, notes: '' });
    };

    const toggleComplete = (id: string) => {
        setSchedules(schedules.map(s =>
            s.id === id ? { ...s, completed: !s.completed } : s
        ));
    };

    const deleteSchedule = (id: string) => {
        setSchedules(schedules.filter(s => s.id !== id));
    };

    const navigateMonth = (direction: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    };

    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const getWorkoutSummary = () => {
        const completed = schedules.filter(s => s.completed).length;
        const total = schedules.length;
        const streak = calculateStreak();
        return { completed, total, streak };
    };

    const calculateStreak = () => {
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = formatDate(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
            const daySchedules = schedules.filter(s => s.date === dateStr && s.completed);
            if (daySchedules.length > 0) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    };

    const summary = getWorkoutSummary();

    return (
        <div className="schedule-page page-container">
            <header className="page-header">
                <h1 className="page-title"><Calendar size={32} /> Workout Schedule</h1>
                <p className="page-subtitle">Plan your gym days and track your fitness journey</p>
            </header>

            {/* Stats Cards */}
            <div className="schedule-stats">
                <div className="stat-card">
                    <span className="stat-icon"><Flame size={40} /></span>
                    <div className="stat-info">
                        <span className="stat-number">{summary.streak}</span>
                        <span className="stat-text">Day Streak</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><CheckCircle size={40} /></span>
                    <div className="stat-info">
                        <span className="stat-number">{summary.completed}/{summary.total}</span>
                        <span className="stat-text">Completed</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><BarChart size={40} /></span>
                    <div className="stat-info">
                        <span className="stat-number">
                            {summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%
                        </span>
                        <span className="stat-text">Success Rate</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="calendar-wrapper">
                <div className="calendar-header">
                    <button className="btn btn-secondary" onClick={() => navigateMonth(-1)}>
                        <ChevronLeft size={20} /> Prev
                    </button>
                    <h2 className="calendar-month">{monthName}</h2>
                    <button className="btn btn-secondary" onClick={() => navigateMonth(1)}>
                        Next <ChevronRight size={20} />
                    </button>
                </div>

                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}

                    {Array.from({ length: startingDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-day empty"></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const daySchedules = getScheduleForDate(date);
                        const isToday = date === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

                        return (
                            <div
                                key={day}
                                className={`calendar-day ${isToday ? 'today' : ''} ${daySchedules.length > 0 ? 'has-workout' : ''}`}
                                onClick={() => handleDateClick(day)}
                            >
                                <span className="day-number">{day}</span>
                                {daySchedules.length > 0 && (
                                    <div className="day-indicators">
                                        {daySchedules.slice(0, 3).map(schedule => {
                                            const type = workoutTypes.find(t => t.value === schedule.type);
                                            return (
                                                <span
                                                    key={schedule.id}
                                                    className={`indicator ${schedule.completed ? 'completed' : ''}`}
                                                    style={{ backgroundColor: type?.color }}
                                                    title={schedule.title}
                                                >
                                                    {type && <type.Icon size={12} />}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Workouts */}
            <section className="upcoming-section">
                <h3 className="section-title">Upcoming Workouts</h3>
                <div className="workout-list">
                    {schedules
                        .filter(s => !s.completed && new Date(s.date) >= new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5)
                        .map(schedule => {
                            const type = workoutTypes.find(t => t.value === schedule.type);
                            return (
                                <div key={schedule.id} className="workout-item">
                                    <div className="workout-icon" style={{ borderColor: type?.color }}>
                                        {type && <type.Icon size={24} />}
                                    </div>
                                    <div className="workout-details">
                                        <h4>{schedule.title}</h4>
                                        <p>{new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                        <span className="workout-duration">{schedule.duration} min</span>
                                    </div>
                                    <div className="workout-actions">
                                        <button
                                            className="btn-icon complete"
                                            onClick={() => toggleComplete(schedule.id)}
                                            title="Mark as complete"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => deleteSchedule(schedule.id)}
                                            title="Delete"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    {schedules.filter(s => !s.completed && new Date(s.date) >= new Date()).length === 0 && (
                        <p className="no-workouts">No upcoming workouts. Click on a calendar day to add one!</p>
                    )}
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Workout</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-date">
                                <Calendar size={16} /> {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>

                            <div className="form-group">
                                <label className="label">Workout Type</label>
                                <div className="type-selector">
                                    {workoutTypes.map(type => (
                                        <button
                                            key={type.value}
                                            className={`type-btn ${formData.type === type.value ? 'active' : ''}`}
                                            style={{ '--type-color': type.color } as React.CSSProperties}
                                            onClick={() => setFormData({ ...formData, type: type.value as ScheduleItem['type'] })}
                                        >
                                            <span><type.Icon size={24} /></span>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Workout Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Upper Body Day"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="15"
                                    max="180"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Notes (optional)</label>
                                <textarea
                                    className="textarea-field"
                                    placeholder="Any specific exercises or goals..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAddSchedule}>
                                Add Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;

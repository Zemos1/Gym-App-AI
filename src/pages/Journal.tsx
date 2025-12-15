import { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Moon, Droplets, Dumbbell, BarChart, PenTool, Book, Check, X, Trash2, ChevronLeft, Target, FileText, Smile, Meh, Frown, Laugh, CloudRain, Rocket } from 'lucide-react';
import './Journal.css';

interface JournalEntry {
    id: string;
    date: string;
    content: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    workoutDone: boolean;
    sleepHours: number;
    waterIntake: number;
    aiAnalysis?: AIAnalysis;
}

interface AIAnalysis {
    summary: string;
    positives: string[];
    improvements: string[];
    recommendations: string[];
    overallScore: number;
}

const Journal = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
    const [showApiInput, setShowApiInput] = useState(false);

    const [formData, setFormData] = useState({
        content: '',
        mood: 'neutral' as JournalEntry['mood'],
        workoutDone: false,
        sleepHours: 7,
        waterIntake: 8,
    });

    useEffect(() => {
        const saved = localStorage.getItem('gym-journal');
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('gym-journal', JSON.stringify(entries));
    }, [entries]);

    const moodOptions = [
        { value: 'great', label: 'Great', icon: <Laugh size={24} />, color: '#10b981' },
        { value: 'good', label: 'Good', icon: <Smile size={24} />, color: '#22c55e' },
        { value: 'neutral', label: 'Neutral', icon: <Meh size={24} />, color: '#f59e0b' },
        { value: 'bad', label: 'Bad', icon: <Frown size={24} />, color: '#f97316' },
        { value: 'terrible', label: 'Terrible', icon: <CloudRain size={24} />, color: '#ef4444' },
    ];

    const analyzeWithAI = async (entry: JournalEntry): Promise<AIAnalysis> => {
        if (apiKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a supportive fitness coach and life advisor. Analyze daily journal entries and provide constructive feedback. Always respond with valid JSON.'
                            },
                            {
                                role: 'user',
                                content: `Analyze this fitness journal entry and provide feedback:
                
                Entry: "${entry.content}"
                Mood: ${entry.mood}
                Workout completed: ${entry.workoutDone ? 'Yes' : 'No'}
                Sleep: ${entry.sleepHours} hours
                Water intake: ${entry.waterIntake} glasses
                
                Respond with JSON:
                {
                  "summary": "Brief summary of the day",
                  "positives": ["positive1", "positive2"],
                  "improvements": ["area to improve 1"],
                  "recommendations": ["actionable recommendation 1", "recommendation 2"],
                  "overallScore": 85
                }`
                            }
                        ],
                        max_tokens: 1000,
                    }),
                });

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    return JSON.parse(data.choices[0].message.content);
                }
            } catch (error) {
                console.error('OpenAI API error:', error);
            }
        }

        // Local analysis fallback
        return generateLocalAnalysis(entry);
    };

    const generateLocalAnalysis = (entry: JournalEntry): AIAnalysis => {
        const positives: string[] = [];
        const improvements: string[] = [];
        const recommendations: string[] = [];
        let score = 50;

        // Analyze workout
        if (entry.workoutDone) {
            positives.push('Great job completing your workout today!');
            score += 15;
        } else {
            improvements.push('Try to fit in a workout tomorrow, even if it\'s just a short one');
            recommendations.push('Schedule your workout at a specific time to build consistency');
        }

        // Analyze sleep
        if (entry.sleepHours >= 7 && entry.sleepHours <= 9) {
            positives.push(`Excellent sleep duration (${entry.sleepHours} hours) - optimal for recovery`);
            score += 10;
        } else if (entry.sleepHours < 7) {
            improvements.push(`Sleep of ${entry.sleepHours} hours is below optimal. Aim for 7-9 hours`);
            recommendations.push('Try going to bed 30 minutes earlier tonight');
        } else {
            improvements.push('Sleeping more than 9 hours might indicate fatigue - check your routine');
        }

        // Analyze water intake
        if (entry.waterIntake >= 8) {
            positives.push(`Great hydration with ${entry.waterIntake} glasses of water`);
            score += 10;
        } else {
            improvements.push(`Water intake of ${entry.waterIntake} glasses is below recommended 8 glasses`);
            recommendations.push('Keep a water bottle at your desk as a reminder to drink more');
        }

        // Analyze mood
        if (entry.mood === 'great' || entry.mood === 'good') {
            positives.push('Positive mood is a great indicator of overall well-being');
            score += 10;
        } else if (entry.mood === 'bad' || entry.mood === 'terrible') {
            recommendations.push('Consider a short walk or meditation to help improve your mood');
            recommendations.push('Reach out to a friend or family member if you\'re feeling down');
        }

        // Analyze content length (engagement)
        if (entry.content.length > 100) {
            positives.push('Detailed journaling helps with self-reflection and mindfulness');
            score += 5;
        } else {
            recommendations.push('Try adding more detail to your entries for better self-reflection');
        }

        // Add general recommendations
        if (recommendations.length === 0) {
            recommendations.push('Keep up the great work! Consistency is key to achieving your goals');
        }

        return {
            summary: `Today was a ${entry.mood} day. ${entry.workoutDone ? 'You completed your workout.' : 'Rest day.'} Sleep: ${entry.sleepHours}h, Hydration: ${entry.waterIntake} glasses.`,
            positives: positives.length > 0 ? positives : ['Every day is a step forward in your fitness journey'],
            improvements,
            recommendations,
            overallScore: Math.min(100, score),
        };
    };

    const handleSubmit = async () => {
        if (!formData.content.trim()) {
            alert('Please write something about your day');
            return;
        }

        setLoading(true);

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            content: formData.content,
            mood: formData.mood,
            workoutDone: formData.workoutDone,
            sleepHours: formData.sleepHours,
            waterIntake: formData.waterIntake,
        };

        const analysis = await analyzeWithAI(newEntry);
        newEntry.aiAnalysis = analysis;

        setEntries([newEntry, ...entries]);
        setShowForm(false);
        setFormData({
            content: '',
            mood: 'neutral',
            workoutDone: false,
            sleepHours: 7,
            waterIntake: 8,
        });
        setSelectedEntry(newEntry);
        setLoading(false);
    };

    const deleteEntry = (id: string) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            setEntries(entries.filter(e => e.id !== id));
            if (selectedEntry?.id === id) {
                setSelectedEntry(null);
            }
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#22c55e';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getWeeklyStats = () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);

        const avgSleep = weekEntries.reduce((sum, e) => sum + e.sleepHours, 0) / (weekEntries.length || 1);
        const avgWater = weekEntries.reduce((sum, e) => sum + e.waterIntake, 0) / (weekEntries.length || 1);
        const workoutDays = weekEntries.filter(e => e.workoutDone).length;
        const avgScore = weekEntries.reduce((sum, e) => sum + (e.aiAnalysis?.overallScore || 0), 0) / (weekEntries.length || 1);

        return { avgSleep, avgWater, workoutDays, avgScore, totalEntries: weekEntries.length };
    };

    const stats = getWeeklyStats();

    return (
        <div className="journal-page page-container">
            <header className="page-header">
                <h1 className="page-title"><BookOpen size={32} /> Daily Journal</h1>
                <p className="page-subtitle">Track your daily progress and get AI-powered insights to improve</p>
            </header>

            {/* API Key Toggle */}
            <div className="api-section">
                <button
                    className="btn btn-secondary"
                    onClick={() => setShowApiInput(!showApiInput)}
                >
                    {showApiInput ? 'Hide' : 'Show'} OpenAI Settings
                </button>
                {showApiInput && (
                    <div className="api-input-wrapper">
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your OpenAI API key (optional)"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                        />
                        <p className="api-hint">
                            <Lightbulb size={16} /> Without an API key, analysis is generated locally. Add your key for more personalized insights.
                        </p>
                    </div>
                )}
            </div>

            {/* Weekly Stats */}
            <div className="weekly-stats">
                <div className="stat-card">
                    <span className="stat-icon"><Moon size={24} /></span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.avgSleep.toFixed(1)}h</span>
                        <span className="stat-text">Avg Sleep</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><Droplets size={24} /></span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.avgWater.toFixed(1)}</span>
                        <span className="stat-text">Avg Water</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><Dumbbell size={24} /></span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.workoutDays}/7</span>
                        <span className="stat-text">Workout Days</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><BarChart size={24} /></span>
                    <div className="stat-info">
                        <span className="stat-number" style={{ color: getScoreColor(stats.avgScore) }}>
                            {stats.avgScore.toFixed(0)}%
                        </span>
                        <span className="stat-text">Avg Score</span>
                    </div>
                </div>
            </div>

            {/* New Entry Button */}
            <button className="btn btn-primary new-entry-btn" onClick={() => setShowForm(true)}>
                <PenTool size={20} /> New Journal Entry
            </button>

            {/* Content Grid */}
            <div className="journal-content">
                {/* Entries List */}
                <div className="entries-section">
                    <h3 className="section-title">Past Entries</h3>
                    <div className="entries-list">
                        {entries.length === 0 ? (
                            <div className="no-entries">
                                <span className="no-entries-icon"><Book size={48} /></span>
                                <p>No journal entries yet. Start tracking your progress!</p>
                            </div>
                        ) : (
                            entries.map(entry => {
                                const mood = moodOptions.find(m => m.value === entry.mood);
                                return (
                                    <div
                                        key={entry.id}
                                        className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedEntry(entry)}
                                    >
                                        <div className="entry-header">
                                            <span className="entry-date">
                                                {new Date(entry.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <span className="entry-mood" title={mood?.label}>
                                                {mood?.icon}
                                            </span>
                                        </div>
                                        <p className="entry-preview">
                                            {entry.content.substring(0, 100)}
                                            {entry.content.length > 100 ? '...' : ''}
                                        </p>
                                        <div className="entry-meta">
                                            <span className={`meta-item ${entry.workoutDone ? 'done' : ''}`}>
                                                {entry.workoutDone ? <Check size={14} /> : <X size={14} />} Workout
                                            </span>
                                            <span className="meta-item"><Moon size={14} /> {entry.sleepHours}h</span>
                                            <span className="meta-item"><Droplets size={14} /> {entry.waterIntake}</span>
                                        </div>
                                        {entry.aiAnalysis && (
                                            <div className="entry-score" style={{ borderColor: getScoreColor(entry.aiAnalysis.overallScore) }}>
                                                {entry.aiAnalysis.overallScore}%
                                            </div>
                                        )}
                                        <button
                                            className="delete-entry"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteEntry(entry.id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Analysis Panel */}
                <div className="analysis-section">
                    {selectedEntry ? (
                        <div className="analysis-content animate-fade-in">
                            <div className="analysis-header">
                                <h3><BarChart size={20} /> AI Analysis</h3>
                                <span className="analysis-date">
                                    {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>

                            {selectedEntry.aiAnalysis && (
                                <>
                                    {/* Score */}
                                    <div className="score-display">
                                        <div
                                            className="score-circle"
                                            style={{ borderColor: getScoreColor(selectedEntry.aiAnalysis.overallScore) }}
                                        >
                                            <span className="score-value">{selectedEntry.aiAnalysis.overallScore}</span>
                                            <span className="score-label">Score</span>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="analysis-block">
                                        <h4><FileText size={18} /> Summary</h4>
                                        <p>{selectedEntry.aiAnalysis.summary}</p>
                                    </div>

                                    {/* What went well */}
                                    {selectedEntry.aiAnalysis.positives.length > 0 && (
                                        <div className="analysis-block positives">
                                            <h4><Check size={18} /> What Went Well</h4>
                                            <ul>
                                                {selectedEntry.aiAnalysis.positives.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Areas to improve */}
                                    {selectedEntry.aiAnalysis.improvements.length > 0 && (
                                        <div className="analysis-block improvements">
                                            <h4><Target size={18} /> Areas to Improve</h4>
                                            <ul>
                                                {selectedEntry.aiAnalysis.improvements.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    <div className="analysis-block recommendations">
                                        <h4><Lightbulb size={18} /> Recommendations</h4>
                                        <ul>
                                            {selectedEntry.aiAnalysis.recommendations.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}

                            {/* Full Entry */}
                            <div className="full-entry">
                                <h4><BookOpen size={18} /> Full Entry</h4>
                                <p>{selectedEntry.content}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <span className="no-selection-icon"><ChevronLeft size={48} /></span>
                            <p>Select an entry to view AI analysis</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Entry Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><PenTool size={20} /> New Journal Entry</h3>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="label">How was your day?</label>
                                <div className="mood-selector">
                                    {moodOptions.map(mood => (
                                        <button
                                            key={mood.value}
                                            className={`mood-btn ${formData.mood === mood.value ? 'active' : ''}`}
                                            style={{ '--mood-color': mood.color } as React.CSSProperties}
                                            onClick={() => setFormData({ ...formData, mood: mood.value as JournalEntry['mood'] })}
                                        >
                                            <span className="mood-icon">{mood.icon}</span>
                                            <span className="mood-label">{mood.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">What happened today?</label>
                                <textarea
                                    className="textarea-field"
                                    placeholder="Write about your day, how you felt, what you accomplished..."
                                    rows={5}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Did you workout?</label>
                                    <div className="toggle-group">
                                        <button
                                            className={`toggle-btn ${formData.workoutDone ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, workoutDone: true })}
                                        >
                                            <Check size={16} /> Yes
                                        </button>
                                        <button
                                            className={`toggle-btn ${!formData.workoutDone ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, workoutDone: false })}
                                        >
                                            <X size={16} /> No
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Hours of sleep</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        min="0"
                                        max="24"
                                        value={formData.sleepHours}
                                        onChange={e => setFormData({ ...formData, sleepHours: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Glasses of water</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        min="0"
                                        max="20"
                                        value={formData.waterIntake}
                                        onChange={e => setFormData({ ...formData, waterIntake: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Rocket size={18} />
                                        Save & Analyze
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;

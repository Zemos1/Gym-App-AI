import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbHelpers } from '../lib/supabase';
import { Dumbbell, TrendingDown, CheckCircle, AlertTriangle, AlertCircle, Scale, Rocket, Save, Lock, Calendar, Lightbulb, Flame, Activity } from 'lucide-react';
import './Workout.css';

interface WorkoutPlan {
    title: string;
    description: string;
    bmiCategory: string;
    exercises: Exercise[];
    tips: string[];
    weeklySchedule: DayPlan[];
}

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
    targetMuscle: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface DayPlan {
    day: string;
    focus: string;
    exercises: string[];
}

const Workout = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
    const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [bmi, setBmi] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
    const [showApiInput, setShowApiInput] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const { user } = useAuth();

    const calculateBMI = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (!h || !w) return null;

        let bmiValue: number;
        if (unit === 'metric') {
            // Height in cm, weight in kg
            const heightM = h / 100;
            bmiValue = w / (heightM * heightM);
        } else {
            // Height in inches, weight in pounds
            bmiValue = (w / (h * h)) * 703;
        }

        return Math.round(bmiValue * 10) / 10;
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6', icon: <TrendingDown size={20} /> };
        if (bmi < 25) return { category: 'Normal', color: '#10b981', icon: <CheckCircle size={20} /> };
        if (bmi < 30) return { category: 'Overweight', color: '#f59e0b', icon: <AlertTriangle size={20} /> };
        return { category: 'Obese', color: '#ef4444', icon: <AlertCircle size={20} /> };
    };

    const generateWorkoutWithAI = async () => {
        const calculatedBMI = calculateBMI();
        if (!calculatedBMI) {
            alert('Please enter valid height and weight');
            return;
        }

        setBmi(calculatedBMI);
        setLoading(true);

        const bmiInfo = getBMICategory(calculatedBMI);

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
                                content: 'You are a professional fitness trainer. Generate detailed, personalized workout plans based on BMI and fitness goals. Always respond with valid JSON.'
                            },
                            {
                                role: 'user',
                                content: `Generate a personalized workout plan for someone with:
                - BMI: ${calculatedBMI} (${bmiInfo.category})
                - Goal: ${goal === 'lose' ? 'Lose weight' : goal === 'gain' ? 'Build muscle' : 'Maintain fitness'}
                - Fitness Level: ${fitnessLevel}
                
                Respond with a JSON object containing:
                {
                  "title": "Plan name",
                  "description": "Brief description",
                  "bmiCategory": "${bmiInfo.category}",
                  "exercises": [{"name": "Exercise", "sets": 3, "reps": "10-12", "restSeconds": 60, "targetMuscle": "Muscle", "difficulty": "${fitnessLevel}"}],
                  "tips": ["tip1", "tip2"],
                  "weeklySchedule": [{"day": "Monday", "focus": "Focus area", "exercises": ["ex1", "ex2"]}]
                }`
                            }
                        ],
                        max_tokens: 2000,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
                }

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    const plan = JSON.parse(data.choices[0].message.content);
                    setWorkoutPlan(plan);
                    setSaved(false);
                } else {
                    throw new Error('No valid response from AI');
                }
            } catch (error: any) {
                console.error('OpenAI API error:', error);
                alert(`AI Generation failed: ${error.message}. Falling back to local plan.`);
                // Fall back to generated plan
                setWorkoutPlan(generateLocalPlan(calculatedBMI, bmiInfo.category));
                setSaved(false);
            }
        } else {
            // Generate plan locally without API
            setWorkoutPlan(generateLocalPlan(calculatedBMI, bmiInfo.category));
            setSaved(false);
        }

        setLoading(false);
    };

    const generateLocalPlan = (bmi: number, category: string): WorkoutPlan => {
        const plans: Record<string, WorkoutPlan> = {
            lose: {
                title: 'Fat Burning Program',
                description: `Designed for your BMI of ${bmi} (${category}), this high-intensity program focuses on burning calories while building lean muscle.`,
                bmiCategory: category,
                exercises: [
                    { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', restSeconds: 20, targetMuscle: 'Full Body', difficulty: fitnessLevel },
                    { name: 'Burpees', sets: 3, reps: '10-15', restSeconds: 30, targetMuscle: 'Full Body', difficulty: fitnessLevel },
                    { name: 'Mountain Climbers', sets: 3, reps: '20', restSeconds: 20, targetMuscle: 'Core', difficulty: fitnessLevel },
                    { name: 'High Knees', sets: 3, reps: '30 seconds', restSeconds: 20, targetMuscle: 'Cardio', difficulty: fitnessLevel },
                    { name: 'Squat Jumps', sets: 3, reps: '12', restSeconds: 30, targetMuscle: 'Legs', difficulty: fitnessLevel },
                    { name: 'Plank', sets: 3, reps: '45 seconds', restSeconds: 30, targetMuscle: 'Core', difficulty: fitnessLevel },
                ],
                tips: [
                    'Focus on high-intensity intervals for maximum calorie burn',
                    'Stay hydrated throughout your workout',
                    'Combine with a caloric deficit diet for best results',
                    'Rest 24-48 hours between intense sessions',
                ],
                weeklySchedule: [
                    { day: 'Monday', focus: 'HIIT Cardio', exercises: ['Jumping Jacks', 'Burpees', 'Mountain Climbers'] },
                    { day: 'Tuesday', focus: 'Lower Body', exercises: ['Squats', 'Lunges', 'Squat Jumps'] },
                    { day: 'Wednesday', focus: 'Active Recovery', exercises: ['Light Walking', 'Stretching'] },
                    { day: 'Thursday', focus: 'Upper Body', exercises: ['Push-ups', 'Dips', 'Plank'] },
                    { day: 'Friday', focus: 'Full Body HIIT', exercises: ['Burpees', 'High Knees', 'Mountain Climbers'] },
                    { day: 'Saturday', focus: 'Cardio', exercises: ['Running', 'Jump Rope', 'Cycling'] },
                    { day: 'Sunday', focus: 'Rest', exercises: ['Complete Rest', 'Light Stretching'] },
                ],
            },
            gain: {
                title: 'Muscle Building Program',
                description: `Tailored for your BMI of ${bmi} (${category}), this strength-focused program will help you build lean muscle mass.`,
                bmiCategory: category,
                exercises: [
                    { name: 'Barbell Squats', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Legs', difficulty: fitnessLevel },
                    { name: 'Bench Press', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Chest', difficulty: fitnessLevel },
                    { name: 'Deadlifts', sets: 4, reps: '6-8', restSeconds: 120, targetMuscle: 'Back', difficulty: fitnessLevel },
                    { name: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 60, targetMuscle: 'Shoulders', difficulty: fitnessLevel },
                    { name: 'Pull-ups', sets: 3, reps: '8-12', restSeconds: 60, targetMuscle: 'Back', difficulty: fitnessLevel },
                    { name: 'Barbell Rows', sets: 4, reps: '8-10', restSeconds: 60, targetMuscle: 'Back', difficulty: fitnessLevel },
                ],
                tips: [
                    'Focus on progressive overload - increase weight gradually',
                    'Consume 1.6-2.2g protein per kg of body weight',
                    'Get 7-9 hours of sleep for optimal recovery',
                    'Eat in a slight caloric surplus (300-500 calories)',
                ],
                weeklySchedule: [
                    { day: 'Monday', focus: 'Chest & Triceps', exercises: ['Bench Press', 'Incline Press', 'Dips'] },
                    { day: 'Tuesday', focus: 'Back & Biceps', exercises: ['Deadlifts', 'Pull-ups', 'Rows'] },
                    { day: 'Wednesday', focus: 'Rest', exercises: ['Light Stretching'] },
                    { day: 'Thursday', focus: 'Legs', exercises: ['Squats', 'Leg Press', 'Calf Raises'] },
                    { day: 'Friday', focus: 'Shoulders & Arms', exercises: ['Overhead Press', 'Lateral Raises', 'Curls'] },
                    { day: 'Saturday', focus: 'Full Body', exercises: ['Compound Movements', 'Core Work'] },
                    { day: 'Sunday', focus: 'Rest', exercises: ['Complete Rest', 'Active Recovery'] },
                ],
            },
            maintain: {
                title: 'Balanced Fitness Program',
                description: `Perfect for your BMI of ${bmi} (${category}), this balanced program maintains your current fitness while preventing muscle loss.`,
                bmiCategory: category,
                exercises: [
                    { name: 'Goblet Squats', sets: 3, reps: '12-15', restSeconds: 60, targetMuscle: 'Legs', difficulty: fitnessLevel },
                    { name: 'Push-ups', sets: 3, reps: '15-20', restSeconds: 45, targetMuscle: 'Chest', difficulty: fitnessLevel },
                    { name: 'Dumbbell Rows', sets: 3, reps: '12', restSeconds: 45, targetMuscle: 'Back', difficulty: fitnessLevel },
                    { name: 'Plank', sets: 3, reps: '60 seconds', restSeconds: 30, targetMuscle: 'Core', difficulty: fitnessLevel },
                    { name: 'Lunges', sets: 3, reps: '12 each leg', restSeconds: 45, targetMuscle: 'Legs', difficulty: fitnessLevel },
                    { name: 'Shoulder Press', sets: 3, reps: '12', restSeconds: 45, targetMuscle: 'Shoulders', difficulty: fitnessLevel },
                ],
                tips: [
                    'Maintain consistency - 3-4 workouts per week is ideal',
                    'Mix cardio and strength training for balanced fitness',
                    'Focus on quality of movement over quantity',
                    'Listen to your body and adjust intensity as needed',
                ],
                weeklySchedule: [
                    { day: 'Monday', focus: 'Full Body Strength', exercises: ['Squats', 'Push-ups', 'Rows'] },
                    { day: 'Tuesday', focus: 'Cardio', exercises: ['30min Running', 'Jump Rope'] },
                    { day: 'Wednesday', focus: 'Rest', exercises: ['Light Walking', 'Stretching'] },
                    { day: 'Thursday', focus: 'Upper Body', exercises: ['Push-ups', 'Shoulder Press', 'Rows'] },
                    { day: 'Friday', focus: 'Lower Body', exercises: ['Squats', 'Lunges', 'Calf Raises'] },
                    { day: 'Saturday', focus: 'Active Recovery', exercises: ['Yoga', 'Light Cardio'] },
                    { day: 'Sunday', focus: 'Rest', exercises: ['Complete Rest'] },
                ],
            },
        };

        return plans[goal];
    };

    const saveWorkoutPlan = async () => {
        if (!user || !workoutPlan || !bmi) {
            return;
        }

        setSaving(true);

        const bmiInfo = getBMICategory(bmi);

        const { error } = await dbHelpers.saveWorkoutPlan({
            user_id: user.id,
            title: workoutPlan.title,
            description: workoutPlan.description,
            bmi_category: bmiInfo.category,
            bmi_value: bmi,
            goal: goal,
            fitness_level: fitnessLevel,
            exercises: workoutPlan.exercises,
            tips: workoutPlan.tips,
            weekly_schedule: workoutPlan.weeklySchedule,
        });

        if (!error) {
            setSaved(true);
        } else {
            console.error('Error saving workout plan:', error);
            alert('Failed to save workout plan. Please try again.');
        }

        setSaving(false);
    };

    const bmiInfo = bmi ? getBMICategory(bmi) : null;

    return (
        <div className="workout-page page-container">
            <header className="page-header">
                <h1 className="page-title"><Dumbbell size={32} /> AI Workout Generator</h1>
                <p className="page-subtitle">Generate personalized workout plans based on your BMI and fitness goals</p>
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
                            <Lightbulb size={16} /> Without an API key, workouts are generated locally. Add your key for AI-powered personalization.
                        </p>
                    </div>
                )}
            </div>

            {/* Calculator Section */}
            <div className="calculator-section">
                <div className="calc-card">
                    <h2 className="calc-title">📊 Calculate Your BMI</h2>

                    <div className="unit-toggle">
                        <button
                            className={`unit-btn ${unit === 'metric' ? 'active' : ''}`}
                            onClick={() => setUnit('metric')}
                        >
                            Metric (cm/kg)
                        </button>
                        <button
                            className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`}
                            onClick={() => setUnit('imperial')}
                        >
                            Imperial (in/lbs)
                        </button>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label className="label">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                                value={height}
                                onChange={e => setHeight(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Fitness Goal</label>
                        <div className="goal-selector">
                            <button
                                className={`goal-btn ${goal === 'lose' ? 'active' : ''}`}
                                onClick={() => setGoal('lose')}
                            >
                                <Flame size={24} />
                                <span>Lose Weight</span>
                            </button>
                            <button
                                className={`goal-btn ${goal === 'maintain' ? 'active' : ''}`}
                                onClick={() => setGoal('maintain')}
                            >
                                <Scale size={24} />
                                <span>Maintain</span>
                            </button>
                            <button
                                className={`goal-btn ${goal === 'gain' ? 'active' : ''}`}
                                onClick={() => setGoal('gain')}
                            >
                                <Dumbbell size={24} />
                                <span>Build Muscle</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Fitness Level</label>
                        <div className="level-selector">
                            <button
                                className={`level-btn ${fitnessLevel === 'beginner' ? 'active' : ''}`}
                                onClick={() => setFitnessLevel('beginner')}
                            >
                                Beginner
                            </button>
                            <button
                                className={`level-btn ${fitnessLevel === 'intermediate' ? 'active' : ''}`}
                                onClick={() => setFitnessLevel('intermediate')}
                            >
                                Intermediate
                            </button>
                            <button
                                className={`level-btn ${fitnessLevel === 'advanced' ? 'active' : ''}`}
                                onClick={() => setFitnessLevel('advanced')}
                            >
                                Advanced
                            </button>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary generate-btn"
                        onClick={generateWorkoutWithAI}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Rocket size={20} />
                                Generate Workout Plan
                            </>
                        )}
                    </button>
                </div>

                {/* BMI Result */}
                {bmi && bmiInfo && (
                    <div className="bmi-result">
                        <div className="bmi-display" style={{ borderColor: bmiInfo.color }}>
                            <span className="bmi-icon">{bmiInfo.icon}</span>
                            <span className="bmi-value">{bmi}</span>
                            <span className="bmi-category" style={{ color: bmiInfo.color }}>
                                {bmiInfo.category}
                            </span>
                        </div>
                        <div className="bmi-scale">
                            <div className="scale-segment underweight">
                                <span>Underweight</span>
                                <span>&lt;18.5</span>
                            </div>
                            <div className="scale-segment normal">
                                <span>Normal</span>
                                <span>18.5-24.9</span>
                            </div>
                            <div className="scale-segment overweight">
                                <span>Overweight</span>
                                <span>25-29.9</span>
                            </div>
                            <div className="scale-segment obese">
                                <span>Obese</span>
                                <span>≥30</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Workout Plan Results */}
            {workoutPlan && (
                <div className="workout-results animate-fade-in">
                    <div className="plan-header">
                        <div className="plan-header-top">
                            <h2 className="plan-title">{workoutPlan.title}</h2>
                            <div className="plan-actions">
                                {user ? (
                                    <button
                                        className={`btn ${saved ? 'btn-success' : 'btn-primary'} save-workout-btn`}
                                        onClick={saveWorkoutPlan}
                                        disabled={saving || saved}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner small"></span>
                                                Saving...
                                            </>
                                        ) : saved ? (
                                            <>
                                                <CheckCircle size={18} />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Workout
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <Link to="/login" className="btn btn-secondary">
                                        <Lock size={18} />
                                        Sign in to Save
                                    </Link>
                                )}
                            </div>
                        </div>
                        <p className="plan-description">{workoutPlan.description}</p>
                    </div>

                    {/* Weekly Schedule */}
                    <section className="plan-section">
                        <h3 className="section-title"><Calendar size={24} /> Weekly Schedule</h3>
                        <div className="schedule-grid">
                            {workoutPlan.weeklySchedule.map((day, index) => (
                                <div key={index} className="schedule-day">
                                    <h4 className="day-name">{day.day}</h4>
                                    <span className="day-focus">{day.focus}</span>
                                    <ul className="day-exercises">
                                        {day.exercises.map((exercise, i) => (
                                            <li key={i}>{exercise}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Exercises */}
                    <section className="plan-section">
                        <h3 className="section-title"><Activity size={24} /> Core Exercises</h3>
                        <div className="exercises-grid">
                            {workoutPlan.exercises.map((exercise, index) => (
                                <div key={index} className="exercise-card">
                                    <h4 className="exercise-name">{exercise.name}</h4>
                                    <div className="exercise-details">
                                        <span className="detail">
                                            <strong>Sets:</strong> {exercise.sets}
                                        </span>
                                        <span className="detail">
                                            <strong>Reps:</strong> {exercise.reps}
                                        </span>
                                        <span className="detail">
                                            <strong>Rest:</strong> {exercise.restSeconds}s
                                        </span>
                                    </div>
                                    <span className="exercise-muscle">{exercise.targetMuscle}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tips */}
                    <section className="plan-section">
                        <h3 className="section-title"><Lightbulb size={24} /> Pro Tips</h3>
                        <div className="tips-list">
                            {workoutPlan.tips.map((tip, index) => (
                                <div key={index} className="tip-item">
                                    <span className="tip-number">{index + 1}</span>
                                    <p>{tip}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Workout;

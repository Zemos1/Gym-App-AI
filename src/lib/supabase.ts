import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Add your Supabase URL and Anon Key to .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface WorkoutPlanRecord {
    id?: string;
    user_id: string;
    title: string;
    description: string;
    bmi_category: string;
    bmi_value: number;
    goal: 'lose' | 'maintain' | 'gain';
    fitness_level: 'beginner' | 'intermediate' | 'advanced';
    exercises: Exercise[];
    tips: string[];
    weekly_schedule: DayPlan[];
    created_at?: string;
    updated_at?: string;
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
    targetMuscle: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface DayPlan {
    day: string;
    focus: string;
    exercises: string[];
}

export interface ScheduleRecord {
    id?: string;
    user_id: string;
    date: string;
    scheduled_days: ScheduledDay[];
    created_at?: string;
    updated_at?: string;
}

export interface ScheduledDay {
    day: string;
    isScheduled: boolean;
    exercises: string[];
    notes?: string;
}

export interface JournalRecord {
    id?: string;
    user_id: string;
    date: string;
    workout_completed: boolean;
    mood: number;
    energy_level: number;
    notes: string;
    exercises_logged: ExerciseLog[];
    created_at?: string;
}

export interface ExerciseLog {
    name: string;
    sets_completed: number;
    reps_completed: string;
    weight?: number;
    notes?: string;
}

// Auth helper functions
export const authHelpers = {
    // Sign up with email and password
    async signUp(email: string, password: string, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || '',
                },
            },
        });
        return { data, error };
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Reset password (sends email)
    async resetPassword(email: string) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { data, error };
    },

    // Update password (after reset)
    async updatePassword(newPassword: string) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        return { data, error };
    },

    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },
};

// Database helper functions
export const dbHelpers = {
    // Workout Plans
    async saveWorkoutPlan(plan: Omit<WorkoutPlanRecord, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('workout_plans')
            .insert(plan)
            .select()
            .single();
        return { data, error };
    },

    async getWorkoutPlans(userId: string) {
        const { data, error } = await supabase
            .from('workout_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async getLatestWorkoutPlan(userId: string) {
        const { data, error } = await supabase
            .from('workout_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        return { data, error };
    },

    async deleteWorkoutPlan(planId: string) {
        const { error } = await supabase
            .from('workout_plans')
            .delete()
            .eq('id', planId);
        return { error };
    },

    // Schedule
    async saveSchedule(schedule: Omit<ScheduleRecord, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('schedules')
            .upsert(schedule, { onConflict: 'user_id,date' })
            .select()
            .single();
        return { data, error };
    },

    async getSchedules(userId: string, startDate?: string, endDate?: string) {
        let query = supabase
            .from('schedules')
            .select('*')
            .eq('user_id', userId);

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query.order('date', { ascending: false });
        return { data, error };
    },

    // Journal
    async saveJournalEntry(entry: Omit<JournalRecord, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('journal_entries')
            .upsert(entry, { onConflict: 'user_id,date' })
            .select()
            .single();
        return { data, error };
    },

    async getJournalEntries(userId: string, limit: number = 30) {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    async getJournalEntry(userId: string, date: string) {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .single();
        return { data, error };
    },
};

-- ============================================
-- GymFlow Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Workout Plans Table
-- ============================================
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    bmi_category TEXT NOT NULL,
    bmi_value NUMERIC(4,1) NOT NULL,
    goal TEXT NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
    fitness_level TEXT NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    tips JSONB NOT NULL DEFAULT '[]'::jsonb,
    weekly_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_created_at ON workout_plans(created_at DESC);

-- Enable Row Level Security
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own workout plans
CREATE POLICY "Users can view own workout plans" ON workout_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own workout plans
CREATE POLICY "Users can insert own workout plans" ON workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workout plans
CREATE POLICY "Users can update own workout plans" ON workout_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own workout plans
CREATE POLICY "Users can delete own workout plans" ON workout_plans
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. Schedules Table
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    scheduled_days JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date DESC);

-- Enable Row Level Security
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own schedules
CREATE POLICY "Users can view own schedules" ON schedules
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own schedules
CREATE POLICY "Users can insert own schedules" ON schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own schedules
CREATE POLICY "Users can update own schedules" ON schedules
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own schedules
CREATE POLICY "Users can delete own schedules" ON schedules
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. Journal Entries Table
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout_completed BOOLEAN DEFAULT FALSE,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    notes TEXT,
    exercises_logged JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own journal entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own journal entries
CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own journal entries
CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. Create Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to workout_plans
DROP TRIGGER IF EXISTS update_workout_plans_updated_at ON workout_plans;
CREATE TRIGGER update_workout_plans_updated_at
    BEFORE UPDATE ON workout_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to schedules
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Success Message
-- ============================================
-- If you see this, all tables were created successfully!
-- Make sure to configure your environment variables:
-- VITE_SUPABASE_URL=https://your-project.supabase.co
-- VITE_SUPABASE_ANON_KEY=your-anon-key

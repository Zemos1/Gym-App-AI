# 🏋️ GymFlow - AI-Powered Fitness Companion

A modern, responsive fitness application built with React, TypeScript, and Vite. Features AI-powered workout generation, user authentication, and cloud-based data storage with Supabase.

## ✨ Features

- **🤖 AI Workout Generator** - Generate personalized workout plans based on your BMI, fitness goals, and experience level
- **📅 Schedule Manager** - Plan and organize your weekly workout schedule
- **📝 Fitness Journal** - Track your progress with daily workout logs
- **🔐 User Authentication** - Secure signup, login, logout, and password reset with Supabase Auth
- **💾 Cloud Storage** - Save your workout plans and access them from any device
- **📂 Workout History** - View and manage all your saved workout plans
- **🌙 Dark/Light Mode** - Beautiful theme switching with green accent dark mode
- **📱 Fully Responsive** - Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account (free tier works great!)

### 1. Clone and Install

```bash
# Navigate to the project directory
cd gym-app

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase-schema.sql` to create the required tables
3. Go to **Settings → API** and copy your:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon/public key**

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# OpenAI API Key (optional - for AI-powered workout generation)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (required for auth and data storage)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📁 Project Structure

```
gym-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx    # Main app layout with navbar
│   │   ├── Layout.css
│   │   └── ProtectedRoute.tsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ThemeContext.tsx   # Theme management
│   ├── lib/             # Utility libraries
│   │   └── supabase.ts  # Supabase client & helpers
│   ├── pages/           # Page components
│   │   ├── Auth.tsx     # Login/Signup/Reset password
│   │   ├── Home.tsx     # Landing page
│   │   ├── Workout.tsx  # AI workout generator
│   │   ├── Schedule.tsx # Weekly schedule manager
│   │   ├── Journal.tsx  # Fitness journal
│   │   └── SavedWorkouts.tsx  # Workout history
│   ├── App.tsx          # Main app with routes
│   ├── index.css        # Global styles
│   └── main.tsx         # App entry point
├── supabase-schema.sql  # Database schema
├── .env.example         # Environment template
└── package.json
```

## 🗄️ Database Schema

The app uses three main tables in Supabase:

| Table | Purpose |
|-------|---------|
| `workout_plans` | Stores generated workout plans with exercises, tips, and schedules |
| `schedules` | Stores weekly workout schedules |
| `journal_entries` | Stores daily fitness journal entries |

All tables have Row Level Security (RLS) enabled - users can only access their own data.

## 🔐 Authentication Features

- **Sign Up** - Create account with email and password
- **Sign In** - Login with email and password
- **Forgot Password** - Send password reset email
- **Reset Password** - Set new password from email link
- **Sign Out** - Logout from the app

## 🎨 Design System

- **Light Mode** - Clean blue/purple gradient accents
- **Dark Mode** - Sleek design with vibrant green (#00ff88) outline accents
- **Typography** - Inter font family
- **Responsive** - Mobile-first design approach

## 📦 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS with CSS Variables
- **Routing**: React Router v7
- **Backend**: Supabase (Auth + PostgreSQL)
- **AI**: OpenAI API (optional)

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📝 License

MIT License - feel free to use this project for learning or personal use!

---

Built with ❤️ using React + TypeScript + Vite + Supabase

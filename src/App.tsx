import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Workout from './pages/Workout';
import Journal from './pages/Journal';
import Auth from './pages/Auth';
import SavedWorkouts from './pages/SavedWorkouts';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/forgot-password" element={<Auth />} />
            <Route path="/reset-password" element={<Auth />} />

            {/* Main App Routes - With Layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
            <Route path="/workout" element={<Layout><Workout /></Layout>} />
            <Route path="/journal" element={<Layout><Journal /></Layout>} />
            <Route path="/saved-workouts" element={<Layout><SavedWorkouts /></Layout>} />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import PredictionStats from './pages/PredictionStats';
import AuthGuard from './guards/AuthGuard';
import ScrollToTop from './components/ScrollToTop';
import Posts from './pages/Posts';

const App = () => {
  return (
    <AuthProvider>
      <Router>
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <AuthGuard>
                <LeaderboardPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/stats" 
            element={
              <AuthGuard>
                <PredictionStats />
              </AuthGuard>
            } 
          />
          <Route 
            path="/posts" 
            element={
              <AuthGuard>
                <Posts />
              </AuthGuard>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
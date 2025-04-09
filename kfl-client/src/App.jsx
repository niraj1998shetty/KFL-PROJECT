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
import TopBar from './components/TopBar';
import Sidebar from './components/SideBar';
import Footer from './components/Footer';

// Layout component for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 pt-16 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-gray-100 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

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
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </AuthGuard>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <AuthGuard>
                <AppLayout>
                  <LeaderboardPage />
                </AppLayout>
              </AuthGuard>
            } 
          />
          <Route 
            path="/stats" 
            element={
              <AuthGuard>
                <AppLayout>
                  <PredictionStats />
                </AppLayout>
              </AuthGuard>
            } 
          />
          <Route 
            path="/posts" 
            element={
              <AuthGuard>
                <AppLayout>
                  <Posts />
                </AppLayout>
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
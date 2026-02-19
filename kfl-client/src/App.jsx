import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import PredictionStats from './pages/PredictionStats';
import TeamsPlayersPage from './pages/TeamsPlayersPage';
import MatchResultsPage from './pages/MatchResultsPage';
import ProfilePage from './pages/ProfilePage';
import AuthGuard from './guards/AuthGuard';
import ScrollToTop from './components/ScrollToTop';
import Posts from './pages/Posts';
import TopBar from './components/TopBar';
import Sidebar from './components/SideBar';
import Footer from './components/Footer';
import UsersPage from './pages/UsersPage';


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
const PageLayout = ({ children, pageTitle, showProfile = false, showBackButton = false, onBackClick = null }) => {
  return (
    <div className="flex flex-col h-screen">
      <TopBar 
        pageTitle={pageTitle}
        showProfile={showProfile}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
      />
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          <Route
            path="/teams-players"
            element={
              <AuthGuard>
                <AppLayout>
                  <TeamsPlayersPage />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/match-results"
            element={
              <AuthGuard>
                <PageLayout pageTitle="IPL Results" showBackButton={true}>
                  <MatchResultsPage />
                 </PageLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/users"
            element={
              <AuthGuard>
               <PageLayout showProfile={true}>
                  <UsersPage />
                 </PageLayout>
              </AuthGuard>
            }
          />

          <Route
            path="/profile"
            element={
              <AuthGuard>
               <PageLayout showProfile={true}>
                  <ProfilePage />
               </PageLayout>
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
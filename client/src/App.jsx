import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminSystemAnalytics from './pages/AdminSystemAnalytics';
import UserFeedback from './pages/UserFeedback';
import AdminMessages from './pages/AdminMessages';
import DashboardLayout from './components/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { darkMode, primaryColor, compactMode, borderRadius } = useTheme();

  const getAlgorithm = () => {
    const algorithms = [darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm];
    if (compactMode) algorithms.push(theme.compactAlgorithm);
    return algorithms;
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: getAlgorithm(),
        token: {
          colorPrimary: primaryColor,
          borderRadius: borderRadius,
          fontFamily: "'Inter', sans-serif",
          // Only set bases if NOT in dark mode, or let algorithm handle it
          ...(darkMode ? {} : {
            colorBgBase: '#ffffff',
            colorTextBase: '#0f172a',
          })
        },
      }}
    >
      <Router>
        <div className="w-full">
          <Routes>
            {/* Public Routes with Navbar/Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth Routes (Standalone) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

            {/* Dashboard Routes (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="feedback" element={<UserFeedback />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/system-analytics" element={<AdminSystemAnalytics />} />
              <Route path="admin/messages" element={<AdminMessages />} />
              <Route path="admin/analytics/:userId" element={<Analytics />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

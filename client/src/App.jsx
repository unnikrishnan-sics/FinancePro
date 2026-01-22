import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5', // Indigo-600
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
          colorBgBase: '#ffffff',
          colorTextBase: '#0f172a',
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

            {/* Dashboard Routes (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<div className="p-4 text-center">Transactions Page (Coming Soon)</div>} />
              <Route path="analytics" element={<div className="p-4 text-center">Analytics Page (Coming Soon)</div>} />
              <Route path="settings" element={<div className="p-4 text-center">Settings Page (Coming Soon)</div>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;

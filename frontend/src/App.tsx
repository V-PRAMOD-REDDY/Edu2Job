import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import JobPredictionPage from "./pages/JobPredictionPage";
import UserAnalyticsPage from "./pages/UserAnalyticsPage";
// 1. IMPORT GROUPS PAGE
import GroupsPage from "./pages/GroupsPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminTrainingDataPage from "./pages/AdminTrainingDataPage";
import AdminUsersPage from "./pages/AdminUsersPage"; 
import AdminModelPage from "./pages/AdminModelPage"; 
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage"; 

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* --- ROOT REDIRECT --- */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User + Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/predict" element={<JobPredictionPage />} />
            <Route path="/my-analytics" element={<UserAnalyticsPage />} />
            
            {/* 2. ADD GROUPS ROUTE HERE */}
            <Route path="/groups" element={<GroupsPage />} />
          </Route>

          {/* Admin-only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/training-data" element={<AdminTrainingDataPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/model" element={<AdminModelPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
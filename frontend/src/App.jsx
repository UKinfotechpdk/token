import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Staff Pages
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';

// Consultant Pages
import ConsultantLogin from './pages/consultant/ConsultantLogin';
import ConsultantApp from './ConsultantApp';

// User/Customer Pages
import UserLogin from './pages/user/UserLogin';
import UserDashboard from './pages/user/UserDashboard';
import Register from './pages/Register';
import BranchList from './pages/user/BranchList';
import ScheduleList from './pages/user/ScheduleList';
import PaymentPage from './pages/user/PaymentPage';
import TokenSuccess from './pages/user/TokenSuccess';
import KioskBookingFlow from './pages/user/KioskBookingFlow';

// Other

import QueueDisplayBoard from './components/QueueDisplayBoard';
import { checkAuth, logout } from './api/api';

export default function App() {
    const [user, setUser] = useState(() => {
        // Detect role from URL for initial state
        const path = window.location.pathname;
        let role = 'user'; // default
        if (path.startsWith('/admin')) role = 'admin';
        else if (path.startsWith('/staff')) role = 'staff';
        else if (path.startsWith('/consultant')) role = 'consultant';
        const userKey = `${role}_user`;

        const saved = localStorage.getItem(userKey) || localStorage.getItem('user');
        if (!saved) return null;
        try {
            const u = JSON.parse(saved);
            if (u && u.role) {
                u.role = u.role.toLowerCase();
                if (u.role === 'customer') u.role = 'user';
            }
            return u;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const res = await checkAuth();
                if (res.data.authenticated) {
                    const authenticatedUser = res.data.user;
                    if (authenticatedUser.role) {
                        authenticatedUser.role = authenticatedUser.role.toLowerCase();
                        if (authenticatedUser.role === 'customer') authenticatedUser.role = 'user';
                    }
                    setUser(authenticatedUser);
                    localStorage.setItem(`${authenticatedUser.role}_user`, JSON.stringify(authenticatedUser));
                } else {
                    // Only clear the session for the current path's role
                    const path = window.location.pathname;
                    let currentRole = 'user';
                    if (path.startsWith('/admin')) currentRole = 'admin';
                    else if (path.startsWith('/staff')) currentRole = 'staff';
                    else if (path.startsWith('/consultant')) currentRole = 'consultant';

                    localStorage.removeItem(`${currentRole}_user`);
                    localStorage.removeItem(`${currentRole}_token`);
                    setUser(null);
                }
            } catch (err) {
                console.error('Auth verification failed');
            } finally {
                setLoading(false);
            }
        };
        verifyAuth();
    }, []);

    const handleLogout = async () => {
        const role = user?.role || 'user';
        try {
            await logout();
        } catch (err) {
            console.warn('Backend logout failed, clearing local session anyway');
        } finally {
            localStorage.removeItem(`${role}_user`);
            localStorage.removeItem(`${role}_token`);
            setUser(null);
            window.location.href = `/${role}/login`;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-dark)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public / Generic Routes */}
                <Route path="/login" element={<UserLogin onLogin={setUser} onSwitch={() => window.location.href = '/register'} />} />
                <Route path="/user/login" element={<UserLogin onLogin={setUser} onSwitch={() => window.location.href = '/register'} />} />
                <Route path="/register" element={<Register onSwitch={() => window.location.href = '/login'} onBack={() => window.location.href = '/login'} />} />

                <Route path="/display" element={<QueueDisplayBoard />} />

                {/* Role-Specific Login Routes (Direct Entry) */}
                <Route path="/admin/login" element={<AdminLogin onLogin={setUser} />} />
                <Route path="/staff/login" element={<StaffLogin onLogin={setUser} />} />
                <Route path="/consultant/login" element={<ConsultantLogin onLogin={setUser} />} />

                {/* Protected Admin Routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute role="admin" user={user}>
                        <AdminDashboard user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                } />

                {/* Protected Staff Routes */}
                <Route path="/staff/*" element={
                    <ProtectedRoute role="staff" user={user}>
                        <StaffDashboard user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                } />

                {/* Protected Consultant Routes */}
                <Route path="/consultant/*" element={
                    <ProtectedRoute role="consultant" user={user}>
                        <ConsultantApp user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                } />

                {/* Protected User Routes */}
                <Route path="/user/*" element={
                    <ProtectedRoute role="user" user={user}>
                        <Navbar user={user} onLogout={handleLogout} />
                        <Routes>
                            <Route path="dashboard" element={<UserDashboard user={user} onLogout={handleLogout} />} />
                            <Route path="book-token/*" element={<KioskBookingFlow />} />
                            <Route path="my-tokens" element={<UserDashboard user={user} onLogout={handleLogout} initialView="tokens" />} />
                            <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                <Route path="/book-token" element={<Navigate to="/user/book-token/branches" replace />} />
                <Route path="/my-tokens" element={<Navigate to="/user/my-tokens" replace />} />

                {/* Default Redirect Logic based on role */}
                <Route path="/" element={
                    user ? (
                        user.role === 'admin' ? <Navigate to="/admin" replace /> :
                            user.role === 'staff' ? <Navigate to="/staff" replace /> :
                                user.role === 'consultant' ? <Navigate to="/consultant" replace /> :
                                    <Navigate to="/user/dashboard" replace />
                    ) : <Navigate to="/login" replace />
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

import React, { useState } from 'react';
import ConsultantDashboard from './components/consultant/ConsultantDashboard';

export default function ConsultantApp({ user, onLogout }) {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top header - Premium Medical Blue Navbar */}
            <header className="top-header premium-navbar">
                {/* Brand / Left Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}>
                    <span style={{ fontSize: '26px' }}>🏢</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
                            Service Portal
                        </h2>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.72)', fontWeight: '500' }}>
                            Welcome, {user?.name || 'Consultant'} 👋
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'rgba(255,255,255,0.15)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '14px', color: '#ffffff'
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: '8px 20px',
                            fontSize: '13px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.22)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        Sign Out 🚪
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content" style={{ flex: 1, padding: '24px' }}>
                <ConsultantDashboard consultant={user} onToast={showToast} />
            </main>

            {/* Toast Notifications */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>
                        {toast.type === 'success' ? '✓' : 'ℹ'} {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}

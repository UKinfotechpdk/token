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
            {/* Top header - Premium Glassmorphism */}
            <header className="top-header" style={{
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🏢</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            Service <span className="highlight" style={{ color: 'var(--primary)' }}>Portal</span>
                        </h2>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {user?.name || 'Staff'} | Dashboard
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: '800' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={onLogout} style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '10px', fontWeight: '700' }}>
                        Sign Out
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

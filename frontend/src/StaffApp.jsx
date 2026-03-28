import React, { useState } from 'react';
import StaffDashboard from './components/staff/StaffDashboard';
import StaffTokenSystem from './components/staff/StaffTokenSystem';
import StaffAssignToken from './components/staff/StaffAssignToken';
import StaffPrintToken from './components/staff/StaffPrintToken';
import StaffLiveDisplay from './components/staff/StaffLiveDisplay';
import StaffDailySummary from './components/staff/StaffDailySummary';

export default function StaffApp({ user, onLogout }) {
    const [activeView, setActiveView] = useState('dashboard');
    const [activeViewData, setActiveViewData] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleNavigate = (view, data = null) => {
        setActiveView(view);
        setActiveViewData(data);
    };

    const renderView = () => {
        const props = { staff: user, onToast: showToast, onNavigate: handleNavigate, initialData: activeViewData };
        switch (activeView) {
            case 'tokensystem': return <StaffTokenSystem {...props} />;
            case 'assigntoken': return <StaffAssignToken {...props} />;
            case 'printtoken': return <StaffPrintToken {...props} />;
            case 'livedisplay': return <StaffLiveDisplay {...props} />;
            case 'dailysummary': return <StaffDailySummary {...props} />;
            case 'dashboard':
            default:
                return <StaffDashboard {...props} />;
        }
    };

    // Live display is fullscreen
    if (activeView === 'livedisplay') {
        return <StaffLiveDisplay staff={user} onToast={showToast} onNavigate={handleNavigate} />;
    }

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="top-header premium-navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => handleNavigate('dashboard')}>
                    <span style={{ fontSize: '24px' }}>🏢</span>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                            Service Hub <span className="highlight" style={{ color: '#bae6fd' }}>Staff</span>
                        </h1>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: '2px' }}>
                            {user?.branch_name || 'All Branches'} Office
                        </p>
                    </div>
                </div>

                <div className="header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'rgba(255,255,255,0.15)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.2)' }}>
                            {user?.staff_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>{user?.staff_name}</span>
                            <span style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>Staff Member</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {activeView !== 'dashboard' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleNavigate('dashboard')} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <span>🏠</span> <span className="hide-on-mobile">Dashboard</span>
                            </button>
                        )}
                        <button className="btn btn-primary btn-sm sign-out-btn" onClick={onLogout} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0284c7', color: '#ffffff', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                            <span className="hide-text-mobile">Sign Out</span> <span className="door-icon" style={{ marginLeft: '6px' }}>🚪</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {renderView()}
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

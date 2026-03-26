import React, { useState, useCallback } from 'react';
import Dashboard from '../../components/admin/Dashboard';
import BranchModule from '../../components/admin/BranchModule';
import StaffModule from '../../components/admin/StaffModule';
import ScheduleModule from '../../components/admin/ScheduleModule';
import PaymentModule from '../../components/admin/PaymentModule';
import ConsultantModule from '../../components/admin/ConsultantModule';

const AdminDashboard = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((msg, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const renderContent = () => {
        const props = { onToast: addToast, onNavigate: setCurrentView };
        switch (currentView) {
            case 'dashboard': return <Dashboard onNavigate={setCurrentView} onToast={addToast} />;
            case 'branches': return <BranchModule {...props} />;
            case 'staff': return <StaffModule {...props} />;
            case 'consultants': return <ConsultantModule {...props} />;
            case 'schedules': return <ScheduleModule {...props} />;
            case 'payments': return <PaymentModule {...props} />;
            default: return <Dashboard onNavigate={setCurrentView} onToast={addToast} />;
        }
    };

    const brandRef = React.useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div className="app-container">
            <header
                className="top-header premium-navbar"
                onMouseMove={handleMouseMove}
            >
                {/* Mouse Follow Glow */}
                <div
                    className="nav-glow-cursor"
                    style={{
                        left: mousePos.x,
                        top: mousePos.y,
                        opacity: mousePos.x === 0 ? 0 : 1
                    }}
                />

                <div className="brand-section" onClick={() => setCurrentView('dashboard')}>
                    <span className="brand-icon-animated">🚀</span>
                    <h1 className="brand-text-premium">Service Hub Admin</h1>
                </div>

                <div className="header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 10 }}>
                    {/* System Status */}
                    <div className="status-indicator">
                        <div className="dot-pulse"></div>
                        <span>System Online</span>
                        <div className="premium-tooltip">System running smoothly</div>
                    </div>

                    <div className="header-user-info" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="avatar-wrapper">
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <button
                        className="pill-logout"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const ripple = document.createElement('span');
                            ripple.className = 'ripple';
                            ripple.style.left = `${e.clientX - rect.left}px`;
                            ripple.style.top = `${e.clientY - rect.top}px`;
                            e.currentTarget.appendChild(ripple);
                            setTimeout(() => ripple.remove(), 600);
                            setTimeout(onLogout, 300);
                        }}
                    >
                        <span>Sign Out</span>
                        <span style={{ marginLeft: '8px', fontSize: '16px' }}>🚪</span>
                    </button>
                </div>
            </header>

            <main className="main-content">
                {renderContent()}
            </main>

            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        {t.type === 'success' ? '✓' : 'ℹ'} {t.msg}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;

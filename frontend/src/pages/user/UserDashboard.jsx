import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyTokens from '../MyTokens';
import { getPublicSchedules, getPublicBranches } from '../../api/api';
import { usePolling } from '../../hooks/usePolling';
import QueueStatusCard from '../../components/user/QueueStatusCard';

export default function UserDashboard({ user, onLogout, initialView = 'menu' }) {
    const [activeView, setActiveView] = useState(initialView);
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();

    const fetchTodaySchedules = async () => {
        try {
            const res = await getPublicSchedules();
            setTodaySchedules(res.data);
        } catch (err) {
            console.error('Failed to fetch today\'s schedules');
        }
    };

    const fetchBranches = async () => {
        try {
            const res = await getPublicBranches();
            setBranches(res.data);
        } catch (err) {
            console.error('Failed to fetch branches');
        }
    };

    usePolling(() => {
        if (activeView === 'menu' || activeView === 'status') {
            fetchTodaySchedules();
        }
    }, 5000);

    useEffect(() => {
        fetchBranches();
        fetchTodaySchedules();
    }, []);

    useEffect(() => {
        if (initialView) {
            setActiveView(initialView);
        }
    }, [initialView]);

    const renderView = () => {
        switch (activeView) {
            case 'book':
                navigate('/user/book-token/branches');
                return null;
            case 'tokens':
                return <MyTokens onBack={() => setActiveView('menu')} />;
            case 'status':
                return (
                    <div className="status-view">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Live Queue Overview</h2>
                            <button className="btn btn-secondary btn-sm" onClick={() => setActiveView('menu')}>Back to Dashboard</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {todaySchedules.length > 0 ? (
                                todaySchedules.map(sched => (
                                    <QueueStatusCard
                                        key={sched.schedule_id}
                                        scheduleId={sched.schedule_id}
                                        scheduleName={sched.service_name || "General Service"}
                                        branchName={sched.branch_name}
                                    />
                                ))
                            ) : (
                                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕒</div>
                                    <h3>No Active Services</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Check back during business hours.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="glass-card" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '100px', height: '100px', background: 'var(--grad-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 16px' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Account Profile</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</div>
                                <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-main)' }}>{user?.name}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Account Role</div>
                                <div style={{ fontWeight: '700', fontSize: '18px', textTransform: 'capitalize', color: 'var(--text-main)' }}>{user?.role} Access</div>
                            </div>
                            <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Security</div>
                                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>Password Protected</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <button className="btn btn-secondary btn-full" onClick={() => setActiveView('menu')}>Return to Dashboard</button>
                        </div>
                    </div>
                );
            default:
                return (
                    <main>
                        {/* Quick Pulse / Active Token Banner if any */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                            <div className="glass-card dash-card card-analytics" style={{ padding: '32px' }} onClick={() => navigate('/user/book-token/branches')}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="card-icon-box">📅</div>
                                    <div style={{ marginLeft: '24px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '4px' }}>Book Token</h3>
                                        <p style={{ fontSize: '14px', opacity: 0.9 }}>Get your spot in seconds</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card dash-card card-activity" style={{ padding: '32px' }} onClick={() => setActiveView('tokens')}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="card-icon-box">🎟️</div>
                                    <div style={{ marginLeft: '24px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '4px' }}>My Tokens</h3>
                                        <p style={{ fontSize: '14px', opacity: 0.9 }}>Active & past bookings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card dash-card card-revenue" style={{ padding: '32px' }} onClick={() => setActiveView('status')}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="card-icon-box">📊</div>
                                    <div style={{ marginLeft: '24px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '4px' }}>Live Queues</h3>
                                        <p style={{ fontSize: '14px', opacity: 0.9 }}>Check real-time wait times</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Removed Discovery and Quick Tip sections as per user request */}
                    </main>
                );
        }
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <main className="main-content">
                <section className="welcome-banner" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                    <div className="welcome-text">
                        <h2 className="welcome-title">
                            Hello, <span className="highlight-text">{user?.name?.split(' ')[0] || 'User'}</span> 👋
                        </h2>
                        <p className="welcome-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>
                            Your Service Hub Portal is ready. Select an action below.
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Account</div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(37, 99, 235, 0.25)', padding: '12px 24px', borderRadius: '16px', backdropFilter: 'blur(10px)', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-all', display: 'inline-block' }}>
                            {user?.email || (user?.name ? `${user.name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'user@example.com')}
                        </div>
                    </div>
                </section>

                {renderView()}
            </main>
        </div>
    );
}

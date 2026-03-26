import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api/api';
import { usePolling } from '../../hooks/usePolling';

export default function ConsultantDashboard({ consultant, onToast }) {
    const [schedules, setSchedules] = useState([]);
    const [tokensBySchedule, setTokensBySchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // stores token_id of acting token
    const [isAway, setIsAway] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
    const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, icon }
    const [activeScheduleId, setActiveScheduleId] = useState(null);

    const _d = new Date();
    const todayStr = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;

    const animations = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUpScale {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
    `;

    // Monitoring network status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const schedRes = await api.getMySchedules();
            const mySchedules = schedRes.data;
            setSchedules(mySchedules);

            const newTokenData = {};
            for (const sched of mySchedules) {
                try {
                    const tokenRes = await api.getTokens(sched.schedule_id);
                    newTokenData[sched.schedule_id] = tokenRes.data;
                } catch (e) {
                    newTokenData[sched.schedule_id] = [];
                }
            }
            setTokensBySchedule(newTokenData);
            setConsecutiveErrors(0);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
            setConsecutiveErrors(prev => prev + 1);
            if (err.response?.status !== 401) {
                onToast('Sync error. Retrying...', 'error');
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [onToast]);

    // Analytics Calculation
    const allTokens = Object.values(tokensBySchedule).flat();
    const servedTokens = allTokens.filter(t => t.status === 'Completed' && t.serving_started_at && t.completed_at);

    let avgServiceMinutes = 0;
    if (servedTokens.length > 0) {
        const totalMs = servedTokens.reduce((acc, t) => {
            const start = new Date(t.serving_started_at);
            const end = new Date(t.completed_at);
            return acc + (end - start);
        }, 0);
        avgServiceMinutes = Math.round((totalMs / servedTokens.length) / 60000);
    }

    const stats = {
        totalServed: allTokens.filter(t => t.status === 'Completed').length,
        pending: allTokens.filter(t => t.status === 'Booked').length,
        activeSchedules: schedules.filter(s => s.status !== 'Completed').length,
        avgTime: avgServiceMinutes || 5,
        nextCustomer: allTokens
            .filter(t => t.status === 'Booked')
            .sort((a, b) => new Date(`1970-01-01T${a.time_slot.split(' - ')[0]}`) - new Date(`1970-01-01T${b.time_slot.split(' - ')[0]}`))[0]
    };

    // Detect new tokens for visual/sound alert
    useEffect(() => {
        const totalPending = Object.values(tokensBySchedule).flat().filter(t => t.status === 'Booked').length;
        if (totalPending > (stats.pending || 0)) {
            // New token arrived
            onToast('New customer checked in!', 'success');
            // Potential for sound alert here: new Audio('/alert.mp3').play();
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
            } catch (e) { }
        }
    }, [tokensBySchedule, stats.pending, onToast]);

    // Real-time polling every 6 seconds
    usePolling(() => fetchData(false), 6000);

    const getIsLive = (sched) => {
        if (!sched) return false;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = sched.start_time.split(':').map(Number);
        const [endH, endM] = sched.end_time.split(':').map(Number);
        const start = startH * 60 + startM;
        const end = endH * 60 + endM;
        return sched.date === todayStr && currentTime >= start && currentTime <= end;
    };

    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    const handleTokenAction = async (tokenId, scheduleId, newStatus) => {
        showConfirm(
            `Confirm ${newStatus}`,
            `Are you sure you want to mark this token as ${newStatus}?`,
            newStatus === 'Completed' ? '✅' : '⏭️',
            async () => {
                setActionLoading(tokenId);
                try {
                    await api.updateTokenStatus(tokenId, { status: newStatus });
                    onToast(`Token ${newStatus}`, 'success');
                    await fetchData(false);
                } catch (err) {
                    onToast('Failed to update token', 'error');
                } finally {
                    setActionLoading(null);
                    setConfirmModal(null);
                }
            }
        );
    };

    const callNextToken = async (scheduleId) => {
        const schedTokens = tokensBySchedule[scheduleId] || [];
        const currentServing = schedTokens.find(t => t.status === 'Serving');
        const nextBooked = schedTokens.find(t => t.status === 'Booked');

        const action = async () => {
            try {
                // Sound play for calling
                try { new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3').play().catch(e => { }); } catch (e) { }

                if (currentServing) {
                    await api.updateTokenStatus(currentServing.token_id, { status: 'Completed' });
                }
                if (nextBooked) {
                    await api.updateTokenStatus(nextBooked.token_id, { status: 'Serving' });
                    onToast(`Serving Token: ${nextBooked.token_number}`, 'success');
                } else {
                    onToast('No customers waiting in queue', 'info');
                    try { new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(e => { }); } catch (e) { }
                }
                fetchData(false);
            } catch (err) {
                onToast('Failed to call next token', 'error');
            } finally {
                setConfirmModal(null);
            }
        };

        if (currentServing || nextBooked) {
            showConfirm(
                'Call Next Token',
                currentServing ? `Complete Token ${currentServing.token_number} and call next?` : 'Call the next customer in queue?',
                '📢',
                action
            );
        } else {
            onToast('No customers waiting in queue', 'info');
        }
    };

    const showConfirm = (title, message, icon, onConfirm) => {
        setConfirmModal({ title, message, icon, onConfirm });
    };

    const callPreviousToken = async (scheduleId) => {
        const schedTokens = tokensBySchedule[scheduleId] || [];
        const currentServing = schedTokens.find(t => t.status === 'Serving');

        // Find the absolute last completed token by sorting by completion time
        const completedTokens = schedTokens
            .filter(t => t.status === 'Completed')
            .sort((a, b) => new Date(a.completed_at || 0) - new Date(b.completed_at || 0));

        const lastCompleted = completedTokens[completedTokens.length - 1];

        if (!lastCompleted) {
            onToast('No previous token to go back to', 'info');
            setConfirmModal(null);
            return;
        }

        try {
            if (currentServing) {
                // Return current to queue
                await api.updateTokenStatus(currentServing.token_id, { status: 'Booked' });
            }
            // Revert completed to serving
            await api.updateTokenStatus(lastCompleted.token_id, { status: 'Serving' });
            onToast(`Reverted to Token: ${lastCompleted.token_number}`, 'info');
            await fetchData(false);
        } catch (err) {
            onToast('Failed to revert token', 'error');
        } finally {
            setConfirmModal(null);
        }
    };

    const recallToken = async (tokenId, tokenNumber) => {
        try {
            // Priority calling sound
            try { new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3').play().catch(e => { }); } catch (e) { }
            onToast(`Recalling Token: ${tokenNumber}`, 'info');
        } catch (e) { }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                if (schedules.length > 0) callNextToken(schedules[0].schedule_id);
            }
            if (e.altKey && e.key.toLowerCase() === 'c') {
                const current = Object.values(tokensBySchedule).flat().find(t => t.status === 'Serving');
                if (current) handleTokenAction(current.token_id, current.schedule_id, 'Completed');
            }
            if (e.altKey && e.key.toLowerCase() === 's') {
                const current = Object.values(tokensBySchedule).flat().find(t => t.status === 'Serving');
                if (current) handleTokenAction(current.token_id, current.schedule_id, 'No-Show');
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [schedules, tokensBySchedule]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="service-portal-dashboard" style={{ width: '100%', boxSizing: 'border-box' }}>
            <style>{animations}</style>
            <div style={{ animation: 'fadeIn 0.6s ease' }}>
                {/* Performance Mini-Dashboard */}
                <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)', transition: 'transform 0.3s ease' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>Done Today</div>
                        <div style={{ fontSize: '32px', fontWeight: '900', margin: '8px 0' }}>{stats.totalServed}</div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>Customers successfully handled.</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', color: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.25)', transition: 'transform 0.3s ease' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>Avg. Handling Time</div>
                        <div style={{ fontSize: '36px', fontWeight: '900', margin: '8px 0' }}>{stats.avgTime} <span style={{ fontSize: '18px' }}>min</span></div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>Average time spent per customer.</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)', transition: 'transform 0.3s ease' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>Next in Line</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', margin: '8px 0' }}>
                            {stats.nextCustomer ? stats.nextCustomer.token_number : '--'}
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '700' }}>
                            {stats.nextCustomer ? `👤 ${stats.nextCustomer.customer_name}` : 'No one waiting'}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(168, 85, 247, 0.25)', transition: 'transform 0.3s ease' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>Queue Wait</div>
                        <div style={{ fontSize: '36px', fontWeight: '900', margin: '8px 0' }}>{stats.pending * stats.avgTime}<span style={{ fontSize: '16px' }}>m</span></div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>Total estimated time today.</div>
                    </div>
                </section>

                {/* Offline Warning Overlay */}
                {(!isOnline || consecutiveErrors > 2) && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'shake 0.5s ease' }}>
                        <span style={{ fontSize: '24px' }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: '800', color: '#fca5a5' }}>Connectivity Issue Detected</div>
                            <div style={{ fontSize: '14px', color: '#fecaca' }}>Real-time updates may be delayed. Please check your internet connection or reload the page.</div>
                        </div>
                    </div>
                )}

                {/* Welcome Message */}
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                            Consultant <span className="highlight">Workspace</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                            Welcome back, {consultant.name.replace(/^Dr\.\s*/i, '')}. Manage your assigned service queues below.
                        </p>
                    </div>
                    <button
                        className={`btn ${isAway ? 'btn-success' : 'btn-secondary'}`}
                        style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
                        onClick={() => {
                            setIsAway(!isAway);
                            onToast(isAway ? 'Service Resumed' : 'Break Mode Activated', isAway ? 'success' : 'info');
                        }}
                    >
                        {isAway ? (
                            <><span style={{ fontSize: '18px' }}>▶️</span> Resume Service</>
                        ) : (
                            <><span style={{ fontSize: '18px' }}>⏸️</span> Go on Break</>
                        )}
                    </button>
                </div>

                {isAway && (
                    <div className="glass-card" style={{ background: 'var(--bg-card)', border: '2px dashed var(--glass-border)', padding: '40px', textAlign: 'center', marginBottom: '32px', animation: 'slideDown 0.3s ease' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>☕</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>Currently on Break</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>Your status is set to away. New customers will see that this counter is temporarily unavailable.</p>
                    </div>
                )}

                {activeScheduleId ? (
                    // Focused Active Workspace
                    <div style={{ animation: 'slideIn 0.4s ease' }}>
                        <button
                            className="btn btn-secondary"
                            style={{
                                marginBottom: '24px', padding: '12px 24px', borderRadius: '14px',
                                fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center',
                                gap: '10px', background: 'var(--bg-input)', color: 'var(--text-main)',
                                border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setActiveScheduleId(null)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                e.currentTarget.style.color = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                e.currentTarget.style.color = 'var(--text-main)';
                            }}
                        >
                            <span>⬅️</span> Back to Dashboard
                        </button>

                        {(() => {
                            const sched = schedules.find(s => s.schedule_id === activeScheduleId);
                            if (!sched) return null;
                            const schedTokens = tokensBySchedule[sched.schedule_id] || [];
                            const servingToken = schedTokens.find(t => t.status === 'Serving');
                            const bookedTokens = schedTokens.filter(t => t.status === 'Booked');

                            return (
                                <div className="glass-card" style={{ background: 'var(--bg-card)', padding: 0, overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: 'var(--shadow-lg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
                                        {/* Left: Focused Service Panel */}
                                        <div style={{ flex: '1', minWidth: '0', width: '100%', padding: '32px', borderRight: '1px solid var(--glass-border)', boxSizing: 'border-box' }}>
                                            <div style={{ marginBottom: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', marginBottom: '12px', display: 'inline-block' }}>
                                                        {sched.service_name || 'General Service'}
                                                    </span>
                                                    {(() => {
                                                        const isLive = getIsLive(sched);
                                                        const isToday = sched.date === todayStr;
                                                        const isFuture = sched.date > todayStr;
                                                        const now = new Date();
                                                        const currentTime = now.getHours() * 60 + now.getMinutes();
                                                        const [endH, endM] = sched.end_time.split(':').map(Number);
                                                        const end = endH * 60 + endM;
                                                        const isPast = (isToday && currentTime > end) || (sched.date < todayStr);

                                                        if (isLive) return <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--success)' }}>🟢 ON AIR (Live)</span>;
                                                        if (isFuture || (isToday && !isPast)) return <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>🕒 UPCOMING</span>;
                                                        return <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--slate-400)' }}>📁 ARCHIVED</span>;
                                                    })()}
                                                </div>
                                                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', margin: '8px 0' }}>{sched.branch_name}</h3>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                    <span>🕒 {sched.start_time} - {sched.end_time}</span>
                                                    {sched.date !== todayStr && <span>📅 {sched.date}</span>}
                                                    <span>🎫 Series: {sched.token_series}</span>
                                                </div>
                                            </div>

                                            {(() => {
                                                const isLive = getIsLive(sched);
                                                if (!isLive) {
                                                    return (
                                                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.4s ease' }}>
                                                            <span style={{ fontSize: '20px' }}>ℹ️</span>
                                                            <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600', lineHeight: '1.4' }}>
                                                                Actions are restricted. This session is currently <strong>Upcoming</strong> or <strong>Closed</strong>.
                                                                You can view the queue, but calling/serving is only available when live.
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            <div style={{ background: 'var(--bg-input)', padding: '40px 24px', borderRadius: '24px', marginBottom: '24px', textAlign: 'center', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '16px' }}>Currently Serving</div>
                                                <div style={{ fontSize: '96px', fontWeight: '900', color: 'var(--primary)', lineHeight: 0.8, marginBottom: '20px', textShadow: '0 4px 15px rgba(37, 99, 235, 0.25)' }}>
                                                    {servingToken ? servingToken.token_number : '--'}
                                                </div>
                                                {servingToken?.customer_name && (
                                                    <div style={{ margin: '20px 0', padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                                                        👤 {servingToken.customer_name}
                                                    </div>
                                                )}
                                                {servingToken && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}
                                                        onClick={() => recallToken(servingToken.token_id, servingToken.token_number)}
                                                    >
                                                        🔄 Recall Customer
                                                    </button>
                                                )}
                                            </div>

                                            {/* Session Progress Bar */}
                                            {schedTokens.length > 0 && (() => {
                                                const done = schedTokens.filter(t => t.status === 'Completed').length;
                                                const pct = Math.round((done / schedTokens.length) * 100);
                                                return (
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                            <span>Customer Progress</span>
                                                            <span style={{ color: 'var(--text-main)' }}>{done}/{schedTokens.length} handled ({pct}%)</span>
                                                        </div>
                                                        <div style={{ background: 'var(--bg-input)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)', transition: 'width 0.8s ease' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                {(() => {
                                                    const isLive = getIsLive(sched);
                                                    return (
                                                        <>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ flex: 1, padding: '18px', fontSize: '16px', fontWeight: '800', borderRadius: '14px' }}
                                                                onClick={() => showConfirm('Previous Token', 'Revert to the last completed token?', '⏮️', () => callPreviousToken(sched.schedule_id))}
                                                                disabled={!isLive || schedTokens.filter(t => t.status === 'Completed').length === 0}
                                                            >
                                                                ⏮️ Prev
                                                            </button>
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{
                                                                    flex: 2, padding: '18px', fontSize: '18px', fontWeight: '900', borderRadius: '14px',
                                                                    background: (!isLive || (bookedTokens.length === 0 && !servingToken)) ? '#94a3b8' : undefined,
                                                                }}
                                                                onClick={() => callNextToken(sched.schedule_id)}
                                                                disabled={!isLive || (bookedTokens.length === 0 && !servingToken)}
                                                            >
                                                                📢 {!isLive ? 'Session Not Live' : (bookedTokens.length === 0 && !servingToken ? 'Queue Empty' : 'Call Next')}
                                                            </button>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Right: Live Queue Panel */}
                                        <div style={{ flex: '1.4', minWidth: '0', width: '100%', padding: '32px', background: 'var(--bg-input)', boxSizing: 'border-box' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Waiting Queue ({bookedTokens.length})</h4>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Next: {bookedTokens[0]?.customer_name || 'No one'}</div>
                                                </div>
                                                <div className="stat-chip" style={{ background: 'var(--bg-input)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                    LIVE UPDATES
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gap: '14px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
                                                {bookedTokens.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--bg-input)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                                                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
                                                        <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>Queue Cleared!</div>
                                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Take a small break or wait for new check-ins.</div>
                                                    </div>
                                                ) : (
                                                    bookedTokens.map((t, idx) => (
                                                        <div key={t.token_id} className="glass-card" style={{ background: 'var(--bg-card)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: idx === 0 ? '2px solid rgba(37, 99, 235, 0.4)' : '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)', animation: 'fadeIn 0.3s ease' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                                <div style={{ fontSize: '28px', fontWeight: '900', color: idx === 0 ? 'var(--primary)' : 'var(--text-main)' }}>{t.token_number}</div>
                                                                <div>
                                                                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{t.customer_name}</div>
                                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t.time_slot} | {t.customer_gender}, {t.customer_age}y</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                {(() => {
                                                                    const isLive = getIsLive(sched);
                                                                    return (
                                                                        <>
                                                                            <button className="btn btn-sm btn-primary" onClick={() => handleTokenAction(t.token_id, sched.schedule_id, 'Serving')} disabled={!isLive || actionLoading === t.token_id}>Serve</button>
                                                                            <button className="btn btn-sm btn-secondary" onClick={() => handleTokenAction(t.token_id, sched.schedule_id, 'No-Show')} disabled={!isLive || actionLoading === t.token_id}>Skip</button>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    // Dashboard Overview Mode
                    <div>
                        {schedules.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🗓️</div>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px' }}>No Sessions Assigned</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 0 32px 0', lineHeight: '1.6' }}>You don't have any active service assignments for today. Please wait for an administrator.</p>
                                <button className="btn btn-secondary" style={{ padding: '12px 32px' }} onClick={() => fetchData(true)}>Refresh Schedule</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '40px' }}>
                                {/* Today's Section */}
                                {schedules.some(s => s.date === todayStr) && (
                                    <div style={{ animation: 'slideIn 0.3s ease' }}>
                                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '900' }}>LIVE</span>
                                            Today
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                                            {schedules.filter(s => s.date === todayStr).map(sched => {
                                                const now = new Date();
                                                const nowMins = now.getHours() * 60 + now.getMinutes();
                                                const [endH, endM] = sched.end_time.split(':').map(Number);
                                                const isPast = nowMins > endH * 60 + endM;
                                                return (
                                                    <div
                                                        key={sched.schedule_id}
                                                        className="glass-card"
                                                        style={{
                                                            background: isPast ? 'var(--bg-surface)' : 'var(--bg-card)',
                                                            padding: '24px', position: 'relative',
                                                            border: '1px solid var(--glass-border)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            cursor: isPast ? 'not-allowed' : 'pointer',
                                                            boxShadow: 'var(--shadow-sm)',
                                                            opacity: isPast ? 0.75 : 1,
                                                            overflow: 'hidden'
                                                        }}
                                                        onClick={() => { if (!isPast) setActiveScheduleId(sched.schedule_id); }}
                                                        onMouseEnter={(e) => {
                                                            if (isPast) return;
                                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (isPast) return;
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                                                        }}
                                                    >
                                                        {/* FINISHED stamp overlay for ended sessions */}
                                                        {isPast && (
                                                            <div style={{
                                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                zIndex: 10, pointerEvents: 'auto',
                                                                background: 'rgba(197, 173, 237, 0.3)', backdropFilter: 'blur(3px)'
                                                            }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div style={{
                                                                    border: '4px solid rgba(16, 185, 129, 0.8)',
                                                                    color: 'rgba(16, 185, 129, 0.9)',
                                                                    padding: '12px 32px',
                                                                    borderRadius: '8px',
                                                                    fontSize: '28px',
                                                                    fontWeight: '900',
                                                                    letterSpacing: '6px',
                                                                    textTransform: 'uppercase',
                                                                    transform: 'rotate(-12deg)',
                                                                    textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                                                    userSelect: 'none',
                                                                    boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.2)'
                                                                }}>
                                                                    FINISHED
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                                            <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900' }}>Series: {sched.token_series}</span>
                                                        </div>
                                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>{sched.service_name}</h3>
                                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '600' }}>📍 {sched.branch_name}</div>

                                                        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>TIME SLOT</div>
                                                            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>🕒 {sched.start_time} - {sched.end_time}</div>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: isPast ? 'var(--slate-500)' : 'var(--primary)', fontWeight: '800', fontSize: '14px' }}>
                                                            <span>{isPast ? 'Session Closed' : 'Open Workspace'}</span>
                                                            <span>{isPast ? '🔒' : '➔'}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}


                                {/* Future Section */}
                                {schedules.some(s => s.date !== todayStr) && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '40px', animation: 'slideIn 0.5s ease' }}>
                                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            🗓️ Future
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                                            {schedules.filter(s => s.date !== todayStr).map(sched => (
                                                <div
                                                    key={sched.schedule_id}
                                                    className="glass-card"
                                                    style={{
                                                        background: 'var(--bg-card)', padding: '24px', position: 'relative', border: '1px solid var(--glass-border)',
                                                        transition: 'all 0.3s ease', cursor: 'pointer', opacity: 0.9
                                                    }}
                                                    onClick={() => setActiveScheduleId(sched.schedule_id)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.opacity = '1';
                                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.opacity = '0.9';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                                        <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', opacity: 0.9 }}>Series: {sched.token_series}</span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>{sched.date}</div>
                                                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{sched.service_name}</h3>
                                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>📍 {sched.branch_name}</div>

                                                    <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>SESSION TIME</div>
                                                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>🕒 {sched.start_time} - {sched.end_time}</div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* Confirmation Modal */}
                {confirmModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000, animation: 'fadeIn 0.2s ease'
                    }}>
                        <div className="glass-card" style={{
                            width: '90%', maxWidth: '400px', padding: '32px',
                            background: 'var(--bg-surface)', textAlign: 'center', animation: 'slideUpScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{confirmModal.icon}</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 12px 0' }}>{confirmModal.title}</h3>
                            <p style={{ color: 'var(--slate-500)', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>{confirmModal.message}</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '12px', fontWeight: '800' }}
                                    onClick={() => setConfirmModal(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '12px', fontWeight: '800' }}
                                    onClick={confirmModal.onConfirm}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

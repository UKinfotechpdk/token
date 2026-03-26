import React, { useState, useEffect } from 'react';
import { getSchedules, getTokens, checkAuth } from '../../api/api';

export default function StaffLiveDisplay({ onNavigate }) {
    const [schedules, setSchedules] = useState([]);
    const [tokensBySchedule, setTokensBySchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [staffBranchId, setStaffBranchId] = useState(null);

    const fetchData = async () => {
        try {
            // Get current staff info if not already fetched
            let branchId = staffBranchId;
            if (branchId === null) {
                const userRes = await checkAuth();
                branchId = userRes.data?.user?.branch_id;
                setStaffBranchId(branchId);
            }

            const schedRes = await getSchedules();
            const d = new Date();
            const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // Filter by BOTH today's date AND staff's branch_id
            const todaySchedules = schedRes.data.filter(s => {
                const isToday = s.date && String(s.date).startsWith(todayStr);
                // If branchId is undefined (e.g. auth failed but page loaded), default to true or gracefully handle it.
                // Assuming we want to show it if branch_id matches, or if we have no branch_id (to avoid empty screen bug in test modes).
                const isBranch = branchId ? String(s.branch_id) === String(branchId) : true;
                return isToday && isBranch;
            });

            setSchedules(todaySchedules);

            const newTokenData = {};
            await Promise.all(
                todaySchedules.map(async (sched) => {
                    try {
                        const tokenRes = await getTokens(sched.schedule_id);
                        newTokenData[sched.schedule_id] = tokenRes.data;
                    } catch (e) { /* ignore */ }
                })
            );
            setTokensBySchedule(newTokenData);
        } catch (err) {
            console.error('Error fetching live display data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const dataInterval = setInterval(fetchData, 5000);
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const getServiceIcon = (name) => {
        const n = name?.toLowerCase() || '';
        if (n.includes('support') || n.includes('help')) return '💬';
        if (n.includes('billing') || n.includes('payment')) return '💰';
        if (n.includes('tech') || n.includes('repair')) return '🖥️';
        if (n.includes('dental')) return '🦷';
        if (n.includes('neuro')) return '🧠';
        return '📋';
    };

    const formatServiceName = (name) => {
        if (!name) return 'General Service';
        let n = name.replace(/^Dr\.\s*/i, '');
        // Manual fix for common misspellings in display only
        if (n.toLowerCase().includes('nuerology')) return 'Neurology';
        if (n.toLowerCase().includes('dentel')) return 'Dental';
        return n;
    };

    if (loading && schedules.length === 0) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--bg-app)',
            color: 'var(--text-main)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
        }}>
            {/* --- Premium Header Section --- */}
            <div className="live-header-container" style={{
                padding: '20px 40px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 100
            }}>
                <div className="live-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '8px', height: '40px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                            Live Token <span style={{ color: 'var(--primary-dark)' }}>Status</span>
                        </h1>
                        {schedules.length > 0 && (
                            <div className="monitoring-tag" style={{ fontSize: '13px', fontWeight: '800', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                                Currently Monitoring: <strong style={{ color: 'var(--primary)' }}>{schedules[0].branch_name} Branch</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className="live-header-right" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '4px' }}>Network Time</div>
                        <div className="live-time-text" style={{ fontSize: '28px', fontWeight: '950', color: 'var(--text-main)', letterSpacing: '1px', fontFamily: 'monospace' }}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        style={{
                            background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--glass-border)',
                            padding: '14px 28px', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: '800',
                            transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        Close Display
                    </button>
                </div>
            </div>

            {/* --- Responsive Display Grid --- */}
            <div className="live-grid-scroll" style={{
                flex: 1, padding: '40px', overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 580px), 1fr))',
                gap: '40px',
                alignContent: 'start',
                maxWidth: '1600px',
                margin: '0 auto',
                width: '100%'
            }}>
                {schedules.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.3, marginTop: '20vh' }}>
                        <div style={{ fontSize: '100px', marginBottom: '32px' }}>📡</div>
                        <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-main)' }}>Waiting for active sessions...</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Real-time updates will appear here when a counter opens.</p>
                    </div>
                ) : (
                    schedules.map(sched => {
                        const schedTokens = tokensBySchedule[sched.schedule_id] || [];
                        const servingToken = schedTokens.find(t => t.status === 'Serving');
                        const nextTokens = schedTokens.filter(t => t.status === 'Booked').slice(0, 4);

                        // Detect if this session has ended
                        const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
                        const [endH, endM] = sched.end_time.split(':').map(Number);
                        const isPast = nowMins > endH * 60 + endM;

                        return (
                            <div key={sched.schedule_id} className="live-display-card" style={{
                                background: isPast ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                                backdropFilter: 'blur(25px)',
                                borderRadius: '40px',
                                padding: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '32px',
                                boxShadow: isPast ? 'none' : 'var(--shadow-lg)',
                                border: isPast ? '2px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)',
                                position: 'relative',
                                opacity: isPast ? 0.7 : 1,
                                pointerEvents: isPast ? 'none' : 'auto',
                                userSelect: isPast ? 'none' : 'auto',
                                animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                                {/* FINISHED stamp for ended sessions */}
                                {isPast && (
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%) rotate(-15deg)',
                                        zIndex: 20, pointerEvents: 'none'
                                    }}>
                                        <div style={{
                                            border: '5px solid #16a34a',
                                            color: '#16a34a',
                                            padding: '10px 28px',
                                            borderRadius: '10px',
                                            fontSize: '36px',
                                            fontWeight: '900',
                                            letterSpacing: '4px',
                                            textTransform: 'uppercase',
                                            background: 'rgba(5, 50, 20, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 4px 20px rgba(22, 163, 74, 0.25)'
                                        }}>
                                            ✅ FINISHED
                                        </div>
                                    </div>
                                )}
                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ fontSize: '28px', background: 'var(--glass-bg)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>
                                            {getServiceIcon(sched.service_name)}
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {formatServiceName(sched.service_name)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '4px' }}>Session Hours</div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{sched.start_time} - {sched.end_time}</div>
                                    </div>
                                </div>

                                {/* Branch Badge */}
                                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginTop: '-12px' }}>
                                    {sched.branch_name}
                                </div>

                                {/* Main "Now Serving" Area */}
                                <div style={{
                                    background: 'var(--glass-bg)',
                                    padding: '50px 30px',
                                    borderRadius: '32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--glass-border)',
                                    position: 'relative',
                                    gap: '24px'
                                }}>
                                    <div style={{ fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '5px', color: 'var(--text-muted)' }}>
                                        Now Serving
                                    </div>

                                    <div className="serving-token-number" style={{
                                        fontSize: 'clamp(80px, 12vw, 160px)',
                                        fontWeight: '950',
                                        lineHeight: 0.9,
                                        color: servingToken ? 'var(--primary-dark)' : 'var(--text-muted)',
                                        letterSpacing: '-2px',
                                        transition: 'all 0.5s ease'
                                    }}>
                                        {servingToken ? servingToken.token_number : '--'}
                                    </div>

                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '950',
                                        textTransform: 'uppercase',
                                        letterSpacing: '3px',
                                        color: servingToken ? 'var(--success)' : 'var(--text-muted)',
                                        background: servingToken ? 'rgba(16, 185, 129, 0.15)' : 'var(--glass-bg)',
                                        padding: '12px 32px',
                                        borderRadius: '16px',
                                        border: servingToken ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)'
                                    }}>
                                        {servingToken ? 'Please Proceed' : 'Standing By'}
                                    </div>
                                </div>

                                {/* Waiting Chip Section */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>Waiting:</div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {nextTokens.length > 0 ? nextTokens.map(nt => (
                                            <div key={nt.token_id} style={{
                                                padding: '12px 24px', borderRadius: '18px', background: 'var(--glass-bg)',
                                                border: '1px solid var(--glass-border)', fontSize: '22px', fontWeight: '950', color: 'var(--text-main)',
                                                boxShadow: 'var(--shadow-sm)',
                                                transition: 'all 0.2s'
                                            }}>
                                                {nt.token_number}
                                            </div>
                                        )) : (
                                            <div style={{ fontSize: '16px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '700' }}>No pending tokens</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 1024px) {
                    .live-header-container { padding: 16px 24px; }
                    .live-grid-scroll { padding: 24px; gap: 24px; }
                    .live-display-card { padding: 32px; border-radius: 32px; }
                }
                @media (max-width: 768px) {
                    .live-header-container { flex-direction: column; align-items: flex-start; gap: 20px; text-align: left; }
                    .live-header-right { width: 100%; justify-content: space-between; border-top: 1px solid var(--slate-100); padding-top: 16px; }
                    .live-time-text { font-size: 20px; }
                    .live-header-brand h1 { font-size: 26px; }
                    .live-grid-scroll { padding: 16px; gap: 16px; }
                    .live-display-card { padding: 24px; }
                }
                @media (max-width: 480px) {
                    .live-header-container { padding: 16px; }
                    .live-grid-scroll { padding: 12px; }
                    .serving-token-number { font-size: 80px !important; }
                    .live-display-card { border-radius: 24px; padding: 20px; }
                }
            `}</style>
        </div>
    );
}

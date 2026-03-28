import React from 'react';

export default function ScheduleList({ schedules, selectedSched, onSelect, branchName, finishedMap = {} }) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper: parse HH:MM time string to today's Date object
    const parseTime = (timeStr) => {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    // Filter to today's schedules only
    const todaySchedules = schedules.filter(s => s.date === todayStr);

    // Determine if a schedule is completed (end_time passed OR all tokens finished)
    const getCompletionStatus = (s) => {
        const end = parseTime(s.end_time);
        const timePast = end && now > end;
        const tokensAllDone = !!finishedMap[s.schedule_id];
        return { isPast: timePast, isDone: tokensAllDone, finished: timePast || tokensAllDone };
    };

    // Sort: active first, completed at bottom
    const sortedSchedules = [...todaySchedules].sort((a, b) => {
        const aStatus = getCompletionStatus(a);
        const bStatus = getCompletionStatus(b);
        return (aStatus.finished ? 1 : 0) - (bStatus.finished ? 1 : 0);
    });

    const renderCard = (s) => {
        const isActive = selectedSched?.schedule_id === s.schedule_id;
        const status = getCompletionStatus(s);
        const isTimePast = status.isPast;
        const isTokensFinished = status.isDone;
        const completed = status.finished;

        const groupColor = completed ? (isTimePast ? '#94a3b8' : 'var(--primary)') : 'var(--secondary)';
        const groupGlow = completed ? (isTimePast ? 'rgba(148,163,184,0.1)' : 'rgba(37, 99, 235, 0.1)') : 'rgba(16, 185, 129, 0.1)';

        return (
            <div
                key={s.schedule_id}
                onClick={() => !completed && onSelect(s)}
                className={`glass-card ${isActive ? 'active' : ''}`}
                style={{
                    padding: '28px',
                    cursor: completed ? 'not-allowed' : 'pointer',
                    border: isActive ? `2px solid ${groupColor}` : '1px solid var(--glass-border)',
                    background: completed
                        ? 'rgba(255,255,255,0.03)'
                        : isActive
                            ? `linear-gradient(135deg, rgba(255,255,255,0.05), ${groupGlow})`
                            : 'var(--bg-card)',
                    boxShadow: isActive ? `0 20px 40px -10px ${groupGlow}` : 'var(--shadow-sm)',
                    transform: isActive ? 'translateY(-6px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(15px)',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: completed ? 0.72 : 1,
                }}
            >
                {/* COMPLETED WATERMARK STAMP */}
                {completed && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-35deg)',
                        fontSize: '2rem',
                        fontWeight: '900',
                        color: isTimePast ? '#ef4444' : 'var(--primary)',
                        border: `3px solid ${isTimePast ? '#ef4444' : 'var(--primary)'}`,
                        borderRadius: '8px',
                        padding: '6px 18px',
                        letterSpacing: '4px',
                        opacity: 0.25,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        textTransform: 'uppercase',
                        userSelect: 'none',
                    }}>
                        {isTimePast ? 'ENDED' : 'COMPLETED'}
                    </div>
                )}

                {/* COMPLETED label badge at bottom */}
                {completed && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '14px',
                        fontSize: '10px',
                        fontWeight: '900',
                        color: isTimePast ? '#ef4444' : 'var(--primary)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        opacity: 0.7,
                        zIndex: 5,
                    }}>
                        ✓ {status.isPast ? 'Session Ended' : 'Tokens Complete'}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                    <span className="badge" style={{
                        background: isActive ? groupColor : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        fontWeight: '900',
                        padding: '6px 14px',
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {s.service_name || 'General Servicing'}
                    </span>
                    {isActive && !completed && <div style={{
                        width: '10px', height: '10px', background: groupColor, borderRadius: '50%',
                        boxShadow: `0 0 15px ${groupColor}`
                    }}></div>}
                </div>

                <h3 className="card-label" style={{ margin: '0 0 16px 0', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                    {s.branch_name}
                </h3>

                {s.consultant_name && (
                    <div className="card-meta" style={{
                        padding: '14px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px',
                        marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        <div style={{ fontSize: '24px', opacity: 0.9 }}>👤</div>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '1px', marginBottom: '2px' }}>
                                Specialist
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff' }}>
                                {s.consultant_name}
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ opacity: 0.7 }}>📅</span> <strong>{s.date}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ opacity: 0.7 }}>🕓</span> <strong>{s.start_time} - {s.end_time}</strong>
                    </div>

                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <span style={{ opacity: 0.7 }}>🎟️</span> <strong>{s.token_count}</strong> Limit
                        </div>
                        <div style={{ fontWeight: '950', color: groupColor, fontSize: '1.1rem' }}>Rs. {s.fees}</div>
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Series: <span style={{ color: 'var(--primary)', opacity: 1 }}>{s.token_series}</span></span>
                        {!completed && <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="live-dot" style={{ width: '6px', height: '6px', background: 'var(--secondary)' }}></span> Live Now
                        </span>}
                    </div>
                </div>

                {/* Glow for active */}
                {isActive && !completed && <div style={{
                    position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px',
                    background: groupColor, filter: 'blur(80px)', opacity: 0.2, zIndex: 0
                }}></div>}
            </div>
        );
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '950', color: '#ffffff', letterSpacing: '-1.5px', marginBottom: '12px' }}>
                    Live <span className="highlight-text">Schedules</span>
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Currently managing live queue for <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{branchName || 'Your Branch'}</span>.
                </p>
            </div>

            {/* Section header */}
            {sortedSchedules.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingLeft: '8px' }}>
                    <div style={{ width: '4px', height: '20px', background: 'var(--secondary)', borderRadius: '4px', boxShadow: '0 0 10px var(--secondary)' }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff', opacity: 0.9 }}>
                        TODAY (LIVE)
                    </span>
                </div>
            )}

            <div className="live-schedule-grid">
                {sortedSchedules.map(s => renderCard(s))}
            </div>

            {sortedSchedules.length === 0 && (
                <div className="empty-state" style={{
                    padding: '100px 40px', background: 'var(--bg-card)', borderRadius: '40px',
                    textAlign: 'center', border: '2px dashed var(--glass-border)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ fontSize: '72px', marginBottom: '24px', filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.3))' }}>🌟</div>
                    <h3 style={{ fontWeight: '950', color: '#ffffff', fontSize: '1.8rem', marginBottom: '12px' }}>No Schedules Today</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem' }}>There are no schedules for today at your branch.</p>
                </div>
            )}
        </div>
    );
}

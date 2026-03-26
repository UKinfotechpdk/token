import React from 'react';

export default function ScheduleList({ schedules, selectedSched, onSelect, branchName }) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Sort schedules by ID descending (Last In, First Out)
    const sortedSchedules = [...schedules].sort((a, b) => b.schedule_id - a.schedule_id);

    const todaySchedules = sortedSchedules.filter(s => s.date === todayStr);
    const upcomingSchedules = sortedSchedules.filter(s => s.date > todayStr);

    const renderGrid = (list, title, isLive) => {
        if (list.length === 0) return null;
        const groupColor = isLive ? 'var(--secondary)' : 'var(--primary)';
        const groupGlow = isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)';

        return (
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingLeft: '8px' }}>
                    <div style={{ width: '4px', height: '20px', background: groupColor, borderRadius: '4px', boxShadow: `0 0 10px ${groupColor}` }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff', opacity: 0.9 }}>
                        {title}
                    </span>
                </div>
                <div className="live-schedule-grid">
                    {list.map(s => {
                        const isActive = selectedSched?.schedule_id === s.schedule_id;
                        return (
                            <div
                                key={s.schedule_id}
                                onClick={() => onSelect(s)}
                                className={`glass-card ${isActive ? 'active' : ''}`}
                                style={{
                                    padding: '28px',
                                    cursor: 'pointer',
                                    border: isActive ? `2px solid ${groupColor}` : '1px solid var(--glass-border)',
                                    background: isActive ? `linear-gradient(135deg, rgba(255,255,255,0.05), ${groupGlow})` : 'var(--bg-card)',
                                    boxShadow: isActive ? `0 20px 40px -10px ${groupGlow}` : 'var(--shadow-sm)',
                                    transform: isActive ? 'translateY(-6px)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backdropFilter: 'blur(15px)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
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
                                    {isActive && <div style={{
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
                                        {isLive && <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span className="live-dot" style={{ width: '6px', height: '6px', background: 'var(--secondary)' }}></span> Live Now
                                        </span>}
                                    </div>
                                </div>

                                {/* Abstract background glow */}
                                {isActive && <div style={{
                                    position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px',
                                    background: groupColor, filter: 'blur(80px)', opacity: 0.2, zIndex: 0
                                }}></div>}
                            </div>
                        );
                    })}
                </div>
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
                    Currently managing live queue for <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{branchName || 'your branch'}</span>.
                </p>
            </div>

            {renderGrid(sortedSchedules, 'Today (Live)', true)}

            {schedules.length === 0 && (
                <div className="empty-state" style={{
                    padding: '100px 40px', background: 'var(--bg-card)', borderRadius: '40px',
                    textAlign: 'center', border: '2px dashed var(--glass-border)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ fontSize: '72px', marginBottom: '24px', filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.3))' }}>🌟</div>
                    <h3 style={{ fontWeight: '950', color: '#ffffff', fontSize: '1.8rem', marginBottom: '12px' }}>No Live Schedules</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem' }}>There are no active schedules running for your branch at this moment.</p>
                </div>
            )}
        </div>
    );
}

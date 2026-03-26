import React from 'react';

export default function ScheduleSelector({ schedules, onSelect, loading, queueData }) {
    const todayStr = new Date().toISOString().split('T')[0];

    const todaySchedules = schedules.filter(s => s.date === todayStr);
    const upcomingSchedules = schedules.filter(s => s.date > todayStr);

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {[1, 2].map(i => (
                    <div key={i} className="glass-card skeleton" style={{ height: '300px', borderRadius: '24px' }} />
                ))}
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', animation: 'fadeIn 0.5s ease', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#f8fafc' }}>No Available Slots</h3>
                <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '16px auto' }}>All services for this location have either concluded for the day or are fully booked. Please check other branches or return tomorrow.</p>
            </div>
        );
    }

    const renderScheduleCard = (sched, isToday = true) => {
        const live = queueData[sched.schedule_id] || { waiting_count: 0, serving_number: '--', avg_time: 5 };
        const isFull = sched.available_tokens === 0;
        const waitTime = live.waiting_count * (live.avg_time || 5);
        const loadColor = live.waiting_count > 8 ? '#ef4444' : (live.waiting_count > 3 ? '#f59e0b' : '#10b981');

        return (
            <div key={sched.schedule_id} className="glass-card dash-card glass-hover" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.4s', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)' }}>
                {/* Status Bar */}
                <div style={{ height: '6px', background: isToday ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : '#64748b' }} />

                <div className="schedule-card-inner" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#f8fafc', margin: 0, textTransform: 'capitalize' }}>{sched.title}</h3>
                                {!isToday && (
                                    <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                                        {sched.date}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🕒 {sched.start_time} - {sched.end_time}
                            </p>
                        </div>
                        <div className="card-icon-box" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px' }}>
                            📋
                        </div>
                    </div>

                    {/* Live Intel Panel */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isToday ? '16px' : '0' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                    {isToday ? 'Now Serving' : 'Availability'}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: isToday ? '#60a5fa' : '#94a3b8', lineHeight: 1 }}>
                                    {isToday ? `#${live.serving_number || '--'}` : 'Upcoming'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                    Available
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: '#f1f5f9', lineHeight: 1 }}>
                                    {sched.available_tokens} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>slots</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar for Wait Time */}
                        {isToday && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, live.waiting_count * 10)}%`, height: '100%', background: loadColor, borderRadius: '4px', transition: 'width 1s ease' }} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: loadColor, whiteSpace: 'nowrap' }}>{waitTime} min wait</span>
                            </div>
                        )}
                    </div>

                    {/* Limit / Call to Action button */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {sched.user_token_count >= 2 ? (
                            <button className="btn btn-secondary btn-full" disabled style={{ height: '56px', fontSize: '14px', fontWeight: '800', flex: 1 }}>
                                Limit Reached (2/2)
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-full"
                                disabled={isFull}
                                onClick={() => onSelect(sched)}
                                style={{ height: '56px', fontSize: '16px', fontWeight: '800', flex: 1, opacity: isFull ? 0.6 : 1 }}
                            >
                                {isFull ? 'Sold Out' : `Select Service (₹${sched.fee})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="schedule-container" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {todaySchedules.length > 0 && (
                <div style={{ animation: 'fadeInDown 0.6s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '24px' }}>⚡</span>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#f8fafc', margin: 0 }}>Today's Live Sessions</h2>
                    </div>
                    <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {todaySchedules.map(s => renderScheduleCard(s, true))}
                    </div>
                </div>
            )}

            {upcomingSchedules.length > 0 && (
                <div style={{ animation: 'fadeInDown 0.6s ease 0.2s', animationFillMode: 'both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '24px' }}>📅</span>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#f8fafc', margin: 0 }}>Upcoming Sessions</h2>
                    </div>
                    <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {upcomingSchedules.map(s => renderScheduleCard(s, false))}
                    </div>
                </div>
            )}
            <style>{`
                .schedule-grid { gap: 32px; }
                @media (max-width: 640px) {
                    .schedule-grid { gap: 16px !important; }
                    .schedule-card-inner { padding: 20px !important; }
                    h2 { font-size: 20px !important; }
                }
            `}</style>
        </div>
    );
}

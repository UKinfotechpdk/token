import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api/api';

export default function ScheduleDetailPage({ schedule, onBack, onToast }) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTokens = useCallback(async () => {
        try {
            const res = await api.getTokens(schedule.schedule_id);
            setTokens(res.data);
        } catch (err) {
            onToast('Failed to load tokens', 'error');
        } finally {
            setLoading(false);
        }
    }, [schedule.schedule_id, onToast]);

    useEffect(() => { fetchTokens(); }, [fetchTokens]);

    // Stats
    const stats = {
        Total: tokens.length,
        Available: tokens.filter(t => t.status === 'Available').length,
        Booked: tokens.filter(t => t.status === 'Booked').length,
        Serving: tokens.filter(t => t.status === 'Serving').length,
        Completed: tokens.filter(t => t.status === 'Completed').length,
        Skipped: tokens.filter(t => t.status === 'Skipped').length,
    };

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div className="schedule-detail-view" style={{ padding: '0 0 40px' }}>
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <button onClick={onBack} className="btn btn-secondary" style={{
                    padding: '12px 24px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>←</span> Back to Dashboard
                </button>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '950', color: 'white', letterSpacing: '-1px' }}>
                    Schedule Insights
                </h2>
            </div>

            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'start' }}>
                {/* Information Card */}
                <div className="glass-card" style={{ padding: '40px', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(30px)' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            marginBottom: '16px'
                        }}>
                            ✨ Core Metadata
                        </div>
                        <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '950', color: 'white', letterSpacing: '-1px' }}>
                            {schedule.service_name || 'General Service'}
                        </h3>
                    </div>

                    <div className="meta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <MetaItem label="Branch Location" value={`📍 ${schedule.branch_name}`} />
                        <MetaItem label="Service Date" value={`📅 ${schedule.date}`} />
                        <MetaItem label="Operational Window" value={`🕒 ${schedule.start_time} - ${schedule.end_time}`} />
                        <MetaItem label="Service Fee" value={`₹${schedule.fees} / Token`} isHighlight />
                        <MetaItem label="Assigned Provider" value={`👤 ${schedule.consultant_name || 'Generic Assistant'}`} />
                        <MetaItem label="Specialization" value={`🔬 ${schedule.specialization || 'General'}`} />
                    </div>
                </div>

                {/* Status breakdown side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '32px', background: 'var(--grad-primary)', color: 'white', borderRadius: '32px', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}>
                        <div style={{ fontSize: '12px', fontWeight: '1000', textTransform: 'uppercase', color: '#ffffff', opacity: 1, letterSpacing: '1.5px', marginBottom: '8px' }}>Capacity Utilization</div>
                        <div style={{ fontSize: '56px', fontWeight: '1000', color: '#ffffff', letterSpacing: '-2px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{stats.Total} <span style={{ fontSize: '18px', color: '#ffffff', opacity: 1, fontWeight: '800' }}>Tokens Generated</span></div>
                        <div style={{ marginTop: '24px', height: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', overflow: 'hidden', padding: '2px' }}>
                            <div style={{ width: `${(stats.Total - stats.Available) / stats.Total * 100}%`, height: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 0 10px white' }}></div>
                        </div>
                    </div>

                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <StatBox label="Booked" value={stats.Booked} icon="🎟️" color="#ffffff" themeColor="#3b82f6" />
                        <StatBox label="Completed" value={stats.Completed} icon="✅" color="#ffffff" themeColor="#10b981" />
                        <StatBox label="Serving" value={stats.Serving} icon="⚡" color="#ffffff" themeColor="#f59e0b" />
                        <StatBox label="Available" value={stats.Available} icon="⏳" color="#ffffff" themeColor="#94a3b8" />
                    </div>
                </div>
            </div>

            <style>{`
                .meta-item-box {
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }
                .meta-item-box:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                }
                @media (max-width: 1024px) {
                    .detail-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    .meta-grid, .stats-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

function MetaItem({ label, value, isHighlight }) {
    return (
        <div className="meta-item-box">
            <label style={{
                fontSize: '10px',
                fontWeight: '900',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
                display: 'block'
            }}>{label}</label>
            <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: isHighlight ? '#10b981' : 'white'
            }}>{value}</div>
        </div>
    );
}

function StatBox({ label, value, icon, color, themeColor }) {
    return (
        <div className="glass-card" style={{
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: `0 10px 30px ${themeColor}15`
        }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
            <div style={{ fontSize: '12px', fontWeight: '1000', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '36px', fontWeight: '1000', color: color, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{value}</div>
        </div>
    );
}

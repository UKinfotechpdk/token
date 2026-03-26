import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPublicSchedules } from '../../api/api';
import { usePolling } from '../../hooks/usePolling';

export default function ScheduleList() {
    const { branchId } = useParams();
    const { state } = useLocation();
    const branch = state?.branch;
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSchedules = async () => {
        try {
            const res = await getPublicSchedules(branchId);
            setSchedules(res.data);
        } catch (err) {
            console.error('Failed to fetch schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [branchId]);

    usePolling(fetchSchedules, 5000);

    const handleSelectSchedule = (schedule) => {
        navigate('/user/book-token/payment', {
            state: {
                schedule,
                branch: branch || { branch_name: schedule.branch_name, branch_id: branchId }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="schedule-list-page" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/user/book-token/branches')} style={{ marginRight: '16px' }}>← Back</button>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Select Service Slot</h2>
            </div>

            <div className="glass-card" style={{ padding: '20px 32px', marginBottom: '32px', borderLeft: '4px solid var(--secondary)' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Location</p>
                <h3 style={{ margin: 0, fontSize: '20px' }}>{branch?.branch_name || 'Selected Branch'}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
                {schedules.length > 0 ? schedules.map(sched => (
                    <div key={sched.schedule_id} className="glass-card dash-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <div className="card-icon-box" style={{ background: 'var(--primary-gradient)', fontSize: '32px', width: '80px', height: '80px' }}>🎫</div>
                        </div>

                        <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{sched.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>Session: {sched.start_time} - {sched.end_time}</p>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Next Available Slot</div>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--secondary)' }}>
                                {sched.available_slots.length > 0 ? sched.available_slots[0] : "SOLD OUT"}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                            {sched.available_slots.length > 0 ? (
                                sched.user_token_count >= 2 ? (
                                    <button className="btn btn-secondary btn-full" disabled style={{ height: '60px', fontSize: '16px', fontWeight: '800' }}>
                                        Limit Reached (2/2)
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={() => handleSelectSchedule(sched)}
                                        style={{ height: '60px', fontSize: '18px', fontWeight: '800' }}
                                    >
                                        Book Now (₹{sched.fee})
                                    </button>
                                )
                            ) : (
                                <button className="btn btn-secondary btn-full" disabled style={{ height: '60px' }}>No Slots Available</button>
                            )}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <div className="status-dot" style={{ background: sched.available_tokens > 0 ? '#10b981' : '#ef4444' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                {sched.available_tokens > 0 ? `${sched.available_tokens} tokens remaining` : 'Queue Full'}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="glass-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center' }}>
                        <p>No active schedules available for this branch today.</p>
                        <button className="btn btn-secondary mt-16" onClick={() => navigate('/user/book-token/branches')}>Change Branch</button>
                    </div>
                )}
            </div>
        </div>
    );
}

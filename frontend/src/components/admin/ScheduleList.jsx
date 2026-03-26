import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api/api';
import ScheduleDetailPage from './ScheduleDetailPage';
import SearchFilter from './SearchFilter';

export default function ScheduleList({ onToast, onAddNew, onEdit, onDelete, onBackToHome }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [branches, setBranches] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, bRes] = await Promise.all([api.getSchedules(), api.getBranches()]);
            const sorted = [...sRes.data].sort((a, b) => b.schedule_id - a.schedule_id);
            setSchedules(sorted);
            setBranches(bRes.data);
        } catch (err) {
            onToast('Failed to load schedules', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const branchOptions = useMemo(() => {
        const opts = [{ label: 'All Branches', value: 'All' }];
        branches.forEach(b => opts.push({ label: b.branch_name, value: b.branch_id.toString() }));
        return opts;
    }, [branches]);

    const getScheduleStatus = (schedule) => {
        const now = new Date();
        const start = new Date(`${schedule.date}T${schedule.start_time}`);
        let end = new Date(`${schedule.date}T${schedule.end_time}`);

        // Handle overnight schedules (e.g., 5 PM to 1 AM)
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }

        if (now > end) return 'COMPLETED';
        if (now >= start && now <= end) return 'LIVE';
        return 'UPCOMING';
    };

    const isLive = (s) => getScheduleStatus(s) === 'LIVE';

    const getStatusColor = (current, total) => {
        const ratio = current / total;
        if (ratio > 0.8) return '#ef4444';
        if (ratio > 0.5) return '#f59e0b';
        return '#10b981';
    };

    // Date helpers
    const todayStr = new Date().toISOString().split('T')[0];

    const pastCutoff = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 2);
        return d.toISOString().split('T')[0];
    })();

    // Filter by search + branch
    const filtered = useMemo(() => {
        return schedules.filter(s => {
            const matchSearch = s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.consultant_name && s.consultant_name.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchBranch = branchFilter === 'All' || s.branch_id?.toString() === branchFilter;
            return matchSearch && matchBranch;
        });
    }, [schedules, searchTerm, branchFilter]);

    // TODAY: schedules whose date === today (LIVE, UPCOMING, COMPLETED of today)
    const todaySchedules = useMemo(() =>
        filtered.filter(s => s.date === todayStr),
        [filtered, todayStr]);

    // PAST: schedules completed in the last 2 days (date >= pastCutoff AND date < today AND COMPLETED)
    const pastSchedules = useMemo(() =>
        filtered.filter(s => s.date >= pastCutoff && s.date < todayStr && getScheduleStatus(s) === 'COMPLETED'),
        [filtered, pastCutoff, todayStr]);

    if (selectedSchedule) {
        return <ScheduleDetailPage
            schedule={selectedSchedule}
            onBack={() => setSelectedSchedule(null)}
            onToast={onToast}
        />;
    }

    if (loading && schedules.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    const ScheduleCard = ({ slot }) => {
        const status = getScheduleStatus(slot);
        const isCompleted = status === 'COMPLETED';
        const isClickable = status === 'LIVE' || status === 'UPCOMING';

        return (
            <div
                key={slot.schedule_id}
                className={`schedule-card${isCompleted ? ' disabled' : ''}`}
                style={{
                    background: isCompleted ? 'rgba(255, 255, 255, 0.03)' : 'var(--bg-card)',
                    borderRadius: '24px',
                    border: `1px solid ${isCompleted ? 'rgba(255, 255, 255, 0.05)' : 'var(--glass-border)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isCompleted ? 'none' : 'var(--shadow-md)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    opacity: isCompleted ? 0.6 : 1,
                    backdropFilter: 'blur(10px)',
                }}
            >
                <span className={`badge live-badge ${status.toLowerCase()}`}>
                    {status}
                </span>

                {!isCompleted && (
                    <div className="actions">
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(slot); }} title="Edit">✏️</button>
                        <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); onDelete(slot.schedule_id); }} title="Delete">🗑️</button>
                    </div>
                )}

                {isCompleted && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '18px', opacity: 0.5 }} title="Completed — read only">🔒</div>
                )}

                <div
                    className="card-clickable-area"
                    onClick={() => setSelectedSchedule(slot)}
                    style={{ padding: '24px', paddingTop: '54px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{slot.service_name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                            <span style={{ opacity: 0.8 }}>👤 Provider:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{slot.consultant_name || 'Counter Service'}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Time Slot</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{slot.start_time} - {slot.end_time}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Date</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>
                                {new Date(slot.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Daily Capacity</span>
                            <span style={{ fontWeight: 800, color: isCompleted ? 'var(--text-muted)' : 'var(--primary)' }}>
                                {slot.current_fill || 0} / {slot.token_count}
                            </span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${((slot.current_fill || 0) / slot.token_count) * 100}%`,
                                background: isCompleted ? 'var(--text-muted)' : 'var(--grad-primary)',
                                borderRadius: '10px',
                                transition: 'width 0.8s ease'
                            }}></div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📍 <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{slot.branch_name}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', background: 'var(--grad-primary)', padding: '6px 14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                            ₹{slot.fees}
                        </div>
                    </div>

                    {isClickable && (
                        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.7 }}>
                            👆 Click to view details
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const SectionHeader = ({ icon, title, count, color }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '12px' }}>
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{title}</h3>
            <span style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '30px', fontSize: '13px', fontWeight: 800 }}>
                {count}
            </span>
        </div>
    );

    return (
        <div className="list-page">
            <SearchFilter
                placeholder="Search schedules by service or provider..."
                onSearch={setSearchTerm}
                onFilter={setBranchFilter}
                filterOptions={branchOptions}
            />

            {/* TODAY SECTION */}
            <div style={{ marginBottom: '32px' }}>
                <SectionHeader icon="📅" title="Today" count={todaySchedules.length} color="#2563eb" />
                {todaySchedules.length === 0 ? (
                    <div className="empty-state-card">
                        No schedules for today
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {todaySchedules.map(slot => <ScheduleCard key={slot.schedule_id} slot={slot} />)}
                    </div>
                )}
            </div>

            {/* PAST 2 DAYS SECTION */}
            <div style={{ marginBottom: '32px' }}>
                <SectionHeader icon="🕐" title="Past (Last 2 Days)" count={pastSchedules.length} color="#64748b" />
                {pastSchedules.length === 0 ? (
                    <div className="empty-state-card">
                        No completed schedules in the last 2 days
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {pastSchedules.map(slot => <ScheduleCard key={slot.schedule_id} slot={slot} />)}
                    </div>
                )}
            </div>

            <div className="list-footer">
                <button className="btn-secondary" onClick={onBackToHome} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏠</span> Back to Dashboard
                </button>
            </div>

            <style>{`
                .schedule-card .actions {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    display: flex;
                    gap: 10px;
                    z-index: 50;
                    opacity: 1;
                    transform: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .live-badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    z-index: 10;
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }
                .live-badge.live { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
                .live-badge.upcoming { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
                .live-badge.completed { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
}

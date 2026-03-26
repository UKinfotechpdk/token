import React, { useState, useEffect } from 'react';
import * as api from '../../api/api';

export default function PaymentModule({ onToast, onNavigate }) {
    const [payments, setPayments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [filters, setFilters] = useState({ branch_id: '', date: '', month: '' });
    const [schedules, setSchedules] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [scheduleDetails, setScheduleDetails] = useState(null);

    const fetchData = async () => {
        try {
            const [bRes, sRes] = await Promise.all([
                api.getBranches(),
                api.getSchedules()
            ]);
            setBranches(bRes.data);
            setSchedules(sRes.data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const fetchPayments = async () => {
        try {
            const params = {};
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.date) params.date = filters.date;
            if (filters.month) params.month = filters.month;
            if (selectedScheduleId) params.schedule_id = selectedScheduleId;
            const res = await api.getPayments(params);
            setPayments(res.data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const fetchScheduleDetails = async (id) => {
        if (!id) {
            setScheduleDetails(null);
            return;
        }
        try {
            const res = await api.getSchedule(id);
            setScheduleDetails(res.data);
        } catch (err) {
            console.error('Error fetching schedule details:', err);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        fetchPayments();
    }, [filters, selectedScheduleId]);

    useEffect(() => {
        fetchScheduleDetails(selectedScheduleId);
    }, [selectedScheduleId]);

    const handleDownloadCSV = () => {
        const params = {};
        if (filters.branch_id) params.branch_id = filters.branch_id;
        if (filters.date) params.date = filters.date;
        if (filters.month) params.month = filters.month;
        if (selectedScheduleId) params.schedule_id = selectedScheduleId;
        api.downloadPaymentCSV(params);
        onToast('Downloading CSV report...', 'success');
    };

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    const filteredSchedules = schedules.filter(s => {
        if (filters.branch_id && s.branch_id !== parseInt(filters.branch_id)) return false;
        if (filters.date && s.date !== filters.date) return false;
        return true;
    });

    return (
        <div className="module-view reports-container">
            <div className="module-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('dashboard')}>
                        <span>🏠</span> Back
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white', letterSpacing: '-0.5px' }}>Financial Reports</h2>
                </div>
            </div>

            <div className="toolbar-actions reports-toolbar premium-filters" style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div className="form-group float-group" style={{ '--stagger': 1, margin: 0 }}>
                    <div className="input-with-icon select-wrapper">
                        <span className="input-icon">🏢</span>
                        <select
                            id="filter-branch"
                            value={filters.branch_id}
                            onChange={e => {
                                setFilters({ ...filters, branch_id: e.target.value });
                                setSelectedScheduleId('');
                            }}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
                        </select>
                        <label htmlFor="filter-branch">Filter by Branch</label>
                    </div>
                </div>

                <div className="form-group float-group" style={{ '--stagger': 2, margin: 0 }}>
                    <div className="input-with-icon">
                        <span className="input-icon">📅</span>
                        <input
                            id="filter-date"
                            type="date"
                            value={filters.date}
                            className="dark-date-input"
                            onChange={e => {
                                setFilters({ ...filters, date: e.target.value });
                                setSelectedScheduleId('');
                            }}
                            placeholder=" "
                        />
                        <label htmlFor="filter-date">Filter by Date</label>
                    </div>
                </div>

                <div className="form-group float-group" style={{ '--stagger': 3, margin: 0 }}>
                    <div className="input-with-icon select-wrapper">
                        <span className="input-icon">📋</span>
                        <select
                            id="filter-schedule"
                            value={selectedScheduleId}
                            onChange={e => setSelectedScheduleId(e.target.value)}
                        >
                            <option value="">All Schedules</option>
                            {filteredSchedules.map(s => (
                                <option key={s.schedule_id} value={s.schedule_id}>
                                    {s.service_name} ({s.start_time}-{s.end_time})
                                </option>
                            ))}
                        </select>
                        <label htmlFor="filter-schedule">Select Specific Schedule</label>
                    </div>
                </div>

                <div className="filter-group reset-btn-container" style={{ display: 'flex', alignItems: 'center' }}>
                    {(filters.branch_id || filters.date || filters.month || selectedScheduleId) && (
                        <button className="btn btn-secondary clear-btn" style={{ width: '100%', height: '54px', borderRadius: '16px', fontWeight: 800, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)' }} onClick={() => {
                            setFilters({ branch_id: '', date: '', month: '' });
                            setSelectedScheduleId('');
                        }}>✕ Clear</button>
                    )}
                </div>
            </div>

            <div className={`reports-hero-grid ${selectedScheduleId ? 'with-schedule' : ''}`}>
                <div className="revenue-hero-card">
                    <div className="card-content" style={{ position: 'relative', zIndex: 2 }}>
                        <div className="label" style={{ opacity: 0.8, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {selectedScheduleId ? 'Schedule Revenue' : 'Total Portfolio Revenue'}
                        </div>
                        <div className="amount" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 950, margin: '12px 0', letterSpacing: '-1.5px', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="stats-row" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '24px' }}>
                            <div className="badge-pill" style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 800, backdropFilter: 'blur(5px)' }}>
                                {payments.length} Transactions
                            </div>
                            <button className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)', fontWeight: 900, borderRadius: '14px', padding: '10px 24px' }} onClick={handleDownloadCSV}>
                                📥 Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="deco-icon" style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '160px', opacity: 0.1, pointerEvents: 'none' }}>💰</div>
                </div>

                {scheduleDetails && (
                    <div className="glass-card-premium meta-info-card">
                        <div className="card-header" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'white' }}>Service Meta</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Core configuration for this queue</p>
                        </div>
                        <div className="meta-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="meta-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="meta-label" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Branch</div>
                                <div className="meta-value" style={{ fontWeight: 800, fontSize: '15px', marginTop: '4px', color: 'white' }}>{scheduleDetails.branch_name}</div>
                            </div>
                            <div className="meta-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="meta-label" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Provider</div>
                                <div className="meta-value" style={{ fontWeight: 800, fontSize: '15px', marginTop: '4px', color: 'white' }}>{scheduleDetails.consultant_name || 'Generic'}</div>
                            </div>
                            <div className="meta-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="meta-label" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Window</div>
                                <div className="meta-value" style={{ fontWeight: 800, fontSize: '15px', marginTop: '4px', color: 'white' }}>{scheduleDetails.start_time} - {scheduleDetails.end_time}</div>
                            </div>
                            <div className="meta-item" style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                                <div className="meta-label" style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Series</div>
                                <div className="meta-value" style={{ fontWeight: 900, fontSize: '15px', marginTop: '4px', color: 'white' }}>{scheduleDetails.token_series}-Series</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedScheduleId && scheduleDetails && (
                <div className="stats-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className="stat-mini-card-premium">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Capacity</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>{scheduleDetails.token_count}</div>
                    </div>
                    <div className="stat-mini-card-premium">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Booked</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>{scheduleDetails.tokens?.filter(t => t.status !== 'Available').length}</div>
                    </div>
                    <div className="stat-mini-card-premium">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Served</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--secondary)', marginTop: '4px' }}>{scheduleDetails.tokens?.filter(t => t.status === 'Completed').length}</div>
                    </div>
                    <div className="stat-mini-card-premium">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-3)', marginTop: '4px' }}>{scheduleDetails.tokens?.filter(t => t.status === 'Available').length}</div>
                    </div>
                </div>
            )}

            {selectedScheduleId && scheduleDetails ? (
                <div className="glass-card-premium table-container-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="card-header-flex" style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="pulse-dot" style={{ width: '12px', height: '12px', background: 'var(--secondary)', borderRadius: '50%', boxShadow: '0 0 12px var(--secondary)' }}></div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>Live Token Distribution</h3>
                        </div>
                        <button className="btn btn-secondary" style={{ borderRadius: '12px', padding: '10px 20px', fontSize: '13px', fontWeight: 800 }} onClick={() => fetchScheduleDetails(selectedScheduleId)}>🔄 Refresh Data</button>
                    </div>
                    <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                        <table className="token-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Token</th>
                                    <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Visitor Info</th>
                                    <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Status</th>
                                    <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Scheduled Slot</th>
                                    <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduleDetails.tokens?.map(token => {
                                    const payment = payments.find(p => p.token_id === token.token_id);
                                    const statusColors = {
                                        'Available': { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', icon: '🎫' },
                                        'Booked': { bg: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', icon: '📅' },
                                        'Serving': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: '⚡' },
                                        'Completed': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', icon: '✅' },
                                        'Cancelled': { bg: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-2)', icon: '❌' }
                                    };
                                    const config = statusColors[token.status] || statusColors['Available'];

                                    return (
                                        <tr key={token.token_id} className="token-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary)', justifyContent: 'center' }}>{token.token_number}</div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                {token.customer_name ? (
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>{token.customer_name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: {token.reason || 'Service Booking'}</div>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: '14px' }}>Waiting for booking...</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', background: config.bg, color: config.color, border: `1px solid ${config.color}20` }}>
                                                    <span>{config.icon}</span> {token.status}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{token.time_slot}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Auto-assigned</div>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                {payment ? (
                                                    <div>
                                                        <div style={{ fontWeight: 900, fontSize: '16px', color: 'var(--secondary)' }}>₹{payment.amount.toLocaleString()}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{payment.payment_method} • Verified</div>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: 'var(--text-muted)', opacity: 0.5, fontWeight: 700 }}>Pending</div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    {payments.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon-main">🔎</div>
                            <h3 className="empty-title">No Data Available</h3>
                            <p className="empty-desc">Try adjusting your branch or date filters to find records.</p>
                        </div>
                    ) : (
                        <div className="payments-grid">
                            {payments.map(p => (
                                <div key={p.payment_id} className="payment-card-premium">
                                    <div className="card-top">
                                        <div className="token-info">
                                            <div className="icon-box-small">🎫</div>
                                            <h4 className="token-num">#{p.token_number}</h4>
                                        </div>
                                        <div className="payment-val">₹{p.amount.toLocaleString()}</div>
                                    </div>
                                    <div className="card-bottom">
                                        <span className="card-meta">📍 {p.branch_name}</span>
                                        <span className="card-meta">📅 {p.payment_date}</span>
                                        <span className={`badge badge-${p.payment_status.toLowerCase()} status-badge`}>{p.payment_status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            <style>{`
                .reports-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .reports-hero-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .reports-hero-grid.with-schedule {
                    grid-template-columns: 1.5fr 1fr;
                }

                .empty-state {
                    background: var(--bg-card);
                    border-radius: 32px;
                    padding: 100px 20px;
                    text-align: center;
                    border: 1px dashed var(--glass-border);
                    backdrop-filter: blur(20px);
                }

                .icon-main { font-size: 80px; filter: drop-shadow(0 0 20px rgba(255,255,255,0.1)); }
                .empty-title { font-weight: 950; margin-top: 24px; color: white; font-size: 1.5rem; }
                .empty-desc { color: var(--text-muted); font-size: 1.1rem; max-width: 400px; margin: 12px auto; }

                .payments-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 24px;
                }

                .payment-card-premium {
                    padding: 24px;
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    background: var(--bg-card);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }
                .payment-card-premium:hover {
                    transform: translateY(-5px);
                    border-color: var(--secondary);
                    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1);
                }

                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .token-info { display: flex; align-items: center; gap: 12px; }
                .icon-box-small { width: 44px; height: 44px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .token-num { margin: 0; font-size: 1.1rem; font-weight: 900; color: white; }
                .payment-val { font-weight: 950; color: var(--secondary); font-size: 1.25rem; }

                .card-bottom {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 16px;
                    align-items: center;
                }

                .card-meta { font-size: 12px; font-weight: 700; color: var(--text-muted); display: flex; alignItems: center; gap: 4px; }

                .token-row:hover {
                    background: rgba(255, 255, 255, 0.02) !important;
                }

                @media (max-width: 1024px) {
                    .reports-hero-grid.with-schedule {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .reports-hero-grid { grid-template-columns: 1fr; }
                    .payments-grid { grid-template-columns: 1fr; }
                }

                input[type="date"].dark-date-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.7;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

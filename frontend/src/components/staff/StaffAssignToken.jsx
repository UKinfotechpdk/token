import React, { useState, useEffect } from 'react';
import * as api from '../../api/api';

function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
}

export default function StaffAssignToken({ staff, onToast, onNavigate }) {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;

    const [schedules, setSchedules] = useState([]);
    const [selectedSched, setSelectedSched] = useState(null);
    const [tokens, setTokens] = useState([]);

    // Multi-step form state
    const [customerName, setCustomerName] = useState('');
    const [customerAge, setCustomerAge] = useState('');
    const [customerGender, setCustomerGender] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingTokens, setFetchingTokens] = useState(false);
    const [lastAssigned, setLastAssigned] = useState(null);

    // To track token changes from background polling
    const prevNextTokenRef = React.useRef(null);
    const selfAssignedRef = React.useRef(false);

    useEffect(() => { fetchSchedules(); }, []);

    const fetchSchedules = async () => {
        try {
            const res = await api.getSchedules();
            const d = new Date();
            const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const todaySchedules = res.data.filter(s => {
                const isToday = s.date && String(s.date).startsWith(todayStr);
                const isBranch = staff?.branch_id ? String(s.branch_id) === String(staff.branch_id) : true;
                return isToday && isBranch;
            });
            setSchedules(todaySchedules);
        } catch (err) {
            onToast('Failed to load schedules', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSchedule = async (schedId) => {
        setLastAssigned(null);
        resetForm();
        setFetchingTokens(true);

        const sched = schedules.find(s => s.schedule_id === parseInt(schedId));
        setSelectedSched(sched);
        if (!sched) {
            setTokens([]);
            setFetchingTokens(false);
            return;
        }
        await fetchTokens(sched.schedule_id);
        setFetchingTokens(false);
    };

    const resetForm = () => {
        setCustomerName('');
        setCustomerAge('');
        setCustomerGender('');
        setCustomerPhone('');
        setPaymentMethod('Cash');
        setErrors({});
    };

    const fetchTokens = async (schedId, isSilent = false) => {
        try {
            const res = await api.getTokens(schedId);
            setTokens(res.data);
        } catch (err) {
            if (!isSilent) onToast('Failed to load tokens', 'error');
        }
    };

    // Polling mechanism for real-time synchronization
    useEffect(() => {
        let interval;
        if (selectedSched) {
            interval = setInterval(() => {
                fetchTokens(selectedSched.schedule_id, true);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedSched]);

    const nextToken = tokens.find(t => t.status === 'Available');
    const bookedCount = tokens.filter(t => t.status !== 'Available').length;

    // Detect if nextToken shifted due to background online booking
    useEffect(() => {
        if (!fetchingTokens && nextToken && prevNextTokenRef.current) {
            if (prevNextTokenRef.current !== nextToken.token_id && !selfAssignedRef.current) {
                // The token ID changed, but we didn't assign it ourselves!
                onToast(`Online Update! A user just booked. Draft token shifted to ${nextToken.token_number}`, 'warning');
            }
        }
        prevNextTokenRef.current = nextToken ? nextToken.token_id : null;
        if (selfAssignedRef.current) {
            selfAssignedRef.current = false; // Reset the self-assigned flag after it processed the shift
        }
    }, [nextToken, fetchingTokens]);

    const handleAssign = async () => {
        if (!nextToken) {
            onToast('No available tokens left!', 'error');
            return;
        }

        const newErrors = {};
        if (!customerName.trim()) newErrors.customerName = 'Full Name is required';
        if (!customerAge) newErrors.customerAge = 'Age is required';
        if (!customerGender) newErrors.customerGender = 'Gender is required';
        if (!customerPhone.trim()) newErrors.customerPhone = 'Mobile Number is required';
        else if (customerPhone.length !== 10) newErrors.customerPhone = 'Must be exactly 10 digits';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            onToast('Please fix the errors in the form', 'error');
            return;
        }
        setErrors({});

        const previousTokens = [...tokens];
        // Optimistically update local tokens state so UI changes *instantly*
        setTokens(prev => prev.map(t => t.token_id === nextToken.token_id ? { ...t, status: 'Booked' } : t));

        setSubmitting(true);
        selfAssignedRef.current = true; // Mark that WE are causing the upcoming token shift
        try {
            await api.updateTokenStatus(nextToken.token_id, {
                status: 'Booked',
                customer_name: customerName.trim(),
                customer_age: customerAge,
                customer_gender: customerGender,
                customer_phone: '+91' + customerPhone.trim(),
                payment_method: paymentMethod
            });
            setLastAssigned({
                token_number: nextToken.token_number,
                customer_name: customerName.trim(),
                time_slot: nextToken.time_slot
            });
            resetForm();
            onToast(`Token ${nextToken.token_number} assigned successfully!`, 'success');
            await fetchTokens(selectedSched.schedule_id);

            // Navigate to print view with data for auto-print
            setTimeout(() => {
                onNavigate('printtoken', {
                    token: { ...nextToken, customer_name: customerName.trim() },
                    schedule: selectedSched
                });
            }, 1000);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                onToast(`Token ${nextToken.token_number} was just booked online. View updated to next token!`, 'error');
                await fetchTokens(selectedSched.schedule_id);
            } else {
                setTokens(previousTokens); // Revert on general failure
                onToast('Failed to assign token.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="module-view" style={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', animation: 'fadeIn 0.5s ease', paddingBottom: '40px' }}>
            <div className="module-header" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-back" onClick={() => onNavigate('dashboard')}>
                        ← <span>Back</span>
                    </button>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>👤</span>
                        Book New Token
                    </h2>
                </div>
            </div>

            {/* Schedule Selector - premium Grid */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--slate-500)' }}>
                        Select Service Counter
                    </span>
                </div>

                <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
                    {schedules.map(s => {
                        const isActive = selectedSched?.schedule_id === s.schedule_id;
                        return (
                            <div
                                key={s.schedule_id}
                                onClick={() => handleSelectSchedule(s.schedule_id)}
                                className={`glass-card ${isActive ? 'active' : ''}`}
                                style={{
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                    background: isActive ? 'white' : 'white',
                                    boxShadow: isActive ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                    transform: isActive ? 'translateY(-4px)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <span className="badge badge-booked" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: 'none' }}>
                                        📋 {s.service_name || 'General'}
                                    </span>
                                    {isActive && <span style={{ fontSize: '18px' }}>✅</span>}
                                </div>

                                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800', color: 'var(--slate-800)' }}>
                                    {s.branch_name}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--slate-600)', fontWeight: '500' }}>
                                        <span style={{ opacity: 0.7 }}>🕓</span>
                                        <strong>{s.start_time} - {s.end_time}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--slate-600)', fontWeight: '500' }}>
                                        <span style={{ opacity: 0.7 }}>🎟️</span>
                                        <span>Capacity: {s.token_count}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedSched && (
                <div style={{ animation: 'slideUpScale 0.4s ease', width: '100%', boxSizing: 'border-box', marginTop: '32px' }}>
                    {fetchingTokens ? (
                        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--glass-border)' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: 'var(--primary)' }}></div>
                            <h3 style={{ margin: 0, color: 'var(--slate-700)', fontSize: '18px', fontWeight: '800' }}>Syncing Live Tokens...</h3>
                            <p style={{ margin: '8px 0 0 0', color: 'var(--slate-500)', fontSize: '14px' }}>Please wait while we lock the next available slot.</p>
                        </div>
                    ) : (
                        /* Stats and Form container */
                        <div className="assign-token-grid" style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                            {/* Stats Sidebar */}
                            <div style={{ display: isTablet ? 'grid' : 'flex', flexDirection: isTablet ? undefined : 'column', gridTemplateColumns: isTablet ? `repeat(auto-fit, minmax(${isMobile ? '120px' : '160px'}, 1fr))` : undefined, gap: '16px' }}>
                                <div style={{ background: 'var(--grad-success)', padding: '24px', textAlign: 'center', borderRadius: '20px', color: 'white', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Available</div>
                                    <div style={{ fontSize: '36px', fontWeight: '900', color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>{tokens.filter(t => t.status === 'Available').length}</div>
                                </div>
                                <div style={{ background: 'var(--grad-primary)', padding: '24px', textAlign: 'center', borderRadius: '20px', color: 'white', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Service Fee</div>
                                    <div style={{ fontSize: '36px', fontWeight: '900', color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>Rs. {selectedSched.fees}</div>
                                </div>

                                {nextToken && (
                                    <div className="revenue-hero-card" style={{ padding: '24px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px' }}>Draft Token</div>
                                        <div style={{ fontSize: '48px', fontWeight: '900' }}>{nextToken.token_number}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '8px' }}>{nextToken.time_slot}</div>
                                    </div>
                                )}
                            </div>

                            {/* Booking Form */}
                            <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                                {nextToken ? (
                                    <>
                                        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                                            Booking Registration
                                        </h3>

                                        <div className="booking-form-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                                            <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                                                <label>Full Name</label>
                                                <input
                                                    type="text"
                                                    value={customerName}
                                                    onChange={(e) => { setCustomerName(e.target.value); setErrors(prev => ({ ...prev, customerName: null })) }}
                                                    placeholder="Enter full name..."
                                                    className="search-input"
                                                    style={{ width: '100%', maxWidth: 'none', minWidth: '0', paddingLeft: '16px', backgroundImage: 'none', borderColor: errors.customerName ? '#ef4444' : '' }}
                                                    autoFocus
                                                />
                                                {errors.customerName && <div className="error-text" style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>{errors.customerName}</div>}
                                            </div>

                                            <div className="form-group">
                                                <label>Age</label>
                                                <input
                                                    type="number"
                                                    value={customerAge}
                                                    onChange={(e) => { setCustomerAge(e.target.value); setErrors(prev => ({ ...prev, customerAge: null })) }}
                                                    placeholder="Age"
                                                    className="search-input"
                                                    style={{ width: '100%', maxWidth: 'none', minWidth: '0', paddingLeft: '16px', backgroundImage: 'none', borderColor: errors.customerAge ? '#ef4444' : '' }}
                                                />
                                                {errors.customerAge && <div className="error-text" style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>{errors.customerAge}</div>}
                                            </div>

                                            <div className="form-group">
                                                <label>Gender</label>
                                                <select
                                                    value={customerGender}
                                                    onChange={(e) => { setCustomerGender(e.target.value); setErrors(prev => ({ ...prev, customerGender: null })) }}
                                                    className="search-input"
                                                    style={{ width: '100%', maxWidth: 'none', minWidth: '0', paddingLeft: '16px', backgroundImage: 'none', borderColor: errors.customerGender ? '#ef4444' : '' }}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {errors.customerGender && <div className="error-text" style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>{errors.customerGender}</div>}
                                            </div>

                                            <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                                                <label>Mobile Number</label>
                                                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                                    <div style={{
                                                        padding: '0 16px', background: 'var(--bg-input)',
                                                        border: '1px solid ' + (errors.customerPhone ? '#ef4444' : 'var(--glass-border)'),
                                                        borderRight: 'none', borderRadius: '12px 0 0 12px',
                                                        display: 'flex', alignItems: 'center', fontWeight: '800', color: 'var(--text-main)'
                                                    }}>
                                                        +91
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        value={customerPhone}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            if (val.length <= 10) {
                                                                setCustomerPhone(val);
                                                                setErrors(prev => ({ ...prev, customerPhone: null }));
                                                            }
                                                        }}
                                                        placeholder="Enter exactly 10 digits"
                                                        className="search-input"
                                                        style={{
                                                            flex: 1, width: '100%', maxWidth: 'none', minWidth: '0', paddingLeft: '16px', backgroundImage: 'none',
                                                            borderColor: errors.customerPhone ? '#ef4444' : '', borderRadius: '0 12px 12px 0'
                                                        }}
                                                    />
                                                </div>
                                                {errors.customerPhone && <div className="error-text" style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>{errors.customerPhone}</div>}
                                            </div>

                                            <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2', marginTop: '12px' }}>
                                                <label style={{ marginBottom: '16px', display: 'block' }}>Payment Method</label>
                                                <div className="payment-method-toggle" style={{ display: 'flex', gap: '16px' }}>
                                                    {['Cash', 'UPI'].map(method => (
                                                        <div
                                                            key={method}
                                                            onClick={() => setPaymentMethod(method)}
                                                            style={{
                                                                flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid',
                                                                borderColor: paymentMethod === method ? 'var(--primary)' : 'var(--glass-border)',
                                                                background: paymentMethod === method ? 'var(--primary)' : 'var(--bg-input)',
                                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                                                fontWeight: '800', color: paymentMethod === method ? 'white' : 'var(--text-main)'
                                                            }}
                                                        >
                                                            {method === 'Cash' ? '💵 ' : '📱 '} {method}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                                            <button
                                                className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
                                                onClick={handleAssign}
                                                disabled={submitting}
                                                style={{ width: '100%', height: isMobile ? '52px' : '60px', fontSize: isMobile ? '15px' : '18px', borderRadius: '16px', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                                            >
                                                {submitting && <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px', borderTopColor: 'transparent', borderRightColor: 'white', borderBottomColor: 'white', borderLeftColor: 'white' }}></div>}
                                                {submitting ? 'Booking Token...' : `Confirm & Book Token ${nextToken.token_number}`}
                                            </button>
                                            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--slate-500)', marginTop: '16px' }}>
                                                Total Amount: <strong style={{ color: 'var(--text-main)' }}>Rs. {selectedSched.fees}</strong> will be collected via {paymentMethod}.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state" style={{ minHeight: '300px' }}>
                                        <div className="icon">🚫</div>
                                        <h3>Schedule Full</h3>
                                        <p>No more slots available for this service today.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Feedback Animation */}
                    {lastAssigned && (
                        <div className="toast toast-success" style={{
                            position: 'static', transform: 'none', width: '100%', minWidth: '0',
                            marginTop: '24px', borderLeft: '6px solid var(--success)', borderRadius: '16px',
                            padding: '24px', animation: 'slideInDown 0.3s ease'
                        }}>
                            <div style={{ fontSize: '32px' }}>✨</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--slate-800)' }}>
                                    Success! Token {lastAssigned.token_number} Live
                                </div>
                                <div style={{ color: 'var(--slate-500)', fontSize: '14px', marginTop: '2px' }}>
                                    Assigned to <strong>{lastAssigned.customer_name}</strong> for {lastAssigned.time_slot}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


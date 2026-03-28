import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

export default function StaffPrintToken({ staff, onToast, onNavigate, initialData }) {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;
    const [schedules, setSchedules] = useState([]);
    const [selectedSched, setSelectedSched] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [tokensBySchedule, setTokensBySchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [tokenToPrint, setTokenToPrint] = useState(null);
    const [error, setError] = useState(null);

    const printRef = useRef();

    const [searchTerm, setSearchTerm] = useState('');
    const hasAutoPrinted = useRef(false);

    useEffect(() => {
        fetchData();

        // Handle auto-print if initialData was passed from StaffApp
        if (initialData?.token && initialData?.schedule && !hasAutoPrinted.current) {
            setSelectedSched(initialData.schedule);
            setTokenToPrint(initialData.token);

            // Set a small delay to ensure the DOM is rendered before printing
            const timer = setTimeout(() => {
                window.print();
                hasAutoPrinted.current = true;
                onToast(`Automated print triggered for Token ${initialData.token.token_number}`, 'success');
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [initialData]);

    const fetchData = async () => {
        setLoading(true);
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

            // Fetch tokens for each today's schedule in parallel
            const tokenPromises = todaySchedules.map(async (s) => {
                try {
                    const tRes = await api.getTokens(s.schedule_id);
                    return { id: s.schedule_id, data: tRes.data };
                } catch (e) {
                    console.error(`Failed to fetch tokens for schedule ${s.schedule_id}`, e);
                    return { id: s.schedule_id, data: [] };
                }
            });

            const results = await Promise.all(tokenPromises);
            const newTokenMap = {};
            results.forEach(r => {
                newTokenMap[r.id] = r.data;
            });
            setTokensBySchedule(newTokenMap);
        } catch (err) {
            onToast('Failed to load system data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Check if a schedule's end time has passed
    const isScheduleCompleted = (s) => {
        if (!s.end_time) return false;
        const [h, m] = s.end_time.split(':').map(Number);
        const end = new Date();
        end.setHours(h, m, 0, 0);
        return new Date() > end;
    };

    const handleSelectSchedule = async (schedId) => {
        const sched = schedules.find(s => s.schedule_id === parseInt(schedId));
        setSelectedSched(sched);
        setTokenToPrint(null);
        setSearchTerm('');

        if (!sched) {
            setTokens([]);
            return;
        }

        // Use pre-fetched tokens if available
        if (tokensBySchedule[sched.schedule_id]) {
            setTokens(tokensBySchedule[sched.schedule_id].filter(t => t.status !== 'Available'));
        } else {
            await fetchTokens(sched.schedule_id);
        }
    };

    const fetchTokens = async (schedId) => {
        try {
            const res = await api.getTokens(schedId);
            // Only show tokens that have been Booked, Serving, or Completed
            setTokens(res.data.filter(t => t.status !== 'Available'));
        } catch (err) {
            onToast('Failed to load tokens', 'error');
        }
    };

    const filteredTokens = tokens.filter(t =>
        t.token_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const triggerSafePrint = () => {
        if (!tokenToPrint) return;
        window.print();
        onToast(`Printing slip for Token ${tokenToPrint.token_number}`, 'success');
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="module-view" style={{ maxWidth: '1400px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: isMobile ? '12px' : '20px' }}>
            <div className="no-print">
                <div className="module-header" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="btn-back" onClick={() => onNavigate('dashboard')}>
                            ← <span>Back</span>
                        </button>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>🖨️</span>
                            Re-Print Token
                        </h2>
                    </div>
                </div>

                {/* Schedule Selector - Premium Grid */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--slate-500)' }}>
                            Choose Service Counter
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '12px' : '16px' }}>
                        {schedules.map(s => {
                            const isActive = selectedSched?.schedule_id === s.schedule_id;
                            const isTimePast = isScheduleCompleted(s);
                            const schedTokens = tokensBySchedule[s.schedule_id] || [];
                            const allTokensFinished = schedTokens.length > 0 && schedTokens.every(t => ['Completed', 'No-Show', 'Cancelled'].includes(t.status));
                            const isFullyDone = isTimePast || allTokensFinished;

                            return (
                                <div
                                    key={s.schedule_id}
                                    onClick={() => !isFullyDone && handleSelectSchedule(s.schedule_id)}
                                    className={`glass-card ${isActive ? 'active' : ''}`}
                                    style={{
                                        padding: '20px',
                                        cursor: isFullyDone ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: isFullyDone ? '1px solid var(--glass-border)' : isActive ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                        background: isFullyDone ? 'var(--bg-card)' : isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                        boxShadow: (isActive && !isFullyDone) ? 'var(--shadow-md)' : 'none',
                                        transform: (isActive && !isFullyDone) ? 'translateY(-4px)' : 'none',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        opacity: isFullyDone ? 0.7 : 1,
                                    }}
                                >
                                    {/* COMPLETED stamp overlay for ended or completed sessions */}
                                    {isFullyDone && (
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 10, pointerEvents: 'auto',
                                            background: isTimePast ? 'rgba(239, 68, 68, 0.05)' : 'rgba(37, 99, 235, 0.05)',
                                            backdropFilter: 'blur(3px)'
                                        }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div style={{
                                                border: `4px solid ${isTimePast ? 'rgba(239, 68, 68, 0.7)' : 'rgba(37, 99, 235, 0.7)'}`,
                                                color: isTimePast ? 'rgba(239, 68, 68, 0.8)' : 'rgba(37, 99, 235, 0.8)',
                                                padding: '8px 20px',
                                                borderRadius: '12px',
                                                fontSize: '22px',
                                                fontWeight: '900',
                                                letterSpacing: '3px',
                                                textTransform: 'uppercase',
                                                transform: 'rotate(-15deg)',
                                                textShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                userSelect: 'none',
                                                boxShadow: `inset 0 0 15px ${isTimePast ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)'}`,
                                                background: 'rgba(255, 255, 255, 0.1)'
                                            }}>
                                                {isTimePast ? 'ENDED' : 'COMPLETED'}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: isFullyDone ? 'var(--text-muted)' : 'var(--slate-800)' }}>
                                            {s.service_name || 'General'}
                                        </h4>
                                        {isTimePast && <span style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626', letterSpacing: '1px', opacity: 0.8 }}>ENDED</span>}
                                        {allTokensFinished && !isTimePast && <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', opacity: 0.8 }}>DONE</span>}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>📍</span> {s.branch_name}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                        <span>🕓</span> {s.start_time} - {s.end_time}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selectedSched && (
                    <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.2fr 1fr', gap: '32px', animation: 'slideUpScale 0.4s ease', width: '100%', boxSizing: 'border-box' }}>
                        {/* Token List Area */}
                        <div>
                            <div className="glass-card" style={{ padding: isMobile ? '16px' : '24px', minHeight: isMobile ? 'auto' : '400px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--slate-800)' }}>Recent Tokens</h3>
                                    <input
                                        type="text"
                                        placeholder="Search number or name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                        style={{ width: isMobile ? '100%' : '200px', margin: 0, height: '40px', fontSize: '13px' }}
                                    />
                                </div>

                                {filteredTokens.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', overflowY: 'auto', maxHeight: '450px', paddingRight: '8px' }}>
                                        {filteredTokens.map(t => (
                                            <div
                                                key={t.token_id}
                                                onClick={() => setTokenToPrint(t)}
                                                style={{
                                                    padding: '16px', borderRadius: '14px', border: '1px solid',
                                                    borderColor: tokenToPrint?.token_id === t.token_id ? 'var(--primary)' : 'var(--glass-border)',
                                                    background: tokenToPrint?.token_id === t.token_id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>
                                                    {t.token_number}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {t.customer_name || 'Walk-in'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', opacity: 0.7 }}>
                                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔎</div>
                                        <div>No matching tokens found</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Print Preview Area */}
                        <div style={{ position: isTablet ? 'static' : 'sticky', top: '24px' }}>
                            {tokenToPrint ? (
                                <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '32px', textAlign: 'center', border: '2px dashed var(--primary)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                                        Slip Preview
                                    </div>

                                    <div style={{
                                        background: '#fff',
                                        color: '#0f172a',
                                        padding: '24px 16px',
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        marginBottom: '32px',
                                        width: '100%',
                                        maxWidth: '300px',
                                        margin: '0 auto 32px',
                                        fontFamily: "'Courier New', Courier, monospace"
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#000' }}>TOKEN KIOSK</div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Customer Token Slip</div>

                                        <div style={{ fontSize: '48px', fontWeight: '950', color: '#0f172a', margin: '16px 0' }}>{tokenToPrint.token_number}</div>

                                        <div style={{ textAlign: 'left', fontSize: '11px', lineHeight: '1.6', marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Customer:</span>
                                                <strong style={{ color: '#334155' }}>{tokenToPrint.customer_name || 'Guest'}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Slot:</span>
                                                <strong style={{ color: '#334155' }}>{tokenToPrint.time_slot}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Counter:</span>
                                                <strong style={{ color: '#334155' }}>{selectedSched.branch_name}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={triggerSafePrint}
                                        style={{ width: '100%', height: '60px', fontSize: '18px', borderRadius: '16px', fontWeight: '900', boxShadow: 'var(--shadow-lg)' }}
                                    >
                                        🖨️ Re-Print Token Slip
                                    </button>
                                </div>
                            ) : (
                                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <div style={{ fontSize: '48px' }}>👈</div>
                                    <h3 style={{ margin: '16px 0 8px 0' }}>Select a Token</h3>
                                    <p style={{ margin: 0, fontSize: '14px' }}>Click a token from the list to see preview and print</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Print Only Area - Rendered via Portal at Body level for accuracy */}
            {
                tokenToPrint && selectedSched && createPortal(
                    <div className="print-only">
                        <div className="thermal-slip">
                            <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>TOKEN KIOSK</div>
                            <div style={{ fontSize: '10px', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                                Customer Token Slip
                            </div>

                            <div style={{ fontSize: '48px', fontWeight: '950', margin: '10px 0', lineHeight: 1 }}>
                                {tokenToPrint.token_number}
                            </div>

                            <div style={{ textAlign: 'left', fontSize: '11px', borderTop: '1px dashed #000', paddingTop: '8px', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', width: '100%' }}>
                                    <span>DATE:</span>
                                    <strong style={{ marginLeft: 'auto' }}>{selectedSched.date}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', width: '100%' }}>
                                    <span>SERVICE:</span>
                                    <strong style={{ marginLeft: 'auto' }}>{selectedSched.service_name || 'General'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', width: '100%' }}>
                                    <span>COUNTER:</span>
                                    <strong style={{ marginLeft: 'auto' }}>{selectedSched.branch_name}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', width: '100%' }}>
                                    <span>TIME:</span>
                                    <strong style={{ marginLeft: 'auto' }}>{selectedSched.start_time}-{selectedSched.end_time}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #ccc', marginTop: '6px', paddingTop: '6px', width: '100%' }}>
                                    <span>FEE:</span>
                                    <strong style={{ marginLeft: 'auto' }}>Rs. {selectedSched.fees}</strong>
                                </div>

                                <div style={{ marginTop: '12px', fontSize: '9px', textAlign: 'center', fontStyle: 'italic', borderTop: '1px solid #000', paddingTop: '8px', width: '100%' }}>
                                    Thank you for choosing us!
                                    <br />
                                    Please wait for your turn.
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            <style>{`
                /* Normal View: Hide printable slip */
                .print-only {
                    display: none;
                }

                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    html, body {
                        background: #fff !important;
                        width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    /* Complete Hiding of main app UI */
                    #root, .app-container, .no-print, header, footer, .top-header, .main-content {
                        display: none !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }
                    /* Display the printing container */
                    .print-only {
                        display: block !important;
                        width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        visibility: visible !important;
                    }
                    .thermal-slip {
                        width: 100% !important;
                        max-width: 80mm;
                        margin: 0;
                        padding: 2mm 4mm;
                        font-family: 'Courier New', Courier, monospace;
                        color: #000;
                        text-align: center;
                        background: #fff;
                    }
                    /* Robust visibility for all content */
                    .thermal-slip, .thermal-slip * {
                        visibility: visible !important;
                        opacity: 1 !important;
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </div >
    );
}

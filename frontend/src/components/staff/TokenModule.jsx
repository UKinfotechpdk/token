import React, { useState } from 'react';

export default function TokenModule({
    selectedSched,
    tokens,
    onUpdate,
    onCallNext,
    onBack,
    calling,
    processingId,
    readOnly = false
}) {
    const stats = {
        Total: tokens.length,
        Available: tokens.filter(t => t.status === 'Available').length,
        Booked: tokens.filter(t => t.status === 'Booked').length,
        Serving: tokens.filter(t => t.status === 'Serving').length,
        Completed: tokens.filter(t => t.status === 'Completed').length,
    };

    const currentServing = tokens.find(t => t.status === 'Serving');
    const nextInQueue = tokens.find(t => t.status === 'Booked');

    const isExpired = () => {
        const now = new Date();
        const schedEnd = new Date(`${selectedSched.date} ${selectedSched.end_time}`);
        return now > schedEnd;
    };
    const expired = isExpired();

    // Schedule metadata block
    const ScheduleDetail = () => (
        <div className="glass-card" style={{
            padding: '24px 40px', marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 23, 42, 0.6))',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '20px', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px -15px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'left' }}>
                    <div className="card-meta" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '4px' }}>Service</div>
                    <div className="card-label" style={{ fontSize: '18px', fontWeight: '950' }}>{selectedSched.service_name || 'General'}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div className="card-meta" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '4px' }}>Time Slot</div>
                    <div style={{ fontSize: '18px', fontWeight: '950', color: expired ? 'var(--danger)' : '#ffffff' }}>
                        {selectedSched.start_time} - {selectedSched.end_time}
                        {expired && <span style={{ marginLeft: '12px', color: 'var(--danger)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>(EXPIRED)</span>}
                    </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div className="card-meta" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '4px' }}>Capacity</div>
                    <div className="card-label" style={{ fontSize: '18px', fontWeight: '950' }}>{selectedSched.token_count} Tokens</div>
                </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onBack} style={{
                borderRadius: '16px', padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff !important',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: '900', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px'
            }}>
                Change Schedule
            </button>
        </div>
    );

    // Live Summary Cards
    const LiveSummary = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {[
                { label: 'Total Tokens', value: stats.Total, bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', shadow: 'rgba(100, 116, 139, 0.4)' },
                { label: 'Available', value: stats.Available, bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.4)' },
                { label: 'Booked', value: stats.Booked, bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', shadow: 'rgba(56, 189, 248, 0.4)' },
                { label: 'Serving', value: stats.Serving, bg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', shadow: 'rgba(251, 191, 36, 0.4)' },
                { label: 'Completed', value: stats.Completed, bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', shadow: 'rgba(139, 92, 246, 0.4)' },
            ].map((stat, i) => (
                <div key={i} style={{
                    padding: '24px 20px', textAlign: 'center',
                    background: stat.bg,
                    borderRadius: '24px',
                    boxShadow: `0 15px 35px -5px ${stat.shadow}, inset 0 2px 4px rgba(255,255,255,0.3)`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateZ(0)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        fontSize: '11px', textTransform: 'uppercase', fontWeight: '950',
                        letterSpacing: '1.5px', marginBottom: '14px', color: 'rgba(255,255,255,0.9)'
                    }}>{stat.label}</div>
                    <div style={{
                        fontSize: '44px', fontWeight: '950', letterSpacing: '-2px',
                        color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}>{stat.value}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ animation: 'slideUpScale 0.4s ease' }}>
            <ScheduleDetail />
            <LiveSummary />

            {/* Now Serving Highlight */}
            <div className="glass-card" style={{
                background: currentServing
                    ? 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' // Deep rich slate
                    : 'rgba(255, 255, 255, 0.02)', // Minimal glass for standby
                border: currentServing ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--glass-border)',
                padding: '56px 48px',
                marginBottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '32px',
                color: 'white',
                boxShadow: currentServing ? '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 40px rgba(37, 99, 235, 0.1)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '40px',
                backdropFilter: 'blur(25px)'
            }}>
                <div style={{ zIndex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '5px', color: currentServing ? 'var(--secondary)' : 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
                        {currentServing ? '🎯 Now Serving' : '📭 Currently Idle'}
                    </div>
                    <div style={{
                        fontSize: '160px', fontWeight: '950', lineHeight: 1, letterSpacing: '-10px',
                        filter: currentServing ? 'drop-shadow(0 0 30px rgba(255,255,255,0.2))' : 'grayscale(1)',
                        opacity: currentServing ? 1 : 0.05,
                        transition: 'all 0.5s ease'
                    }}>
                        {currentServing ? currentServing.token_number : '--'}
                    </div>
                    {currentServing?.customer_name && (
                        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '14px 40px', borderRadius: '20px', marginTop: '32px', fontSize: '22px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '24px' }}>👤</span> {currentServing.customer_name}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, width: '100%', maxWidth: '600px' }}>
                    {currentServing ? (
                        readOnly ? (
                            // STAFF VIEW: Read-only badge — no action buttons
                            <div style={{
                                padding: '14px 32px', borderRadius: '20px',
                                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.7)', fontWeight: '800', fontSize: '15px',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <span>👁️</span> Viewing Live — Managed by Consultant
                            </div>
                        ) : (
                            <>
                                <button className="btn"
                                    onClick={() => onUpdate(currentServing.token_id, 'Completed')}
                                    disabled={processingId === currentServing.token_id}
                                    style={{
                                        flex: 1, height: '72px', fontSize: '20px', fontWeight: '900',
                                        background: 'var(--success)', color: 'white', border: 'none', borderRadius: '24px',
                                        boxShadow: '0 20px 40px -10px rgba(16,185,129,0.3)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', minWidth: '240px'
                                    }}>
                                    {processingId === currentServing.token_id ? '⏳ Updating...' : <><span>✅</span> Complete Service</>}
                                </button>
                                <button className="btn"
                                    onClick={() => onUpdate(currentServing.token_id, 'Completed')}
                                    style={{
                                        height: '72px', padding: '0 32px', fontSize: '18px', fontWeight: '800',
                                        background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                    }}>
                                    <span>⚠️</span> No Show
                                </button>
                            </>
                        )
                    ) : (
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>
                            Counter is Currently Standing By
                        </div>
                    )}
                </div>

                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', zIndex: 0 }}></div>
            </div>

        </div>
    );
}

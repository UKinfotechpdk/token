import React from 'react';

const steps = [
    { id: 'branch', label: 'Location', icon: '📍' },
    { id: 'schedule', label: 'Service', icon: '🕒' },
    { id: 'booking', label: 'Details', icon: '📝' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'success', label: 'Success', icon: '🎉' }
];

export default function KioskHeader({ currentStep, onBack, canGoBack }) {
    const activeIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <header style={{ width: '100%', marginBottom: '40px', animation: 'fadeInDown 0.8s ease' }}>
            <div className="header-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
                {canGoBack && (
                    <button onClick={onBack} className="btn-back" style={{ padding: '10px 16px', fontSize: '14px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                        <span>←</span> Back
                    </button>
                )}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className="service-hub-tag" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Service Hub</div>
                    <div className="header-title" style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>Token Booking</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px', maxWidth: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
                {/* Progress Background Line */}
                <div className="progress-line-bg" style={{
                    position: 'absolute',
                    top: '18px',
                    left: '40px',
                    right: '40px',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    zIndex: 0
                }} />

                {/* Active Progress Line */}
                <div className="progress-line-active" style={{
                    position: 'absolute',
                    top: '18px',
                    left: '40px',
                    width: `${(activeIndex / (steps.length - 1)) * 80}%`,
                    height: '2px',
                    background: 'var(--primary)',
                    zIndex: 0,
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />

                {steps.map((step, idx) => {
                    const isActive = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    return (
                        <div key={step.id} style={{ zIndex: 1, textAlign: 'center', minWidth: '40px', flex: '1' }}>
                            <div className="step-circle" style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: isCurrent ? 'var(--primary)' : (isActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.05)'),
                                border: `2px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                margin: '0 auto 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isCurrent ? 'white' : (isActive ? 'var(--primary)' : 'rgba(255,255,255,0.3)'),
                                fontWeight: '800',
                                fontSize: '13px',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? '0 0 20px rgba(37, 99, 235, 0.3)' : 'none',
                                transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                {idx + 1}
                            </div>
                            <div className="step-label" style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                                display: 'block'
                            }}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 600px) {
                    .header-top-bar {
                        flex-direction: column-reverse !important;
                        align-items: flex-end !important;
                        gap: 12px !important;
                    }
                    .btn-back {
                        align-self: flex-start !important;
                    }
                    .step-label {
                        display: none !important;
                    }
                    .step-circle {
                        width: 32px !important;
                        height: 32px !important;
                        font-size: 12px !important;
                    }
                    .progress-line-bg, .progress-line-active {
                        top: 16px !important;
                    }
                }
            `}</style>
        </header>
    );
}

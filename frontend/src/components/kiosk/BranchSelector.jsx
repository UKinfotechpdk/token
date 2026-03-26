import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BranchSelector({ branches, onSelect, loading }) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div>
                {/* Back to Dashboard on loading state too */}
                <div style={{ marginBottom: '24px' }}>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card skeleton" style={{ height: '220px', borderRadius: '24px' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeInUp 0.8s ease' }}>
            {/* Back to Dashboard Button */}
            <div style={{ marginBottom: '28px' }}>
                <button
                    onClick={() => navigate('/user/dashboard')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f1f5f9'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Branch Grid */}
            <div className="branch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {branches.map(branch => {
                    const isOpen = branch.status === 'Active';
                    return (
                        <div
                            key={branch.branch_id}
                            onClick={() => isOpen && onSelect(branch)}
                            style={{
                                padding: '32px',
                                cursor: isOpen ? 'pointer' : 'not-allowed',
                                borderRadius: '24px',
                                borderTop: `4px solid ${isOpen ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                                background: isOpen ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255,255,255,0.02)',
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${isOpen ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                borderTopWidth: isOpen ? '4px' : '4px',
                                opacity: isOpen ? 1 : 0.5,
                                filter: isOpen ? 'none' : 'grayscale(0.5)',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: isOpen ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                            }}
                            onMouseOver={e => isOpen && (e.currentTarget.style.transform = 'translateY(-4px)')}
                            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {/* Card Header: Icon + Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', background: isOpen ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${isOpen ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                                    📍
                                </div>
                                <span style={{
                                    padding: '5px 14px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    background: isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                                    color: isOpen ? '#34d399' : '#94a3b8',
                                    border: `1px solid ${isOpen ? 'rgba(52,211,153,0.4)' : 'rgba(148,163,184,0.3)'}`,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {isOpen ? '● OPEN' : '○ CLOSED'}
                                </span>
                            </div>

                            {/* Branch Name */}
                            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#f8fafc', marginBottom: '8px', lineHeight: 1.2 }}>
                                {branch.branch_name}
                            </h3>

                            {/* Location */}
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                                📌 {branch.location}
                            </p>

                            {/* Footer: Hours + Select */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    🕒 {branch.opening_hours || '09:00 - 17:00'}
                                </div>
                                {isOpen && (
                                    <div style={{ color: '#60a5fa', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        SELECT →
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .skeleton {
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }
                @keyframes loading { to { background-position: -200% 0; } }
            `}</style>
        </div>
    );
}

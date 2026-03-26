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
                        className="btn-back"
                        onClick={() => navigate('/user/dashboard')}
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
                    className="btn-back"
                    onClick={() => navigate('/user/dashboard')}
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
                                borderTop: `4px solid ${isOpen ? 'var(--success)' : 'var(--glass-border)'}`,
                                background: isOpen ? 'var(--bg-card)' : 'var(--glass-bg)',
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${isOpen ? 'rgba(16,185,129,0.2)' : 'var(--glass-border)'}`,
                                borderTopWidth: isOpen ? '4px' : '4px',
                                opacity: isOpen ? 1 : 0.6,
                                filter: isOpen ? 'none' : 'grayscale(0.5)',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: isOpen ? 'var(--shadow-md)' : 'none',
                            }}
                            onMouseOver={e => isOpen && (e.currentTarget.style.transform = 'translateY(-4px)')}
                            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {/* Card Header: Icon + Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', background: isOpen ? 'var(--glass-bg)' : 'rgba(100,116,139,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${isOpen ? 'var(--glass-border)' : 'var(--glass-border)'}` }}>
                                    📍
                                </div>
                                <span style={{
                                    padding: '5px 14px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    background: isOpen ? 'rgba(16,185,129,0.1)' : 'var(--glass-bg)',
                                    color: isOpen ? '#10b981' : 'var(--text-muted)',
                                    border: `1px solid ${isOpen ? 'rgba(52,211,153,0.3)' : 'var(--glass-border)'}`,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {isOpen ? '● OPEN' : '○ CLOSED'}
                                </span>
                            </div>

                            {/* Branch Name */}
                            <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.2 }}>
                                {branch.branch_name}
                            </h3>

                            {/* Location */}
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                                📌 {branch.location}
                            </p>

                            {/* Footer: Hours + Select */}
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    🕒 {branch.opening_hours || '09:00 - 17:00'}
                                </div>
                                {isOpen && (
                                    <div style={{ color: 'var(--primary-dark)', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    background: linear-gradient(90deg, rgba(197, 173, 237, 0.1) 25%, rgba(197, 173, 237, 0.3) 50%, rgba(197, 173, 237, 0.1) 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }
                @keyframes loading { to { background-position: -200% 0; } }
            `}</style>
        </div>
    );
}

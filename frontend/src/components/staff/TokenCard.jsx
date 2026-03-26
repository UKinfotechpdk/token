import React from 'react';

const STATUS_COLORS = {
    Available: { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' },
    Booked: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
    Serving: { bg: '#fef3c7', border: '#fde68a', text: '#d97706' }, // Improved orange for Serving
    Completed: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
};

export default function TokenCard({ token, onUpdate, isProcessing }) {
    const colors = STATUS_COLORS[token.status] || STATUS_COLORS.Available;

    return (
        <div className="glass-card"
            style={{
                padding: '24px', textAlign: 'center', transition: 'all 0.3s ease',
                borderTop: `4px solid ${colors.text}`,
                background: 'white',
                opacity: isProcessing ? 0.7 : 1,
                transform: isProcessing ? 'scale(0.98)' : 'none'
            }}>
            <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--slate-800)', letterSpacing: '-1.5px', marginBottom: '4px' }}>
                {token.token_number}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: '600', minHeight: '1.4em', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {token.customer_name ? (
                    <>👤 <span style={{ color: 'var(--slate-700)' }}>{token.customer_name}</span></>
                ) : (
                    'No Customer'
                )}
            </div>

            <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '10px',
                fontSize: '11px', fontWeight: '800', background: colors.bg, color: colors.text,
                textTransform: 'uppercase', marginBottom: '24px', border: `1px solid ${colors.border}`,
                letterSpacing: '1px'
            }}>
                {token.status}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {token.status === 'Booked' && (
                    <button className="btn btn-sm"
                        onClick={() => onUpdate(token.token_id, 'Serving')}
                        disabled={isProcessing}
                        style={{ width: '100%', background: 'var(--primary)', color: 'white' }}>
                        {isProcessing ? 'Wait...' : 'Start Serving'}
                    </button>
                )}
                {token.status === 'Serving' && (
                    <button className="btn btn-sm"
                        onClick={() => onUpdate(token.token_id, 'Completed')}
                        disabled={isProcessing}
                        style={{ width: '100%', background: 'var(--success)', color: 'white' }}>
                        {isProcessing ? 'Wait...' : 'Complete Token'}
                    </button>
                )}
                {token.status === 'Available' && (
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', fontStyle: 'italic', padding: '10px 0' }}>Waiting for booking</div>
                )}
                {token.status === 'Completed' && (
                    <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700', padding: '10px 0' }}>✓ Handled</div>
                )}
            </div>
        </div>
    );
}

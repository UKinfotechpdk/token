import React from 'react';

const PAYMENT_METHODS = [
    { id: 'UPI', icon: '📱', label: 'Digital Pay (UPI)', sub: 'Instant Confirmation' },
    { id: 'Cash', icon: '💵', label: 'Pay at Counter', sub: 'Cash / Card' },
];

export default function PaymentModule({ formData, onUpdate, onConfirm, onBack, schedule, loading }) {
    const fee = schedule?.fee || 0;
    const selected = formData.paymentMethod;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div className="glass-card" style={{ padding: 'clamp(28px,4vw,48px)', borderRadius: '28px', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>

                <h2 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: '900', color: '#f8fafc', marginBottom: '10px', textAlign: 'center' }}>
                    🔒 Secure Payment
                </h2>
                <p style={{ color: '#64748b', marginBottom: '36px', textAlign: 'center', fontSize: '15px' }}>
                    Choose your preferred payment method to finalize booking.
                </p>

                {/* Payment Method Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                    {PAYMENT_METHODS.map(({ id, icon, label, sub }) => {
                        const isActive = selected === id;
                        return (
                            <div
                                key={id}
                                onClick={() => onUpdate({ paymentMethod: id })}
                                style={{
                                    padding: '24px 20px',
                                    borderRadius: '18px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    background: isActive ? 'rgba(37,99,235,0.15)' : 'rgba(30,41,59,0.6)',
                                    border: `2px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                                    boxShadow: isActive ? '0 0 24px rgba(37,99,235,0.25)' : 'none',
                                    transform: isActive ? 'translateY(-2px)' : 'none',
                                }}
                                onMouseOver={e => !isActive && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                                onMouseOut={e => !isActive && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                            >
                                <div style={{ fontSize: '34px', marginBottom: '12px' }}>{icon}</div>
                                <div style={{ fontWeight: '800', color: isActive ? '#93c5fd' : '#e2e8f0', fontSize: '15px', marginBottom: '4px' }}>{label}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{sub}</div>
                                {isActive && (
                                    <div style={{ marginTop: '10px', display: 'inline-block', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(96,165,250,0.4)' }}>
                                        ✓ Selected
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div style={{ background: 'rgba(30,41,59,0.5)', padding: '24px', borderRadius: '18px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#475569', marginBottom: '16px' }}>
                        Order Summary
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>Service Fee</span>
                        <span style={{ color: '#e2e8f0', fontWeight: '700' }}>₹{fee}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>Processing Fee</span>
                        <span style={{ color: '#e2e8f0', fontWeight: '700' }}>₹0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '17px', fontWeight: '900', color: '#f1f5f9' }}>Total Amount</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#60a5fa' }}>₹{fee}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: '1 1 120px', height: '56px', borderRadius: '14px', fontWeight: '700' }}
                        onClick={onBack}
                    >
                        ← Back
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ flex: '2 1 200px', height: '56px', fontSize: '17px', fontWeight: '900', borderRadius: '14px', opacity: loading ? 0.7 : 1 }}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                Processing...
                            </span>
                        ) : 'Confirm & Book Token'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin   { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

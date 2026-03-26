import React, { useState } from 'react';

export default function BookingDetails({ formData, onUpdate, onNext, onCancel, queueStatus }) {
    const live = queueStatus || { waiting_count: 0, serving_number: '--', avg_time: 5 };
    const waitTime = live.waiting_count * (live.avg_time || 5);

    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!formData.name || !formData.name.trim()) errs.name = 'Full name is required.';
        if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)
            errs.age = 'Enter a valid age (1–120).';
        if (!formData.gender) errs.gender = 'Please select a gender.';
        const digits = (formData.contact || '').replace(/\D/g, '');
        if (!digits || digits.length !== 10) errs.contact = 'Enter a valid 10-digit mobile number.';
        return errs;
    };

    const handleNext = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        const normalised = formData.contact.replace(/\D/g, '');
        onUpdate({ contact: normalised.startsWith('91') ? '+' + normalised : '+91' + normalised });
        onNext();
    };

    const handlePhone = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 10) {
            onUpdate({ contact: val });
            if (errors.contact) setErrors(prev => ({ ...prev, contact: null }));
        }
    };

    const inputStyle = (field) => ({
        background: 'var(--glass-bg)',
        border: `1.5px solid ${errors[field] ? '#f87171' : 'var(--glass-border)'}`,
        color: 'var(--text-main)',
        fontSize: '16px',
        padding: '16px 20px',
        borderRadius: '14px',
        width: '100%',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        boxShadow: errors[field] ? '0 0 0 3px rgba(248,113,113,0.15)' : 'none',
    });

    const labelStyle = {
        display: 'block', fontWeight: '700', fontSize: '12px',
        textTransform: 'uppercase', letterSpacing: '1px',
        color: 'var(--text-muted)', marginBottom: '8px'
    };
    const errStyle = {
        color: '#f87171', fontSize: '12px', marginTop: '6px',
        fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) clamp(260px,30%,340px)', gap: '32px', alignItems: 'start', animation: 'fadeIn 0.5s ease' }}>

            {/* ─── Form Card ─── */}
            <div className="glass-card" style={{ padding: 'clamp(24px,4vw,48px)', borderRadius: '28px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>
                    Customer Information
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
                    Fill in the details below to secure your spot in the queue.
                </p>

                <div style={{ display: 'grid', gap: '20px' }}>

                    {/* Full Name */}
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input
                            style={inputStyle('name')}
                            value={formData.name}
                            onChange={e => { onUpdate({ name: e.target.value }); if (errors.name) setErrors(p => ({ ...p, name: null })); }}
                            placeholder="Enter your full name"
                            autoFocus
                        />
                        {errors.name && <div style={errStyle}>⚠ {errors.name}</div>}
                    </div>

                    {/* Age + Gender */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Age</label>
                            <input
                                type="number"
                                style={inputStyle('age')}
                                value={formData.age}
                                onChange={e => { onUpdate({ age: e.target.value }); if (errors.age) setErrors(p => ({ ...p, age: null })); }}
                                placeholder="Years"
                                min="1" max="120"
                            />
                            {errors.age && <div style={errStyle}>⚠ {errors.age}</div>}
                        </div>
                        <div>
                            <label style={labelStyle}>Gender</label>
                            <select
                                style={{ ...inputStyle('gender'), appearance: 'none' }}
                                value={formData.gender}
                                onChange={e => { onUpdate({ gender: e.target.value }); if (errors.gender) setErrors(p => ({ ...p, gender: null })); }}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && <div style={errStyle}>⚠ {errors.gender}</div>}
                        </div>
                    </div>

                    {/* Mobile Number with +91 */}
                    <div>
                        <label style={labelStyle}>Mobile Number</label>
                        <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${errors.contact ? '#f87171' : 'var(--glass-border)'}`, boxShadow: errors.contact ? '0 0 0 3px rgba(248,113,113,0.15)' : 'none' }}>
                            <div style={{ padding: '0 16px', background: 'rgba(197, 173, 237, 0.2)', display: 'flex', alignItems: 'center', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '15px', flexShrink: 0, borderRight: '1px solid var(--glass-border)' }}>
                                🇮🇳 +91
                            </div>
                            <input
                                type="tel"
                                style={{ flex: 1, background: 'var(--glass-bg)', border: 'none', color: 'var(--text-main)', fontSize: '16px', padding: '16px 20px', outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
                                value={(formData.contact || '').replace(/\D/g, '')}
                                onChange={handlePhone}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                            />
                        </div>
                        {errors.contact
                            ? <div style={errStyle}>⚠ {errors.contact}</div>
                            : <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>
                                {(formData.contact || '').replace(/\D/g, '').length}/10 digits entered
                            </div>
                        }
                    </div>

                    {/* Reason */}
                    <div>
                        <label style={labelStyle}>
                            Reason for Visit <span style={{ opacity: 0.5, fontWeight: 500, textTransform: 'none' }}>(optional)</span>
                        </label>
                        <textarea
                            style={{ ...inputStyle('reason'), minHeight: '100px', resize: 'vertical' }}
                            value={formData.reason}
                            onChange={e => onUpdate({ reason: e.target.value })}
                            placeholder="Briefly describe the service needed"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '40px', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" style={{ flex: '1 1 120px', height: '56px', borderRadius: '14px', fontWeight: '700' }} onClick={onCancel}>
                        ← Back
                    </button>
                    <button className="btn btn-primary" style={{ flex: '2 1 200px', height: '56px', fontSize: '17px', fontWeight: '900', borderRadius: '14px' }} onClick={handleNext}>
                        Review &amp; Pay →
                    </button>
                </div>

                {/* Back to Dashboard */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={onCancel}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: '4px 8px' }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        ↩ Back to Dashboard
                    </button>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'var(--grad-primary)', color: 'white', padding: '28px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(197, 173, 237, 0.4)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.85, marginBottom: '20px', letterSpacing: '1.5px' }}>Queue Live Status</div>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Est. Waiting Time</div>
                        <div style={{ fontSize: '52px', fontWeight: '900', lineHeight: 1 }}>{waitTime} <span style={{ fontSize: '20px', fontWeight: 400 }}>min</span></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>Waiting</div>
                            <div style={{ fontSize: '22px', fontWeight: '800' }}>{live.waiting_count}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>Active</div>
                            <div style={{ fontSize: '22px', fontWeight: '800' }}>#{live.serving_number}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Safety Note</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                        Please ensure your mobile number is correct to receive status updates.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="clamp(260px"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

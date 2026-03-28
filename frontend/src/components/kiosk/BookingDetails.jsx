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
        background: '#f8fafc',
        border: `2px solid ${errors[field] ? '#ef4444' : '#cbd5e1'}`,
        color: '#000000',
        fontSize: '15.5px',
        padding: '14px 18px',
        borderRadius: '12px',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        boxShadow: errors[field] ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
    });

    const labelStyle = {
        display: 'block', fontWeight: '700', fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '1.2px',
        color: '#000000', marginBottom: '6px'
    };


    return (
        <>
            <style>{`
                .booking-layout {
                    display: grid;
                    grid-template-columns: minmax(0,1fr) clamp(240px,28%,320px);
                    gap: 28px;
                    align-items: start;
                    animation: fadeIn 0.5s ease;
                }
                @media (max-width: 768px) {
                    .booking-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .booking-sidebar {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }
                }
                @media (max-width: 480px) {
                    .booking-sidebar {
                        grid-template-columns: 1fr !important;
                    }
                }
                /* Force input text visibility against global dark-theme overrides */
                .bk-input {
                    color: #000000 !important;
                    background: #f8fafc !important;
                    -webkit-text-fill-color: #000000 !important;
                    font-weight: 700 !important;
                }
                .bk-input::placeholder {
                    color: #475569 !important;
                    -webkit-text-fill-color: #475569 !important;
                    opacity: 1 !important;
                    font-weight: 500 !important;
                }
                .bk-input:focus {
                    border-color: #2563eb !important;
                    background: #ffffff !important;
                    box-shadow: 0 0 0 4px rgba(37,99,235,0.15) !important;
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000 !important;
                }
                .bk-input.error:focus {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 4px rgba(239,68,68,0.1) !important;
                }
                /* Phone inner input */
                .bk-phone-input {
                    color: #000000 !important;
                    background: transparent !important;
                    -webkit-text-fill-color: #000000 !important;
                    font-weight: 700 !important;
                }
                .bk-phone-input::placeholder {
                    color: #475569 !important;
                    -webkit-text-fill-color: #475569 !important;
                    opacity: 1 !important;
                    font-weight: 500 !important;
                }
                .bk-error {
                    color: #ef4444 !important;
                    font-size: 11.5px !important;
                    margin-top: 6px !important;
                    font-weight: 700 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                    letter-spacing: 0.2px !important;
                }
                @media (max-width: 480px) {
                    .age-gender-grid {
                        grid-template-columns: 1fr !important;
                        gap: 18px !important;
                    }
                    .booking-form-card {
                        padding: 24px 16px !important;
                    }
                }
            `}</style>

            <div className="booking-layout">

                {/* ─── Form Card ─── */}
                <div className="booking-form-card" style={{
                    padding: '32px',
                    borderRadius: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', marginBottom: '6px' }}>
                        Customer Information
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>
                        Fill in the details below to secure your spot in the queue.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                        {/* Full Name */}
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                className={`bk-input${errors.name ? ' error' : ''}`}
                                style={inputStyle('name')}
                                value={formData.name}
                                onChange={e => { onUpdate({ name: e.target.value }); if (errors.name) setErrors(p => ({ ...p, name: null })); }}
                                placeholder="Enter your full name"
                                autoFocus
                            />
                            {errors.name && <div className="bk-error">⚠ {errors.name}</div>}
                        </div>

                        {/* Age + Gender */}
                        <div className="age-gender-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Age</label>
                                <input
                                    className={`bk-input${errors.age ? ' error' : ''}`}
                                    type="number"
                                    style={inputStyle('age')}
                                    value={formData.age}
                                    onChange={e => { onUpdate({ age: e.target.value }); if (errors.age) setErrors(p => ({ ...p, age: null })); }}
                                    placeholder="Years"
                                    min="1" max="120"
                                />
                                {errors.age && <div className="bk-error">⚠ {errors.age}</div>}
                            </div>
                            <div>
                                <label style={labelStyle}>Gender</label>
                                <select
                                    className={`bk-input${errors.gender ? ' error' : ''}`}
                                    style={{ ...inputStyle('gender'), appearance: 'none', cursor: 'pointer' }}
                                    value={formData.gender}
                                    onChange={e => { onUpdate({ gender: e.target.value }); if (errors.gender) setErrors(p => ({ ...p, gender: null })); }}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <div className="bk-error">⚠ {errors.gender}</div>}
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label style={labelStyle}>Mobile Number</label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'stretch',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: `2px solid ${errors.contact ? '#ef4444' : '#cbd5e1'}`,
                                boxShadow: errors.contact ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none',
                                background: '#f8fafc'
                            }}>
                                <div style={{
                                    padding: '0 14px',
                                    background: '#f1f5f9',
                                    display: 'flex', alignItems: 'center',
                                    fontWeight: '700', color: '#000000',
                                    fontSize: '14.5px', flexShrink: 0,
                                    borderRight: '2px solid #cbd5e1'
                                }}>
                                    🇮🇳 +91
                                </div>
                                <input
                                    className="bk-phone-input"
                                    type="tel"
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none',
                                        color: '#000000', fontSize: '15.5px',
                                        padding: '14px 18px', outline: 'none',
                                        fontFamily: 'inherit', minWidth: 0, width: '100%',
                                        boxSizing: 'border-box', fontWeight: '700'
                                    }}
                                    value={(formData.contact || '').replace(/\D/g, '')}
                                    onChange={handlePhone}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                />
                            </div>
                            {errors.contact
                                ? <div className="bk-error">⚠ {errors.contact}</div>
                                : <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>
                                    {(formData.contact || '').replace(/\D/g, '').length}/10 digits entered
                                </div>
                            }
                        </div>

                        {/* Reason */}
                        <div>
                            <label style={labelStyle}>
                                Reason for Visit <span style={{ opacity: 0.5, fontWeight: 500, textTransform: 'none', fontSize: '11px' }}>(optional)</span>
                            </label>
                            <textarea
                                className="bk-input"
                                style={{ ...inputStyle('reason'), minHeight: '90px', resize: 'vertical' }}
                                value={formData.reason}
                                onChange={e => onUpdate({ reason: e.target.value })}
                                placeholder="Briefly describe the service needed"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                        <button
                            style={{
                                flex: '1 1 110px', height: '52px', borderRadius: '12px', fontWeight: '700',
                                background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569',
                                cursor: 'pointer', fontSize: '14px'
                            }}
                            onClick={onCancel}
                        >
                            ← Back
                        </button>
                        <button
                            style={{
                                flex: '2 1 180px', height: '52px', fontSize: '16px', fontWeight: '900',
                                borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: '#ffffff', border: 'none', cursor: 'pointer',
                                boxShadow: '0 6px 18px rgba(37,99,235,0.28)'
                            }}
                            onClick={handleNext}
                        >
                            Review & Pay →
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                background: 'none', border: 'none', color: '#94a3b8',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                textDecoration: 'underline', padding: '4px 8px'
                            }}
                        >
                            ↩ Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* ─── Sidebar ─── */}
                <div className="booking-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #2563eb, #0284c7)',
                        color: 'white', padding: '24px',
                        borderRadius: '18px',
                        boxShadow: '0 10px 28px rgba(37,99,235,0.3)'
                    }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.85, marginBottom: '16px', letterSpacing: '1.5px' }}>Queue Live Status</div>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Est. Waiting Time</div>
                            <div style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1 }}>
                                {waitTime} <span style={{ fontSize: '18px', fontWeight: 400 }}>min</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>Waiting</div>
                                <div style={{ fontSize: '20px', fontWeight: '800' }}>{live.waiting_count}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>Active</div>
                                <div style={{ fontSize: '20px', fontWeight: '800' }}>#{live.serving_number}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '20px', borderRadius: '16px',
                        border: '1px solid #e2e8f0', background: '#ffffff',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px' }}>Safety Note</div>
                        <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: '600' }}>
                            Please ensure your mobile number is correct to receive status updates.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

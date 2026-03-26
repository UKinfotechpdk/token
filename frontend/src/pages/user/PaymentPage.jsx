import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookToken, verifyPayment } from '../../api/api';

export default function PaymentPage() {
    const { state } = useLocation();
    const { schedule, branch } = state || {};
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    if (!schedule) {
        navigate('/user/book-token/branches');
        return null;
    }

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // First reserve the token (backend will pick next available slot)
            const bookRes = await bookToken({
                schedule_id: schedule.schedule_id
            });

            if (bookRes.data.status === 'pending_payment') {
                const tokenId = bookRes.data.token_id;
                const assignedSlot = bookRes.data.time_slot;

                // Simulate Razorpay Delay
                setTimeout(async () => {
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: "order_" + Math.random().toString(36).substring(7),
                            razorpay_payment_id: "pay_" + Math.random().toString(36).substring(7),
                            razorpay_signature: "sig_" + Math.random().toString(36).substring(7),
                            token_id: tokenId
                        });

                        if (verifyRes.data.success) {
                            navigate(`/user/book-token/success/${tokenId}`, {
                                state: {
                                    token: verifyRes.data.token,
                                    branch,
                                    schedule: { ...schedule, selected_slot: assignedSlot }
                                }
                            });
                        }
                    } catch (err) {
                        alert(err.response?.data?.error || "Payment verification failed");
                        setProcessing(false);
                    }
                }, 1500);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Booking failed");
            setProcessing(false);
        }
    };

    return (
        <div className="payment-page flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
            <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>💳</div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Booking Checkout</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>You are booking a token for <strong style={{ color: 'var(--text-main)' }}>{branch?.branch_name}</strong></p>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '32px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Centre</div>
                        <div style={{ fontWeight: '700', fontSize: '18px' }}>{branch?.branch_name}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Service</div>
                            <div style={{ fontWeight: '700' }}>{schedule.title}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Slot</div>
                            <div style={{ fontWeight: '700' }}>{schedule.selected_slot || 'Next Available'}</div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '24px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '16px' }}>TOTAL DUE</span>
                        <span style={{ fontWeight: '900', fontSize: '32px', color: 'var(--secondary)' }}>₹{schedule.fee}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <button
                        className={`btn ${processing ? 'btn-loading' : 'btn-primary'} btn-full`}
                        onClick={handlePayment}
                        disabled={processing}
                        style={{ height: '60px', fontSize: '18px', fontWeight: '900' }}
                    >
                        {processing ? 'Confirming...' : `Pay ₹${schedule.fee} Now`}
                    </button>

                    <button
                        className="btn btn-secondary btn-full"
                        onClick={() => navigate(-1)}
                        disabled={processing}
                        style={{ height: '54px' }}
                    >
                        Cancel
                    </button>
                </div>

                <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Protected by Secure Encryption. No medical data is stored.
                </p>
            </div>
        </div>
    );
}

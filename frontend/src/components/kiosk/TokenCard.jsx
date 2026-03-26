import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';

export default function TokenCard({ token, schedule, branch, onDone }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect mobile devices
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android|ipad|playbook|silk|iphone|ipod/i.test(userAgent) || window.innerWidth <= 768) {
                setIsMobile(true);
            }
        };
        checkMobile();

        // Auto print on load if desktop
        if (window.innerWidth > 768) {
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, []);

    const handlePrintOrDownload = async () => {
        if (isMobile && token?.token_id) {
            try {
                // To download the PDF we can just use the download API endpoint directly through window.location
                // However, since it's an authenticated route, standard link might not work if tokens are stored in JS headers.
                // Assuming session cookies are used based on backend setup (`@login_required`).
                window.open(`${api.defaults.baseURL.replace('/api', '')}/public/token/${token.token_id}/download`, '_blank');
            } catch (error) {
                console.error('Download failed', error);
            }
        } else {
            window.print();
        }
    };

    return (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease', maxWidth: '500px', margin: '0 auto' }}>
            <div className="no-print">
                <div style={{ padding: 'clamp(28px,4vw,48px)', borderRadius: '36px', background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>

                    {/* Subtle top-glow line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(16,185,129,0.3),transparent)' }} />

                    {/* ✓ Icon */}
                    <div style={{ width: '88px', height: '88px', background: 'var(--grad-success)', color: 'white', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', margin: '0 auto 20px', boxShadow: '0 16px 36px rgba(16,185,129,0.2)' }}>
                        ✓
                    </div>

                    <h2 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>
                        Booking Confirmed!
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
                        Your digital token has been generated.
                    </p>

                    {/* Token Number Box */}
                    <div style={{ background: 'rgba(16,185,129,0.05)', padding: '36px 24px', borderRadius: '20px', border: '2px dashed rgba(16,185,129,0.2)', marginBottom: '32px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Token Number
                        </div>
                        <div style={{ fontSize: 'clamp(64px,15vw,96px)', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-4px', lineHeight: 1 }}>
                            {token?.token_number || '--'}
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {schedule?.service_name || 'General Service'}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '32px', textAlign: 'left' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '700' }}>Customer</div>
                                <div style={{ fontWeight: '800', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {token?.customer_name || 'Guest'}
                                </div>
                            </div>
                            <div style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '700' }}>Est. Wait</div>
                                <div style={{ fontWeight: '800', color: '#10b981' }}>~10 Mins</div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '700' }}>Location</div>
                            <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>📍 {branch?.branch_name || 'Branch'}</div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', height: '56px', fontSize: '17px', fontWeight: '900', borderRadius: '14px', border: 'none' }}
                            onClick={handlePrintOrDownload}
                        >
                            {isMobile ? '📥 Download Token PDF' : '🖨️ Print Token Slip'}
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ width: '100%', height: '52px', fontSize: '15px', fontWeight: '700', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={onDone}
                        >
                            ← Return to Dashboard
                        </button>
                    </div>
                </div>

                <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>
                    A copy of this token has been sent to your phone.
                </p>
            </div>

            {/* ─── Print Only Area ─── */}
            {createPortal(
                <div className="print-only">
                    <div className="thermal-slip">
                        <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>TOKEN KIOSK</div>
                        <div style={{ fontSize: '10px', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '15px' }}>Customer Token Slip</div>
                        <div style={{ fontSize: '48px', fontWeight: '950', margin: '15px 0', lineHeight: 1 }}>{token?.token_number}</div>
                        <div style={{ textAlign: 'left', fontSize: '11px', borderTop: '1px dashed #000', paddingTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span>DATE:</span><strong>{new Date().toLocaleDateString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span>SERVICE:</span><strong>{schedule?.service_name || 'General'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span>COUNTER:</span><strong>{branch?.branch_name}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #ccc', marginTop: '8px', paddingTop: '8px' }}>
                                <span>FEE:</span><strong>Rs. {schedule?.fees || '0'}</strong>
                            </div>
                            <div style={{ marginTop: '15px', fontSize: '9px', textAlign: 'center', fontStyle: 'italic', borderTop: '1px solid #000', paddingTop: '10px' }}>
                                Thank you for choosing us!<br />Please wait for your turn.
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .print-only { display: none; }
                @media print {
                    @page { margin: 0; size: auto; }
                    html, body { background: #fff !important; width: 80mm !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                    #root, .app-container, .no-print, header, footer, .top-header, .main-content { display: none !important; }
                    .print-only { display: block !important; width: 80mm !important; }
                    .thermal-slip { width: 100% !important; max-width: 80mm; margin: 0; padding: 2mm 4mm; font-family: 'Courier New', monospace; color: #000; text-align: center; background: #fff; }
                    .thermal-slip, .thermal-slip * { visibility: visible !important; opacity: 1 !important; animation: none !important; }
                }
            `}</style>
        </div>
    );
}

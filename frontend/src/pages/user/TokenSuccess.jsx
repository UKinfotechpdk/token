import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { downloadToken } from '../../api/api';

export default function TokenSuccess() {
    const { tokenId } = useParams();
    const { state } = useLocation();
    const { token, branch, schedule } = state || {};
    const navigate = useNavigate();

    const handleDownload = async () => {
        try {
            const res = await downloadToken(tokenId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `token_${token?.token_number || tokenId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download PDF receipt');
        }
    };

    return (
        <div className="token-success-page flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
            <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '48px', textAlign: 'center' }}>
                <div className="success-icon-animate" style={{ fontSize: '64px', marginBottom: '24px', color: '#10b981' }}>✅</div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Booking Confirmed!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your service token is ready.</p>

                <div className="glass-card" style={{ background: '#fff', color: '#000', padding: '32px', borderRadius: '32px', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>YOUR TOKEN NUMBER</div>
                    <div style={{ fontSize: '72px', fontWeight: '900', lineHeight: 1, margin: '12px 0' }}>{token?.token_number || "-"}</div>

                    <div style={{ borderTop: '2px dashed #eee', margin: '24px 0', paddingTop: '24px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#888' }}>Customer Name</span>
                            <span style={{ fontWeight: '700' }}>{token?.customer_name || "Guest"}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#888' }}>Service Centre</span>
                            <span style={{ fontWeight: '700' }}>{branch?.branch_name || schedule?.branch_name || "Main Branch"}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#888' }}>Service Type</span>
                            <span style={{ fontWeight: '700' }}>{schedule?.title || "General"}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888' }}>Assigned Slot</span>
                            <span style={{ fontWeight: '700' }}>{token?.time_slot || "Auto-assigned"}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <button
                        className="btn btn-primary btn-full"
                        onClick={handleDownload}
                        style={{
                            height: '60px',
                            fontSize: '18px',
                            fontWeight: '800',
                            background: 'var(--secondary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}
                    >
                        📥 Download Token (PDF)
                    </button>

                    <button
                        className="btn btn-secondary btn-full"
                        onClick={() => navigate('/user/dashboard')}
                        style={{ height: '54px' }}
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scaleUp {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .success-icon-animate {
                    animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}} />
        </div >
    );
}

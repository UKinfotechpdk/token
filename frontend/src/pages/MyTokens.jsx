import React, { useState, useEffect } from 'react';
import { getMyTokens } from '../api/api';
import { usePolling } from '../hooks/usePolling';

export default function MyTokens({ onBack }) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTokens = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await getMyTokens();
            setTokens(res.data);
        } catch (err) {
            console.error('Failed to fetch tokens');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    usePolling(() => fetchTokens(false), 10000);

    useEffect(() => {
        fetchTokens(true);
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-main)' }}>Loading your tokens...</div>;

    return (
        <div className="my-tokens-page" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ marginRight: '16px' }}>← Back</button>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>My Bookings</h2>
            </div>

            {tokens.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                    <h3>No tokens found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't booked any tokens yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                    {tokens.map(token => (
                        <div key={token.token_id} className="glass-card" style={{ padding: '24px', border: '1px solid rgba(15,157,138,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <span style={{
                                        padding: '4px 8px',
                                        background: token.status === 'Completed' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(15, 157, 138, 0.2)',
                                        color: token.status === 'Completed' ? '#34D399' : 'var(--secondary)',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {token.status}
                                    </span>
                                    <h3 style={{ marginTop: '12px', fontSize: '18px', fontWeight: '800' }}>
                                        {token.schedule?.service_name || 'General Service'}
                                    </h3>
                                    <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                                        <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                                            <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-muted)' }}>
                                                📍 <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{token.schedule?.branch_name}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>#{token.token_number}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{token.time_slot}</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        📅 {token.schedule?.date}
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: 'rgba(52, 211, 153, 0.1)',
                                        color: '#34D399',
                                        border: '1px solid rgba(52, 211, 153, 0.3)'
                                    }}>PAID</span>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '6px 12px', fontSize: '11px' }}
                                    onClick={async () => {
                                        try {
                                            const { downloadToken } = await import('../api/api');
                                            const res = await downloadToken(token.token_id);
                                            const url = window.URL.createObjectURL(new Blob([res.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `token_${token.token_number}.pdf`);
                                            document.body.appendChild(link);
                                            link.click();
                                        } catch (err) {
                                            alert("Failed to download PDF");
                                        }
                                    }}
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

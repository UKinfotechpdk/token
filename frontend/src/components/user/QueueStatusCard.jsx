import React, { useState, useEffect } from 'react';
import { getPublicTokenStatus } from '../../api/api';
import { usePolling } from '../../hooks/usePolling';

const QueueStatusCard = ({ scheduleId, scheduleName, branchName }) => {
    const [status, setStatus] = useState({
        current_token: '...',
        next_token: '...',
        waiting_count: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await getPublicTokenStatus(scheduleId);
            setStatus(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch status for', scheduleId);
        }
    };

    usePolling(fetchStatus, 5000);

    useEffect(() => {
        setLoading(true);
        fetchStatus();
    }, [scheduleId]);

    // Simple estimation: 10 mins per waiting customer
    const estimatedWait = status.waiting_count * 10;

    return (
        <div className="glass-card queue-status-card" style={{
            padding: '24px',
            borderLeft: '4px solid var(--secondary)',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{scheduleName}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{branchName}</p>
                </div>
                <div className="pulse-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981' }}>LIVE</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="status-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{status.current_token}</div>
                </div>
                <div className="status-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>NEXT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-white)' }}>{status.next_token}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0 8px' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                    Waiting: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{status.waiting_count}</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                    Est. Wait: <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{estimatedWait} mins</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .pulse-indicator .dot {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}} />
        </div>
    );
};

export default QueueStatusCard;

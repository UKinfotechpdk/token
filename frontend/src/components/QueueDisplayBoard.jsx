import React, { useState, useEffect } from 'react';
import { getBranchBoard } from '../api/api';

export default function QueueDisplayBoard() {
    const [boardData, setBoardData] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState(null);

    // Auto-update timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch data every 10 seconds
    useEffect(() => {
        const branchId = 1; // Default or get from URL param
        const fetchData = async () => {
            try {
                const res = await getBranchBoard(branchId);
                setBoardData(res.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch board data');
                setError('Reconnecting to server...');
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="display-board-page" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0B3B36 0%, #021A18 100%)',
            color: 'white',
            padding: '40px',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                borderBottom: '2px solid rgba(15, 157, 138, 0.3)',
                paddingBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'var(--primary)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px'
                    }}>
                        🏥
                    </div>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>QUEUE DISPLAY</h1>
                        <p style={{ color: 'var(--secondary)', fontWeight: '700' }}>LIVE TOKEN STATUS</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '40px', fontWeight: '800' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
            </header>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ff6b6b', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Board Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '32px'
            }}>
                {boardData.map((item, idx) => (
                    <div key={idx} className="glass-card" style={{
                        padding: '0',
                        overflow: 'hidden',
                        border: '2px solid rgba(15, 157, 138, 0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ background: 'rgba(15, 157, 138, 0.15)', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{item.consultant_name}</h2>
                            <p style={{ color: 'var(--secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>{item.specialization} | {item.service}</p>
                        </div>
                        <div style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            background: item.status === 'Active' ? 'rgba(52, 211, 153, 0.05)' : 'transparent'
                        }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Current Calling</span>
                            <div style={{
                                fontSize: '120px',
                                fontWeight: '900',
                                color: item.current_token === 'None' ? '#444' : 'white',
                                margin: '10px 0',
                                textShadow: item.current_token === 'None' ? 'none' : '0 0 30px rgba(15, 157, 138, 0.5)'
                            }}>
                                {item.current_token}
                            </div>
                        </div>
                        <div style={{
                            padding: '16px',
                            textAlign: 'center',
                            background: item.status === 'Active' ? 'rgba(15, 157, 138, 0.2)' : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}>
                            <div style={{
                                width: '12px', height: '12px',
                                borderRadius: '50%',
                                background: item.status === 'Active' ? '#10B981' : '#666',
                                boxShadow: item.status === 'Active' ? '0 0 10px #10B981' : 'none'
                            }}></div>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: item.status === 'Active' ? 'white' : '#888' }}>
                                {item.status === 'Active' ? "IN SESSION" : "WAITING"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Scrolling Text */}
            <footer style={{
                position: 'fixed',
                bottom: '0', left: '0', right: '0',
                background: 'rgba(15, 157, 138, 0.2)',
                padding: '12px 40px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--secondary)' }}>
                    <span>&bull; Please maintain silence in the clinic hall</span>
                    <span>&bull; Wear masks for your safety</span>
                    <span>&bull; Powered by Service Hub Kiosk Systems</span>
                </div>
            </footer>
        </div>
    );
}

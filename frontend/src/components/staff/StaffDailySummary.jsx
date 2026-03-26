import React, { useState, useEffect } from 'react';
import { getSchedules, getTokens } from '../../api/api';

function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
}

export default function StaffDailySummary({ staff, onToast, onNavigate }) {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;
    const [schedules, setSchedules] = useState([]);
    const [summaryData, setSummaryData] = useState({
        totalCapacity: 0,
        totalBooked: 0,
        totalServed: 0,
        totalWaiting: 0,
        estimatedRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [staff]);

    const fetchData = async () => {
        if (!staff?.branch_id) return;
        try {
            setLoading(true);
            const schedRes = await getSchedules();
            const d = new Date();
            const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const todaySchedules = schedRes.data.filter(s => {
                const isToday = s.date && String(s.date).startsWith(todayStr);
                const isBranch = staff?.branch_id ? String(s.branch_id) === String(staff.branch_id) : true;
                return isToday && isBranch;
            });

            let cap = 0, booked = 0, served = 0, waiting = 0, rev = 0;
            const detailedSchedules = [];

            for (const s of todaySchedules) {
                cap += s.token_count;
                const tokenRes = await getTokens(s.schedule_id);
                const tokens = tokenRes.data;

                const bookedTokens = tokens.filter(t => t.status !== 'Available');
                const servedTokens = tokens.filter(t => t.status === 'Completed');
                const waitTokens = tokens.filter(t => t.status === 'Booked');

                const scheduleRevenue = bookedTokens.length * (s.fees || 0);

                booked += bookedTokens.length;
                served += servedTokens.length;
                waiting += waitTokens.length;
                rev += scheduleRevenue;

                detailedSchedules.push({
                    ...s,
                    booked_count: bookedTokens.length,
                    served_count: servedTokens.length,
                    waiting_count: waitTokens.length,
                    revenue: scheduleRevenue
                });
            }

            setSchedules(detailedSchedules);
            setSummaryData({
                totalCapacity: cap,
                totalBooked: booked,
                totalServed: served,
                totalWaiting: waiting,
                estimatedRevenue: rev
            });

        } catch (error) {
            console.error('Error fetching summary:', error);
            onToast('Failed to load daily summary data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = () => {
        const todayStr = new Date().toLocaleDateString();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Daily Summary Report - ${todayStr}\n\n`;
        csvContent += "Overall Summary\n";
        csvContent += "Total Capacity,Tokens Booked,Currently Waiting,Served Today,Est. Revenue\n";
        csvContent += `${summaryData.totalCapacity},${summaryData.totalBooked},${summaryData.totalWaiting},${summaryData.totalServed},Rs. ${summaryData.estimatedRevenue}\n\n`;
        csvContent += "Counter Breakdown\n";
        csvContent += "Counter/Consultant,Timing,Series,Fee,Booked,Served,Waiting,Revenue\n";

        schedules.forEach(s => {
            const name = (s.consultant_name || s.service_name || 'General Service').replace(/^Dr\.\s*/i, '');
            const timing = `${s.start_time} - ${s.end_time}`;
            csvContent += `"${name}","${timing}","${s.token_series}",${s.fees},${s.booked_count},${s.served_count},${s.waiting_count},${s.revenue}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const fileDate = new Date().toISOString().split('T')[0];
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `daily_summary_${fileDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onToast('Summary report downloaded successfully.', 'success');
    };

    return (
        <div style={{ padding: isMobile ? '12px' : '0 20px', animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px', marginBottom: '32px' }}>
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="btn btn-secondary"
                    style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                    🏠 Back to Dashboard
                </button>

                <button
                    onClick={handleDownloadCSV}
                    className="btn btn-primary"
                    disabled={loading || schedules.length === 0}
                    style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start', opacity: (loading || schedules.length === 0) ? 0.6 : 1, cursor: (loading || schedules.length === 0) ? 'not-allowed' : 'pointer' }}
                >
                    📥 Download CSV
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', marginLeft: isMobile ? '0' : 'auto' }}>
                    <div style={{ fontSize: isMobile ? '20px' : '28px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', width: isMobile ? '40px' : '52px', height: isMobile ? '40px' : '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>📊</div>
                    <div>
                        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: '900', margin: 0, color: '#f8fafc', lineHeight: 1.1, whiteSpace: 'nowrap' }}>Daily Summary</h2>
                        <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: isMobile ? '11px' : '14px' }}>Branch Stats Overview</p>
                    </div>
                </div>
            </div>

            {loading && schedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#3b82f6' }}></div>
                    <p style={{ color: '#94a3b8' }}>Calculating daily metrics...</p>
                </div>
            ) : (
                <>
                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <StatCard icon="🎫" label="Total Capacity" value={summaryData.totalCapacity} color="#94a3b8" bg="rgba(148,163,184,0.1)" border="rgba(148,163,184,0.2)" isMobile={isMobile} />
                        <StatCard icon="📅" label="Tokens Booked" value={summaryData.totalBooked} color="#60a5fa" bg="rgba(59,130,246,0.15)" border="rgba(59,130,246,0.3)" isMobile={isMobile} />
                        <StatCard icon="⏳" label="Currently Waiting" value={summaryData.totalWaiting} color="#fcd34d" bg="rgba(245,158,11,0.15)" border="rgba(245,158,11,0.3)" isMobile={isMobile} />
                        <StatCard icon="✅" label="Served Today" value={summaryData.totalServed} color="#34d399" bg="rgba(16,185,129,0.15)" border="rgba(16,185,129,0.3)" isMobile={isMobile} />
                        <StatCard icon="💰" label="Est. Revenue" value={`Rs. ${summaryData.estimatedRevenue}`} color="#2dd4bf" bg="rgba(20,184,166,0.15)" border="rgba(20,184,166,0.3)" isMobile={isMobile} />
                    </div>

                    {/* Active Sessions List */}
                    <div className="glass-card dash-card" style={{ borderRadius: '24px', padding: 'clamp(20px, 4vw, 32px)', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px', color: '#f8fafc' }}>Active Counter Sessions</h3>

                        {schedules.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No active sessions found for today.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {schedules.map(s => (
                                    <div key={s.schedule_id} style={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        padding: isMobile ? '16px' : '16px 24px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        gap: isMobile ? '12px' : '0',
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#e2e8f0', fontSize: '16px', marginBottom: '6px' }}>
                                                {(s.consultant_name || s.service_name || 'General Service').replace(/^Dr\.\s*/i, '')}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', gap: '16px', fontWeight: '600' }}>
                                                <span>🕓 {s.start_time} - {s.end_time}</span>
                                                <span>🎟️ {s.token_count} max</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: isMobile ? 'left' : 'right', width: isMobile ? '100%' : 'auto', borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingTop: isMobile ? '12px' : '0' }}>
                                            <div style={{ fontWeight: '900', color: '#60a5fa', fontSize: '18px', letterSpacing: '0.5px' }}>Series {s.token_series}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Fee: Rs. {s.fees}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color, bg, border, isMobile }) {
    return (
        <div style={{
            background: bg, padding: isMobile ? '20px' : '24px', borderRadius: '20px',
            border: `1px solid ${border}`, backdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px',
            transition: 'transform 0.2s ease', cursor: 'default'
        }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: isMobile ? '20px' : '24px', background: 'rgba(0,0,0,0.2)', width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                    {icon}
                </span>
                <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '0.5px' }}>
                    {label}
                </span>
            </div>
            <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '900', color: color, textShadow: `0 0 20px ${color}40`, letterSpacing: '-0.5px' }}>
                {value}
            </div>
        </div>
    );
}

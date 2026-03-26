import React from 'react';

export default function SummaryBar({ stats, activeFilter, onFilterChange }) {
    const filters = [
        { label: 'All', key: 'All', count: stats.Total, color: 'var(--slate-700)', bg: 'var(--slate-100)' },
        { label: 'Available', key: 'Available', count: stats.Available, color: 'var(--slate-500)', bg: 'var(--slate-100)' },
        { label: 'Booked', key: 'Booked', count: stats.Booked, color: 'var(--primary)', bg: 'rgba(37, 99, 235, 0.1)' },
        { label: 'Serving', key: 'Serving', count: stats.Serving, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Completed', key: 'Completed', count: stats.Completed, color: 'var(--slate-400)', bg: 'var(--slate-100)' },
    ];

    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
            {filters.map(s => {
                const isActive = activeFilter === s.key;
                return (
                    <button key={s.key}
                        onClick={() => onFilterChange(s.key)}
                        style={{
                            border: 'none', background: isActive ? s.color : 'white',
                            color: isActive ? 'white' : 'var(--slate-600)',
                            padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '700',
                            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
                            boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                            cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '130px', justifyContent: 'center'
                        }}>
                        <span>{s.label}</span>
                        <span style={{ padding: '2px 8px', background: isActive ? 'rgba(255,255,255,0.2)' : s.bg, borderRadius: '8px', fontSize: '12px' }}>{s.count}</span>
                    </button>
                );
            })}
        </div>
    );
}

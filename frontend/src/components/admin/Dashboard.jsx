import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api/api';
import { usePolling } from '../../hooks/usePolling';

export default function Dashboard({ onNavigate, onToast }) {
    const [stats, setStats] = useState({ branches: 0, staff: 0, consultants: 0, schedules: 0, payments: 0, revenue: 0 });
    const fetchStats = useCallback(async () => {
        try {
            const [bRes, sRes, cRes, schRes, pRes] = await Promise.all([
                api.getBranches(), api.getStaff(), api.getConsultants(), api.getSchedules(), api.getPayments()
            ]);

            const allPayments = pRes.data || [];
            const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

            setStats({
                branches: bRes.data.length,
                staff: sRes.data.length,
                consultants: cRes.data.length,
                schedules: schRes.data.length,
                payments: allPayments.length,
                revenue: totalRevenue
            });

        } catch (err) { console.error(err); }
    }, []);

    usePolling(fetchStats, 10000);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);


    const CARDS = [
        {
            key: 'branches', label: 'Branches', desc: 'Active Locations',
            count: stats.branches, cssClass: 'card-analytics',
            icon: '🏢'
        },
        {
            key: 'staff', label: 'Staff', desc: 'Service Staff',
            count: stats.staff, cssClass: 'card-activity',
            icon: '👥'
        },
        {
            key: 'consultants', label: 'Providers', desc: 'Active Providers',
            count: stats.consultants, cssClass: 'card-alerts',
            icon: '👤'
        },
        {
            key: 'schedules', label: 'Schedules', desc: 'Service Schedules',
            count: stats.schedules, cssClass: 'card-critical',
            icon: '📅'
        },
        {
            key: 'payments', label: 'Reports', desc: 'Financial Analytics',
            count: `₹${stats.revenue.toLocaleString()}`, cssClass: 'card-revenue',
            icon: '📊'
        }
    ];

    return (
        <div className="dashboard-main">
            {/* Welcome Banner */}
            <section className="welcome-banner">
                <div className="welcome-text">
                    <h2 className="welcome-title">
                        Welcome back, <span className="highlight-text">Administrator</span> 👋
                    </h2>
                    <p className="welcome-subtitle">
                        Here's your organization overview. Select a section from the sidebar or click a card to manage.
                    </p>
                </div>
            </section>

            {/* Cards Grid */}
            <section className="cards-grid">
                {CARDS.map((card, i) => (
                    <button key={card.key} className={`dash-card ${card.cssClass}`}
                        onClick={() => onNavigate(card.key)}
                        style={{ animationDelay: `${i * 0.1}s` }}>

                        <div className="card-content">
                            <div className="card-top-info">
                                <div className="card-icon-box">
                                    {card.icon}
                                </div>
                                <div className="card-text-stack">
                                    <span className="card-count">{card.count}</span>
                                    <h3 className="card-label">{card.label}</h3>
                                    <span className="card-desc">{card.desc}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-action">
                            <span>Manage</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                ))}
            </section>

        </div>
    );
}

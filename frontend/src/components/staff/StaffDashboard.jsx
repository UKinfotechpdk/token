import React from 'react';

export default function StaffDashboard({ staff, onToast, onNavigate }) {
    const cards = [
        {
            icon: '🎫', title: 'Token System', desc: 'Start or resume token issuance for physical queuing.',
            action: 'Start Token', cssClass: 'card-analytics', onClick: () => onNavigate('tokensystem')
        },
        {
            icon: '👤', title: 'Assign Token', desc: 'Quickly assign the next available token manually.',
            action: 'Assign Token', cssClass: 'card-activity', onClick: () => onNavigate('assigntoken')
        },
        {
            icon: '🖨️', title: 'Print Token', desc: 'Re-print a previously assigned physical token slip.',
            action: 'Print Token', cssClass: 'card-alerts', onClick: () => onNavigate('printtoken')
        },
        {
            icon: '🖥️', title: 'Live Token Display', desc: 'Open a full-screen display for customers in waiting area.',
            action: 'Show Display', cssClass: 'card-success', onClick: () => onNavigate('livedisplay')
        },
        {
            icon: '📊', title: 'Daily Summary', desc: 'View complete insights, token statistics, and financial summaries.',
            action: 'View Summary', cssClass: 'card-critical', onClick: () => onNavigate('dailysummary')
        },
    ];

    return (
        <div className="dashboard-main">
            {/* Welcome Banner */}
            <section className="welcome-banner">
                <div className="welcome-text">
                    <h2 className="welcome-title">
                        Welcome back, <span className="highlight-text">{staff?.staff_name || 'Staff Member'}</span> 👋
                    </h2>
                    <p className="welcome-subtitle">
                        Here's your branch overview. Select an action below to manage tokens and service.
                    </p>
                </div>
            </section>

            {/* Cards Grid */}
            <section className="cards-grid">
                {cards.map((card, i) => (
                    <button key={i} className={`dash-card ${card.cssClass}`}
                        onClick={card.onClick}
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            textAlign: 'left'
                        }}>

                        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                                <div className="card-icon-box" style={{ fontSize: '28px', background: 'rgba(255,255,255,0.25)', padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                                    {card.icon}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <h3 className="card-label" style={{ margin: 0 }}>{card.title}</h3>
                                    <p className="card-desc" style={{ margin: 0 }}>{card.desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-action" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', marginTop: '24px', zIndex: 1 }}>
                            <span>{card.action}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                ))}
            </section>
        </div>
    );
}

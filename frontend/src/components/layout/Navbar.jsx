import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    if (!user) return null;

    return (
        <nav className="top-header premium-navbar">
            {/* Brand / Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>🎟️</span>
                <div>
                    <Link
                        to="/user/dashboard"
                        style={{ textDecoration: 'none' }}
                    >
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
                            Token Kiosk
                        </h2>
                    </Link>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.72)', fontWeight: '500' }}>
                        Welcome, {user?.name || 'Customer'} 👋
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Avatar */}
                <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontSize: '14px', color: '#ffffff'
                }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    style={{
                        padding: '8px 20px',
                        fontSize: '13px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.22)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    Sign Out 🚪
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

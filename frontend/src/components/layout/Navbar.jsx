import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav className="glass-nav" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--glass-border)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            marginBottom: '1rem'
        }}>
            <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🎟️</span>
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    letterSpacing: '-0.5px'
                }}>
                    Token Kiosk
                </Link>
            </div>

            {/* Removed Dashboard link as per user request */}

            <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="user-info" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome,</div>
                    <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>{user.name}</div>
                </div>
                <button
                    onClick={onLogout}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 16px' }}
                >
                    Logout
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .nav-item {
                    text-decoration: none;
                    color: var(--text-muted);
                    font-weight: 500;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }
                .nav-item:hover {
                    color: var(--secondary);
                }
                .glass-nav {
                    background: var(--bg-surface);
                    backdrop-filter: blur(var(--glass-blur));
                }
                .brand-text {
                    font-size: 20px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.5px;
                }
                .brand-icon {
                    font-size: 24px;
                    margin-right: 8px;
                }
            `}} />
        </nav>
    );
};

export default Navbar;

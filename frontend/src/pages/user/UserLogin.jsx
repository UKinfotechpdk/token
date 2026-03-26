import React, { useState } from 'react';
import { login } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const UserLogin = ({ onLogin, onSwitch }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login({ identifier, password, role: 'user' });
            const { user, token } = res.data;
            localStorage.setItem('user_token', token);
            localStorage.setItem('user_user', JSON.stringify(user));
            onLogin(user);
            navigate('/user/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid identifier or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                </div>

                <h1>Customer Login</h1>
                <p className="subtitle">Sign in to manage your tokens</p>



                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email or Mobile</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📧</span>
                            <input
                                type="text"
                                placeholder="Enter email or mobile number"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔑</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: '46px' }}
                            />
                            <div className="input-actions" style={{ right: '10px' }}>
                                <button
                                    type="button"
                                    className="action-tiny"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        {error && <div className="input-error-msg">⚠️ {error}</div>}
                    </div>

                    <button type="submit" className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <span
                            onClick={() => onSwitch('register')}
                            style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Register Now
                        </span>
                    </p>
                </form>
            </div>
        </div >
    );
};

export default UserLogin;

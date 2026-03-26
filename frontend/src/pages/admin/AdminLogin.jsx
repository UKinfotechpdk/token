import React, { useState } from 'react';
import { adminLogin } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
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
            const res = await adminLogin({ identifier, password });
            const { user, token } = res.data;
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));
            onLogin(user);
            navigate('/admin');
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
                        background: 'var(--primary)',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <span style={{ fontSize: '32px' }}>🔒</span>
                    </div>
                </div>

                <h1>Admin Login</h1>
                <p className="subtitle">Enter credentials to access the Admin Portal</p>



                <form onSubmit={handleSubmit} className="module-form" noValidate>
                    <div className="form-group float-group" style={{ '--stagger': 1, marginBottom: '24px' }}>
                        <div className="input-with-icon">
                            <span className="input-icon">📧</span>
                            <input
                                id="admin-id"
                                type="text"
                                placeholder=" "
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                            <label htmlFor="admin-id">Email or Mobile Number</label>
                        </div>
                    </div>

                    <div className="form-group float-group" style={{ '--stagger': 2, marginBottom: '24px' }}>
                        <div className="input-with-icon">
                            <span className="input-icon">🔑</span>
                            <input
                                id="admin-pass"
                                type={showPassword ? "text" : "password"}
                                placeholder=" "
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label htmlFor="admin-pass">Access Password</label>
                            <div className="input-actions" style={{ position: 'absolute', right: '12px', zIndex: 10 }}>
                                <button
                                    type="button"
                                    className="action-tiny"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        {error && <div className="error-message shake" style={{ marginTop: '8px', display: 'block' }}>⚠️ {error}</div>}
                    </div>

                    <button type="submit" className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ height: '56px', borderRadius: '18px', fontSize: '16px', fontWeight: 900, marginTop: '12px' }}>
                        {loading ? 'Authenticating...' : 'Sign In as Admin'}
                    </button>
                </form>
            </div>
        </div >
    );
};

export default AdminLogin;

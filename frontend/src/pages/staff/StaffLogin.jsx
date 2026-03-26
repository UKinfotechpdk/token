import React, { useState } from 'react';
import { staffLogin } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const StaffLogin = ({ onLogin }) => {
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
            const res = await staffLogin({ identifier, password });
            const { user, token } = res.data;
            localStorage.setItem('staff_token', token);
            localStorage.setItem('staff_user', JSON.stringify(user));
            onLogin(user);
            navigate('/staff');
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
                        <span style={{ fontSize: '32px' }}>🏢</span>
                    </div>
                </div>

                <h1>Staff Login</h1>
                <p className="subtitle">Enter credentials to access the Staff Portal</p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Staff ID or Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🆔</span>
                            <input
                                type="text"
                                placeholder="Enter staff identifier"
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
                                placeholder="Enter staff password"
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
                    </div>

                    <button type="submit" className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                        {loading ? 'Logging in...' : 'Sign In as Staff'}
                    </button>
                </form>
            </div>
        </div >
    );
};

export default StaffLogin;

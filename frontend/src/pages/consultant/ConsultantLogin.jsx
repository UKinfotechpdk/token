import React, { useState } from 'react';
import { consultantLogin } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const ConsultantLogin = ({ onLogin }) => {
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
            const res = await consultantLogin({ identifier, password });
            const { user, token } = res.data;
            localStorage.setItem('consultant_token', token);
            localStorage.setItem('consultant_user', JSON.stringify(user));
            onLogin(user);
            navigate('/consultant');
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
                        <span style={{ fontSize: '32px' }}>👤</span>
                    </div>
                </div>

                <h1>Specialist Login</h1>
                <p className="subtitle">Enter credentials to access the Specialist Portal</p>



                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Specialist ID / Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon">💼</span>
                            <input
                                type="text"
                                placeholder="Enter specialist identifier"
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
                                placeholder="Enter password"
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
                        {loading ? 'Entering Portal...' : 'Sign In as Specialist'}
                    </button>
                </form>
            </div>
        </div >
    );
};

export default ConsultantLogin;

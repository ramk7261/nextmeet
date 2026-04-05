import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import '../App.css';

export default function Authentication() {
    const [formState, setFormState] = useState(0); // 0 = login, 1 = register
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [snackOpen, setSnackOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { handleRegister, handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const switchTab = (tab) => {
        setFormState(tab);
        setError('');
        setMessage('');
    };

    const handleAuth = async () => {
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        if (formState === 1 && !name.trim()) {
            setError('Please enter your full name.');
            return;
        }

        setLoading(true);
        try {
            if (formState === 0) {
                await handleLogin(username.trim(), password);
                // handleLogin navigates to /home on success
            } else {
                const result = await handleRegister(name.trim(), username.trim(), password);
                setMessage(result || 'Account created! Please sign in.');
                setSnackOpen(true);
                setName('');
                setUsername('');
                setPassword('');
                setFormState(0);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mesh-bg" />

            <div className="auth-container page-wrapper">
                {/* Left Panel - branding */}
                <div className="auth-left">
                    <div className="auth-left-content">
                        <div className="auth-brand">
                            <div className="logo-mark">🎥</div>
                            <span className="auth-brand-name">NexMeet</span>
                        </div>
                        <h2 className="auth-left-title">
                            The future of<br />
                            <span className="auth-highlight">remote collaboration</span>
                        </h2>
                        <p className="auth-left-sub">
                            Trusted by 50,000+ teams worldwide for crystal-clear video meetings.
                        </p>
                        <div className="auth-features">
                            {[
                                { icon: '🔐', bg: 'rgba(59,130,246,0.15)',  title: 'Secure by default',      sub: 'E2E encrypted, no data stored' },
                                { icon: '⚡', bg: 'rgba(6,182,212,0.15)',   title: 'Instant meetings',       sub: 'One click, no setup needed' },
                                { icon: '🌍', bg: 'rgba(16,185,129,0.15)',  title: 'Global infrastructure',  sub: 'Servers in 40+ regions' }
                            ].map(f => (
                                <div className="auth-feature-item" key={f.title}>
                                    <div className="af-icon" style={{ background: f.bg }}>{f.icon}</div>
                                    <div className="af-text">
                                        <strong>{f.title}</strong>
                                        <span>{f.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - form */}
                <div className="auth-right">
                    <h2 className="auth-title">
                        {formState === 0 ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p className="auth-sub">
                        {formState === 0 ? 'Sign in to continue to NexMeet' : 'Join 50,000+ teams on NexMeet'}
                    </p>

                    <div className="tab-row">
                        <button
                            className={`tab-btn ${formState === 0 ? 'active' : ''}`}
                            onClick={() => switchTab(0)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`tab-btn ${formState === 1 ? 'active' : ''}`}
                            onClick={() => switchTab(1)}
                        >
                            Create Account
                        </button>
                    </div>

                    {formState === 1 && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Rahul Sharma"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="rahul_sharma"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAuth()}
                        />
                    </div>

                    {error   && <div className="auth-error-msg">{error}</div>}
                    {message && <div className="auth-success-msg">{message}</div>}

                    <button className="btn-full" onClick={handleAuth} disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : formState === 0 ? 'Sign In →' : 'Create Account →'
                        }
                    </button>

                    <div className="auth-divider">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-text">or</span>
                        <div className="auth-divider-line" />
                    </div>

                    <button className="btn-guest" onClick={() => navigate('/home')}>
                        👤 Continue as Guest
                    </button>

                    <p className="auth-terms">
                        By continuing, you agree to our <span>Terms</span> and <span>Privacy Policy</span>
                    </p>
                </div>
            </div>

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                message={message}
                onClose={() => setSnackOpen(false)}
            />
        </div>
    );
}

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';
import '../App.css';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState('');
    const { addToUserHistory, getStoredUser } = useContext(AuthContext);

    // Get logged-in user's name (falls back to "Guest")
    const user = getStoredUser();
    const displayName = user ? user.name : 'Guest';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const generateCode = () => {
        const parts = ['nex', 'mtg', 'vid', 'con', 'live'];
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `${parts[Math.floor(Math.random() * parts.length)]}-${rand(4)}-${rand(4)}`;
    };

    const handleJoin = async () => {
        const code = meetingCode.trim();
        if (!code) return;
        await addToUserHistory(code);
        navigate(`/${code}`);
    };

    const handleNewMeeting = async () => {
        const code = generateCode();
        setMeetingCode(code);
        await addToUserHistory(code);
        navigate(`/${code}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const recentItems = [
        { code: 'abc-xyz-123', date: 'Today, 10:30 AM · 45 min · 5 participants', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
        { code: 'pqr-mno-789', date: 'Yesterday, 3:00 PM · 1h 20min · 3 participants', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)' },
        { code: 'lmn-def-456', date: 'Jan 18 · 30 min · 2 participants', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' }
    ];

    return (
        <div>
            <div className="mesh-bg" />

            {/* App Navbar */}
            <nav className="app-nav">
                <div className="app-nav-left">
                    <div className="nav-logo" style={{ fontSize: '1.1rem' }}>
                        <div className="logo-mark" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>🎥</div>
                        NexMeet
                    </div>
                </div>

                <div className="user-info-nav">
                    <div className="user-avatar">{avatarLetter}</div>
                    <div>
                        <div className="user-name">{displayName}</div>
                        <div className="user-status">
                            <span className="status-dot" />
                            Online
                        </div>
                    </div>
                </div>

                <div className="app-nav-right">
                    <button className="icon-btn" onClick={() => navigate('/history')} title="Meeting History">🕐</button>
                    <button className="icon-btn" title="Notifications">🔔</button>
                    <button className="icon-btn" title="Settings">⚙️</button>
                    <button
                        className="btn-nav-ghost"
                        style={{ fontSize: '0.8rem' }}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="page-wrapper">
                <div className="home-main">
                    <h1 className="home-greet">{getGreeting()}, {displayName.split(' ')[0]} 👋</h1>
                    <p className="home-sub">Ready to connect? Start or join a meeting below.</p>

                    {/* Join / New Meeting Card */}
                    <div className="join-card">
                        <div className="join-card-inner">
                            <div className="join-left">
                                <h2>Join or Start a Meeting</h2>
                                <p>Enter a meeting code to join, or create an instant meeting.</p>
                                <div className="join-input-row">
                                    <input
                                        className="join-input"
                                        placeholder="Enter meeting code (e.g. abc-xyz-1234)"
                                        value={meetingCode}
                                        onChange={e => setMeetingCode(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                    />
                                    <button className="btn-join" onClick={handleJoin}>
                                        🎥 Join
                                    </button>
                                </div>
                            </div>

                            <div className="join-right">
                                <div className="join-right-icon">✨</div>
                                <div className="new-meet-label">Instant Meeting</div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.75rem' }}>
                                    Start with a generated code
                                </p>
                                <button className="btn-new-meet" onClick={handleNewMeeting}>
                                    + New Meeting
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        {[
                            { icon: '📹', label: 'New Meeting', action: handleNewMeeting },
                            { icon: '🔗', label: 'Join Meeting', action: handleJoin },
                            { icon: '🕐', label: 'History',      action: () => navigate('/history') },
                            { icon: '📅', label: 'Schedule',     action: () => {} }
                        ].map(qa => (
                            <div className="quick-action" key={qa.label} onClick={qa.action}>
                                <div className="qa-icon">{qa.icon}</div>
                                <div className="qa-label">{qa.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Meetings */}
                    <div className="recent-title">🕐 Recent Meetings</div>
                    {recentItems.map(r => (
                        <div className="recent-item" key={r.code}>
                            <div
                                className="recent-icon"
                                style={{ background: r.bg, border: `1px solid ${r.border}` }}
                            >
                                📹
                            </div>
                            <div>
                                <div className="recent-code">{r.code}</div>
                                <div className="recent-date">{r.date}</div>
                            </div>
                            <button
                                className="recent-rejoin"
                                onClick={() => navigate(`/${r.code}`)}
                            >
                                Rejoin →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);

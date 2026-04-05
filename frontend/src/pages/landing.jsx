import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        { icon: '⚡', cls: 'feat-icon-blue',    title: 'Zero-Latency HD Video',    desc: 'WebRTC-powered peer-to-peer connections deliver 1080p video with sub-50ms latency globally.' },
        { icon: '🛡️', cls: 'feat-icon-cyan',    title: 'End-to-End Encrypted',      desc: 'Every meeting is secured with AES-256 encryption. Your conversations stay private, always.' },
        { icon: '🤖', cls: 'feat-icon-violet',  title: 'AI Summaries',              desc: 'Auto-generated meeting notes, action items, and transcripts delivered to your inbox.' },
        { icon: '🖥️', cls: 'feat-icon-emerald', title: 'Screen Sharing',            desc: 'Share your full screen, a window, or a browser tab with zero lag and HD quality.' },
        { icon: '📱', cls: 'feat-icon-rose',    title: 'Works Everywhere',          desc: 'Join from any device — desktop, mobile, tablet — no downloads ever required.' },
        { icon: '📊', cls: 'feat-icon-amber',   title: 'Meeting Analytics',         desc: 'Participant insights, speaking time breakdown, and engagement scores for every meeting.' }
    ];

    const stats = [
        ['2M+', 'Meetings Hosted'],
        ['150+', 'Countries'],
        ['99.9%', 'Uptime'],
        ['<4ms', 'Avg Latency']
    ];

    return (
        <div>
            <div className="mesh-bg" />

            {/* Navbar */}
            <nav className="nexmeet-nav">
                <a className="nav-logo">
                    <div className="logo-mark">🎥</div>
                    NexMeet
                </a>
                <ul className="nav-links-list">
                    <li><a>Features</a></li>
                    <li><a>Pricing</a></li>
                    <li><a>Enterprise</a></li>
                    <li><a>Docs</a></li>
                </ul>
                <div className="nav-actions">
                    <button className="btn-nav-ghost" onClick={() => navigate('/auth')}>Sign In</button>
                    <button className="btn-nav-primary" onClick={() => navigate('/auth')}>Get Started Free →</button>
                </div>
            </nav>

            <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Hero */}
                <main className="hero">
                    <div className="hero-badge">
                        <span className="badge-dot" />
                        Now with AI meeting summaries &amp; transcripts
                    </div>

                    <h1>
                        Video Meetings<br />
                        Built for <span className="word-highlight">Real Work</span>
                    </h1>

                    <p className="hero-desc">
                        Crystal-clear video, zero friction. Connect with your team, clients,
                        or loved ones in seconds — no downloads, no accounts required.
                    </p>

                    <div className="hero-btns">
                        <button className="btn-primary" onClick={() => navigate('/auth')}>
                            🚀 Start a Meeting Free
                        </button>
                        <button className="btn-secondary-hero" onClick={() => navigate('/home')}>
                            👤 Join as Guest
                        </button>
                    </div>

                    {/* Mock meeting preview */}
                    <div className="hero-visual">
                        <div className="meet-preview">
                            <div className="preview-topbar">
                                <div className="tbar-dot" />
                                <div className="tbar-dot" />
                                <div className="tbar-dot" />
                                <span className="tbar-title">Team Standup — Product Design</span>
                                <span className="tbar-live">
                                    <span className="live-dot" /> LIVE
                                </span>
                            </div>
                            <div className="video-grid">
                                <div className="video-tile main-tile tile-gradient-1 speaking">
                                    👨‍💻
                                    <span className="tile-name">Rahul (You)</span>
                                    <span className="tile-mic">🎤</span>
                                </div>
                                <div className="video-tile tile-gradient-2">
                                    👩‍🎨
                                    <span className="tile-name">Priya</span>
                                    <span className="tile-mic">🔇</span>
                                </div>
                                <div className="video-tile tile-gradient-3">
                                    👨‍💼
                                    <span className="tile-name">Arjun</span>
                                    <span className="tile-mic">🎤</span>
                                </div>
                                <div className="video-tile tile-gradient-4">
                                    🧑‍💻
                                    <span className="tile-name">Dev</span>
                                    <span className="tile-mic">🔇</span>
                                </div>
                                <div className="video-tile tile-gradient-5">
                                    👩‍🔬
                                    <span className="tile-name">Sneha</span>
                                    <span className="tile-mic">🎤</span>
                                </div>
                            </div>
                            <div className="preview-controls">
                                {['🎤', '🎥', '🖥️', '💬', '👥'].map(icon => (
                                    <div key={icon} className="ctrl-btn">{icon}</div>
                                ))}
                                <div className="ctrl-btn danger">📞</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="stats-row">
                        {stats.map(([val, label]) => (
                            <div className="stat" key={label}>
                                <div className="stat-val">{val}</div>
                                <div className="stat-lbl">{label}</div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Features section */}
                <section className="landing-section">
                    <div className="section-inner">
                        <div className="section-label">Why NexMeet</div>
                        <h2 className="section-title">
                            Everything Teams Need.<br />Nothing They Don't.
                        </h2>
                        <div className="feat-grid">
                            {features.map(f => (
                                <div className="feat-card" key={f.title}>
                                    <div className={`feat-icon ${f.cls}`}>{f.icon}</div>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

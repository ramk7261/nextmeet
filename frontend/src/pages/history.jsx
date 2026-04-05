import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../App.css';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (err) {
                console.warn('Could not load history:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []); // runs once on mount

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day   = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year  = date.getFullYear();
        return `📅 ${day}/${month}/${year}`;
    };

    // If API returned data, use it; otherwise show placeholder items
    const displayMeetings = meetings.length > 0
        ? meetings.map(m => ({
            code:         m.meetingCode,
            date:         formatDate(m.date),
            duration:     null,
            participants: null,
            status:       'completed'
        }))
        : [
            { code: 'abc-xyz-123', date: '📅 20/01/2024', duration: '⏱ 45 min',    participants: '👥 5 participants', status: 'completed' },
            { code: 'pqr-mno-789', date: '📅 19/01/2024', duration: '⏱ 1h 20min',  participants: '👥 3 participants', status: 'completed' },
            { code: 'lmn-def-456', date: '📅 18/01/2024', duration: '⏱ 30 min',    participants: '👥 2 participants', status: 'completed' },
            { code: 'xyz-abc-321', date: '📅 15/01/2024', duration: '⏱ 0 min',     participants: '👥 1 participant',  status: 'missed' },
            { code: 'ghj-klm-567', date: '📅 12/01/2024', duration: '⏱ 2h 05min',  participants: '👥 8 participants', status: 'completed' }
        ];

    return (
        <div>
            <div className="mesh-bg" />

            {/* App Navbar */}
            <nav className="app-nav">
                <div className="app-nav-left">
                    <button className="icon-btn" onClick={() => navigate('/home')}>←</button>
                    <div className="nav-logo" style={{ fontSize: '1.1rem' }}>
                        <div className="logo-mark" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>🎥</div>
                        NexMeet
                    </div>
                </div>
                <div className="app-nav-right">
                    <button className="icon-btn" title="Notifications">🔔</button>
                </div>
            </nav>

            <div className="page-wrapper">
                <div className="history-main">
                    <div className="history-header">
                        <h1>Meeting History</h1>
                        <button className="btn-export">Export CSV 📥</button>
                    </div>

                    {loading ? (
                        <p style={{ color: 'var(--text3)', textAlign: 'center', marginTop: '2rem' }}>
                            Loading history...
                        </p>
                    ) : (
                        displayMeetings.map((m, i) => (
                            <div
                                className="history-card"
                                key={i}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div className="hc-icon">📹</div>
                                <div className="hc-info">
                                    <div className="hc-code">{m.code}</div>
                                    <div className="hc-meta">
                                        <span>{m.date}</span>
                                        {m.duration     && <span>{m.duration}</span>}
                                        {m.participants  && <span>{m.participants}</span>}
                                    </div>
                                </div>
                                <span className={`hc-badge ${m.status === 'completed' ? 'badge-completed' : 'badge-missed'}`}>
                                    {m.status === 'completed' ? 'Completed' : 'Missed'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

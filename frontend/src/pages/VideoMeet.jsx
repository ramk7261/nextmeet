import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import '../App.css';
import server from '../environment';

// ICE server config for WebRTC peer connections
const peerConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// In-memory map of peer connections: { socketId -> RTCPeerConnection }
const peerConnections = {};

export default function VideoMeetComponent() {
    const socketRef     = useRef(null);
    const socketIdRef   = useRef(null);
    const localVideoRef = useRef(null);
    const videoRef      = useRef([]); // mirrors videos state for use in callbacks
    const permissionsChecked = useRef(false); // prevents repeated permission requests

    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [screenEnabled, setScreenEnabled] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState('');
    const [videos, setVideos] = useState([]);       // remote streams
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [newMessages, setNewMessages] = useState(0);

    // ── Silent black video + silent audio (used when camera/mic is off) ──
    const silence = () => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const dst = osc.connect(ctx.createMediaStreamDestination());
        osc.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    const blackVideo = ({ width = 640, height = 480 } = {}) => {
        const canvas = Object.assign(document.createElement('canvas'), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    const blackSilenceStream = () => new MediaStream([blackVideo(), silence()]);

    // ── Request camera + microphone permissions once ──
    const getPermissions = useCallback(async () => {
        if (permissionsChecked.current) return;
        permissionsChecked.current = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            window.localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setVideoEnabled(true);
            setAudioEnabled(true);
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
        } catch (err) {
            console.warn('Media permission denied:', err.message);
            window.localStream = blackSilenceStream();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = window.localStream;
            }
            setVideoEnabled(false);
            setAudioEnabled(false);
        }
    }, []); // stable — no deps

    // Run only once on mount
    useEffect(() => {
        getPermissions();
    }, [getPermissions]);

    // ── Sync camera / mic state changes to localStream tracks ──
    useEffect(() => {
        if (!window.localStream) return;
        window.localStream.getVideoTracks().forEach(t => { t.enabled = videoEnabled; });
    }, [videoEnabled]);

    useEffect(() => {
        if (!window.localStream) return;
        window.localStream.getAudioTracks().forEach(t => { t.enabled = audioEnabled; });
    }, [audioEnabled]);

    // ── Screen share ──
    useEffect(() => {
        if (!screenEnabled) return;

        const startScreenShare = async () => {
            try {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });

                // Stop current local stream
                if (window.localStream) {
                    window.localStream.getTracks().forEach(t => t.stop());
                }
                window.localStream = displayStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = displayStream;
                }

                // Replace tracks in all peer connections
                Object.values(peerConnections).forEach(pc => {
                    displayStream.getTracks().forEach(track => {
                        pc.addTrack(track, displayStream);
                    });
                    pc.createOffer().then(offer => {
                        pc.setLocalDescription(offer);
                        // Signal all peers about new stream
                        Object.entries(peerConnections).forEach(([id]) => {
                            if (socketRef.current) {
                                socketRef.current.emit('signal', id, JSON.stringify({ sdp: pc.localDescription }));
                            }
                        });
                    });
                });

                // Auto-stop screen share when user clicks "Stop sharing"
                displayStream.getVideoTracks()[0].onended = () => {
                    setScreenEnabled(false);
                    getPermissions(); // restore camera
                };
            } catch (err) {
                console.warn('Screen share cancelled or failed:', err.message);
                setScreenEnabled(false);
            }
        };

        startScreenShare();
    }, [screenEnabled, getPermissions]);

    // ── WebRTC signaling message handler ──
    const gotMessageFromServer = useCallback((fromId, message) => {
        const signal = JSON.parse(message);
        if (fromId === socketIdRef.current) return;

        const pc = peerConnections[fromId];
        if (!pc) return;

        if (signal.sdp) {
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type === 'offer') {
                        return pc.createAnswer();
                    }
                })
                .then(answer => {
                    if (answer) {
                        pc.setLocalDescription(answer);
                        socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: pc.localDescription }));
                    }
                })
                .catch(e => console.warn('SDP error:', e.message));
        }

        if (signal.ice) {
            pc.addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e => console.warn('ICE error:', e.message));
        }
    }, []);

    // ── Connect to Socket.IO and start WebRTC ──
    const connectToSocket = useCallback(() => {
        socketRef.current = io(server, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id;

            // Join the meeting room identified by the URL path
            socketRef.current.emit('join-call', window.location.href);

            // Incoming chat messages
            socketRef.current.on('chat-message', (data, sender, senderId) => {
                setMessages(prev => [...prev, { sender, data }]);
                if (senderId !== socketIdRef.current) {
                    setNewMessages(prev => prev + 1);
                }
            });

            // A peer left
            socketRef.current.on('user-left', (id) => {
                setVideos(prev => prev.filter(v => v.socketId !== id));
                if (peerConnections[id]) {
                    peerConnections[id].close();
                    delete peerConnections[id];
                }
            });

            // A new user joined (clients = all socket IDs currently in room)
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach(socketListId => {
                    if (peerConnections[socketListId]) return; // already created

                    const pc = new RTCPeerConnection(peerConfig);
                    peerConnections[socketListId] = pc;

                    // Send ICE candidates to the peer
                    pc.onicecandidate = (event) => {
                        if (event.candidate && socketRef.current) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ ice: event.candidate }));
                        }
                    };

                    // Receive remote video stream
                    pc.ontrack = (event) => {
                        const remoteStream = event.streams[0];
                        setVideos(prev => {
                            const exists = prev.find(v => v.socketId === socketListId);
                            const updated = exists
                                ? prev.map(v => v.socketId === socketListId ? { ...v, stream: remoteStream } : v)
                                : [...prev, { socketId: socketListId, stream: remoteStream }];
                            videoRef.current = updated;
                            return updated;
                        });
                    };

                    // Add local stream tracks to peer connection
                    const localStream = window.localStream || blackSilenceStream();
                    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                });

                // If THIS socket just joined, create offers for all existing peers
                if (id === socketIdRef.current) {
                    Object.entries(peerConnections).forEach(([peerId, pc]) => {
                        if (peerId === socketIdRef.current) return;
                        pc.createOffer()
                            .then(offer => pc.setLocalDescription(offer))
                            .then(() => {
                                socketRef.current.emit('signal', peerId, JSON.stringify({ sdp: peerConnections[peerId].localDescription }));
                            })
                            .catch(e => console.warn('Offer error:', e.message));
                    });
                }
            });
        });
    }, [gotMessageFromServer]);

    // ── Enter the meeting ──
    const connect = () => {
        if (!username.trim()) return;
        setAskForUsername(false);
        connectToSocket();
    };

    // ── End call ──
    const handleEndCall = () => {
        // Stop all tracks
        if (window.localStream) {
            window.localStream.getTracks().forEach(t => t.stop());
        }
        // Close all peer connections
        Object.values(peerConnections).forEach(pc => pc.close());
        // Disconnect socket
        if (socketRef.current) socketRef.current.disconnect();
        window.location.href = '/';
    };

    // ── Send chat message ──
    const sendMessage = () => {
        if (!message.trim() || !socketRef.current) return;
        socketRef.current.emit('chat-message', message.trim(), username);
        setMessage('');
    };

    const roomCode = window.location.pathname.replace('/', '');

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="mesh-bg" />

            {askForUsername ? (
                /* ── Pre-join screen ── */
                <div className="prejoin-screen page-wrapper">
                    <div className="prejoin-card">
                        <div className="prejoin-preview">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                            />
                            <span className="prejoin-cam-label">Camera Preview</span>
                        </div>

                        <h3>Ready to Join?</h3>
                        <p className="prejoin-sub">Enter your display name to join the meeting</p>

                        <div className="form-group">
                            <label className="form-label">Your Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Rahul Sharma"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && connect()}
                            />
                        </div>

                        <div className="prejoin-controls">
                            <button
                                className={`pj-ctrl-btn ${videoEnabled ? 'active' : ''}`}
                                onClick={() => setVideoEnabled(v => !v)}
                            >
                                {videoEnabled ? '🎥 Cam On' : '🚫 Cam Off'}
                            </button>
                            <button
                                className={`pj-ctrl-btn ${audioEnabled ? 'active' : ''}`}
                                onClick={() => setAudioEnabled(a => !a)}
                            >
                                {audioEnabled ? '🎤 Mic On' : '🔇 Mic Off'}
                            </button>
                        </div>

                        <button className="btn-enter-meet" onClick={connect}>
                            🚀 Join Meeting Now
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Active meeting UI ── */
                <div className="meeting-ui">
                    {/* Top bar */}
                    <div className="meet-topbar">
                        <div className="meet-topbar-left">
                            <div className="nav-logo" style={{ fontSize: '1rem' }}>
                                <div className="logo-mark" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>🎥</div>
                                NexMeet
                            </div>
                            <span className="meet-code">{roomCode}</span>
                        </div>
                        <button
                            className="btn-nav-ghost"
                            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                            onClick={() => navigator.clipboard?.writeText(window.location.href)}
                        >
                            🔗 Copy Link
                        </button>
                    </div>

                    {/* Video area + chat */}
                    <div className="meet-area-wrapper">
                        <div className="meet-video-area">
                            {/* Local video (you) */}
                            <div className="meet-tile main-tile tile-gradient-1" style={{ position: 'relative' }}>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
                                />
                                <span className="tile-name">{username || 'You'} (You)</span>
                            </div>

                            {/* Remote participant videos */}
                            {videos.map((v, i) => (
                                <div
                                    key={v.socketId}
                                    className={`meet-tile tile-gradient-${(i % 4) + 2}`}
                                    style={{ position: 'relative' }}
                                >
                                    <video
                                        ref={ref => {
                                            if (ref && v.stream) ref.srcObject = v.stream;
                                        }}
                                        autoPlay
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
                                    />
                                    <span className="tile-name">Participant {i + 1}</span>
                                </div>
                            ))}

                            {/* Empty waiting tiles */}
                            {Array.from({ length: Math.max(0, 4 - videos.length) }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className={`meet-tile tile-gradient-${(videos.length + i) % 4 + 2}`}
                                    style={{ opacity: 0.4 }}
                                >
                                    <span style={{ fontSize: '2rem' }}>👤</span>
                                    <span className="tile-name">Waiting...</span>
                                </div>
                            ))}
                        </div>

                        {/* Chat panel */}
                        <div className={`chat-panel ${showChat ? 'open' : ''}`}>
                            <div className="chat-header">💬 Meeting Chat</div>
                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <p style={{ color: 'var(--text3)', fontSize: '0.82rem', textAlign: 'center', marginTop: '1rem' }}>
                                        No messages yet
                                    </p>
                                ) : messages.map((item, idx) => (
                                    <div key={idx} className={`chat-msg ${item.sender === username ? 'me' : ''}`}>
                                        <div className="chat-bubble">
                                            {item.sender !== username && (
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '3px' }}>
                                                    {item.sender}
                                                </div>
                                            )}
                                            {item.data}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input-row">
                                <input
                                    className="chat-text-input"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button className="chat-send-btn" onClick={sendMessage}>➤</button>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="meet-controls">
                        <button
                            className={`mc-btn ${audioEnabled ? 'active' : ''}`}
                            onClick={() => setAudioEnabled(a => !a)}
                        >
                            <span className="mc-btn-icon">{audioEnabled ? '🎤' : '🔇'}</span>
                            <span className="mc-btn-label">{audioEnabled ? 'Mute' : 'Unmute'}</span>
                        </button>

                        <button
                            className={`mc-btn ${videoEnabled ? 'active' : ''}`}
                            onClick={() => setVideoEnabled(v => !v)}
                        >
                            <span className="mc-btn-icon">{videoEnabled ? '🎥' : '📷'}</span>
                            <span className="mc-btn-label">{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
                        </button>

                        {screenAvailable && (
                            <button
                                className={`mc-btn ${screenEnabled ? 'active' : ''}`}
                                onClick={() => setScreenEnabled(s => !s)}
                            >
                                <span className="mc-btn-icon">🖥️</span>
                                <span className="mc-btn-label">{screenEnabled ? 'Stop Share' : 'Share'}</span>
                            </button>
                        )}

                        <button
                            className={`mc-btn ${showChat ? 'active' : ''}`}
                            onClick={() => { setShowChat(s => !s); setNewMessages(0); }}
                        >
                            <span className="mc-btn-icon">💬</span>
                            <span className="mc-btn-label">
                                Chat {newMessages > 0 ? `(${newMessages})` : ''}
                            </span>
                        </button>

                        <button className="mc-btn">
                            <span className="mc-btn-icon">👥</span>
                            <span className="mc-btn-label">People ({videos.length + 1})</span>
                        </button>

                        <button className="mc-btn end-call" onClick={handleEndCall}>
                            <span className="mc-btn-icon">📞</span>
                            <span className="mc-btn-label">End Call</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

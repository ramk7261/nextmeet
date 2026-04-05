require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'NexMeet Backend is running!',
        status: 'ok'
    });
});

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// In-memory store
let connections = {}; // { roomId: [socketId, ...] }
let messages = {};    // { roomId: [{ sender, data, time }, ...] }
let timeOnline = {};  // { socketId: Date }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-call', (roomId) => {
        if (!connections[roomId]) {
            connections[roomId] = [];
        }

        if (!connections[roomId].includes(socket.id)) {
            connections[roomId].push(socket.id);
        }

        if (!messages[roomId]) {
            messages[roomId] = [];
        }

        timeOnline[socket.id] = new Date();

        // Notify all users in room
        connections[roomId].forEach((id) => {
            io.to(id).emit('user-joined', socket.id, connections[roomId]);
        });

        // Send old chat messages
        socket.emit('chat-history', messages[roomId]);
    });

    // WebRTC signaling
    socket.on('signal', (toId, message) => {
        io.to(toId).emit('signal', socket.id, message);
    });

    // Chat message
    socket.on('chat-message', (data, sender) => {
        const roomEntry = Object.entries(connections).find(([roomId, ids]) => {
            return ids.includes(socket.id);
        });

        if (roomEntry) {
            const roomId = roomEntry[0];
            const ids = roomEntry[1];

            const msg = {
                sender,
                data,
                time: new Date()
            };

            messages[roomId].push(msg);

            ids.forEach((id) => {
                io.to(id).emit('chat-message', data, sender, socket.id);
            });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        Object.entries(connections).forEach(([roomId, ids]) => {
            const index = ids.indexOf(socket.id);

            if (index !== -1) {
                ids.splice(index, 1);

                // Notify remaining users
                ids.forEach((id) => {
                    io.to(id).emit('user-left', socket.id);
                });

                // Delete empty room
                if (ids.length === 0) {
                    delete connections[roomId];
                    delete messages[roomId];
                }
            }
        });

        delete timeOnline[socket.id];
    });
});

// Start server only after MongoDB connection
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');

        server.listen(PORT, () => {
            console.log(`NexMeet server running on port ${PORT}`);
            console.log(`API: http://localhost:${PORT}/api/v1/users`);
            console.log('Socket.IO ready for WebRTC signaling');
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });
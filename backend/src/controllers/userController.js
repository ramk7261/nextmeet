const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId, username) => {
    return jwt.sign(
        { userId, username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/v1/users/register
// Body: { name, username, password }
const register = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Name, username and password are required.'
            });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({
                message: 'Username already taken. Please choose another.'
            });
        }

        await User.create({ name, username, password });

        return res.status(httpStatus.CREATED).json({
            message: 'Account created successfully! You can now sign in.'
        });
    } catch (err) {
        console.error('[Register Error]', err.message);
        if (err.name === 'ValidationError') {
            const msg = Object.values(err.errors).map(e => e.message)[0];
            return res.status(httpStatus.BAD_REQUEST).json({ message: msg });
        }
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Server error. Please try again later.'
        });
    }
};

// POST /api/v1/users/login
// Body: { username, password }
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Username and password are required.'
            });
        }

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Invalid username or password.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Invalid username or password.'
            });
        }

        const token = generateToken(user._id, user.username);

        return res.status(httpStatus.OK).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username
            }
        });
    } catch (err) {
        console.error('[Login Error]', err.message);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Server error. Please try again later.'
        });
    }
};

// GET /api/v1/users/get_all_activity?token=...
// Protected route - requires verifyToken middleware
const getAllActivity = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('meetingHistory');

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'User not found.'
            });
        }

        // Sort newest first
        const history = user.meetingHistory.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        return res.status(httpStatus.OK).json(history);
    } catch (err) {
        console.error('[Get Activity Error]', err.message);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Server error. Please try again later.'
        });
    }
};

// POST /api/v1/users/add_to_activity
// Body: { token, meeting_code }
// Protected route - requires verifyToken middleware
const addToActivity = async (req, res) => {
    try {
        const { meeting_code } = req.body;

        if (!meeting_code) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Meeting code is required.'
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'User not found.'
            });
        }

        user.meetingHistory.push({
            meetingCode: meeting_code,
            date: new Date()
        });

        await user.save();

        return res.status(httpStatus.OK).json({
            message: 'Meeting added to history.'
        });
    } catch (err) {
        console.error('[Add Activity Error]', err.message);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = { register, login, getAllActivity, addToActivity };

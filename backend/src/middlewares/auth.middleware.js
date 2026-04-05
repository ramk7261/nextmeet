const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

/**
 * Middleware: Verify JWT token
 * Accepts token from request body OR query param
 * Usage:
 *   Body:  { token: "..." }
 *   Query: ?token=...
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.body.token || req.query.token;

        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, username, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Token expired. Please login again.'
            });
        }
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Invalid token.'
        });
    }
};

module.exports = { verifyToken };

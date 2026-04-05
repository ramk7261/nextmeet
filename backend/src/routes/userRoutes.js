const express = require('express');
const router = express.Router();
const { register, login, getAllActivity, addToActivity } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (JWT required)
router.get('/get_all_activity', verifyToken, getAllActivity);
router.post('/add_to_activity', verifyToken, addToActivity);

module.exports = router;

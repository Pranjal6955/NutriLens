const express = require('express');
const rateLimit = require('express-rate-limit');

const authMiddleware = require('../middleware/authMiddleware');
const { register, login, logout } = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Auth-specific rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'Too many authentication attempts from this IP, please try again later.',
});

// Public auth routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authLimiter, logout);

// Protected route
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: 'Welcome to dashboard',
    user: req.user,
  });
});

module.exports = router;

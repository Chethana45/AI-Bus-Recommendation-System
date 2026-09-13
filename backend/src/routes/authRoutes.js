const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  getCurrentUser,
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getCurrentUser);

module.exports = router;
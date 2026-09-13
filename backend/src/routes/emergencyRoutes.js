const express = require('express');

const {
  getEmergencyBuses,
  createEmergencyBooking
} = require('../controllers/emergencyController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

/*
 * Searching for emergency buses is public.
 * Users should be able to see available buses before logging in.
 */
router.get('/buses', getEmergencyBuses);

/*
 * Actually creating the emergency reservation requires login.
 */
router.post('/book', protect, createEmergencyBooking);

module.exports = router;
const express = require('express');
const {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
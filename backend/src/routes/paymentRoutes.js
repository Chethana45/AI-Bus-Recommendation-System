const express = require('express');
const {
  createPayment,
  getPayments,
} = require('../controllers/paymentController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createPayment);
router.get('/', getPayments);

module.exports = router;
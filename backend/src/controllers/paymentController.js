const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMode } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking id is required' });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const payment = await Payment.create({
      user: req.user._id,
      booking: booking._id,
      amount: booking.fare,
      paymentMode: paymentMode || booking.paymentMode || 'UPI',
      status: 'success',
      transactionId: `TXN${Date.now()}`,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
    })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
};
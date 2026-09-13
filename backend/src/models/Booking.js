const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    busName: String,
    from: String,
    to: String,
    travelDate: {
      type: String,
      required: true,
    },
    departureTime: String,
    arrivalTime: String,
    seats: {
      type: [Number],
      required: true,
    },
    passengerCount: Number,
    passengerDetails: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        age: Number,
        gender: String,
      },
    ],
    fare: Number,
    totalAmount: {
      type: Number,
      required: true,
    },
    farePerSeat: Number,
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    paymentMode: {
      type: String,
      enum: ['Card', 'UPI', 'Wallet', 'Cash'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    bookingType: {
      type: String,
      enum: ['normal', 'emergency'],
      default: 'normal',
    },
    emergencyReason: {
      type: String,
      enum: ['Festival', 'Medical Emergency', 'Family Emergency', 'Urgent Work', 'Other', null],
      default: null,
    },
    priorityLevel: {
      type: String,
      enum: ['normal', 'high', 'critical'],
      default: 'normal',
    },
    priorityFee: {
      type: Number,
      default: 0,
    },
    cancellationDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
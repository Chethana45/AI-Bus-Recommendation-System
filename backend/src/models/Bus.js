const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    time: String,
  },
  { _id: false }
);

const stopSchema = new mongoose.Schema(
  {
    name: String,
    time: String,
    type: {
      type: String,
      enum: ['boarding', 'stop', 'dropping'],
      default: 'stop',
    },
  },
  { _id: false }
);

const busSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
    },
    busType: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    fromCity: String,
    toCity: String,
    departureTime: String,
    arrivalTime: String,
    duration: String,
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    emergencySeats: {
      type: Number,
      default: 0,
    },
    fare: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    amenities: [String],
    boardingPoint: pointSchema,
    droppingPoint: pointSchema,
    stops: [stopSchema],
    // All cities the bus passes through in order (from → stops... → to)
    // Used to find buses for sub-routes / intermediate bookings
    routeCities: {
      type: [String],
      default: [],
    },
    image: String,
    cancellationPolicy: String,
    bookedSeats: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bus', busSchema);
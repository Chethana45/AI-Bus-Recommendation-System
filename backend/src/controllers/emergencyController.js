const Bus = require('../models/Bus');
const Booking = require('../models/Booking');

const getEmergencyBuses = async (req, res) => {
  try {
    const { from, to, travelDate } = req.query;

    if (!from || !to || !travelDate) {
      return res.status(400).json({ message: 'From, destination and travel date are required' });
    }

    const requestedDate = new Date(`${travelDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const differenceInDays = Math.round((requestedDate - today) / (1000 * 60 * 60 * 24));

    if (differenceInDays < 0 || differenceInDays > 3) {
      return res.status(400).json({ message: 'Emergency reservations are available only for the next 3 days.' });
    }

    const buses = await Bus.find({
      $or: [
        { from: new RegExp(`^${from}$`, 'i'), to: new RegExp(`^${to}$`, 'i') },
        { routeCities: { $all: [from, to] } },
      ],
      availableSeats: { $gt: 0 },
    }).sort({ availableSeats: -1, fare: 1 });

    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch emergency buses', error: error.message });
  }
};

const createEmergencyBooking = async (req, res) => {
  try {
    const {
      busId,
      travelDate,
      selectedSeats,
      passengerDetails,
      emergencyReason,
      priorityLevel,
      paymentMode,
    } = req.body;

    if (!busId || !travelDate || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ message: 'Bus, travel date and seats are required' });
    }

    if (!Array.isArray(passengerDetails) || passengerDetails.length !== selectedSeats.length) {
      return res.status(400).json({ message: 'Passenger details must match the number of selected seats' });
    }

    if (!emergencyReason) {
      return res.status(400).json({ message: 'Emergency reason is required' });
    }

    const requestedDate = new Date(`${travelDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const differenceInDays = Math.round((requestedDate - today) / (1000 * 60 * 60 * 24));

    if (differenceInDays < 0 || differenceInDays > 3) {
      return res.status(400).json({ message: 'Emergency reservations are available only within the next 3 days.' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const requestedSeats = [...new Set(selectedSeats.map(Number))];
    if (requestedSeats.length !== selectedSeats.length) {
      return res.status(400).json({ message: 'Duplicate seats are not allowed' });
    }

    const invalidSeat = requestedSeats.some((seat) => seat < 1 || seat > bus.totalSeats);
    if (invalidSeat) return res.status(400).json({ message: 'One or more selected seats are invalid' });

    const bookedSeats = Array.isArray(bus.bookedSeats) ? bus.bookedSeats : [];
    const alreadyBooked = requestedSeats.some((seat) => bookedSeats.includes(seat));
    if (alreadyBooked) return res.status(409).json({ message: 'One or more selected seats are already booked' });

    if (bus.availableSeats < requestedSeats.length) {
      return res.status(409).json({ message: `Only ${bus.availableSeats} seats are currently available` });
    }

    const normalizedPassengers = passengerDetails.map((passenger) => ({
      name: String(passenger.name || '').trim(),
      email: String(passenger.email || '').trim(),
      phone: String(passenger.phone || '').trim(),
      age: passenger.age ? Number(passenger.age) : undefined,
      gender: passenger.gender || undefined,
    }));

    if (normalizedPassengers.some((p) => !p.name || !p.email || !p.phone)) {
      return res.status(400).json({ message: 'Name, email and phone are required for every passenger' });
    }

    const fare = bus.fare * requestedSeats.length;
    const priorityFeePerSeat = 100;
    const priorityFee = priorityFeePerSeat * requestedSeats.length;
    const totalAmount = fare + priorityFee;

    const booking = await Booking.create({
      user: req.user._id,
      bus: bus._id,
      busName: bus.busName,
      from: bus.from,
      to: bus.to,
      travelDate,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      seats: requestedSeats,
      passengerCount: requestedSeats.length,
      passengerDetails: normalizedPassengers,
      fare,
      totalAmount,
      farePerSeat: bus.fare,
      bookingType: 'emergency',
      emergencyReason,
      priorityLevel: priorityLevel || 'high',
      priorityFee,
      paymentMode: paymentMode || 'UPI',
      paymentStatus: 'pending',
    });

    bus.bookedSeats.push(...requestedSeats);
    bus.availableSeats -= requestedSeats.length;
    await bus.save();

    res.status(201).json({
      success: true,
      message: 'Emergency priority reservation created successfully',
      bookingId: booking._id,
      booking,
    });
  } catch (error) {
    console.error('Emergency booking error:', error);
    res.status(500).json({ message: 'Failed to create emergency booking', error: error.message });
  }
};

module.exports = { getEmergencyBuses, createEmergencyBooking };

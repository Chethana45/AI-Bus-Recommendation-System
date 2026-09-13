const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

const getBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('bus')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('bus');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { busId, travelDate, selectedSeats, totalAmount, passengerDetails, paymentMode } = req.body;

    // Enhanced validation
    if (!busId || !travelDate || !selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({
        message: 'Bus, travel date and seats are required',
        missing: {
          busId: !busId,
          travelDate: !travelDate,
          selectedSeats: !selectedSeats || selectedSeats.length === 0,
        },
      });
    }

    if (!passengerDetails || !Array.isArray(passengerDetails) || passengerDetails.length === 0) {
      return res.status(400).json({ message: 'Passenger details are required' });
    }

    if (passengerDetails.length !== selectedSeats.length) {
      return res.status(400).json({
        message: `Passenger count (${passengerDetails.length}) must match selected seats (${selectedSeats.length})`,
      });
    }

    // Check user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found', busId });
    }

    // Convert seats to numbers with validation
    const requestedSeats = selectedSeats.map((seat) => {
      const seatNum = Number(seat);
      if (isNaN(seatNum)) {
        throw new Error(`Invalid seat number: ${seat}`);
      }
      return seatNum;
    });

    const bookedSeats = Array.isArray(bus.bookedSeats) ? bus.bookedSeats : [];
    const actualAvailableSeats = typeof bus.totalSeats === 'number'
      ? bus.totalSeats - bookedSeats.length
      : bus.availableSeats;

    if (bus.availableSeats !== actualAvailableSeats) {
      console.warn('Inconsistent bus seat counts:', {
        busId: bus._id,
        totalSeats: bus.totalSeats,
        availableSeats: bus.availableSeats,
        bookedSeatsCount: bookedSeats.length,
        actualAvailableSeats,
      });
      bus.availableSeats = actualAvailableSeats;
    }

    const alreadyBooked = requestedSeats.some((seat) => bookedSeats.includes(seat));

    if (alreadyBooked) {
      const unavailableSeats = requestedSeats.filter((seat) => bookedSeats.includes(seat));
      return res.status(409).json({
        message: 'One or more selected seats are already booked',
        unavailableSeats,
      });
    }

    if (actualAvailableSeats < selectedSeats.length) {
      return res.status(409).json({
        message: 'Not enough seats available',
        available: actualAvailableSeats,
        requested: selectedSeats.length,
      });
    }

    // Validate totalAmount
    const farePerSeat = bus.fare;
    const calculatedTotal = farePerSeat * selectedSeats.length;

    if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
      console.warn(`Amount mismatch - Received: ${totalAmount}, Calculated: ${calculatedTotal}`);
    }

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
      passengerCount: selectedSeats.length,
      passengerDetails,
      fare: calculatedTotal,
      totalAmount,
      farePerSeat,
      paymentMode: paymentMode || 'UPI',
      paymentStatus: 'pending',
    });

    bus.bookedSeats.push(...requestedSeats);
    bus.availableSeats -= selectedSeats.length;
    await bus.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: booking._id,
      booking,
    });
  } catch (error) {
    console.error('Booking creation error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const bus = await Bus.findById(booking.bus);

    if (bus) {
      const cancelledSeats = booking.seats.map((seat) => Number(seat));
      bus.bookedSeats = bus.bookedSeats.filter((seat) => !cancelledSeats.includes(seat));
      bus.availableSeats += booking.seats.length;
      await bus.save();
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date().toISOString().split('T')[0];
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
};
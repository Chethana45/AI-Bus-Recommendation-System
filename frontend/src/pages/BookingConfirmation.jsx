import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  const hasBookingData = Boolean(booking && Object.keys(booking).length > 0);

  const bookingId = useMemo(() => {
    if (booking.bookingId) return booking.bookingId;
    const now = new Date();
    return `BK${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }, [booking.bookingId]);

  if (!hasBookingData) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-confirmation-card no-booking-card">
          <div className="confirmation-header">
            <div className="confirmation-icon">⚠️</div>
            <h1>No booking found</h1>
            <p className="confirmation-message">Please complete a seat selection and payment to view confirmation details.</p>
          </div>
          <div className="button-group justify-center">
            <button className="btn-action primary" onClick={() => navigate('/search-bus')}>
              Search Buses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    passengerName = 'Ananya Sharma',
    busName = 'RedExpress Premium',
    busType = 'AC Sleeper',
    from = 'New Delhi',
    to = 'Mumbai',
    journeyDate = '2026-06-15',
    departureTime = '20:30',
    arrivalTime = '08:45',
    selectedSeats = ['12', '13'],
    totalFare = 900,
    farePerSeat = 450,
    paymentMethod = 'UPI',
  } = booking;

  return (
    <div className="booking-confirmation-page">
      <div className="booking-confirmation-card ticket-card">
        <div className="confirmation-header ticket-header">
          <div>
            <div className="confirmation-icon">✅</div>
            <h1>Booking Confirmed</h1>
          </div>
          <span className="confirmation-tag">E-ticket delivered</span>
        </div>

        <div className="progress-bar">
          <div className="progress-step active" />
          <div className="progress-step active" />
          <div className="progress-step active" />
        </div>

        <div className="ticket-grid">
          <div className="ticket-info">
            <div className="ticket-section">
              <span className="ticket-label">Booking ID</span>
              <p className="ticket-value">{bookingId}</p>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Passenger</span>
              <p className="ticket-value">{passengerName}</p>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Route</span>
              <p className="ticket-value">{from} → {to}</p>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Journey</span>
              <p className="ticket-value">{journeyDate} · {departureTime} - {arrivalTime}</p>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Seats</span>
              <p className="ticket-value">{selectedSeats.join(', ')}</p>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Bus</span>
              <p className="ticket-value">{busName} · {busType}</p>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Payment</span>
              <p className="ticket-value">{paymentMethod}</p>
            </div>
          </div>

          <div className="ticket-qr">
            <div className="qr-code-placeholder">QR</div>
            <div className="fare-summary">
              <div className="fare-row">
                <span>Fare per seat</span>
                <strong>₹{farePerSeat}</strong>
              </div>
              <div className="fare-row total">
                <span>Total paid</span>
                <strong>₹{totalFare}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-note">
          <p>Show this ticket at boarding. The QR code is valid for one-time entry and ensures a smooth check-in.</p>
        </div>

        <div className="button-group">
          <button className="btn-action primary" onClick={() => navigate('/booking-history')}>
            View Booking History
          </button>
          <button className="btn-action secondary" onClick={() => navigate('/search-bus')}>
            Book Another Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

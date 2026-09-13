import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const getBookingId = (booking) => booking?.id || booking?._id || booking?.bookingId || '';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/bookings');
        if (!mounted) return;
        // expect res.data to be an array of bookings
        setBookingsData(res.data || []);
      } catch (err) {
        console.error('Failed to load bookings', err);
        if (!mounted) return;
        setError('Unable to load booking history. Please refresh or try again later.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBookings = bookingsData.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDownloadTicket = (bookingId) => {
    alert(`Downloading ticket for booking ${bookingId}`);
  };

  const handleCancelBooking = (bookingId) => {
    if (!bookingId) {
      alert('Unable to cancel booking. Missing booking identifier.');
      return;
    }

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmCancel) {
      return;
    }

    const updatedBookings = bookingsData.map((booking) => {
      if (getBookingId(booking) !== bookingId) return booking;
      return {
        ...booking,
        status: 'cancelled',
        cancellationDate: today,
      };
    });

    setBookingsData(updatedBookings);

    const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    let updatedLocalBookings = localBookings.map((booking) =>
      getBookingId(booking) === bookingId
        ? {
            ...booking,
            status: 'cancelled',
            cancellationDate: today,
          }
        : booking
    );

    const bookingFromHistory = updatedBookings.find(
      (booking) => getBookingId(booking) === bookingId
    );

    if (bookingFromHistory && !updatedLocalBookings.some((booking) => getBookingId(booking) === bookingId)) {
      updatedLocalBookings.push({
        ...bookingFromHistory,
        id: bookingFromHistory.id || bookingFromHistory._id || bookingFromHistory.bookingId,
        status: 'cancelled',
        cancellationDate: today,
      });
    }

    localStorage.setItem('bookings', JSON.stringify(updatedLocalBookings));
    window.dispatchEvent(new Event('bookingsUpdated'));
    alert('Booking cancelled successfully');
  };

  const handleRebooking = (booking) => {
    navigate('/search-bus', {
      state: {
        from: booking.from,
        to: booking.to,
        travelDate: booking.travelDate,
      },
    });
  };

  return (
    <div className="booking-history-container">
      <div className="booking-history-hero">
        <div>
          <p className="booking-history-eyebrow">Travels dashboard</p>
          <h1>Booking History</h1>
          <p>View and manage all your bus bookings from one place.</p>
        </div>
        <button className="history-action-btn" onClick={() => navigate('/search-bus')}>Plan another trip</button>
      </div>

      <div className="booking-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Bookings
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading booking history...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredBookings.length > 0 ? (
        <div className="bookings-container">
          {filteredBookings.map((booking) => {
            const bookingId = getBookingId(booking);
            return (
              <div key={bookingId || booking._id || booking.bookingId} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-info-left">
                    <div className="booking-id">Booking ID: {bookingId || 'N/A'}</div>
                  <div className="booking-date">Booked on {booking.bookingDate}</div>
                </div>
                <div className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </div>
              </div>

              <div className="booking-journey">
                <div className="journey-point">
                  <div className="point-label">From</div>
                  <div className="point-city">{booking.from}</div>
                </div>
                <div className="journey-arrow">→</div>
                <div className="journey-point">
                  <div className="point-label">To</div>
                  <div className="point-city">{booking.to}</div>
                </div>
              </div>

              <div className="booking-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Bus Name</span>
                  <span className="detail-value">{booking.busName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Travel Date</span>
                  <span className="detail-value">{booking.travelDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Departure</span>
                  <span className="detail-value">{booking.departureTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Arrival</span>
                  <span className="detail-value">{booking.arrivalTime}</span>
                </div>
              </div>

              <div className="booking-seat-info">
                <div className="seats-section">
                  <span className="section-label">Seat Numbers:</span>
                  <div className="seat-numbers">
                    {booking.seats.map((seat) => (
                      <span key={seat} className="seat-tag">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="passenger-section">
                  <span className="section-label">Passengers:</span>
                  <span className="passenger-count">{booking.passengerCount}</span>
                </div>
              </div>

              <div className="booking-fare-info">
                <div className="fare-breakdown">
                  <div className="fare-item">
                    <span className="fare-label">Fare per Seat</span>
                    <span className="fare-amount">₹{booking.farePerSeat}</span>
                  </div>
                  <div className="fare-item">
                    <span className="fare-label">Number of Seats</span>
                    <span className="fare-amount">× {booking.passengerCount}</span>
                  </div>
                  <div className="fare-divider"></div>
                  <div className="fare-item total">
                    <span className="fare-label">Total Fare</span>
                    <span className="fare-amount">₹{booking.fare}</span>
                  </div>
                </div>
                <div className="payment-info">
                  <span className="payment-mode">💳 {booking.paymentMode}</span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      className="action-btn download-btn"
                      onClick={() => handleDownloadTicket(bookingId)}
                    >
                      📥 Download Ticket
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => handleCancelBooking(bookingId)}
                    >
                      ❌ Cancel Booking
                    </button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <>
                    <button
                      className="action-btn download-btn"
                      onClick={() => handleDownloadTicket(bookingId)}
                    >
                      📥 Download Receipt
                    </button>
                    <button
                      className="action-btn rebook-btn"
                      onClick={() => handleRebooking(booking)}
                    >
                      🔄 Rebook
                    </button>
                  </>
                )}
                {booking.status === 'cancelled' && (
                  <button
                    className="action-btn rebook-btn"
                    onClick={() => handleRebooking(booking)}
                  >
                    🔄 Rebook
                  </button>
                )}
              </div>

              {booking.status === 'cancelled' && booking.cancellationDate && (
                <div className="cancellation-note">
                  <p>Cancelled on {booking.cancellationDate}</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      ) : (
        <div className="no-bookings">
          <div className="no-bookings-icon">📭</div>
          <h3>No Bookings Found</h3>
          <p>
            {filter === 'all'
              ? 'You do not have any bookings yet.'
              : `No ${filter} bookings were found.`}
          </p>
          <button className="search-buses-btn" onClick={() => navigate('/search-bus')}>
            🔍 Search Buses
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

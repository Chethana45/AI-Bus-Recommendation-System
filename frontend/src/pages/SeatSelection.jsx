import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SeatLayout from '../components/SeatLayout';
import { getBusById } from '../services/busService';

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { busId } = useParams();
  const [busInfo, setBusInfo] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (!busId) {
          throw new Error('Invalid bus identifier');
        }

        // Call backend with the string ObjectId directly
        let data = await getBusById(busId);

        // Normalize possible wrapped responses from the API
        if (data && data.data) data = data.data;
        if (Array.isArray(data)) data = data[0] || null;
        if (!mounted) return;
        if (!data) {
          setError('Unable to load the selected bus. Please return to search and choose another route.');
          setBusInfo(null);
        } else {
          setBusInfo(data);
          // normalize booked seats to numbers so `includes` checks work reliably
          setBookedSeats((data.bookedSeats || []).map((s) => (typeof s === 'number' ? s : Number(s))));
        }
      } catch (err) {
        console.error('Failed to load bus for seat selection', err);
        if (!mounted) return;
        setError('Unable to load the selected bus. Please return to search and choose another route.');
        setBusInfo(null);
      } finally {
        if (mounted) {
          setSelectedSeats([]);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [busId]);

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const totalFare = busInfo ? selectedSeats.length * busInfo.fare : 0;
  const availableSeatsCount = busInfo ? busInfo.totalSeats - bookedSeats.length : 0;

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0 || !busInfo) {
      return;
    }
navigate('/payment', {
  state: {
    bus: busInfo,
    busId: busInfo._id,
    selectedSeats: selectedSeats.slice().sort((a, b) => a - b),
    travelDate: location.state?.travelDate || busInfo.travelDate || '',
    totalFare,
    farePerSeat: busInfo.fare,
  },
});
    
  };

  const handleContinueShopping = () => {
    navigate('/search-bus');
  };

  if (loading) {
    return (
      <div className="search-results-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading seat layout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-container">
        <div className="error-message">
          {error}
          <div style={{ marginTop: '1rem' }}>
            <button className="search-buses-btn" onClick={handleContinueShopping}>
              🔍 Search Buses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (busInfo && availableSeatsCount <= 0) {
    return (
      <div className="search-results-container">
        <div className="no-results">
          <p>There are no seats available on this bus right now.</p>
          <button className="search-buses-btn" onClick={handleContinueShopping}>
            🔍 Search Other Buses
          </button>
        </div>
      </div>
    );
  }

  const generateSeats = () => {
    const seats = [];
    let seatNumber = 1;
    for (let row = 0; row < 8; row++) {
      const rowSeats = [];
      for (let col = 0; col < 5; col++) {
        rowSeats.push(seatNumber);
        seatNumber++;
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const allSeats = generateSeats();

  return (
    <div className="seat-selection-page">
      <div className="seat-selection-container">
        {/* Header */}
        <div className="seat-selection-header">
          <h1>Select Your Seats</h1>
          <div className="bus-route-info">
            <span className="route-from">{busInfo.from}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">{busInfo.to}</span>
          </div>
          <p className="bus-info-text">
            {busInfo.busName} • {busInfo.busType} • {busInfo.departureTime} - {busInfo.arrivalTime}
          </p>
        </div>

        {/* Seat Statistics */}
        <div className="seat-statistics">
          <div className="stat available">
            <span className="stat-dot"></span>
            <span>Available: {availableSeatsCount}</span>
          </div>
          <div className="stat selected">
            <span className="stat-dot"></span>
            <span>Selected: {selectedSeats.length}</span>
          </div>
          <div className="stat booked">
            <span className="stat-dot"></span>
            <span>Booked: {bookedSeats.length}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="seat-selection-content">
          <div className="seat-layout-wrapper">
            <div className="seat-layout-header">
              <h2>Bus Layout</h2>
              <p>Click on seats to select/deselect</p>
            </div>

            <SeatLayout
              seats={allSeats}
              selectedSeats={selectedSeats}
              bookedSeats={bookedSeats}
              onSeatSelect={handleSeatSelect}
              farePerSeat={busInfo.fare}
            />
          </div>

          {/* Booking Summary Sidebar */}
          <div className="seat-actions">
            <div className="seat-action-card">
              <h3>Booking Summary</h3>

              {/* Journey Details */}
              <div className="summary-section journey-details">
                <div className="journey-item">
                  <span className="journey-label">From</span>
                  <span className="journey-value">{busInfo.from}</span>
                </div>
                <div className="journey-item">
                  <span className="journey-label">To</span>
                  <span className="journey-value">{busInfo.to}</span>
                </div>
                <div className="journey-item">
                  <span className="journey-label">Departure</span>
                  <span className="journey-value">{busInfo.departureTime}</span>
                </div>
                <div className="journey-item">
                  <span className="journey-label">Arrival</span>
                  <span className="journey-value">{busInfo.arrivalTime}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Seats Summary */}
              <div className="summary-section">
                <div className="summary-item">
                  <span className="label">Selected Seats:</span>
                  <span className="value seat-list">
                    {selectedSeats.length > 0
                      ? selectedSeats.sort((a, b) => a - b).join(', ')
                      : 'No seats selected'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Number of Seats:</span>
                  <span className="value">{selectedSeats.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Passengers:</span>
                  <span className="value">{selectedSeats.length}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Fare Breakdown */}
              <div className="summary-section fare-section">
                <div className="fare-breakdown">
                  <div className="fare-item">
                    <span className="fare-label">Fare per Seat</span>
                    <span className="fare-value">₹{busInfo.fare}</span>
                  </div>
                  <div className="fare-item">
                    <span className="fare-label">×</span>
                    <span className="fare-value">{selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="fare-divider-line"></div>
                  <div className="fare-item total">
                    <span className="fare-label">Total Fare</span>
                    <span className="total-value">₹{totalFare}</span>
                  </div>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="proceed-btn"
                  onClick={handleProceedToBooking}
                  disabled={selectedSeats.length === 0}
                >
                  {selectedSeats.length === 0 ? 'Select Seats to Continue' : 'Continue to Payment'}
                </button>

                <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                  Change Bus
                </button>
              </div>

              {selectedSeats.length > 0 && (
                <div className="booking-info">
                  <p>
                    <strong>{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected.</strong> Total payable
                    amount is ₹{totalFare}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SeatSelection;

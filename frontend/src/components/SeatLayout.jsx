

const SeatLayout = ({ seats, selectedSeats, bookedSeats, onSeatSelect, farePerSeat }) => {
  const handleSeatClick = (seatNumber) => {
    if (!bookedSeats.includes(seatNumber)) {
      onSeatSelect(seatNumber);
    }
  };

  const getSeatStatus = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) {
      return 'booked';
    }
    if (selectedSeats.includes(seatNumber)) {
      return 'selected';
    }
    return 'available';
  };

  return (
    <div className="seat-layout-container">
      <div className="seat-layout">
        <div className="seat-layout-header">
          <h3>Select Your Seats</h3>
          <p>Tap on a seat to select or deselect it.</p>
        </div>

        <div className="bus-frame">
          <div className="driver-area">Driver</div>
          <div className="seats-grid">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="seat-row">
                {row.slice(0, 2).map((seatNumber) => {
                  const status = getSeatStatus(seatNumber);
                  return (
                    <button
                      key={seatNumber}
                      className={`seat seat-${status}`}
                      onClick={() => handleSeatClick(seatNumber)}
                      disabled={status === 'booked'}
                      title={`Seat ${seatNumber}`}
                    >
                      {seatNumber}
                    </button>
                  );
                })}

                <div className="aisle"></div>

                {row.slice(2).map((seatNumber) => {
                  const status = getSeatStatus(seatNumber);
                  return (
                    <button
                      key={seatNumber}
                      className={`seat seat-${status}`}
                      onClick={() => handleSeatClick(seatNumber)}
                      disabled={status === 'booked'}
                      title={`Seat ${seatNumber}`}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-seat available-sample"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-seat selected-sample"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-seat booked-sample"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      <div className="seat-summary">
        <h4>Selected Seats</h4>
        {selectedSeats.length > 0 ? (
          <>
            <div className="selected-seats-list">
              {selectedSeats.sort((a, b) => a - b).map((seat) => (
                <span key={seat} className="seat-badge">
                  {seat}
                </span>
              ))}
            </div>
            <div className="seat-summary-details">
              <p>
                <strong>Number of Seats:</strong> {selectedSeats.length}
              </p>
              <p>
                <strong>Fare per Seat:</strong> ₹{farePerSeat}
              </p>
              <div className="total-fare">
                <strong>Total Fare:</strong>
                <span className="fare-amount">₹{selectedSeats.length * farePerSeat}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="no-seats-message">No seats selected</p>
        )}
      </div>
    </div>
  );
};

export default SeatLayout;

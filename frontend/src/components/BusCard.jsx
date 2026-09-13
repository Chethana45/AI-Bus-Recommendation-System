import { motion } from 'framer-motion';
import { ArrowRight, MapPinned, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AMENITY_ICONS = {
  WiFi: '📶',
  'Charging Point': '🔌',
  Blanket: '🛏️',
  'Water Bottle': '💧',
  AC: '❄️',
  'Non-AC': '🌡️',
};

const BusCard = ({ bus, onViewSeats, travelDate }) => {
  const navigate = useNavigate();
  const amenities = bus.amenities || bus.features || [];
  const origin = bus.from || bus.origin || bus.source || 'Start';
  const destination = bus.to || bus.destination || bus.target || 'End';

  const handleViewSeats = () => {
    if (onViewSeats) {
      onViewSeats();
    } else {
      navigate(`/bus-details/${bus._id}`, {
        state: {
          travelDate: travelDate || '',
        },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bus-card"
    >
      <div className="bus-card-top">
        <div>
          <h3 className="bus-name">{bus.busName}</h3>
          <p className="bus-subtitle"><MapPinned size={14} /> {origin} → {destination}</p>
        </div>
        <div className="bus-rating-pill">
          <span><Star size={14} /></span>
          <strong>{bus.rating || '4.5'}</strong>
        </div>
      </div>

      <div className="bus-card-meta">
        <span className="bus-badge">{bus.busType || 'AC'}</span>
        <span className="bus-seats"><Users size={14} /> {bus.availableSeats || 32} seats left</span>
      </div>

      <div className="bus-route-timeline">
        <div className="route-point">
          <span className="route-time">{bus.departureTime || '06:30'}</span>
          <span className="route-label">Departure</span>
        </div>

        <div className="route-line-wrapper">
          <div className="route-line"></div>
          <div className="route-duration">{bus.duration || '10h 45m'}</div>
        </div>

        <div className="route-point route-end">
          <span className="route-time">{bus.arrivalTime || '17:15'}</span>
          <span className="route-label">Arrival</span>
        </div>
      </div>

      {/* Route stops / intermediate cities */}
      {bus.routeCities && bus.routeCities.length > 2 && (
        <div className="bus-route-stops">
          <span className="route-stops-label">🛑 Via:</span>
          <div className="route-stops-list">
            {bus.routeCities.slice(1, -1).map((city, i) => (
              <span key={i} className="route-stop-chip">{city}</span>
            ))}
          </div>
        </div>
      )}

      {!bus.routeCities && bus.stops && bus.stops.length > 0 && (
        <div className="bus-route-stops">
          <span className="route-stops-label">🛑 Stops:</span>
          <div className="route-stops-list">
            {bus.stops.slice(0, 5).map((stop, i) => (
              <span key={i} className="route-stop-chip">{stop.name}</span>
            ))}
            {bus.stops.length > 5 && <span className="route-stop-chip">+{bus.stops.length - 5} more</span>}
          </div>
        </div>
      )}

      <div className="bus-details-row">
        <div className="fare-block">
          <span className="fare-label">Starting fare</span>
          <strong className="fare-amount">₹{bus.fare || 999}</strong>
        </div>
        <div className="amenity-list">
          {amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="amenity-pill">
              <span>{AMENITY_ICONS[amenity] || '✔️'}</span>
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="bus-card-footer">
        <div className="bus-operator">
          <span>{bus.operator || 'Elite Travels'}</span>
          <small>{bus.boardingPoint?.name || 'Main Stand'}</small>
        </div>
        <button className="view-seats-btn" onClick={handleViewSeats}>
          View Seats
          <ArrowRight size={15} />
        </button>
      </div>
    </motion.div>
  );
};

export default BusCard;

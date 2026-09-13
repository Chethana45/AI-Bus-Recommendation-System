import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BusFront, Clock3, MapPin, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { getBusById } from '../services/busService';

const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23edf2f7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='32' fill='%23666'%3EBus%20image%20unavailable%3C/text%3E%3C/svg%3E";

const AMENITY_ICONS = {
  wifi: '📶',
  ac: '❄️',
  'charging port': '🔌',
  charging: '🔌',
  'charging points': '🔌',
  'usb charging': '🔌',
  'water bottle': '💧',
  water: '💧',
  'gps tracking': '📡',
  blanket: '🧣',
  blankets: '🧣',
  'reading light': '💡',
  'reclining seats': '🛋️',
  snacks: '🍪',
  breakfast: '🥐',
  dinner: '🍽️',
  pillow: '🛏️',
  'basic seating': '🪑',
};

const getAmenityIcon = (amenity) => AMENITY_ICONS[amenity?.toLowerCase()] || '✨';
const formatAmenityLabel = (amenity) => amenity?.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Amenity';

const BusDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { busId } = useParams();
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getBusById(busId);
        if (!mounted) return;
        if (!data) {
          setError('Bus details not found. Please return to search and select another bus.');
          setBusDetails(null);
          setImageFailed(false);
        } else {
          setBusDetails(data);
          setImageFailed(false);
        }
      } catch (err) {
        console.error('Failed loading bus details', err);
        if (!mounted) return;
        setError('Bus details not found. Please return to search and select another bus.');
        setBusDetails(null);
        setImageFailed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [busId]);

  const handleSelectSeats = () => {
    if (busDetails) {
      navigate(`/seat-selection/${busDetails._id}`, {
        state: {
          travelDate: location.state?.travelDate || busDetails.travelDate || '',
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="bus-details-page">
        <div className="bus-details-loading">
          <div className="bus-details-spinner" />
          <p>Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bus-details-page">
        <div className="bus-details-error">
          <p>{error}</p>
          <button onClick={() => navigate('/search-bus')}>Search Buses</button>
        </div>
      </div>
    );
  }

  const badges = [busDetails?.busType, busDetails?.ac ? 'AC' : null, busDetails?.sleeper ? 'Sleeper' : null, busDetails?.seater ? 'Seater' : null].filter(Boolean);

  return (
    <div className="bus-details-page">
      <div className="bus-details-container">
        <motion.section className="bus-summary-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="bus-summary-main">
            <div className="bus-summary-header">
              <div className="bus-summary-brand">
                <div className="bus-summary-thumb">
                  {imageFailed ? (
                    <BusFront size={24} />
                  ) : (
                    <img
                      src={busDetails?.image || placeholderImage}
                      alt={busDetails?.busName || 'Bus'}
                      onError={() => setImageFailed(true)}
                    />
                  )}
                </div>
                <div>
                  <p className="bus-summary-operator">{busDetails?.operator}</p>
                  <h1>{busDetails?.busName}</h1>
                  <p className="bus-summary-description">{busDetails?.description || 'Premium ride with comfort-first amenities and reliable service.'}</p>
                  <div className="bus-summary-badges">
                    <span className="bus-pill-rating">
                      <Star size={14} /> {busDetails?.rating}
                    </span>
                    {badges.map((badge) => (
                      <span key={badge} className="bus-pill-tag">{badge}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bus-summary-status">
                <span className="status-pill">{busDetails?.availableSeats} seats left</span>
              </div>
            </div>

            <div className="bus-route-row">
              <div className="route-column">
                <p className="route-label">Departure</p>
                <h3>{busDetails?.from || busDetails?.boardingPoint?.name || 'Departure'}</h3>
                <p>{busDetails?.departureTime}</p>
              </div>
              <div className="route-line">
                <span className="route-dot" />
                <span className="route-track" />
                <span className="route-dot" />
                <span className="route-duration">{busDetails?.duration}</span>
              </div>
              <div className="route-column route-column-right">
                <p className="route-label">Arrival</p>
                <h3>{busDetails?.to || busDetails?.droppingPoint?.name || 'Arrival'}</h3>
                <p>{busDetails?.arrivalTime}</p>
              </div>
            </div>

            <div className="bus-summary-footer">
              <div className="summary-info-card">
                <p className="summary-info-label">Boarding</p>
                <p className="summary-info-value">{busDetails?.boardingPoint?.name}</p>
              </div>
              <div className="summary-info-card">
                <p className="summary-info-label">Drop-off</p>
                <p className="summary-info-value">{busDetails?.droppingPoint?.name}</p>
              </div>
              <div className="summary-info-card">
                <p className="summary-info-label">Duration</p>
                <p className="summary-info-value">{busDetails?.duration}</p>
              </div>
            </div>
          </div>

          <aside className="bus-summary-price-card">
            <p className="price-label">Starting from</p>
            <div className="price-amount">₹{busDetails?.fare}</div>
            <div className="price-meta">
              <span>{busDetails?.availableSeats}/{busDetails?.totalSeats} seats available</span>
            </div>
            <button onClick={handleSelectSeats}>Select Seats</button>
            <p className="price-note">
              <ShieldCheck size={14} /> Secure payment • Instant confirmation
            </p>
          </aside>
        </motion.section>

        <div className="bus-details-grid">
          <div className="bus-details-main">
            <section className="detail-card">
              <div className="detail-card-header">
                <div>
                  <h2>Journey details</h2>
                  <p>Pickup, drop-off, and route timing at a glance.</p>
                </div>
              </div>
              <div className="journey-card">
                <div className="journey-point-card">
                  <div className="journey-point-top">
                    <p className="journey-time">{busDetails?.departureTime}</p>
                    <span className="journey-chip">Departure</span>
                  </div>
                  <h3>{busDetails?.boardingPoint?.name}</h3>
                  <p>{busDetails?.boardingPoint?.address}</p>
                </div>
                <div className="journey-point-card">
                  <div className="journey-point-top">
                    <p className="journey-time">{busDetails?.arrivalTime}</p>
                    <span className="journey-chip">Arrival</span>
                  </div>
                  <h3>{busDetails?.droppingPoint?.name}</h3>
                  <p>{busDetails?.droppingPoint?.address}</p>
                </div>
              </div>
            </section>

            <section className="detail-card">
              <div className="detail-card-header">
                <div>
                  <h2>Amenities</h2>
                  <p>Comfort features included on this trip.</p>
                </div>
              </div>
              <div className="amenity-grid">
                {busDetails?.amenities?.map((amenity) => (
                  <div key={amenity} className="amenity-chip">
                    <span className="amenity-icon">{getAmenityIcon(amenity)}</span>
                    <span>{formatAmenityLabel(amenity)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-card">
              <div className="detail-card-header">
                <div>
                  <h2>Cancellation policy</h2>
                  <p>Flexible support if plans change.</p>
                </div>
              </div>
              <button className="policy-toggle" onClick={() => setPolicyOpen((value) => !value)}>
                <span>View policy details</span>
                <span>{policyOpen ? 'Hide' : 'Show'}</span>
              </button>
              {policyOpen ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="policy-card">
                  <div className="policy-pill">Flexible</div>
                  <p>{busDetails?.cancellationPolicy || 'Policy details are available at checkout and are based on the selected fare.'}</p>
                </motion.div>
              ) : null}
            </section>
          </div>

          <aside className="bus-details-sidebar">
            <div className="fare-card">
              <div className="fare-card-header">
                <h2>Fare summary</h2>
                <span className="fare-pill">Best value</span>
              </div>
              <div className="fare-row">
                <span>Base fare</span>
                <span>₹{busDetails?.fare}</span>
              </div>
              <div className="fare-row">
                <span>Booking fee</span>
                <span>₹0</span>
              </div>
              <div className="fare-row total">
                <span>Total</span>
                <span>₹{busDetails?.fare}</span>
              </div>
              <div className="fare-row seats">
                <span>Seats available</span>
                <span>{busDetails?.availableSeats}/{busDetails?.totalSeats}</span>
              </div>
              <button className="select-seats-btn" onClick={handleSelectSeats}>Select Seats</button>
              <div className="fare-note">
                <Sparkles size={14} />
                <span>Secure payment • Instant confirmation • 24/7 support</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;

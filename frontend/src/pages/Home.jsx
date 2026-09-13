import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { buses } from '../data/buses';

const indianCities = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Ahmedabad',
  'Goa',
  'Lucknow',
  'Kochi',
  'Chandigarh',
  'Nagpur',
  'Guwahati',
];

const cityOptions = indianCities.map((city) => ({ label: city, value: city }));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '48px',
    borderRadius: '14px',
    background: 'var(--bg-secondary)',
    borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--border-color)',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none',
    '&:hover': {
      borderColor: 'rgba(99, 102, 241, 0.4)',
    },
  }),
  menu: (base) => ({
    ...base,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'rgba(99, 102, 241, 0.22)'
      : state.isFocused
      ? 'rgba(99, 102, 241, 0.10)'
      : 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgba(255, 255, 255, 0.75)',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    background: 'var(--border-color)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--text-secondary)',
  }),
};

const popularRoutes = [
  { from: 'Delhi', to: 'Mumbai', demand: 'High demand' },
  { from: 'Bangalore', to: 'Hyderabad', demand: 'Popular route' },
  { from: 'Kolkata', to: 'Pune', demand: 'Best value' },
];

const whyItems = [
  { icon: <Clock3 size={20} />, title: 'Fast Booking', description: 'Reserve your seat in seconds with a smooth search experience.' },
  { icon: <ShieldCheck size={20} />, title: 'Secure Payments', description: 'Trusted checkout with encrypted payments and instant confirmation.' },
  { icon: <Users size={20} />, title: '24/7 Support', description: 'Get help whenever you need it before, during, or after the journey.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ from: '', to: '', travelDate: '' });
  const [searchError, setSearchError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const featuredBuses = buses.slice(0, 3);
  const getCityOption = (value) => cityOptions.find((option) => option.value === value) || null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCityChange = (field, selectedOption) => {
    setFormData({ ...formData, [field]: selectedOption ? selectedOption.value : '' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!formData.travelDate) {
      setSearchError('Please select a valid future travel date.');
      return;
    }

    if (formData.travelDate < today) {
      setSearchError('Please select a valid future travel date.');
      return;
    }

    if (formData.from && formData.to && formData.travelDate) {
      setSearchError('');
      navigate('/search-bus', { state: { from: formData.from, to: formData.to, travelDate: formData.travelDate } });
    } else {
      setSearchError('Please fill in all fields.');
    }
  };

  return (
    <div className="home">
      <section className="hero hero-modern">
        <div className="hero-overlay" />
        <div className="hero-grid">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="hero-copy">
            <span className="eyebrow">Premium travel made simple</span>
            <h1>Book your next comfortable ride in minutes.</h1>
            <p>Discover trusted buses, flexible fares, and a smoother way to travel across India.</p>
            <div className="hero-actions">
              <button className="hero-cta" onClick={() => navigate('/search-bus')}>
                Search buses <ArrowRight size={16} />
              </button>
              <span className="hero-pill">Flexible cancellation • Secure checkout</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.08 }} className="hero-card glass-card">
            <div className="hero-card-header">
              <div>
                <span className="badge badge-primary">Fast search</span>
                <h2>Plan your next trip</h2>
              </div>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-group">
                <label htmlFor="from">From</label>
                <Select
                  inputId="from"
                  value={getCityOption(formData.from)}
                  onChange={(option) => handleCityChange('from', option)}
                  options={cityOptions}
                  placeholder="Select departure city"
                  className="route-select"
                  classNamePrefix="route-select"
                  isSearchable
                  isClearable
                  styles={selectStyles}
                  menuPlacement="auto"
                  isOptionDisabled={(option) => option.value === formData.to}
                />
              </div>
              <div className="form-group">
                <label htmlFor="to">To</label>
                <Select
                  inputId="to"
                  value={getCityOption(formData.to)}
                  onChange={(option) => handleCityChange('to', option)}
                  options={cityOptions}
                  placeholder="Select destination city"
                  className="route-select"
                  classNamePrefix="route-select"
                  isSearchable
                  isClearable
                  styles={selectStyles}
                  menuPlacement="auto"
                  isOptionDisabled={(option) => option.value === formData.from}
                />
              </div>
              <div className="form-group">
                <label htmlFor="travelDate">Travel Date</label>
                <input
                  type="date"
                  id="travelDate"
                  name="travelDate"
                  className="input-field"
                  value={formData.travelDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
              </div>
              {searchError && <div className="form-error">{searchError}</div>}
              <button type="submit" className="search-button">
                <Sparkles size={16} />
                Search buses
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="routes-section">
        <div className="section">
          <div className="section-heading">
            <div>
              <h2 className="section-title-gradient">Popular routes</h2>
              <p className="section-subtitle-muted">Top journeys travellers book today.</p>
            </div>
          </div>
          <div className="routes-grid">
            {popularRoutes.map((route) => (
              <motion.div
                key={`${route.from}-${route.to}`}
                whileHover={{ y: -6 }}
                className="route-card"
                onClick={() => navigate('/search-bus', { state: { from: route.from, to: route.to } })}
              >
                <div className="route-header">
                  <div>
                    <div className="route-cities">{route.from} → {route.to}</div>
                    <div className="route-city">Comfortable buses with flexible cancellation</div>
                  </div>
                  <div className="route-arrow"><ArrowRight size={18} /></div>
                </div>
                <div className="route-demand" data-demand={route.demand}>{route.demand}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-buses-section">
        <div className="section">
          <div className="section-heading">
            <div>
              <h2 className="section-title-gradient">Featured buses</h2>
              <p className="section-subtitle-muted">Handpicked options with excellent ratings and smooth comfort.</p>
            </div>
          </div>
          <div className="featured-buses-grid">
            {featuredBuses.map((bus) => (
              <motion.article whileHover={{ y: -6 }} key={bus.id} className="featured-bus-card">
                <div className="featured-bus-top">
                  <div>
                    <h3>{bus.busName}</h3>
                    <p>{bus.operator}</p>
                  </div>
                  <span className="featured-bus-rating">★ {bus.rating}</span>
                </div>
                <div className="featured-bus-meta">
                  <span>{bus.fromCity} → {bus.toCity}</span>
                  <span>{bus.duration}</span>
                </div>
                <div className="featured-bus-footer">
                  <div>
                    <p className="featured-bus-seats">{bus.availableSeats} seats left</p>
                    <p className="featured-bus-price">₹{bus.fare}</p>
                  </div>
                  <button className="featured-bus-button" onClick={() => navigate(`/bus-details/${bus.id}`)}>
                    Book
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="emergency-home-section">
        <div className="emergency-home-card">
          <div>
            <span className="eyebrow emergency-home-eyebrow">Last-minute travel support</span>
            <h2>🚨 Need a bus urgently?</h2>
            <p>Festival plans, medical emergencies or urgent work? Reserve an available bus within the next 3 days through our priority booking flow.</p>
          </div>
          <button type="button" onClick={() => navigate('/emergency-reservation')}>Make Emergency Reservation <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="why-section">
        <div className="section">
          <div className="section-heading">
            <div>
              <h2 className="section-title-gradient">Why choose BusBook</h2>
              <p className="section-subtitle-muted">Premium bus travel, optimized for convenience and comfort.</p>
            </div>
          </div>
          <div className="why-grid">
            {whyItems.map((item) => (
              <div key={item.title} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-banner">
          <div>
            <p className="eyebrow">Ready to travel?</p>
            <h2>Ready for your next journey?</h2>
            <p>Book your next ride with confidence and enjoy seamless travel from start to finish.</p>
          </div>
          <button className="cta-button" onClick={() => navigate('/search-bus')}>
            Search Buses
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;

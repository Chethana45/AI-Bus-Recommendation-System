import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

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

const SearchForm = ({ onSearch, minimal = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    travelDate: '',
    passengers: '1',
  });
  const [formError, setFormError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const isPastDate = (date) => date && date < today;

  const getCityOption = (value) => cityOptions.find((option) => option.value === value) || null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormError('');
  };

  const handleCityChange = (field, selectedOption) => {
    setFormData({
      ...formData,
      [field]: selectedOption ? selectedOption.value : '',
    });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to) {
      alert('Please select departure and destination cities');
      return;
    }

    if (!formData.travelDate) {
      setFormError('Please select a valid future travel date.');
      return;
    }

    if (isPastDate(formData.travelDate)) {
      setFormError('Please select a valid future travel date.');
      return;
    }

    setFormError('');
    if (onSearch) {
      onSearch(formData);
    } else {
      navigate('/search-bus', {
        state: {
          from: formData.from,
          to: formData.to,
          travelDate: formData.travelDate,
          passengers: formData.passengers,
        },
      });
    }
  };

  // Popular routes for quick selection
  const popularRoutes = [
    { from: 'Delhi', to: 'Mumbai' },
    { from: 'Bangalore', to: 'Hyderabad' },
    { from: 'Chennai', to: 'Bangalore' },
    { from: 'Kolkata', to: 'Mumbai' },
  ];

  const handleQuickRoute = (route) => {
    setFormData({
      ...formData,
      from: route.from,
      to: route.to,
    });
  };

  if (minimal) {
    return (
      <form className="search-form search-form-minimal" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <Select
              value={getCityOption(formData.from)}
              onChange={(selectedOption) => handleCityChange('from', selectedOption)}
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
            <Select
              value={getCityOption(formData.to)}
              onChange={(selectedOption) => handleCityChange('to', selectedOption)}
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
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleInputChange}
              className="form-input"
              min={today}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-search">
            🔍 Search
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h3>Book Your Bus Ticket</h3>
      
      <div className="quick-routes">
        <p className="quick-label">Popular routes:</p>
        <div className="route-buttons">
          {popularRoutes.map((route, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-route-btn"
              onClick={() => handleQuickRoute(route)}
            >
              {route.from} → {route.to}
            </button>
          ))}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">From</label>
          <Select
            value={getCityOption(formData.from)}
            onChange={(selectedOption) => handleCityChange('from', selectedOption)}
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
          <label className="form-label">To</label>
          <Select
            value={getCityOption(formData.to)}
            onChange={(selectedOption) => handleCityChange('to', selectedOption)}
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
          <label className="form-label">Travel Date</label>
          <input
            type="date"
            name="travelDate"
            value={formData.travelDate}
            onChange={handleInputChange}
            className="form-input"
            min={today}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Passengers</label>
          <select
            name="passengers"
            value={formData.passengers}
            onChange={handleInputChange}
            className="form-select"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Passenger' : 'Passengers'}
              </option>
            ))}
          </select>
        </div>
      </div>
      {formError && <div className="form-error">{formError}</div>}
      <button type="submit" className="btn btn-primary btn-lg">
        🔍 Search Buses
      </button>
    </form>
  );
};

export default SearchForm;

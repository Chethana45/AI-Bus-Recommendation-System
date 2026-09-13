import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import BusCard from '../components/BusCard';
import { searchBuses, getAvailableBuses } from '../services/busService';

const busTypeOptions = ['Seater', 'Sleeper', 'AC', 'Non-AC'];
const amenityOptions = ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle'];
const departureOptions = ['Before 06:00', '06:00 - 12:00', '12:00 - 18:00', 'After 18:00'];

const parseHour = (time) => {
  const match = String(time).match(/(\d{1,2}):?(\d{2})?/);
  if (!match) return null;
  const hour = Number(match[1]);
  return hour;
};

const SearchBus = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useState({ from: '', to: '', travelDate: '' });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (location.state && (location.state.from || location.state.to)) {
          if (location.state.travelDate && location.state.travelDate < today) {
            setSearchError('Please select a valid future travel date.');
            setSearchParams(location.state);
            setBuses([]);
            return;
          }

          setSearchParams(location.state);
          const results = await searchBuses({
            from: location.state.from,
            to: location.state.to,
            travelDate: location.state.travelDate,
          });
          if (!active) return;
          setBuses(results || []);
        } else {
          setSearchParams({ from: '', to: '', travelDate: '' });
          const results = await getAvailableBuses();
          if (!active) return;
          setBuses(results || []);
        }
      } catch (err) {
        console.error('Error fetching buses', err);
        if (err?.response?.data?.message) {
          setSearchError(err.response.data.message);
        } else {
          setError('Unable to load bus results. Please refresh the page or try again later.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [location, today]);

  const hasSearchInput = searchParams.from || searchParams.to || searchParams.travelDate;

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setSelectedDeparture('');
  };

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const busTypes = selectedTypes.length > 0 ? selectedTypes : busTypeOptions;
      const availability = selectedTypes.length ? busTypes.includes(bus.busType) : true;
      if (!availability) return false;

      const amenities = bus.amenities || bus.features || [];
      if (selectedAmenities.length > 0) {
        const amenityMatch = selectedAmenities.every((amenity) =>
          amenities.some((item) => item.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!amenityMatch) return false;
      }

      if (selectedDeparture) {
        const hour = parseHour(bus.departureTime);
        if (hour === null) return false;
        if (selectedDeparture === 'Before 06:00' && hour >= 6) return false;
        if (selectedDeparture === '06:00 - 12:00' && (hour < 6 || hour > 12)) return false;
        if (selectedDeparture === '12:00 - 18:00' && (hour < 12 || hour > 18)) return false;
        if (selectedDeparture === 'After 18:00' && hour <= 18) return false;
      }

      return true;
    });
  }, [buses, selectedTypes, selectedAmenities, selectedDeparture]);

  return (
    <div className="search-results-page">
      <div className="search-results-hero">
        <div className="search-results-hero__content">
          <div className="search-results-hero__eyebrow">Premium route planner</div>
          <div className="search-results-header">
            <div className="search-results-header__copy">
              <h1>Search Bus Results</h1>
              <p className="search-subtitle">
                {hasSearchInput
                  ? `${searchParams.from} → ${searchParams.to} • ${searchParams.travelDate || 'Flexible dates'}`
                  : 'Latest routes and top operators for your journey'}
              </p>
            </div>
            <div className="search-summary-pill">
              <span>{filteredBuses.length} buses found</span>
              {selectedTypes.length + selectedAmenities.length + (selectedDeparture ? 1 : 0) > 0 && (
                <button type="button" className="clear-filters" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="search-results-hero__meta">
          <div className="search-results-hero__stat">
            <strong>{filteredBuses.length}</strong>
            <span>matching trips</span>
          </div>
          <div className="search-results-hero__stat">
            <strong>{buses.length}</strong>
            <span>available today</span>
          </div>
        </div>
      </div>

      <div className="search-page-inner">
        <aside className="search-sidebar">
          <div className="filter-card">
            <div className="filter-card-header">
              <h2>Filters</h2>
              <span>Refine your results</span>
            </div>

            <div className="filter-group">
              <h3>Bus Type</h3>
              {busTypeOptions.map((type) => (
                <label key={type} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Amenities</h3>
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Departure time</h3>
              {departureOptions.map((slot) => (
                <label key={slot} className="filter-checkbox">
                  <input
                    type="radio"
                    name="departure"
                    checked={selectedDeparture === slot}
                    onChange={() => setSelectedDeparture(slot)}
                  />
                  <span>{slot}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="search-results-panel">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading buses...</p>
            </div>
          ) : searchError ? (
            <div className="error-message">{searchError}</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredBuses.length > 0 ? (
            <div className="bus-results-grid">
              {filteredBuses.map((bus) => (
                <BusCard key={bus._id} bus={bus} travelDate={searchParams.travelDate} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>
                {buses.length === 0
                  ? 'No buses available right now. Try searching again later.'
                  : 'No buses match your filter selection. Adjust filters to widen results.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchBus;

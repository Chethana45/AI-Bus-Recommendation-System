import React, { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, MapPin, ShieldAlert, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { getEmergencyBuses, createEmergencyBooking } from '../services/emergencyService';
import './emergency.css';

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Goa', 'Lucknow', 'Kochi', 'Chandigarh', 'Nagpur', 'Guwahati'];
const cityOptions = cities.map((city) => ({ label: city, value: city }));
const reasons = ['Festival', 'Medical Emergency', 'Family Emergency', 'Urgent Work', 'Other'];
const priorityLevels = [
  { value: 'high', label: 'High Priority', description: 'Urgent last-minute travel' },
  { value: 'critical', label: 'Critical Priority', description: 'Medical or serious emergency' },
];

const selectStyles = {
  control: (base) => ({ ...base, minHeight: 48, borderRadius: 12, background: '#111827', borderColor: 'rgba(255,255,255,.14)' }),
  menu: (base) => ({ ...base, background: '#111827', zIndex: 50 }),
  option: (base, state) => ({ ...base, background: state.isFocused ? 'rgba(239,68,68,.18)' : '#111827', color: '#fff' }),
  singleValue: (base) => ({ ...base, color: '#fff' }),
  placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,.55)' }),
};

const EmergencyReservation = () => {
  const navigate = useNavigate();
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({ from: '', to: '', travelDate: todayString, reason: '', priorityLevel: 'high', passengerCount: 1 });
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([{ name: '', email: '', phone: '', age: '', gender: '' }]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const optionsFor = (field) => cityOptions.filter((option) => option.value !== form[field === 'from' ? 'to' : 'from']);

  const updatePassengerCount = (count) => {
    const safeCount = Math.min(6, Math.max(1, Number(count)));
    setForm((prev) => ({ ...prev, passengerCount: safeCount }));
    setPassengers((prev) => Array.from({ length: safeCount }, (_, index) => prev[index] || ({ name: '', email: '', phone: '', age: '', gender: '' })));
    setSelectedSeats((prev) => prev.slice(0, safeCount));
  };

  const search = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(null);
    setSelectedBus(null);
    setSelectedSeats([]);
    if (!form.from || !form.to || !form.travelDate || !form.reason) {
      setError('Please complete the route, travel date and emergency reason.');
      return;
    }
    if (form.from === form.to) {
      setError('Departure and destination must be different.');
      return;
    }
    try {
      setLoading(true);
      const results = await getEmergencyBuses({ from: form.from, to: form.to, travelDate: form.travelDate });
      setBuses(results);
      if (!results.length) setError('No buses with available seats were found for this emergency route.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load emergency buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) return prev.filter((item) => item !== seat);
      if (prev.length >= form.passengerCount) return prev;
      return [...prev, seat].sort((a, b) => a - b);
    });
  };

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) => prev.map((passenger, i) => (i === index ? { ...passenger, [field]: value } : passenger)));
  };

  const totalFare = useMemo(() => {
    if (!selectedBus) return 0;
    return selectedSeats.length * Number(selectedBus.fare || 0);
  }, [selectedBus, selectedSeats]);

  const priorityFee = selectedSeats.length * 100;
  const totalAmount = totalFare + priorityFee;

  const book = async () => {
    setError('');
    if (!localStorage.getItem('authToken')) {
      navigate('/login');
      return;
    }
    if (!selectedBus || selectedSeats.length !== form.passengerCount) {
      setError(`Select exactly ${form.passengerCount} seat${form.passengerCount > 1 ? 's' : ''}.`);
      return;
    }
    if (passengers.some((p) => !p.name.trim() || !p.email.trim() || !p.phone.trim())) {
      setError('Enter name, email and phone for every passenger.');
      return;
    }

    try {
      setBookingLoading(true);
      const result = await createEmergencyBooking({
        busId: selectedBus._id,
        travelDate: form.travelDate,
        selectedSeats,
        passengerDetails: passengers.map((p) => ({ ...p, age: p.age ? Number(p.age) : undefined })),
        emergencyReason: form.reason,
        priorityLevel: form.priorityLevel,
        paymentMode: 'UPI',
      });

      setSuccess(result);
      navigate('/booking-confirmation', {
        state: {
          bookingId: result.bookingId,
          passengerName: passengers[0].name,
          busName: selectedBus.busName,
          busType: selectedBus.busType,
          from: selectedBus.from,
          to: selectedBus.to,
          journeyDate: form.travelDate,
          departureTime: selectedBus.departureTime,
          arrivalTime: selectedBus.arrivalTime,
          selectedSeats,
          totalFare: totalAmount,
          farePerSeat: selectedBus.fare,
          paymentMethod: 'Priority Reservation',
          bookingType: 'emergency',
          emergencyReason: form.reason,
          priorityLevel: form.priorityLevel,
          priorityFee,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Emergency reservation failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="emergency-page">
      <section className="emergency-hero">
        <div className="emergency-badge"><AlertTriangle size={16} /> Emergency / Priority Reservation</div>
        <h1>Need to travel urgently?</h1>
        <p>Reserve an available bus within the next 3 days for festivals, medical emergencies, family emergencies or urgent work.</p>
        <div className="emergency-notice"><ShieldAlert size={18} /><span>Priority reservation does not create extra seats. It only provides a dedicated last-minute booking flow for available seats.</span></div>
      </section>

      <section className="emergency-panel">
        <form onSubmit={search} className="emergency-form">
          <div className="emergency-form-title"><MapPin size={20} /><div><h2>Find a priority bus</h2><p>Emergency travel is limited to today and the next 3 days.</p></div></div>
          <div className="emergency-grid">
            <label><span>From</span><Select value={cityOptions.find((o) => o.value === form.from) || null} onChange={(o) => setForm((p) => ({ ...p, from: o?.value || '' }))} options={optionsFor('from')} styles={selectStyles} placeholder="Departure city" /></label>
            <label><span>To</span><Select value={cityOptions.find((o) => o.value === form.to) || null} onChange={(o) => setForm((p) => ({ ...p, to: o?.value || '' }))} options={optionsFor('to')} styles={selectStyles} placeholder="Destination city" /></label>
            <label><span>Travel date</span><input type="date" min={todayString} max={maxDate} value={form.travelDate} onChange={(e) => setForm((p) => ({ ...p, travelDate: e.target.value }))} /></label>
            <label><span>Passengers</span><select value={form.passengerCount} onChange={(e) => updatePassengerCount(e.target.value)}>{[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}</select></label>
          </div>
          <div className="emergency-reasons"><span>Why is this a priority reservation?</span><div className="reason-grid">{reasons.map((reason) => <button type="button" key={reason} className={form.reason === reason ? 'reason-option active' : 'reason-option'} onClick={() => setForm((p) => ({ ...p, reason }))}>{reason}</button>)}</div></div>
          <div className="priority-grid">{priorityLevels.map((level) => <button type="button" key={level.value} className={form.priorityLevel === level.value ? 'priority-option active' : 'priority-option'} onClick={() => setForm((p) => ({ ...p, priorityLevel: level.value }))}><strong>{level.label}</strong><small>{level.description}</small></button>)}</div>
          <button className="emergency-search-button" disabled={loading}>{loading ? 'Finding buses...' : 'Find Emergency Buses'}</button>
        </form>
      </section>

      {error && <div className="emergency-error"><AlertTriangle size={18} />{error}</div>}

      {buses.length > 0 && <section className="emergency-results"><div className="emergency-section-heading"><div><span className="emergency-eyebrow">Priority inventory</span><h2>Available buses</h2></div><span>{buses.length} option{buses.length !== 1 ? 's' : ''}</span></div>
        <div className="emergency-bus-list">{buses.map((bus) => <article key={bus._id} className={selectedBus?._id === bus._id ? 'emergency-bus-card selected' : 'emergency-bus-card'} onClick={() => { setSelectedBus(bus); setSelectedSeats([]); }}><div><span className="bus-type-pill">{bus.busType}</span><h3>{bus.busName}</h3><p>{bus.operator}</p></div><div className="emergency-route"><strong>{bus.from}</strong><span>→</span><strong>{bus.to}</strong><small><Clock3 size={14} /> {bus.departureTime} – {bus.arrivalTime}</small></div><div className="emergency-bus-price"><span>{bus.availableSeats} seats available</span><strong>₹{bus.fare}</strong><small>per seat</small></div></article>)}</div></section>}

      {selectedBus && <section className="emergency-panel booking-panel">
        <div className="emergency-form-title"><Users size={20} /><div><h2>Select priority seats</h2><p>{selectedBus.busName} • Choose {form.passengerCount} seat{form.passengerCount > 1 ? 's' : ''}.</p></div></div>
        <div className="seat-grid">{Array.from({ length: selectedBus.totalSeats }, (_, i) => i + 1).map((seat) => { const booked = (selectedBus.bookedSeats || []).includes(seat); const selected = selectedSeats.includes(seat); return <button key={seat} type="button" disabled={booked} className={`emergency-seat ${booked ? 'booked' : ''} ${selected ? 'selected' : ''}`} onClick={() => toggleSeat(seat)}>{seat}</button>; })}</div>
        <div className="seat-help"><span>Selected: {selectedSeats.length}/{form.passengerCount}</span><span>Available: {selectedBus.availableSeats}</span></div>

        <div className="passenger-list"><h3>Passenger details</h3>{passengers.map((passenger, index) => <div className="passenger-card" key={index}><strong>Passenger {index + 1} • Seat {selectedSeats[index] || '—'}</strong><div className="passenger-grid"><input placeholder="Full name" value={passenger.name} onChange={(e) => updatePassenger(index, 'name', e.target.value)} /><input type="email" placeholder="Email" value={passenger.email} onChange={(e) => updatePassenger(index, 'email', e.target.value)} /><input placeholder="Phone" value={passenger.phone} onChange={(e) => updatePassenger(index, 'phone', e.target.value)} /><input type="number" min="1" max="120" placeholder="Age" value={passenger.age} onChange={(e) => updatePassenger(index, 'age', e.target.value)} /><select value={passenger.gender} onChange={(e) => updatePassenger(index, 'gender', e.target.value)}><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select></div></div>)}</div>

        <div className="emergency-summary"><div><span>Base fare</span><strong>₹{totalFare}</strong></div><div><span>Priority fee</span><strong>₹{priorityFee}</strong></div><div className="summary-total"><span>Total reservation amount</span><strong>₹{totalAmount}</strong></div></div>
        <button type="button" className="emergency-book-button" onClick={book} disabled={bookingLoading || selectedSeats.length !== form.passengerCount}>{bookingLoading ? 'Creating reservation...' : 'Confirm Emergency Reservation'}</button>
      </section>}

      {success && <div className="emergency-success"><CheckCircle2 size={22} /><div><strong>Emergency reservation created.</strong><span>Booking ID: {success.bookingId}</span></div></div>}
      <div className="emergency-footer-note"><CalendarClock size={16} /> Priority reservations are designed for genuine last-minute travel needs. Seat availability is always checked before confirmation.</div>
    </div>
  );
};

export default EmergencyReservation;

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Landmark, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import api from '../services/api';
import { getBusById } from '../services/busService';
import GlassCard from '../components/ui/GlassCard';
import Stepper from '../components/ui/Stepper';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = useMemo(() => location.state || {}, [location.state]);
  const routeBus = booking.bus || null;
  const routeTravelDate = booking.travelDate || '';
  const routeSelectedSeats = booking.selectedSeats || [];
  const routeTotalFare = booking.totalFare;
  const routeFarePerSeat = booking.farePerSeat || 0;
  const routeBusId = booking.busId || null;

  const [busData, setBusData] = useState(routeBus);
  const [loadingDetails, setLoadingDetails] = useState(!routeBus && Boolean(routeBusId));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      if (routeBus) {
        setBusData(routeBus);
        setLoadingDetails(false);
        return;
      }
      if (!routeBusId) {
        setBusData(null);
        setLoadingDetails(false);
        return;
      }
      setLoadingDetails(true);
      try {
        let data = await getBusById(routeBusId);
        if (data && data.data) data = data.data;
        if (Array.isArray(data)) data = data[0] || null;
        if (!mounted) return;
        setBusData(data || null);
      } catch (err) {
        console.error('Failed to load bus details for payment page', err);
        if (!mounted) return;
        setError('Unable to load booking details. Please return and try again.');
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [routeBusId, routeBus]);

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [passengerName, setPassengerName] = useState(booking.passengerName || '');
  const [email, setEmail] = useState(booking.email || '');
  const [phone, setPhone] = useState(booking.phone || '');

  const effectiveBus = busData || routeBus;
  const effectiveBusId = routeBusId || effectiveBus?._id || effectiveBus?.id || '';
  const effectiveSelectedSeats = routeSelectedSeats;
  const effectiveFarePerSeat = routeFarePerSeat || effectiveBus?.fare || 0;
  const effectiveTotalFare = routeTotalFare !== undefined ? routeTotalFare : effectiveFarePerSeat * effectiveSelectedSeats.length;
  const effectiveTravelDate = routeTravelDate || effectiveBus?.travelDate || '';

  const serviceFee = Math.round(effectiveTotalFare * 0.05);
  const taxes = Math.round(effectiveTotalFare * 0.08);
  const amountPayable = effectiveTotalFare + serviceFee + taxes;

  const displayFrom = effectiveBus?.from || '';
  const displayTo = effectiveBus?.to || '';
  const displayDeparture = effectiveBus?.departureTime || '';
  const displayArrival = effectiveBus?.arrivalTime || '';
  const displayBusType = effectiveBus?.busType || '';

  const paymentOptions = [
    { id: 'upi', label: 'UPI', description: 'Instant', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'card', label: 'Card', description: 'Visa/Mastercard', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'wallet', label: 'Wallet', description: 'Paytm/PhonePe', icon: <Wallet className="h-4 w-4" /> },
    { id: 'net-banking', label: 'Net Banking', description: 'Bank transfer', icon: <Landmark className="h-4 w-4" /> },
  ];

  if (!routeBusId && !routeBus) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">No booking selected</h2>
          <p className="mt-2 text-slate-300">Please select a bus and seats before proceeding to payment.</p>
          <button className="mt-4 rounded-full bg-violet-500 px-5 py-2 font-medium text-white" onClick={() => navigate('/search-bus')}>
            Search Buses
          </button>
        </div>
      </div>
    );
  }

  if (!effectiveTravelDate) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">Travel date is missing</h2>
          <p className="mt-2 text-slate-300">Please select a travel date and seats before proceeding.</p>
          <button className="mt-4 rounded-full bg-violet-500 px-5 py-2 font-medium text-white" onClick={() => navigate('/search-bus')}>
            Search Buses
          </button>
        </div>
      </div>
    );
  }

  if (loadingDetails) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/10 px-8 py-10 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-400/30 border-t-violet-400" />
          <p className="text-slate-300">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const handlePayNow = async () => {
    if (!localStorage.getItem('authToken')) {
      navigate('/login');
      return;
    }

    if (!effectiveSelectedSeats || effectiveSelectedSeats.length === 0) {
      setError('Please select a travel date and seat before proceeding.');
      return;
    }

    if (!effectiveTravelDate) {
      setError('Please select a travel date and seat before proceeding.');
      return;
    }

    if (!effectiveBusId) {
      setError('Please select a travel date and seat before proceeding.');
      return;
    }

    if (!passengerName.trim()) {
      setError('Please enter your full name to continue.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address to continue.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number to continue.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const payload = {
        busId: effectiveBusId,
        travelDate: effectiveTravelDate,
        selectedSeats: effectiveSelectedSeats,
        totalAmount: amountPayable,
        passengerDetails: [
          {
            name: passengerName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
        ],
        paymentMode: paymentMethod.toUpperCase(),
      };

      const res = await api.post('/bookings', payload);

      const bookingResponse = res?.data || {};
      const existingBookings = JSON.parse(localStorage.getItem('bookings')) || [];

      existingBookings.push({
        ...bookingResponse,
        busId: effectiveBusId,
        busName: effectiveBus?.busName,
        from: effectiveBus?.from,
        to: effectiveBus?.to,
        seats: effectiveSelectedSeats,
        totalFare: amountPayable,
        status: 'completed',
        bookingDate: new Date().toISOString(),
      });

      localStorage.setItem('bookings', JSON.stringify(existingBookings));

      setPaymentSuccess(true);
      window.setTimeout(() => {
        navigate('/booking-confirmation', {
          state: {
            ...bookingResponse,
            passengerName: passengerName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            paymentMethod: paymentMethod.toUpperCase().replace('-', ' '),
            totalFare: amountPayable,
            busName: effectiveBus?.busName,
            busType: effectiveBus?.busType,
            from: effectiveBus?.from,
            to: effectiveBus?.to,
            journeyDate: effectiveTravelDate,
            departureTime: effectiveBus?.departureTime,
            arrivalTime: effectiveBus?.arrivalTime,
            selectedSeats: effectiveSelectedSeats,
            farePerSeat: effectiveFarePerSeat,
          },
        });
      }, 1200);
    } catch (err) {
      console.error('Payment/booking error:', err);
      const backendMsg = err?.response?.data?.message || '';

      if (backendMsg.toLowerCase().includes('bus') && backendMsg.toLowerCase().includes('required')) {
        setError('Please select a travel date and seat before proceeding.');
      } else if (backendMsg.toLowerCase().includes('seat') && backendMsg.toLowerCase().includes('required')) {
        setError('Please select a travel date and seat before proceeding.');
      } else if (backendMsg.toLowerCase().includes('travel date') && backendMsg.toLowerCase().includes('required')) {
        setError('Please select a travel date and seat before proceeding.');
      } else if (backendMsg.toLowerCase().includes('already booked') || backendMsg.toLowerCase().includes('already taken')) {
        setError('Some selected seats are already booked. Please go back and choose different seats.');
      } else if (backendMsg.toLowerCase().includes('payment')) {
        setError('Payment could not be processed. Please check your payment method and try again.');
      } else if (backendMsg.toLowerCase().includes('network') || backendMsg.toLowerCase().includes('timeout')) {
        setError('Unable to connect. Please check your internet and try again.');
      } else {
        setError(backendMsg || 'Booking could not be completed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">Payment successful</h2>
          <p className="mt-2 text-slate-300">Your booking is being confirmed and you will be redirected shortly.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="payment-shell">
      <div className="payment-container">
        <header className="payment-header">
          <div>
            <p className="payment-eyebrow">Payment</p>
            <h1 className="payment-page-title">Complete your booking</h1>
            <p className="payment-page-subtitle">Review your journey details and complete payment.</p>
          </div>
          <div className="payment-badge">
            <ShieldCheck size={16} />
            Secure checkout
          </div>
        </header>

        <div className="payment-progress">
          <Stepper steps={['Search', 'Bus', 'Seats', 'Payment', 'Confirmed']} activeStep={3} />
        </div>

        <div className="payment-grid">
          <section className="payment-main-surface">
            <div className="payment-section-block">
              <h2>Passenger details</h2>
              <p>Your ticket updates will be sent using these details.</p>
              <div className="payment-form-grid">
                <label className="payment-field">
                  <span>Full name</span>
                  <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Enter full name" />
                </label>
                <label className="payment-field">
                  <span>Email address</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
                </label>
                <label className="payment-field payment-field-full">
                  <span>Phone number</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                </label>
              </div>
            </div>

            <div className="payment-divider" />

            <div className="payment-section-block">
              <h2>Payment method</h2>
              <p>Select a payment option to continue.</p>
              <div className="payment-method-grid">
                {paymentOptions.map((method) => (
                  <button key={method.id} type="button" className={`payment-method-option ${paymentMethod === method.id ? 'active' : ''}`} onClick={() => setPaymentMethod(method.id)}>
                    <span className={`payment-method-icon ${paymentMethod === method.id ? 'active' : ''}`}>{method.icon}</span>
                    <span className="payment-method-copy">
                      <span className="payment-method-label">{method.label}</span>
                      <span className="payment-method-description">{method.description}</span>
                    </span>
                    <span className="payment-method-check">{paymentMethod === method.id ? '●' : '○'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="payment-divider" />

            <div className="payment-section-block">
              <h2>Payment details</h2>
              <p>Use the secure payment option that suits you best.</p>

              {paymentMethod === 'upi' ? (
                <div className="payment-details-box">
                  <label className="payment-field payment-field-full">
                    <span>UPI ID</span>
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
                  </label>
                  <p className="payment-help-text">Enter your UPI ID to continue securely.</p>
                </div>
              ) : null}

              {paymentMethod === 'card' ? (
                <div className="payment-details-box payment-details-grid">
                  <label className="payment-field payment-field-full">
                    <span>Card number</span>
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" />
                  </label>
                  <label className="payment-field">
                    <span>Expiry</span>
                    <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                  </label>
                  <label className="payment-field">
                    <span>CVV</span>
                    <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="•••" />
                  </label>
                  <label className="payment-field payment-field-full">
                    <span>Name on card</span>
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Enter cardholder name" />
                  </label>
                </div>
              ) : null}

              {paymentMethod === 'wallet' ? (
                <div className="payment-details-box">
                  <p className="payment-help-text">Your wallet app will be used for the secure payment flow.</p>
                </div>
              ) : null}

              {paymentMethod === 'net-banking' ? (
                <div className="payment-details-box">
                  <p className="payment-help-text">You will be redirected to your bank for the secure payment step.</p>
                </div>
              ) : null}
            </div>

            <div className="payment-divider" />

            <button type="button" className="payment-coupon-toggle" onClick={() => setShowCoupon((value) => !value)}>
              <span>🏷 Have a coupon?</span>
              <span>{showCoupon ? 'Hide' : 'Add coupon'}</span>
            </button>

            {showCoupon ? (
              <div className="payment-coupon-row">
                <input className="payment-input-field" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" />
                <button type="button">Apply</button>
              </div>
            ) : null}
          </section>

          <aside className="payment-summary-surface">
            <div className="payment-summary-block">
              <p className="payment-summary-label">Booking summary</p>
              <h2>Your journey</h2>

              <div className="payment-route-card">
                <div className="payment-route-stop">
                  <span className="payment-route-time">{displayDeparture}</span>
                  <span className="payment-route-city">{displayFrom}</span>
                </div>
                <div className="payment-route-line-wrap">
                  <span className="payment-route-line" />
                  <span className="payment-route-duration">{effectiveBus?.duration || 'Journey'}</span>
                </div>
                <div className="payment-route-stop payment-route-stop-right">
                  <span className="payment-route-time">{displayArrival}</span>
                  <span className="payment-route-city">{displayTo}</span>
                </div>
              </div>

              <div className="payment-summary-meta">
                <div>
                  <span className="payment-summary-label">Date</span>
                  <p>{effectiveTravelDate}</p>
                </div>
                <div>
                  <span className="payment-summary-label">Seats</span>
                  <p>{effectiveSelectedSeats.join(', ')}</p>
                </div>
                <div>
                  <span className="payment-summary-label">Bus</span>
                  <p>{displayBusType}</p>
                </div>
              </div>
            </div>

            <div className="payment-summary-block payment-summary-block-fare">
              <p className="payment-summary-label">Fare details</p>
              <div className="payment-price-row">
                <span>Fare per seat</span>
                <strong>₹{effectiveFarePerSeat}</strong>
              </div>
              <div className="payment-price-row">
                <span>Seats booked</span>
                <strong>{effectiveSelectedSeats.length}</strong>
              </div>
              <div className="payment-price-row">
                <span>Subtotal</span>
                <strong>₹{effectiveTotalFare}</strong>
              </div>
              <div className="payment-price-row">
                <span>Service fee</span>
                <strong>₹{serviceFee}</strong>
              </div>
              <div className="payment-price-row">
                <span>Taxes</span>
                <strong>₹{taxes}</strong>
              </div>
              <div className="payment-total-row">
                <span>Total</span>
                <strong>₹{amountPayable}</strong>
              </div>
            </div>

            {error ? <div className="payment-error">{error}</div> : null}

            <button className="payment-submit-btn" onClick={handlePayNow} disabled={isProcessing}>
              {isProcessing ? 'Processing payment...' : `Pay ₹${amountPayable} securely`}
            </button>

            <div className="payment-trust-row">
              <span>🔒 Secure payment</span>
              <span>✓ Instant confirmation</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Payment;
import api from './api';
import { bookings } from '../data/bookings';

export const getBookings = async (filter = 'all') => {
  try {
    const res = await api.get('/bookings', { params: filter === 'all' ? {} : { status: filter } });
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return data;
  } catch (err) {
    // Fallback to in-memory data for offline/dev
    if (filter === 'all') return Promise.resolve([...bookings]);
    return Promise.resolve(bookings.filter((booking) => booking.status === filter));
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const res = await api.get(`/bookings/${bookingId}`);
    const data = res.data;
    return data;
  } catch (err) {
    // Fallback to in-memory lookup without parseInt on ObjectId strings
    const booking = bookings.find((item) => item.id === bookingId || String(item.id) === String(bookingId));
    if (!booking) {
      return Promise.reject(new Error('Booking not found.'));
    }
    return Promise.resolve(booking);
  }
};

export const createBooking = async (payload) => {
  try {
    const res = await api.post('/bookings', payload);
    return res.data;
  } catch (err) {
    // Fallback to an in-memory create when API unavailable
    const nextId = bookings.length ? Math.max(...bookings.map((item) => Number(item.id) || 0)) + 1 : 1;
    const newBooking = {
      id: nextId,
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      paymentMode: 'UPI',
      cancellationDate: null,
      ...payload,
    };
    bookings.unshift(newBooking);
    return Promise.resolve(newBooking);
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/cancel`);
    return res.data;
  } catch (err) {
    // Fallback to in-memory cancellation
    const booking = bookings.find((item) => item.id === bookingId || String(item.id) === String(bookingId));
    if (!booking) {
      return Promise.reject(new Error('Booking not found.'));
    }
    booking.status = 'cancelled';
    booking.cancellationDate = new Date().toISOString().split('T')[0];
    return Promise.resolve(booking);
  }
};

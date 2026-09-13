import api from './api';

export const getEmergencyBuses = async ({ from, to, travelDate }) => {
  const res = await api.get('/emergency/buses', { params: { from, to, travelDate } });
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

export const createEmergencyBooking = async (payload) => {
  const res = await api.post('/emergency/book', payload);
  return res.data;
};

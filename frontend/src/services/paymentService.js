import api from './api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

export const initiatePayment = async (bookingData) => {
  /**
   * Initiate payment for a booking
   * @param {Object} bookingData - Booking details including amount, booking ID, etc.
   * @returns {Promise} Payment initiation response
   */
  const res = await api.post('/payments/initiate', bookingData);
  return res.data;
};

export const verifyPayment = async (paymentId, transactionId) => {
  /**
   * Verify payment after transaction
   * @param {String} paymentId - Payment ID from backend
   * @param {String} transactionId - Transaction ID from payment gateway
   * @returns {Promise} Verification response with booking confirmation
   */
  const res = await api.post('/payments/verify', {
    paymentId,
    transactionId,
  });
  return res.data;
};

export const getPaymentStatus = async (paymentId) => {
  /**
   * Check payment status
   * @param {String} paymentId - Payment ID to check
   * @returns {Promise} Current payment status
   */
  const res = await api.get(`/payments/${paymentId}`);
  return res.data;
};

export const processRefund = async (bookingId, reason) => {
  /**
   * Process refund for a cancelled booking
   * @param {String} bookingId - Booking ID to refund
   * @param {String} reason - Reason for refund
   * @returns {Promise} Refund processing response
   */
  const res = await api.post('/payments/refund', {
    bookingId,
    reason,
  });
  return res.data;
};

export const getPaymentMethods = async () => {
  /**
   * Get available payment methods
   * @returns {Promise} List of available payment methods
   */
  const res = await api.get('/payments/methods');
  return res.data;
};

export const updatePaymentMethod = async (paymentMethodId, details) => {
  /**
   * Update or add a payment method
   * @param {String} paymentMethodId - Optional, for updates
   * @param {Object} details - Payment method details
   * @returns {Promise} Updated payment method
   */
  const endpoint = paymentMethodId 
    ? `/payments/methods/${paymentMethodId}` 
    : '/payments/methods';
  
  const method = paymentMethodId ? 'put' : 'post';
  const res = await api[method](endpoint, details);
  return res.data;
};

export const removePaymentMethod = async (paymentMethodId) => {
  /**
   * Remove a saved payment method
   * @param {String} paymentMethodId - Payment method to remove
   * @returns {Promise} Removal confirmation
   */
  const res = await api.delete(`/payments/methods/${paymentMethodId}`);
  return res.data;
};

export const getPaymentHistory = async (filter = {}) => {
  /**
   * Get user's payment history
   * @param {Object} filter - Filter options (date range, status, etc.)
   * @returns {Promise} Payment history
   */
  const res = await api.get('/payments/history', { params: filter });
  return res.data;
};

export const downloadPaymentReceipt = async (paymentId) => {
  /**
   * Download payment receipt as PDF
   * @param {String} paymentId - Payment ID to download receipt for
   * @returns {Promise} Receipt download URL or file
   */
  const res = await api.get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob',
  });
  return res.data;
};


import api from './api';

const TOKEN_KEY = 'authToken';

export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data || {};

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  return res.data;
};

export const register = async (payload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

export const logout = async () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user');
  return { success: true };
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return Promise.reject(new Error('User is not authenticated.'));
  }

  const res = await api.get('/auth/me');
  return res.data;
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem(TOKEN_KEY));
};

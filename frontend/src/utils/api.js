import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://arora-dental-care-website.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurora_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aurora_admin_token');
      localStorage.removeItem('aurora_admin_user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

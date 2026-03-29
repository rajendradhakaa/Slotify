import axios from 'axios';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = !configuredApiBaseUrl || configuredApiBaseUrl === 'https://api.slotify.com'
  ? '/api'
  : configuredApiBaseUrl;

export const API_BASE_URL = apiBaseUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error, fallbackMessage) {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === 'ERR_NETWORK') {
    return 'The API is unreachable right now. Please try again in a moment.';
  }

  return fallbackMessage;
}

export const eventTypesApi = {
  getAll: () => api.get('/event-types').then(res => res.data),
  getById: (id) => api.get(`/event-types/${id}`).then(res => res.data),
  getBySlug: (slug) => api.get(`/event-types/slug/${slug}`).then(res => res.data),
  create: (data) => api.post('/event-types', data).then(res => res.data),
  update: (id, data) => api.put(`/event-types/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/event-types/${id}`),
};

export const availabilityApi = {
  getAll: () => api.get('/availability').then(res => res.data),
  update: (data) => api.put('/availability', { rules: data }).then(res => res.data),
  getSlots: (slug, date) => api.get(`/availability/${slug}/slots?date=${date}`).then(res => res.data),
  checkSlot: (slug, startTime) => api.get(`/availability/${slug}/check?start_time=${startTime}`).then(res => res.data),
};

export const bookingsApi = {
  getAll: (upcoming) => {
    const params = upcoming !== undefined ? `?upcoming=${upcoming}` : '';
    return api.get(`/bookings${params}`).then(res => res.data);
  },
  getById: (id) => api.get(`/bookings/${id}`).then(res => res.data),
  create: (data) => api.post('/bookings', data).then(res => res.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then(res => res.data),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  login: (data) => api.post('/auth/login', data).then(res => res.data),
  providers: () => api.get('/auth/providers').then(res => res.data),
  oauthUrl: (provider) => `${apiBaseUrl}/auth/${provider}`,
};

export default api;

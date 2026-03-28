import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  create: (data) => api.post('/bookings', data).then(res => res.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then(res => res.data),
};

export default api;

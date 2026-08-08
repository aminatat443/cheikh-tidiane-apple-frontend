import api from './api.js';

export const feedbackService = {
  // Avis sur la boutique (témoignages)
  list: () => api.get('/feedback').then((r) => r.data),
  create: (payload) => api.post('/feedback', payload).then((r) => r.data),
};

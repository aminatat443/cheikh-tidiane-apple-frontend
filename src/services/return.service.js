import api from './api.js';

/** Demandes de retour côté client. */
export const returnService = {
  // payload : { orderId, reason, items: [{ orderItemId, quantity }] }
  create: (payload) => api.post('/returns', payload).then((r) => r.data),
  list: () => api.get('/returns').then((r) => r.data),
  getOne: (id) => api.get(`/returns/${id}`).then((r) => r.data),
};

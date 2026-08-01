import api from './api.js';

export const paymentService = {
  // { purpose:'order'|'installment', referenceId, method } → { paymentId, checkoutUrl, mode, amount }
  initiate: (payload) => api.post('/payments', payload).then((r) => r.data),
  get: (id) => api.get(`/payments/${id}`).then((r) => r.data),
  simulate: (id, outcome) => api.post(`/payments/${id}/simulate`, { outcome }).then((r) => r.data),
  mine: () => api.get('/payments').then((r) => r.data),
};

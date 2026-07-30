import api from './api.js';

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const cartService = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (payload) => api.post('/cart', payload).then((r) => r.data),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data),
};

export const favoriteService = {
  list: () => api.get('/favorites').then((r) => r.data),
  add: (productId) => api.post('/favorites', { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/favorites/${productId}`).then((r) => r.data),
};

export const orderService = {
  create: (payload) => api.post('/orders', payload).then((r) => r.data),
  list: () => api.get('/orders').then((r) => r.data),
  getOne: (id) => api.get(`/orders/${id}`).then((r) => r.data),
};

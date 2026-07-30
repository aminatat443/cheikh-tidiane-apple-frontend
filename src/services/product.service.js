import api from './api.js';

export const productService = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/products/${id}`).then((r) => r.data),
  reviews: (id) => api.get(`/products/${id}/reviews`).then((r) => r.data),
  addReview: (id, payload) => api.post(`/products/${id}/reviews`, payload).then((r) => r.data),
};

export const categoryService = {
  list: () => api.get('/categories').then((r) => r.data),
};

export const lebalmaService = {
  simulate: (productId) =>
    api.get('/lebalma/simulate', { params: { productId } }).then((r) => r.data),
  subscribe: (productId) => api.post('/lebalma/subscribe', { productId }).then((r) => r.data),
  myContracts: () => api.get('/lebalma/contracts').then((r) => r.data),
};

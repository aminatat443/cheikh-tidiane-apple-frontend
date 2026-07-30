import api from './api.js';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  // Téléverse des fichiers (FormData, champ « images ») → renvoie les URLs
  uploadImages: (formData) => api.post('/admin/products/upload', formData).then((r) => r.data),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload).then((r) => r.data),
};

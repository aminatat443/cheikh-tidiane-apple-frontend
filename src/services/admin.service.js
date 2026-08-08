import api from './api.js';

export const adminService = {
  // Tableau de bord & finance
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  finance: () => api.get('/admin/finance').then((r) => r.data),

  // Produits
  createProduct: (payload) => api.post('/admin/products', payload).then((r) => r.data),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  // Téléverse des fichiers (FormData, champ « images ») → renvoie les URLs
  // mode 'raw' = pas d'optimisation fond blanc (cachet/signature) ; défaut = photo produit.
  uploadImages: (formData, mode = 'product') =>
    api.post(`/admin/products/upload${mode === 'raw' ? '?mode=raw' : ''}`, formData).then((r) => r.data),

  // Commandes
  orders: () => api.get('/admin/orders').then((r) => r.data),
  createOrder: (payload) => api.post('/admin/orders', payload).then((r) => r.data),
  order: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, payload) =>
    api.put(`/admin/orders/${id}/status`, payload).then((r) => r.data),
  // Facture PDF générée côté serveur (Blob)
  invoicePdf: (id) =>
    api.get(`/admin/orders/${id}/invoice.pdf`, { responseType: 'blob' }).then((r) => r.data),

  // Clients
  clients: () => api.get('/admin/clients').then((r) => r.data),
  createClient: (payload) => api.post('/admin/clients', payload).then((r) => r.data),

  // Contrats Lebalma
  contracts: () => api.get('/admin/lebalma/contracts').then((r) => r.data),
  createContract: (payload) => api.post('/admin/lebalma/contracts', payload).then((r) => r.data),
  contract: (id) => api.get(`/admin/lebalma/contracts/${id}`).then((r) => r.data),
  updateContractStatus: (id, status) =>
    api.put(`/admin/lebalma/contracts/${id}/status`, { status }).then((r) => r.data),
  deliverContract: (id) => api.put(`/admin/lebalma/contracts/${id}/deliver`).then((r) => r.data),
  payInstallment: (id) => api.put(`/admin/lebalma/installments/${id}/pay`).then((r) => r.data),

  // Retours
  returns: () => api.get('/admin/returns').then((r) => r.data),
  return: (id) => api.get(`/admin/returns/${id}`).then((r) => r.data),
  updateReturnStatus: (id, payload) =>
    api.put(`/admin/returns/${id}/status`, payload).then((r) => r.data),

  // Réglages (boutique / facturation)
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (payload) => api.put('/admin/settings', payload).then((r) => r.data),

  // Campagnes e-mail (promo, newsletter)
  campaignPreview: (type = 'promo') => api.get(`/admin/campaigns/${type}/preview`, { responseType: 'text' }).then((r) => r.data),
  campaignSend: (type, payload) => api.post(`/admin/campaigns/${type}/send`, payload).then((r) => r.data),
  // Relance panier abandonné
  abandonedCartPreview: () => api.get('/admin/campaigns/abandoned-cart/preview', { responseType: 'text' }).then((r) => r.data),
  abandonedCartRun: (payload) => api.post('/admin/campaigns/abandoned-cart/run', payload).then((r) => r.data),
  // Recommandations personnalisées (par historique d'achat)
  recommendationsPreview: () => api.get('/admin/campaigns/recommendations/preview', { responseType: 'text' }).then((r) => r.data),
  recommendationsRun: (payload) => api.post('/admin/campaigns/recommendations/run', payload).then((r) => r.data),

  // Gestion des administrateurs (super-admin uniquement)
  listAdmins: () => api.get('/admin/admins').then((r) => r.data),
  createAdmin: (payload) => api.post('/admin/admins', payload).then((r) => r.data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`).then((r) => r.data),
};

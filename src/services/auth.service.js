import api from './api.js';

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  // Chemin « /auth/social » (et non « /google ») pour ne pas être bloqué par les bloqueurs de pub.
  google: (credential) => api.post('/auth/social', { credential }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  // Vérification d'e-mail (à l'inscription)
  verifyEmail: (token) => api.post('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: () => api.post('/auth/resend-verification').then((r) => r.data),
  // Mot de passe oublié / réinitialisation
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }).then((r) => r.data),
  // Double authentification (2FA / TOTP)
  verify2fa: (payload) => api.post('/auth/2fa/verify', payload).then((r) => r.data),
  // Enrôlement 2FA à la connexion (jeton temporaire) — admins
  enroll2fa: (tempToken) => api.post('/auth/2fa/enroll', { tempToken }).then((r) => r.data),
  enrollVerify2fa: (payload) => api.post('/auth/2fa/enroll/verify', payload).then((r) => r.data),
  setup2fa: () => api.post('/auth/2fa/setup').then((r) => r.data),
  enable2fa: (code) => api.post('/auth/2fa/enable', { code }).then((r) => r.data),
  disable2fa: (code) => api.post('/auth/2fa/disable', { code }).then((r) => r.data),
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

export const userService = {
  // Mise à jour du profil (nom, téléphone, adresse, zone de livraison…)
  updateProfile: (payload) => api.put('/users/profile', payload).then((r) => r.data),
};

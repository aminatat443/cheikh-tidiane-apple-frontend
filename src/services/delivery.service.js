import api from './api.js';

export const deliveryService = {
  // Zones de livraison + tarifs (région de Dakar)
  zones: () => api.get('/delivery/zones').then((r) => r.data),
};

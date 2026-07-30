export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ⚠️ Numéro WhatsApp de la boutique — format international SANS le "+" ni espaces.
// Remplacez par le vrai numéro (ex. Sénégal : 221XXXXXXXXX).
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '221770000000';

export const CATEGORIES = [
  { label: 'iPhone', slug: 'iphone' },
  { label: 'iPad', slug: 'ipad' },
  { label: 'MacBook', slug: 'macbook' },
];

export const SORT_OPTIONS = [
  { label: 'Nouveautés', value: 'recent' },
  { label: 'Prix croissant', value: 'price_asc' },
  { label: 'Prix décroissant', value: 'price_desc' },
  { label: 'Meilleures ventes', value: 'popular' },
  { label: 'Mieux notés', value: 'rating' },
];

export const PAYMENT_METHODS = [
  { label: 'Wave', value: 'wave' },
  { label: 'Orange Money', value: 'orange_money' },
  { label: 'Carte bancaire', value: 'card' },
  { label: 'Lebalma (échelonné)', value: 'lebalma' },
];

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ID client Google (OAuth 2.0, type Web). Vide = bouton Google masqué.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ⚠️ Numéro WhatsApp de la boutique — format international SANS le "+" ni espaces.
// Remplacez par le vrai numéro (ex. Sénégal : 221XXXXXXXXX).
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '221770000000';

// Photos d'iPhone (rouge, blanc, orange), alternées sur les fiches iPhone
// en attendant les vraies photos par produit. Uniquement pour les iPhones.
// Versions normalisées : canevas carré identique (1000×1000), 1 téléphone
// centré à la même taille sur fond blanc (voir originaux iphone*.jpg/.png).
export const IPHONE_IMAGES = [
  '/images/iphone-1.png', // iPhone 13 (PRODUCT)RED
  '/images/iphone-2.png', // iPhone 16 blanc
  '/images/iphone-3.png', // iPhone 17 orange
];

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

// Libellés lisibles des méthodes de paiement (par valeur)
export const PAYMENT_METHOD_LABELS = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  card: 'Carte bancaire',
  lebalma: 'Lebalma',
  cash: 'Espèces (sur place)',
};

// Moyens de paiement sélectionnables pour une vente au comptoir
export const POS_PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'wave', label: 'Wave' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'card', label: 'Carte bancaire' },
];

// === Statuts de commande (front) ===
export const ORDER_STATUSES = [
  { value: 'pending', label: 'En attente', tone: 'warning' },
  { value: 'paid', label: 'Payée', tone: 'success' },
  { value: 'processing', label: 'En préparation', tone: 'accent' },
  { value: 'shipped', label: 'Expédiée', tone: 'accent' },
  { value: 'delivered', label: 'Livrée', tone: 'success' },
  { value: 'cancelled', label: 'Annulée', tone: 'danger' },
  { value: 'returned', label: 'Retournée', tone: 'muted' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'En attente', tone: 'warning' },
  { value: 'success', label: 'Réglé', tone: 'success' },
  { value: 'failed', label: 'Échoué', tone: 'danger' },
  { value: 'refunded', label: 'Remboursé', tone: 'muted' },
];

// === Statuts d'une demande de retour (front) ===
export const RETURN_STATUSES = [
  { value: 'requested', label: 'Demande reçue', tone: 'warning' },
  { value: 'approved', label: 'Approuvée', tone: 'accent' },
  { value: 'rejected', label: 'Refusée', tone: 'danger' },
  { value: 'refunded', label: 'Remboursée', tone: 'success' },
];

// Statuts de commande éligibles à une demande de retour
export const RETURNABLE_ORDER_STATUS = ['paid', 'shipped', 'delivered'];

// === Statuts de contrat Lebalma (front) ===
export const CONTRACT_STATUSES = [
  { value: 'pending', label: 'En attente', tone: 'warning' },
  { value: 'active', label: 'Actif', tone: 'accent' },
  { value: 'completed', label: 'Terminé', tone: 'success' },
  { value: 'defaulted', label: 'En défaut', tone: 'danger' },
  { value: 'cancelled', label: 'Annulé', tone: 'muted' },
];

export const INSTALLMENT_STATUSES = {
  upcoming: { label: 'À venir', tone: 'muted' },
  pending: { label: 'En attente de validation', tone: 'warning' },
  paid: { label: 'Payée', tone: 'success' },
  late: { label: 'En retard', tone: 'danger' },
};

// Moyens de paiement d'une échéance Lebalma (espace client)
export const LEBALMA_PAY_METHODS = [
  { value: 'wave', label: 'Wave' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'cash', label: 'Espèces (en boutique)' },
];

// Logo de la boutique (PNG) — navbar, en-tête des factures, back-office
export const SHOP_LOGO = '/images/cheikh-tidiane-apple.svg';

// Coordonnées par défaut de la boutique (surchargées par les réglages admin)
export const SHOP_DEFAULTS = {
  name: 'Cheikh Tidiane Apple',
  address: 'Dakar, Sénégal',
  phone: '',
  email: '',
  ninea: '',
  rccm: '',
  stampUrl: '',
};

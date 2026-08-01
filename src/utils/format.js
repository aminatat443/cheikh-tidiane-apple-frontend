/**
 * Formate un montant en FCFA (XOF), sans décimales, séparateur d'espace.
 * Ex : 420000 → "420 000 FCFA"
 */
export function formatPrice(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
}

/** Concatène des classes conditionnelles. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calcule le plan Lebalma d'un produit pour un prix donné (barème par produit).
 * Mensualité = (prix − acompte) × multiplicateur ÷ nombre de mois.
 * @param {number} price - prix de la capacité choisie
 * @param {object} product - produit (params Lebalma)
 * @returns {object|null} plan, ou null si non éligible.
 */
export function computeLebalma(price, product) {
  if (!product?.lebalmaEligible || !product?.lebalmaMonths || !price) return null;
  const downPaymentPercent = product.lebalmaDownPercent || 0;
  const months = product.lebalmaMonths || 1;
  const multiplier = product.lebalmaMultiplier || 1;
  const downPaymentAmount = Math.round((price * downPaymentPercent) / 100);
  const financedAmount = Math.round((price - downPaymentAmount) * multiplier);
  const installmentAmount = Math.round(financedAmount / months);
  return {
    downPaymentPercent,
    downPaymentAmount,
    months,
    installmentAmount,
    financedAmount,
    totalAmount: downPaymentAmount + financedAmount,
  };
}

/** Formate une date en français court. */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Temps relatif en français (ex : "il y a 5 min", "à l'instant"). */
export function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return formatDate(date);
}

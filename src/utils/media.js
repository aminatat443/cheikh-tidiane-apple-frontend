import { IPHONE_IMAGES } from '@/constants';

// Note : l'optimisation des images (redimensionnement, WebP/AVIF, qualité) est
// entièrement déléguée à Cloudinary — au téléversement (transformation produit
// 1200×1200, fond blanc, q_auto:good) et à la livraison via les réglages
// « Automatic format/quality » du compte Cloudinary. Le frontend sert donc l'URL
// stockée telle quelle, sans manipulation.

/** Vrai si le produit est un iPhone (par catégorie ou par nom/modèle). */
function isIphone(product) {
  const slug = product?.category?.slug;
  const label = `${product?.model || ''} ${product?.name || ''}`;
  return slug === 'iphone' || /iphone/i.test(label);
}

/**
 * Les 3 photos d'iPhone, alternées par produit : chaque iPhone démarre sur
 * une image différente (rotation déterministe via l'id) pour varier le
 * catalogue, tout en gardant les 3 dans la galerie.
 */
export function iphoneImages(product) {
  const n = IPHONE_IMAGES.length;
  const start = Math.abs(Number(product?.id) || 0) % n;
  return Array.from({ length: n }, (_, i) => IPHONE_IMAGES[(start + i) % n]);
}

/**
 * Placeholder produit — visuel de repli en attendant les vraies photos.
 * iPhones uniquement : renvoie la 1re image alternée. Les autres catégories
 * (iPad, MacBook) gardent leur illustration vectorielle (DeviceIllustration).
 */
export function productPlaceholder(product) {
  return isIphone(product) ? iphoneImages(product)[0] : null;
}

/**
 * Galerie d'images à afficher pour un produit.
 * - Si le produit a de vraies photos → on les utilise (max `count`).
 * - Sinon, pour un iPhone → les 3 photos alternées (galerie défilable).
 * - Sinon (iPad, MacBook) → pas de placeholder photo.
 */
export function productGallery(product, count = 4) {
  const real = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
  if (real.length) return real.slice(0, count);
  return isIphone(product) ? iphoneImages(product).slice(0, count) : [];
}

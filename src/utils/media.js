import { IPHONE_IMAGES } from '@/constants';

/**
 * Optimise une URL Cloudinary À LA VOLÉE (sans re-téléverser l'image) :
 * insère format & qualité automatiques (WebP/AVIF, compression), densité
 * d'écran (Retina) et une largeur cible. Cloudinary génère la dérivée à la
 * 1re requête puis la sert depuis son CDN (mise en cache).
 * Les URL non-Cloudinary (placeholders locaux `/images/…`) sont renvoyées telles quelles.
 * @param {string} url
 * @param {{width?:number, height?:number, crop?:string}} opts
 */
export function optimizeImage(url, { width, height, crop = 'limit' } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  // Évite d'empiler nos transformations si l'URL en contient déjà une des nôtres.
  if (/\/upload\/[^/]*f_auto/.test(url)) return url;
  const t = ['f_auto', 'q_auto', 'dpr_auto', `c_${crop}`];
  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  return url.replace('/upload/', `/upload/${t.join(',')}/`);
}

/**
 * Construit un `srcSet` responsive pour une image Cloudinary (plusieurs largeurs).
 * Renvoie `undefined` pour les URL non-Cloudinary (le navigateur utilise alors `src`).
 */
export function optimizedSrcSet(url, widths = [300, 400, 600, 800]) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return undefined;
  return widths.map((w) => `${optimizeImage(url, { width: w })} ${w}w`).join(', ');
}

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

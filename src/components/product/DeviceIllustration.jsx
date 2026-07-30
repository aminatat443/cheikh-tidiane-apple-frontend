/**
 * Illustrations vectorielles épurées des appareils (iPhone, iPad, MacBook),
 * utilisées comme visuel par défaut quand un produit n'a pas de photo.
 * Remplaçables à tout moment par de vraies photos produit.
 */
const devices = {
  iphone: (
    <svg viewBox="0 0 240 240" fill="none" className="h-full w-full" aria-hidden="true">
      <rect x="92" y="30" width="56" height="180" rx="16" fill="#111827" />
      <rect x="98" y="44" width="44" height="152" rx="9" fill="#eaf1fb" />
      <rect x="110" y="36" width="20" height="5" rx="2.5" fill="#0b0f1a" />
      <rect x="109" y="200" width="22" height="3" rx="1.5" fill="#c3ccd8" />
    </svg>
  ),
  ipad: (
    <svg viewBox="0 0 240 240" fill="none" className="h-full w-full" aria-hidden="true">
      <rect x="60" y="26" width="120" height="188" rx="16" fill="#111827" />
      <rect x="72" y="44" width="96" height="152" rx="7" fill="#eaf1fb" />
      <circle cx="120" cy="35" r="2.4" fill="#0b0f1a" />
      <circle cx="120" cy="205" r="5" stroke="#3a4657" strokeWidth="2" />
    </svg>
  ),
  macbook: (
    <svg viewBox="0 0 240 240" fill="none" className="h-full w-full" aria-hidden="true">
      <rect x="58" y="52" width="124" height="88" rx="8" fill="#111827" />
      <rect x="64" y="58" width="112" height="76" rx="4" fill="#eaf1fb" />
      <path d="M32 148h176l10 22a4 4 0 0 1-4 5H26a4 4 0 0 1-4-5z" fill="#1f2937" />
      <rect x="102" y="148" width="36" height="5" rx="2.5" fill="#0b0f1a" />
    </svg>
  ),
};

export default function DeviceIllustration({ category, className }) {
  const key = ['iphone', 'ipad', 'macbook'].includes(category) ? category : 'iphone';
  return <div className={className}>{devices[key]}</div>;
}

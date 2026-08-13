import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_NUMBER, SITE_URL } from '@/constants';

/**
 * Bouton WhatsApp flottant (coin bas-droite), présent sur toutes les pages
 * boutique. Ouvre une conversation WhatsApp avec le numéro de la boutique,
 * en incluant le lien du site dans le message.
 */
export default function WhatsAppFab() {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Bonjour, je vous contacte depuis votre boutique Cheikh Tidiane Apple : ${SITE_URL}`
  )}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      title="Nous contacter sur WhatsApp"
      className="group fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform duration-200 ease-smooth hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
    >
      {/* Halo pulsant discret pour attirer l'œil */}
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" />
      <FaWhatsapp size={30} />
    </a>
  );
}

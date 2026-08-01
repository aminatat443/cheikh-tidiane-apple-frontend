import DeviceIllustration from './DeviceIllustration';
import { productPlaceholder } from '@/utils/media';
import { cn } from '@/utils/format';

/**
 * Affiche la photo du produit, ou une illustration de l'appareil (iPhone/iPad/
 * MacBook selon la catégorie) lorsqu'aucune photo n'est disponible.
 */
const GRADIENTS = [
  'from-primary-100 to-primary-200',
  'from-accent-light to-primary-100',
  'from-[#eef2f7] to-[#dfe7f0]',
  'from-[#f3f4f6] to-[#e7ebf1]',
];

export default function ProductMedia({ product, className, imgClassName }) {
  // Vraie photo si disponible, sinon placeholder (iPhone rouge pour les iPhones).
  const image = product?.images?.[0] || productPlaceholder(product);
  const gradient = GRADIENTS[(product?.id || 0) % GRADIENTS.length];

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {image ? (
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      ) : (
        <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br p-6', gradient)}>
          <DeviceIllustration category={product?.category?.slug} className="h-4/5 w-4/5 max-h-[240px]" />
        </div>
      )}
    </div>
  );
}

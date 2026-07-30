import { cn } from '@/utils/format';

const tones = {
  accent: 'bg-accent text-white',
  promo: 'bg-promo text-white', // Orange — réservé aux réductions
  success: 'bg-success text-white',
  neutral: 'bg-primary text-white',
  soft: 'bg-accent-light text-accent',
};

export default function Badge({ tone = 'accent', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

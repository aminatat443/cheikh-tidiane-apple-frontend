import { cn } from '@/utils/format';

const variants = {
  primary: 'btn-primary',
  buy: 'btn-buy',
  dark: 'btn-dark',
  light: 'btn-light',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

export default function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button className={cn(variants[variant] || variants.primary, className)} {...props}>
      {children}
    </button>
  );
}

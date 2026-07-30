import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function SectionTitle({ eyebrow, title, subtitle, link, linkLabel = 'Tout voir' }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold tracking-tighter sm:text-3xl dark:text-white">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {link && (
        <Link
          to={link}
          className="group hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-accent sm:inline-flex"
        >
          {linkLabel}
          <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

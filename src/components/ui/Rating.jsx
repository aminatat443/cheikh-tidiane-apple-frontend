import { FaStar, FaRegStar } from 'react-icons/fa';

export default function Rating({ value = 0, count }) {
  return (
    <div className="flex items-center gap-1 text-warning" aria-label={`Note ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= Math.round(value) ? <FaStar key={n} size={14} /> : <FaRegStar key={n} size={14} />
      )}
      {count != null && <span className="ml-1 text-xs text-muted">({count})</span>}
    </div>
  );
}

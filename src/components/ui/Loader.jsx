export default function Loader({ label = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <span className="relative grid h-10 w-10 place-items-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-line border-t-accent dark:border-white/10 dark:border-t-accent" />
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

import { useState } from 'react';
import { FiMail, FiCheck } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // TODO: brancher sur l'API newsletter
    if (email) setDone(true);
  };

  return (
    <section className="container-page my-24">
      <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white sm:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl">
          <p className="eyebrow">Newsletter</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tighter sm:text-4xl">Restez informé</h2>
          <p className="mx-auto mt-3 text-white/70">
            Nouveautés Apple, arrivages et offres Lebalma en avant-première. Sans spam.
          </p>

          {done ? (
            <p className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-success/15 px-5 py-3 font-medium text-success ring-1 ring-success/30">
              <FiCheck /> Inscription confirmée, merci !
            </p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-4 text-sm text-primary outline-none ring-2 ring-transparent transition focus:ring-accent"
                />
              </div>
              <button type="submit" className="btn-buy">S'abonner</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

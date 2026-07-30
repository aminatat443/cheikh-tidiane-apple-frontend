import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function Contact() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-extrabold">Contactez-nous</h1>
      <p className="mt-2 text-sm text-muted">Une question ? Notre équipe vous répond.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <p className="flex items-center gap-3 text-sm"><FiMapPin className="text-accent" /> Dakar, Sénégal</p>
          <p className="flex items-center gap-3 text-sm"><FiPhone className="text-accent" /> +221 XX XXX XX XX</p>
          <p className="flex items-center gap-3 text-sm"><FiMail className="text-accent" /> contact@cheikhtidiane.com</p>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="card space-y-4 p-6"
        >
          <input className="input" placeholder="Votre nom" required />
          <input className="input" type="email" placeholder="Votre email" required />
          <textarea className="input min-h-28" placeholder="Votre message" required />
          <button className="btn-primary w-full">Envoyer</button>
        </form>
      </div>
    </div>
  );
}

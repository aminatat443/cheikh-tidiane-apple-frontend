import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiUser, FiSmartphone, FiSearch, FiPlus, FiCheck, FiX, FiUserPlus } from 'react-icons/fi';
import { adminService } from '@/services/admin.service';
import { productService } from '@/services/product.service';
import { formatPrice, computeLebalma } from '@/utils/format';
import IdCardScanner from './IdCardScanner';

const EMPTY_KYC = { frontUrl: '', backUrl: '', lastName: '', firstName: '', nin: '', birthDate: '', expiryDate: '' };

/**
 * Formulaire « contrat en boutique » : l'admin recherche un client en temps réel
 * (par téléphone / email / nom) — ou le crée s'il n'existe pas — puis choisit un
 * produit éligible Lebalma, prévisualise le plan et génère le contrat.
 */
export default function ContractForm({ onClose, onSaved }) {
  const qc = useQueryClient();
  const { data: clientsRes } = useQuery({ queryKey: ['admin', 'clients'], queryFn: () => adminService.clients() });
  const { data: productsRes } = useQuery({ queryKey: ['admin', 'products'], queryFn: () => productService.list({ limit: 200 }) });

  const clients = clientsRes?.data || [];
  const eligible = (productsRes?.data || []).filter((p) => p.lebalmaEligible);

  const [picked, setPicked] = useState(null); // client sélectionné (objet)
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [clientSaving, setClientSaving] = useState(false);

  const [productId, setProductId] = useState('');
  const [storage, setStorage] = useState('');
  const [kyc, setKyc] = useState(EMPTY_KYC);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setKycField = (patch) => setKyc((k) => ({ ...k, ...patch }));
  const onPhoto = (side, url) => setKyc((k) => ({ ...k, [side === 'front' ? 'frontUrl' : 'backUrl']: url }));
  // Pré-remplit uniquement les champs encore vides (ne remplace pas une saisie admin).
  const onExtract = (fields) => setKyc((k) => ({
    ...k,
    lastName: k.lastName || fields.lastName || '',
    firstName: k.firstName || fields.firstName || '',
    nin: k.nin || fields.nin || '',
    birthDate: k.birthDate || fields.birthDate || '',
    expiryDate: k.expiryDate || fields.expiryDate || '',
  }));

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => (q ? clients.filter((c) => `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(q)).slice(0, 6) : []),
    [clients, q]
  );

  const product = eligible.find((p) => String(p.id) === String(productId));
  const variants = product?.variants?.length
    ? product.variants
    : (product?.storages || []).map((s) => ({ storage: s, price: product?.price }));
  const activeVariant = variants.find((v) => v.storage === storage) || variants[0];
  const price = activeVariant?.price ?? product?.price ?? 0;
  const plan = useMemo(() => (product ? computeLebalma(price, product) : null), [product, price]);

  function openCreate() {
    const isEmail = query.includes('@');
    setNewClient({ name: '', email: isEmail ? query.trim() : '', phone: isEmail ? '' : query.trim() });
    setCreating(true);
    setError('');
  }

  async function createClientInline() {
    if (!newClient.name.trim() || (!newClient.email.trim() && !newClient.phone.trim())) return setError('Nom + email ou téléphone requis');
    setClientSaving(true);
    setError('');
    try {
      const res = await adminService.createClient({
        name: newClient.name.trim(),
        email: newClient.email.trim(),
        phone: newClient.phone.trim(),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setPicked(res.data);
      setCreating(false);
      setQuery('');
    } catch (err) {
      setError(err.response?.data?.message || 'Création du client impossible');
    } finally {
      setClientSaving(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!picked) return setError('Sélectionnez ou créez un client');
    if (!productId) return setError('Sélectionnez un produit éligible');
    setSaving(true);
    try {
      await adminService.createContract({ userId: Number(picked.id), productId: Number(productId), price, kyc });
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Création du contrat impossible');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {/* Client : recherche temps réel ou création */}
      <div>
        <label className="label dark:text-white/80"><FiUser className="mr-1 inline" size={13} /> Client</label>

        {picked ? (
          <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent-light px-3 py-2.5 dark:bg-white/5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary dark:text-white">
                {picked.name}
                {picked.isKycVerified
                  ? <span className="ml-2 text-xs font-medium text-success">✓ KYC</span>
                  : <span className="ml-2 text-xs font-medium text-warning">KYC non vérifié</span>}
              </p>
              <p className="truncate text-xs text-muted">{picked.phone || picked.email}</p>
            </div>
            <button type="button" onClick={() => { setPicked(null); setQuery(''); }} className="ml-3 shrink-0 rounded-lg p-1.5 text-muted hover:bg-white/60 hover:text-primary dark:hover:bg-white/10" aria-label="Changer de client">
              <FiX size={16} />
            </button>
          </div>
        ) : creating ? (
          <div className="space-y-3 rounded-xl border border-line p-3 dark:border-white/10">
            <p className="flex items-center gap-1.5 text-sm font-semibold dark:text-white"><FiUserPlus size={14} /> Nouveau client</p>
            <input className="input" placeholder="Nom complet *" value={newClient.name} onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="Email (ou téléphone)" value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
              <input className="input" placeholder="Téléphone (ou email)" value={newClient.phone} onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="btn-outline px-3 py-1.5 text-sm">Annuler</button>
              <button type="button" onClick={createClientInline} disabled={clientSaving} className="btn-primary px-3 py-1.5 text-sm">
                <FiCheck size={14} /> {clientSaving ? 'Enregistrement…' : 'Créer et sélectionner'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
              <input
                className="input pl-9"
                placeholder="Rechercher par téléphone, email ou nom…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            {q && (
              <div className="mt-2 overflow-hidden rounded-xl border border-line dark:border-white/10">
                {matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setPicked(c); setQuery(''); }}
                    className="flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2 text-left text-sm transition last:border-0 hover:bg-surface dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium dark:text-white">{c.name}</span>
                      <span className="block truncate text-xs text-muted">{c.phone || c.email}</span>
                    </span>
                    {c.isKycVerified && <span className="shrink-0 text-xs font-medium text-success">✓ KYC</span>}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={openCreate}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-accent transition hover:bg-accent-light dark:hover:bg-white/5"
                >
                  <FiPlus size={15} /> {matches.length ? 'Créer un nouveau client' : `Aucun client trouvé — créer « ${query.trim()} »`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label dark:text-white/80"><FiSmartphone className="mr-1 inline" size={13} /> Produit éligible</label>
          <select className="input" value={productId} onChange={(e) => { setProductId(e.target.value); setStorage(''); }}>
            <option value="">— Choisir un produit —</option>
            {eligible.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {variants.length > 0 && (
          <div>
            <label className="label dark:text-white/80">Capacité</label>
            <select className="input" value={activeVariant?.storage || ''} onChange={(e) => setStorage(e.target.value)}>
              {variants.map((v) => (
                <option key={v.storage} value={v.storage}>{v.storage} — {formatPrice(v.price)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Aperçu du plan */}
      {plan && (
        <div className="rounded-2xl border border-accent/25 bg-accent-light p-4 dark:border-white/10 dark:bg-primary-800">
          <p className="mb-3 text-sm font-bold text-accent">Aperçu du plan Lebalma — {plan.months} mois</p>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              ['Prix', formatPrice(price)],
              [`Acompte (${plan.downPaymentPercent}%)`, formatPrice(plan.downPaymentAmount)],
              ['Mensualité', formatPrice(plan.installmentAmount)],
              ['Total', formatPrice(plan.totalAmount)],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted">{k}</p>
                <p className="font-bold text-primary dark:text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pièce d'identité (KYC) : photo/import recto-verso + OCR */}
      <div className="rounded-2xl border border-line p-4 dark:border-white/10">
        <p className="mb-1 text-sm font-bold dark:text-white">Pièce d'identité (KYC)</p>
        <p className="mb-3 text-xs text-muted">
          Prenez en photo ou importez le recto et le verso. Les informations sont détectées
          automatiquement — vérifiez-les et corrigez si besoin.
        </p>

        <IdCardScanner photos={{ front: kyc.frontUrl, back: kyc.backUrl }} onPhoto={onPhoto} onExtract={onExtract} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label dark:text-white/80">NIN</label>
            <input className="input" value={kyc.nin} onChange={(e) => setKycField({ nin: e.target.value })} placeholder="Numéro d'identification" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label dark:text-white/80">Naissance</label>
              <input className="input" value={kyc.birthDate} onChange={(e) => setKycField({ birthDate: e.target.value })} placeholder="JJ/MM/AAAA" />
            </div>
            <div>
              <label className="label dark:text-white/80">Expiration</label>
              <input className="input" value={kyc.expiryDate} onChange={(e) => setKycField({ expiryDate: e.target.value })} placeholder="JJ/MM/AAAA" />
            </div>
          </div>
        </div>
        {(kyc.frontUrl || kyc.backUrl) && (
          <p className="mt-2 text-xs text-success">✓ La validation KYC du client sera activée à la création du contrat.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-4 dark:border-white/10">
        <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Création…' : 'Générer le contrat'}
        </button>
      </div>
    </form>
  );
}

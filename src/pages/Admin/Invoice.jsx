import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiPrinter, FiUploadCloud, FiDownload } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/utils/format';
import { SHOP_LOGO, SHOP_DEFAULTS, PAYMENT_METHOD_LABELS, PAYMENT_STATUSES } from '@/constants';

const payMeta = (v) => PAYMENT_STATUSES.find((s) => s.value === v)?.label || v;

export default function Invoice() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [uploadedStamp, setUploadedStamp] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminService.order(id),
  });
  const { data: setRes } = useQuery({ queryKey: ['admin', 'settings'], queryFn: () => adminService.getSettings() });

  if (isLoading) return <Loader />;
  const order = orderRes?.data;
  if (!order) return <p className="py-10 text-center text-muted">Facture introuvable.</p>;

  const shop = { ...SHOP_DEFAULTS, ...(setRes?.data || {}) };
  const stampUrl = uploadedStamp ?? shop.stampUrl;
  const items = order.items || [];

  async function handleStamp(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('images', file);
      const up = await adminService.uploadImages(fd);
      const url = up.data?.[0];
      if (url) {
        setUploadedStamp(url);
        // Persiste comme cachet/signature par défaut pour les prochaines factures
        await adminService.updateSettings({ stampUrl: url });
        qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      }
    } catch (e) {
      setError(e.response?.data?.message || "Échec du téléversement de l'image");
    } finally {
      setUploading(false);
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    setError('');
    try {
      const blob = await adminService.invoicePdf(order.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${order.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Échec de la génération du PDF côté serveur');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      {/* Barre d'actions (non imprimée) */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/admin/invoices" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary dark:hover:text-white">
          <FiArrowLeft /> Retour aux factures
        </Link>
        <div className="flex items-center gap-2">
          <label className="btn-outline cursor-pointer px-4 py-2 text-sm">
            <FiUploadCloud size={15} /> {uploading ? 'Envoi…' : 'Cachet & signature'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { handleStamp(e.target.files); e.target.value = ''; }} />
          </label>
          <button onClick={() => window.print()} className="btn-outline px-4 py-2 text-sm">
            <FiPrinter size={15} /> Imprimer
          </button>
          <button onClick={downloadPdf} disabled={downloading} className="btn-primary px-4 py-2 text-sm">
            <FiDownload size={15} /> {downloading ? 'Génération…' : 'Télécharger le PDF'}
          </button>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger print:hidden">{error}</p>}

      {/* Facture */}
      <div
        id="invoice-print"
        style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
        className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-[#111827] shadow-card ring-1 ring-line sm:p-10"
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-6 border-b-2 border-[#111827] pb-6">
          <div className="flex items-center gap-3">
            <img src={SHOP_LOGO} alt={shop.name} className="h-14 w-auto" />
            <div>
              <p className="text-lg font-extrabold leading-tight">{shop.name}</p>
              {shop.address && <p className="text-xs text-[#6B7280]">{shop.address}</p>}
              {shop.phone && <p className="text-xs text-[#6B7280]">Tél : {shop.phone}</p>}
              {shop.email && <p className="text-xs text-[#6B7280]">{shop.email}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-[#0A84FF]">FACTURE</p>
            <p className="mt-1 font-mono text-sm font-semibold">N° {order.reference}</p>
            <p className="text-xs text-[#6B7280]">Date : {formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Émetteur / Client */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Vendeur</p>
            <p className="font-semibold">{shop.name}</p>
            {shop.ninea && <p className="text-xs text-[#6B7280]">NINEA : {shop.ninea}</p>}
            {shop.rccm && <p className="text-xs text-[#6B7280]">RCCM : {shop.rccm}</p>}
          </div>
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Facturé à</p>
            <p className="font-semibold">{order.shippingName || order.user?.name || 'Client'}</p>
            {order.user?.email && <p className="text-xs text-[#6B7280]">{order.user.email}</p>}
            {(order.shippingPhone || order.user?.phone) && (
              <p className="text-xs text-[#6B7280]">Tél : {order.shippingPhone || order.user?.phone}</p>
            )}
            {(order.shippingAddress || order.shippingCity) && (
              <p className="text-xs text-[#6B7280]">{[order.shippingAddress, order.shippingCity].filter(Boolean).join(', ')}</p>
            )}
          </div>
        </div>

        {/* Articles */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="bg-[#F9FAFB] text-left text-[11px] uppercase tracking-wider text-[#6B7280]">
              <th className="rounded-l-lg px-3 py-2 font-bold">Désignation</th>
              <th className="px-3 py-2 text-center font-bold">Qté</th>
              <th className="px-3 py-2 text-right font-bold">P.U.</th>
              <th className="rounded-r-lg px-3 py-2 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-[#E5E7EB]">
                <td className="px-3 py-2.5">
                  <span className="font-medium">{it.productName}</span>
                  {(it.storage || it.color) && (
                    <span className="text-[#6B7280]"> — {[it.storage, it.color].filter(Boolean).join(' · ')}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">{it.quantity}</td>
                <td className="px-3 py-2.5 text-right">{formatPrice(it.unitPrice)}</td>
                <td className="px-3 py-2.5 text-right font-semibold">{formatPrice(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-[#6B7280]"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-[#6B7280]"><span>Livraison</span><span>{formatPrice(order.shippingFee)}</span></div>
            <div className="mt-1 flex justify-between rounded-lg bg-[#111827] px-3 py-2 text-base font-extrabold text-white">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Paiement */}
        <div className="mt-4 text-xs text-[#6B7280]">
          Mode de paiement : <span className="font-semibold text-[#111827]">{PAYMENT_METHOD_LABELS[order.paymentMethod] || '—'}</span>
          {' · '}Règlement : <span className="font-semibold text-[#111827]">{payMeta(order.paymentStatus)}</span>
          {order.isLebalma && <span className="ml-1 font-semibold text-[#0A84FF]">(Financement Lebalma)</span>}
        </div>

        {/* Pied : mentions + cachet/signature */}
        <div className="mt-8 flex items-end justify-between gap-6 border-t border-[#E5E7EB] pt-5">
          <p className="max-w-xs text-[11px] leading-relaxed text-[#6B7280]">
            Merci de votre confiance. Facture générée par {shop.name}. Montants exprimés en FCFA (XOF).
          </p>
          <div className="text-center">
            {stampUrl ? (
              <img src={stampUrl} alt="Cachet et signature" className="mx-auto h-24 w-auto object-contain" />
            ) : (
              <div className="grid h-24 w-40 place-items-center rounded-lg border border-dashed border-[#E5E7EB] text-[11px] text-[#9CA3AF]">
                Cachet &amp; signature
              </div>
            )}
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Cachet &amp; signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

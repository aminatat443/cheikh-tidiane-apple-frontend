import { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { FiCamera, FiUploadCloud, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { adminService } from '@/services/admin.service';
import { parseIdText } from '@/utils/idOcr';
import { cn } from '@/utils/format';

/**
 * Capture (photo) ou import du recto/verso d'une pièce d'identité :
 * téléverse les images et lance l'OCR pour pré-remplir les infos KYC.
 * @param {{front:string, back:string}} photos  URLs déjà téléversées
 * @param {(side:'front'|'back', url:string)=>void} onPhoto
 * @param {(fields:object)=>void} onExtract  champs OCR (nom, prénom, nin, dates)
 */
export default function IdCardScanner({ photos, onPhoto, onExtract }) {
  const [status, setStatus] = useState({});
  const inputs = { front: useRef(null), back: useRef(null) };

  async function handle(side, file) {
    if (!file) return;
    // 1) Téléversement de la photo
    setStatus((s) => ({ ...s, [side]: 'upload' }));
    try {
      const fd = new FormData();
      fd.append('images', file);
      const up = await adminService.uploadImages(fd);
      if (up.data?.[0]) onPhoto(side, up.data[0]);
    } catch {
      /* le stockage échoue silencieusement, l'OCR peut continuer */
    }
    // 2) OCR (best-effort)
    setStatus((s) => ({ ...s, [side]: 'ocr' }));
    try {
      const { data } = await Tesseract.recognize(file, 'fra');
      onExtract(parseIdText(data.text));
    } catch {
      /* OCR indisponible → saisie manuelle */
    }
    setStatus((s) => ({ ...s, [side]: 'done' }));
  }

  const Slot = ({ side, label }) => {
    const url = photos[side];
    const st = status[side];
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium dark:text-white/80">{label}</p>
        <div className={cn(
          'relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition',
          url ? 'border-transparent' : 'border-line hover:border-accent dark:border-white/15'
        )}>
          {url ? (
            <>
              <img src={url} alt={label} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onPhoto(side, '')}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Retirer"
              >
                <FiX size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-3 text-center">
              <div className="flex gap-2">
                <button type="button" onClick={() => inputs[side].current?.click()} className="btn-outline px-3 py-1.5 text-xs">
                  <FiUploadCloud size={14} /> Importer
                </button>
                <button type="button" onClick={() => inputs[side].current?.click()} className="btn-primary px-3 py-1.5 text-xs">
                  <FiCamera size={14} /> Photo
                </button>
              </div>
              <p className="text-[11px] text-muted">JPEG / PNG</p>
            </div>
          )}

          {(st === 'upload' || st === 'ocr') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/80 text-accent dark:bg-primary-900/80">
              <FiLoader className="animate-spin" size={20} />
              <span className="text-xs font-medium">{st === 'upload' ? 'Téléversement…' : 'Lecture de la carte…'}</span>
            </div>
          )}
          {st === 'done' && url && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[11px] font-semibold text-white">
              <FiCheck size={11} /> Lu
            </span>
          )}
        </div>
        <input
          ref={inputs[side]}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => { handle(side, e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Slot side="front" label="Carte d'identité — recto" />
      <Slot side="back" label="Carte d'identité — verso" />
    </div>
  );
}

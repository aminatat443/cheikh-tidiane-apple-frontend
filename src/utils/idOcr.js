/**
 * Analyse (best-effort) du texte OCR d'une carte d'identité (CEDEAO / CNI Sénégal)
 * pour en extraire : nom, prénom, NIN, date de naissance, date d'expiration.
 * Les résultats restent modifiables par l'admin (l'OCR n'est pas fiable à 100 %).
 */
export function parseIdText(raw) {
  const text = (raw || '').replace(/\r/g, '');
  const upper = text.toUpperCase();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // --- NIN : la plus longue suite de chiffres (>= 13) ---
  let nin = '';
  const runs = (upper.match(/[0-9][0-9 ]{11,22}[0-9]/g) || []).map((s) => s.replace(/\s/g, ''));
  for (const d of runs) if (d.length >= 13 && d.length > nin.length) nin = d;
  if (!nin) {
    const long = (upper.match(/\d{13,20}/g) || []).sort((a, b) => b.length - a.length);
    if (long[0]) nin = long[0];
  }

  // --- Dates JJ/MM/AAAA ---
  const all = [...upper.matchAll(/(\d{2})[ ./-](\d{2})[ ./-](\d{4})/g)].map((m) => ({
    key: Number(`${m[3]}${m[2]}${m[1]}`),
    str: `${m[1]}/${m[2]}/${m[3]}`,
  }));
  let birthDate = '';
  let expiryDate = '';
  if (all.length) {
    const sorted = [...all].sort((a, b) => a.key - b.key);
    birthDate = sorted[0].str; // la plus ancienne = naissance
    expiryDate = sorted[sorted.length - 1].str; // la plus récente = expiration
    // Affinage par libellés si présents
    for (let i = 0; i < lines.length; i++) {
      const u = lines[i].toUpperCase();
      const near = `${lines[i]} ${lines[i + 1] || ''}`;
      const dd = near.match(/(\d{2})[ ./-](\d{2})[ ./-](\d{4})/);
      if (!dd) continue;
      const s = `${dd[1]}/${dd[2]}/${dd[3]}`;
      if (/(NAISS|BIRTH|NÉ|\bNE\b)/.test(u)) birthDate = s;
      if (/(EXPIR|VALAB|VALID|JUSQU|EXPIRY)/.test(u)) expiryDate = s;
    }
  }

  // --- Nom / Prénom (après un libellé, sinon ligne suivante) ---
  const grab = (labelRe) => {
    for (let i = 0; i < lines.length; i++) {
      if (!labelRe.test(lines[i].toUpperCase())) continue;
      const after = lines[i].split(':')[1];
      let val = (after && after.trim()) || (lines[i + 1] || '');
      val = val.replace(/(NOM|SURNAME|PR[ÉE]NOMS?|GIVEN NAMES?)\s*:?/i, '').trim();
      val = val.replace(/[^A-Za-zÀ-ÿ' -]/g, ' ').replace(/\s+/g, ' ').trim();
      if (val.length >= 2) return val;
    }
    return '';
  };
  const lastName = grab(/\bNOM\b|SURNAME/);
  const firstName = grab(/PR[ÉE]NOM|GIVEN NAMES?/);

  return { lastName, firstName, nin, birthDate, expiryDate };
}

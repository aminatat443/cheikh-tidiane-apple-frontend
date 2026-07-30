# Charte Graphique — Teintes & Shades

Échelles de couleurs (tints & shades) des couleurs **primaire**, **secondaire** et **tertiaire**.
Générées et câblées dans `tailwind.config.js`. Style visé : premium, Apple-like, minimaliste.

**Répartition cible :** 70 % blanc · 20 % noir · 10 % bleu.

---

## 1. Primaire — Noir profond `#111827`

Base = `900`. Sert aux : navbar (thème sombre), footer, titres, texte, boutons principaux, icônes.

| Shade | Hex | Token Tailwind | Rôle typique |
|------:|-----|----------------|--------------|
| 50  | `#F9FAFB` | `primary-50`  | fonds très clairs |
| 100 | `#F3F4F6` | `primary-100` | survols légers, fonds |
| 200 | `#E5E7EB` | `primary-200` | bordures (= `line`) |
| 300 | `#D1D5DB` | `primary-300` | bordures marquées |
| 400 | `#9CA3AF` | `primary-400` | texte désactivé, placeholders |
| 500 | `#6B7280` | `primary-500` | **texte secondaire** (= `muted`) |
| 600 | `#4B5563` | `primary-600` | texte tertiaire |
| 700 | `#374151` | `primary-700` | texte fort |
| 800 | `#1F2937` | `primary-800` | **texte principal** (charte) |
| 900 | `#111827` | `primary` / `primary-900` | **couleur primaire** — navbar, footer, titres |
| 950 | `#0B0F1A` | `primary-950` | surfaces les plus sombres |

---

## 2. Secondaire — Blanc `#FFFFFF` (échelle neutre)

Base = `0` (blanc pur). Le blanc n'ayant pas de teintes plus claires, l'échelle descend vers les
gris neutres (surfaces, fonds, bordures, cartes). Sert aux : fond principal, cartes, inputs, modales.

| Shade | Hex | Token Tailwind | Rôle typique |
|------:|-----|----------------|--------------|
| 0   | `#FFFFFF` | `neutral-0` / `neutral` | **blanc pur** — cartes, inputs, fond |
| 50  | `#F8FAFC` | `neutral-50`  | **fond clair** (= `surface`) |
| 100 | `#F1F5F9` | `neutral-100` | sections alternées |
| 200 | `#E2E8F0` | `neutral-200` | séparateurs |
| 300 | `#CBD5E1` | `neutral-300` | bordures |
| 400 | `#94A3B8` | `neutral-400` | icônes discrètes |
| 500 | `#64748B` | `neutral-500` | texte secondaire (variante froide) |
| 600 | `#475569` | `neutral-600` | texte |
| 700 | `#334155` | `neutral-700` | texte fort |
| 800 | `#1E293B` | `neutral-800` | surfaces sombres |
| 900 | `#0F172A` | `neutral-900` | bleu-noir (= `midnight`) |
| 950 | `#020617` | `neutral-950` | quasi-noir |

---

## 3. Tertiaire — Bleu électrique `#0A84FF`

Base = `500`. **À utiliser avec parcimonie (10–15 % max)** : boutons « Acheter » / « Ajouter au
panier », liens, prix promo, icônes actives, badges, focus.

| Shade | Hex | Token Tailwind | Rôle typique |
|------:|-----|----------------|--------------|
| 50  | `#EBF4FF` | `accent-50`  | fonds bleutés très clairs (= `accent-light`) |
| 100 | `#D6E8FF` | `accent-100` | badges doux, surbrillance |
| 200 | `#ADD1FF` | `accent-200` | états hover clairs |
| 300 | `#7DB5FF` | `accent-300` | illustrations |
| 400 | `#4398FF` | `accent-400` | dégradés |
| 500 | `#0A84FF` | `accent` / `accent-500` | **couleur d'accent** — CTA, liens, focus |
| 600 | `#006AE6` | `accent-600` / `accent-hover` | **survol bouton Acheter** |
| 700 | `#0055BF` | `accent-700` | pression / actif |
| 800 | `#054596` | `accent-800` | textes bleus sur fond clair |
| 900 | `#0A3A78` | `accent-900` | fonds bleus profonds |
| 950 | `#06213F` | `accent-950` | quasi-nuit bleutée |

> Alias conservés pour la compatibilité : `accent-light` (#E8F2FF), `accent-dark` (#0A2540), `accent-hover` (#006AE6).

---

## 4. Couleurs de statut (rappel)

| Rôle | Hex | Token |
|------|-----|-------|
| Succès | `#10B981` | `success` |
| Avertissement | `#F59E0B` | `warning` |
| Danger / erreur | `#EF4444` | `danger` |
| Promotion (réductions) | `#F97316` | `promo` |

---

## 5. Exemples d'usage (classes Tailwind)

```html
<!-- Bouton principal (noir → survol bleu) -->
<button class="bg-primary text-white hover:bg-accent rounded-xl">…</button>

<!-- Bouton Acheter (bleu → survol plus foncé) -->
<button class="bg-accent text-white hover:bg-accent-600 rounded-xl">Acheter</button>

<!-- Carte produit -->
<div class="bg-white ring-1 ring-line rounded-[20px] shadow-card">…</div>

<!-- Lien / prix promo -->
<a class="text-accent">…</a>

<!-- Fond de section clair -->
<section class="bg-surface">…</section>
```

---

*Échelles câblées dans `tailwind.config.js`. Voir aussi la charte complète (typographie, boutons,
espacements, ombres) fournie par l'équipe.*

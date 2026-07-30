# CLAUDE.md — Frontend

Règles de développement pour le dépôt **`cheikh-tidiane-apple-frontend`** (SPA React).
Voir aussi : `CAHIER_DES_CHARGES.md` (périmètre frontend), `STATUT.md` (avancement), et la doc racine.

---

## 1. Stack
React 19 · Vite · React Router · Axios · Redux Toolkit · React Query · React Hook Form + Yup · Tailwind CSS · React Icons · socket.io-client.
JavaScript (JSX), modules ES. Alias `@` → `src` (voir `vite.config.js`).

## 2. Charte graphique (à respecter strictement)
- Couleurs **uniquement** via les tokens Tailwind : `primary` (#111827), `accent` (#0A84FF), blanc, `muted`, `surface`, `line`, `success`, `danger`, `warning`. **Jamais** de couleur codée en dur.
- `accent` réservé aux actions / accents (CTA, liens actifs, focus).
- Réutiliser les classes composant de `index.css` (`.btn-primary`, `.card`, `.input`, `.container-page`…).
- Style minimaliste, premium, mobile-first, micro-interactions fluides (150–300 ms).

## 3. Conventions
- Composants React en `PascalCase`, un composant par fichier. Pages dans `pages/<Nom>/index.jsx`.
- Hooks `useXxx`, services `xxx.service.js`, slices Redux `xxxSlice.js`.
- Imports via l'alias `@/…`.
- Séparer présentation et logique ; extraire la logique réutilisable dans `hooks/`.
- Accessibilité : `aria-label` sur les boutons icônes, `alt` sur les images, focus visible.
- Images : `loading="lazy"`, dimensions cohérentes.

## 4. Données & état
- **État serveur** (produits, commandes…) via **React Query** — ne pas dupliquer dans Redux.
- **État global UI** (auth, panier, favoris) via **Redux Toolkit**. Panier/favoris persistés en `localStorage`.
- **Formulaires** via React Hook Form + résolveur Yup (messages en français).
- Tous les appels réseau passent par les **services** (`services/`), jamais d'`axios` brut dans les composants.

## 5. API & sécurité
- Instance Axios centralisée (`services/api.js`) : JWT injecté automatiquement, déconnexion sur 401.
- Ne jamais stocker de secret dans le code ; config via `import.meta.env` (`VITE_*`).
- Le JWT vit dans `localStorage` (clé `token`). Nettoyage au logout.
- Routes sensibles derrière `ProtectedRoute` (et `adminOnly` pour l'admin).

## 6. Argent & i18n
- Devise **FCFA (XOF)** : toujours formater via `formatPrice` (entiers, pas de décimales).
- Langue : français. Textes clairs et cohérents.

## 7. Performance
- React Query : `staleTime` raisonnable, pas de refetch inutile.
- Recherche/filtres : `useDebounce` (250 ms) pour éviter les requêtes en rafale.
- Lazy-loading des images ; envisager le code-splitting des routes si le bundle grossit.

## 8. Definition of Done
- [ ] Respecte la charte (tokens Tailwind) et les conventions.
- [ ] Responsive (mobile/tablette/desktop) et accessible.
- [ ] Appels réseau via un service ; états loading/erreur/vide gérés.
- [ ] `npm run lint` OK ; build `npm run build` sans erreur.
- [ ] `STATUT.md` mis à jour.

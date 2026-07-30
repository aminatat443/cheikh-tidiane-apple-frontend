# Cheikh Tidiane Apple — Frontend

Interface web (SPA React) de la boutique Apple (iPhone, iPad, MacBook) avec financement **Lebalma**.

## Stack
React 19 · Vite · React Router · Axios · Redux Toolkit · React Query · React Hook Form + Yup · Tailwind CSS · React Icons · Socket.IO client.

## Prérequis
- Node.js ≥ 18
- Le backend (`cheikh-tidiane-apple-backend`) lancé sur `http://localhost:5000`

## Installation
```bash
npm install
cp .env.example .env      # VITE_API_URL, VITE_SOCKET_URL
```

## Démarrage
```bash
npm run dev       # http://localhost:5173
npm run build     # build de production (dossier dist/)
npm run preview   # prévisualiser le build
npm run lint      # ESLint
```

## Charte graphique
| Couleur | HEX | Token |
|---------|-----|-------|
| Noir profond | `#111827` | `primary` |
| Blanc | `#FFFFFF` | — |
| Bleu électrique | `#0A84FF` | `accent` |

## Structure
```
src/
  components/  common · layout · ui · product
  pages/       Home · Products · ProductDetails · Cart · Checkout · Login ·
               Register · Profile · Orders · Favorites · Search · Contact ·
               Lebalma · Admin · NotFound
  routes/      AppRoutes, ProtectedRoute
  services/    api (axios), product.service, auth.service
  store/       Redux Toolkit (auth, cart, favorites)
  context/     SocketContext
  hooks/       useDebounce
  utils/       format (FCFA, dates)
  constants/
```

## Documentation
- [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md) — spécifications frontend
- [`CLAUDE.md`](./CLAUDE.md) — règles de développement
- [`STATUT.md`](./STATUT.md) — avancement

## Fonctionnalités clés
Recherche & filtres en temps réel · Hero slider · Favoris & panier persistants · Auth JWT · Checkout multi-paiement (Wave, Orange Money, carte, Lebalma) · Simulateur Lebalma · Espace admin.
"# cheikh-tidiane-apple-frontend"  

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
Recherche & filtres en temps réel · Hero slider · Favoris & panier persistants · Auth JWT (+ Google & 2FA) · Checkout multi-paiement (Wave, Orange Money, carte, Lebalma) · Simulateur Lebalma · Espace admin.

## Comptes de test

> Créés par les scripts de seed backend : `npm run db:seed` (réinitialise la base + super-admin) puis `npm run db:seed:demo` (additif : admin, clients, commandes et contrats de démo). Les mots de passe sont en clair ci-dessous mais hachés en base (Bcrypt).

### Administration — `/admin`
| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Super-admin** (Cheikh Tidiane) | `admin@cheikhtidiane.com` | `admin123` | Tout, dont la **gestion des administrateurs** et la 2FA |
| **Admin** | `manager@cheikhtidiane.com` | `admin123` | Back-office complet **sauf** la gestion des admins |

### Clients (boutique) — mot de passe commun : `client123`
| Nom | Email | KYC | Idéal pour tester |
|-----|-------|-----|-------------------|
| Awa Ndiaye | `awa@example.com` | ✅ | Commandes + **contrat Lebalma actif** (échéances à payer) |
| Modou Fall | `modou@example.com` | ✅ | Commandes + contrat **en attente** |
| Ibrahima Bâ | `ibrahima@example.com` | ✅ | Contrat **terminé** ; peut souscrire à Lebalma |
| Aïssatou Diop | `aissatou@example.com` | ✅ | Contrat **en défaut** |
| Fatou Sarr | `fatou@example.com` | ❌ | Client **sans KYC** (souscription Lebalma bloquée) |
| Fatou Sarr | `fatou@example.com` | ❌ | Client **sans KYC** (souscription Lebalma bloquée) |

> 🔐 Identifiants de **développement uniquement** — à changer impérativement avant toute mise en production.
> 💳 Le paiement fonctionne en **mode simulation** tant que les clés Wave / Orange Money ne sont pas configurées : le checkout redirige vers un simulateur (`/paiement/simulateur/:id`) qui confirme ou échoue le paiement.
# Cahier des Charges — Frontend (SPA React)

**Dépôt :** `cheikh-tidiane-apple-frontend`
**Rôle :** interface web de la boutique Apple (iPhone, iPad, MacBook) + financement Lebalma.
**Version :** 1.0 — 24/07/2026

> 📄 Vue d'ensemble du produit : cahier des charges à la racine du projet. Ce document couvre **uniquement le périmètre frontend**.

---

## 1. Rôle du frontend
Application **React (SPA)** consommant l'API REST du backend. Elle offre :
- une vitrine e-commerce moderne et responsive,
- la recherche et le filtrage **en temps réel**,
- le parcours d'achat complet (favoris, panier, commande),
- l'espace client et l'espace administration,
- la présentation et la simulation du financement **Lebalma**.

---

## 2. Stack technique
| Rôle | Techno |
|------|--------|
| UI | React 19 |
| Build / dev | Vite |
| Routing | React Router |
| HTTP | Axios (instance centralisée + JWT) |
| État global | Redux Toolkit (auth, panier, favoris) |
| État serveur / cache | React Query (TanStack) |
| Formulaires | React Hook Form + Yup |
| Styling | Tailwind CSS (tokens de la charte) |
| Icônes | React Icons |
| Temps réel | socket.io-client |

---

## 3. Charte graphique
| Rôle | Couleur | Token Tailwind |
|------|---------|----------------|
| Noir profond | `#111827` | `primary` |
| Blanc | `#FFFFFF` | (fond) |
| Bleu électrique | `#0A84FF` | `accent` |

Dérivés : `muted` (#6B7280), `surface` (#F9FAFB), `line` (#E5E7EB), `success`, `danger`, `warning`.
Style : minimaliste, premium, espaces généreux, coins arrondis, micro-interactions. Police **Inter**.
Classes utilitaires : `.btn-primary`, `.btn-dark`, `.btn-outline`, `.card`, `.input`, `.container-page` (voir `index.css`).

---

## 4. Structure
```
src/
  components/
    common/    SearchBar, Hero, SectionTitle, Testimonials, Newsletter
    layout/    Navbar, Footer, Layout
    ui/        Button, Badge, Loader, Rating
    product/   ProductCard, ProductGrid, ProductFilters
  pages/       Home, Products, ProductDetails, Cart, Checkout, Login,
               Register, Profile, Orders, Favorites, Search, Contact,
               Lebalma, Admin, NotFound
  routes/      AppRoutes, ProtectedRoute
  services/    api (axios), product.service, auth.service
  store/       authSlice, cartSlice, favoriteSlice, index
  context/     SocketContext
  hooks/       useDebounce
  utils/       format (formatPrice XOF, cn, formatDate)
  constants/   endpoints, catégories, tri, moyens de paiement
```

---

## 5. Fonctionnalités & écrans

### Navbar
Sticky, glassmorphism, logo, menu (Accueil, iPhone, iPad, MacBook, Lebalma, Promos), **recherche temps réel**, icônes favoris/panier (compteurs), menu compte, responsive (hamburger).

### Recherche temps réel (`SearchBar`)
Suggestions instantanées (debounce 250 ms) via React Query : miniature + nom + prix ; « Entrée » → page résultats ; message « aucun résultat ».

### Accueil (`Home`)
Hero (slider auto + manuel : nouveautés / promos / Lebalma), catégories, derniers arrivages, top des ventes, bandeau Lebalma, témoignages clients, newsletter, footer.

### Catalogue (`Products`)
Grille responsive + **filtres temps réel** (catégorie, prix max, couleur, capacité, éligible Lebalma, en stock) + tri + compteur. Debounce pour fluidité. Synchronisation avec les paramètres d'URL.

### Fiche produit (`ProductDetails`)
Galerie, sélection couleur/capacité, prix (barré si promo), ajout panier/favoris, **simulateur Lebalma** (acompte, échéances, coût total).

### Panier / Favoris / Commande
Panier persistant (localStorage + Redux), quantités, total ; favoris ; checkout (livraison + moyen de paiement : Wave, Orange Money, carte, Lebalma).

### Compte
Connexion / inscription (React Hook Form + Yup), profil, historique des commandes, favoris. Routes protégées (`ProtectedRoute`), route admin réservée au rôle admin.

### Lebalma (`Lebalma`)
Présentation, plans (hebdo ≥ iPhone 11 Pro, mensuel ≥ iPhone 12 Pro), étapes, éligibilité.

### Admin (`Admin`)
Tableau de bord (statistiques). Modules CRUD à développer.

---

## 6. Intégration API
- Base : `VITE_API_URL` (défaut `http://localhost:5000/api`).
- Instance Axios (`services/api.js`) : injection automatique du JWT, déconnexion sur 401.
- Temps réel : `VITE_SOCKET_URL` via `SocketContext` (rejoint la room utilisateur / admin).

---

## 7. Exigences non fonctionnelles
- **Responsive** mobile-first, **accessibilité** (labels, focus, ARIA), **performance** (lazy-loading images, cache React Query, debounce).
- SEO de base (meta, titre, lang="fr").
- Devise **FCFA (XOF)** formatée via `formatPrice`.

---

## 8. Reste à faire (voir STATUT.md)
Synchronisation panier/favoris serveur, KYC & souscription Lebalma end-to-end, redirection passerelle de paiement, modules admin CRUD, page retours, tests.

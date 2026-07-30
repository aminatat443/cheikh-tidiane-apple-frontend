# STATUT.md — Frontend

Avancement du dépôt **`cheikh-tidiane-apple-frontend`**.
**Dernière mise à jour :** 24 juillet 2026
**Phase :** 🟨 Interface fonctionnelle (UI en place, à connecter/compléter côté métier)

Légende : ⬜ à faire · 🟨 en cours · ✅ terminé · 🧪 en test · ⛔ bloqué

---

## Fondations
| Élément | Statut |
|---------|--------|
| Setup Vite + React 19 | ✅ |
| Tailwind + tokens de la charte | ✅ |
| Alias `@`, structure de dossiers | ✅ |
| Store Redux (auth, cart, favorites) | ✅ |
| Axios (JWT, 401) | ✅ |
| React Query (provider) | ✅ |
| Socket.IO (context) | ✅ |
| Routing + routes protégées + admin | ✅ |
| ESLint config | ✅ |

## Layout & vitrine
| Élément | Statut |
|---------|--------|
| Navbar (sticky, compteurs, menu compte, responsive) | ✅ |
| Recherche temps réel (suggestions) | ✅ |
| Hero slider (auto + manuel) | ✅ |
| Footer | ✅ |
| Section catégories | ✅ |
| Derniers arrivages | ✅ |
| Top des ventes | ✅ |
| Bandeau Lebalma | ✅ |
| Témoignages clients | ✅ (données statiques — à brancher API) |
| Newsletter | 🟨 UI OK, ⬜ appel API |

## Catalogue & produit
| Élément | Statut |
|---------|--------|
| Grille produits (ProductGrid/Card) | ✅ |
| Filtres temps réel (catégorie, prix, couleur, capacité, Lebalma, stock) | ✅ |
| Tri | ✅ |
| Page détail produit (galerie, variantes) | ✅ |
| Simulateur Lebalma (fiche produit) | ✅ |
| Avis produit (affichage/ajout) | ⬜ |
| Galerie multi-images + zoom | 🟨 image principale seulement |

## E-commerce
| Élément | Statut |
|---------|--------|
| Favoris (toggle, page, persistance) | ✅ (local) · 🟨 sync serveur |
| Panier (ajout, quantités, total, persistance) | ✅ (local) · 🟨 sync serveur |
| Checkout (livraison + paiement) | ✅ création commande · 🟨 redirection passerelle |
| Page de confirmation | ⬜ |

## Compte
| Élément | Statut |
|---------|--------|
| Connexion (RHF + Yup) | ✅ |
| Inscription (RHF + Yup) | ✅ |
| Restauration de session (fetchMe) | ✅ |
| Profil | ✅ (lecture) · ⬜ édition |
| Historique commandes | ✅ |
| Espace Lebalma (contrats/échéances) | ⬜ |
| Gestion des retours | ⬜ |

## Lebalma
| Élément | Statut |
|---------|--------|
| Page présentation + plans + étapes | ✅ |
| Simulateur (fiche produit) | ✅ |
| Souscription + KYC (UI) | ⬜ |
| Suivi échéancier + paiement échéance | ⬜ |

## Admin
| Élément | Statut |
|---------|--------|
| Tableau de bord (stats) | ✅ |
| CRUD produits / catégories | ⬜ |
| Gestion commandes / clients | ⬜ |
| Gestion promotions / contenu | ⬜ |

## Qualité
| Élément | Statut |
|---------|--------|
| Responsive | ✅ |
| Accessibilité de base | 🟨 |
| Tests | ⬜ |
| SEO avancé (OG, schema) | ⬜ |

---

## Journal
| Date | Élément |
|------|---------|
| 2026-07-24 | Scaffold complet : layout, vitrine, catalogue + filtres temps réel, panier/favoris, auth, checkout, Lebalma, admin dashboard + docs |

# 📊 DESCRIPTIF DES FONCTIONNALITÉS ET MATRICE DE SUIVI DU STATUT — SNAPCONNECT

---

**Projet :** SnapConnect (Marketplace pour Créateurs Smartphone)  
**Document de Référence :** Suivi en temps réel de l'état d'avancement des fonctionnalités  
**Dernière actualisation :** Août 2026  

---

## 📈 TABLEAU DE BORD D'AVANCEMENT GLOBAL

| Module | Fonctionnalités Totales | ✅ Terminées | ⏳ En Cours | 📋 Planifiées | Taux de Complétion |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Socle & Design System** | 6 | 6 | 0 | 0 | **100%** |
| **2. Pages Publiques & Vitrine** | 7 | 7 | 0 | 0 | **100%** |
| **3. Authentification & Profils** | 6 | 6 | 0 | 0 | **100%** |
| **4. Marketplace & Recherche** | 6 | 6 | 0 | 0 | **100%** |
| **5. Modèle A (Job Briefs)** | 5 | 5 | 0 | 0 | **100%** |
| **6. Modèle B (Services/Packages)** | 5 | 5 | 0 | 0 | **100%** |
| **7. Espace Client (Client Area)** | 6 | 6 | 0 | 0 | **100%** |
| **8. Espace Créateur (Creator Studio)** | 7 | 7 | 0 | 0 | **100%** |
| **9. Contrat Unique & Escrow** | 6 | 6 | 0 | 0 | **100%** |
| **10. Messagerie & Notifications** | 4 | 4 | 0 | 0 | **100%** |
| **11. Espace Administrateur** | 6 | 2 | 2 | 2 | **50%** |
| **TOTAL GÉNÉRAL** | **64** | **57** | **2** | **5** | **90%** |

---

## 📑 MATRICE DÉTAILLÉE DES FONCTIONNALITÉS

> **Légende des Statuts :**  
> - `[✅ TERMINÉ]` : Fonctionnalité entièrement développée, intégrée et fonctionnelle dans l'interface.  
> - `[⏳ EN COURS]` : Fonctionnalité en phase active de travail/raffinage.  
> - `[📋 PLANIFIÉ]` : Fonctionnalité conçue au niveau architectural, prévue pour les prochaines étapes.

---

### 1. 🎨 SOCLE TECHNIQUE & DESIGN SYSTEM

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **SYS-01** | Design Tokens Pure CSS | Variables globales pour couleurs (violet `#8b5cf6`, rose `#ec4899`), typographie Outfit, espacements, ombres et glassmorphism | Tous | `[✅ TERMINÉ]` | `src/styles.css` |
| **SYS-02** | Configuration Angular 19 | Support Standalone Components avec `inlineStyleLanguage: "css"` sans dépendance SCSS | Tous | `[✅ TERMINÉ]` | `angular.json` |
| **SYS-03** | Modèles du Domaine | Définition des 18 interfaces TypeScript métier | Tous | `[✅ TERMINÉ]` | `src/app/core/models/*.ts` |
| **SYS-04** | Services Signals Réactifs | 20 services gérant l'état applicatif avec Signaux Angular et données mockées | Tous | `[✅ TERMINÉ]` | `src/app/core/services/*.ts` |
| **SYS-05** | Guards d'accès | Protection des routes par rôle (`authGuard`, `roleGuard`, `adminGuard`, `guestGuard`) | Tous | `[✅ TERMINÉ]` | `src/app/core/guards/*.ts` |
| **SYS-06** | Intercepteur JWT | Injection automatique des en-têtes Authorization Bearer sur requêtes HTTP | Authentifié | `[✅ TERMINÉ]` | `src/app/core/interceptors/jwt.interceptor.ts` |

---

### 2. 🌐 PAGES PUBLIQUES & VITRINE

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **PUB-01** | Hero Section Dynamique | Titre dégradé animé, sélecteur de recherche à 3 modes (*Créateurs*, *Services*, *Jobs*), chips populaires | Public | `[✅ TERMINÉ]` | `src/app/features/public/landing/landing.component.ts` |
| **PUB-02** | Mock-up Smartphone Hero | Aperçu visuel 4K ProRes avec badges flottants animés (*70% plus rapide*, *Escrow 100%*) | Public | `[✅ TERMINÉ]` | `src/app/features/public/landing/landing.component.ts` |
| **PUB-03** | Comparatif Agence vs Smartphone | Tableau interactif mettant en avant les avantages ROI, rapidité et format 9:16 | Public | `[✅ TERMINÉ]` | `src/app/features/public/landing/landing.component.ts` |
| **PUB-04** | Page Processus "How It Works" | Guide visuel pas-à-pas expliquant le Modèle A (Jobs) et le Modèle B (Services) | Public | `[✅ TERMINÉ]` | `src/app/features/public/how-it-works/how-it-works.component.ts` |
| **PUB-05** | Répertoire des Catégories | Grille complète des 8 spécialités de contenu mobile avec statistiques | Public | `[✅ TERMINÉ]` | `src/app/features/public/categories/categories.component.ts` |
| **PUB-06** | Page À Propos & Vision | Présentation de la mission SnapConnect et de la révolution vidéo mobile | Public | `[✅ TERMINÉ]` | `src/app/features/public/about/about.component.ts` |
| **PUB-07** | Pages FAQ & Légal | Centre d'aide interactif, page de contact, Conditions Générales et Politique de Confidentialité | Public | `[✅ TERMINÉ]` | `src/app/features/public/{help,contact,terms,privacy}/` |

---

### 3. 🔐 AUTHENTIFICATION & GESTION DES PROFILS

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **AUT-01** | Connexion Multi-Rôle | Formulaire de login avec validation et redirection intelligente vers le bon Dashboard | Visiteur | `[✅ TERMINÉ]` | `src/app/features/auth/login/login.component.ts` |
| **AUT-02** | Démo Logins 1-Clic | 3 boutons d'accès rapide (*Compte Client*, *Compte Créateur*, *Compte Admin*) pour tests instantanés | Visiteur | `[✅ TERMINÉ]` | `src/app/features/auth/login/login.component.ts` |
| **AUT-03** | Inscription avec Choix de Rôle | Cartes interactives permettant de choisir son profil (Client vs Créateur Mobile) | Visiteur | `[✅ TERMINÉ]` | `src/app/features/auth/register/register.component.ts` |
| **AUT-04** | Barre de Navigation Connectée | Affichage de l'avatar, prénom, badges de messages non lus, menu déroulant selon rôle | Authentifié | `[✅ TERMINÉ]` | `src/app/shared/components/navbar/navbar.component.ts` |
| **AUT-05** | Déconnexion Sécurisée | Nettoyage du token JWT, réinitialisation de l'état Auth et redirection vers l'accueil | Authentifié | `[✅ TERMINÉ]` | `src/app/core/services/auth.service.ts` |
| **AUT-06** | Page Paramètres & Profil | Mise à jour des informations personnelles et spécifications du smartphone | Authentifié | `[✅ TERMINÉ]` | `src/app/features/shared-features/settings/settings.component.ts` |

---

### 4. 🔍 MARKETPLACE & RECHERCHE UNIFIÉE

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **MKT-01** | Annuaire des Créateurs | Recherche en direct par nom, compétences et modèle de smartphone (iPhone 16 Pro, S24...) | Tous | `[✅ TERMINÉ]` | `src/app/features/marketplace/creators/creator-list/creator-list.component.ts` |
| **MKT-02** | Profil Créateur Détaillé | Présentation avec avatar vérifié, note moyenne, tarif horaire et indicateur de disponibilité | Tous | `[✅ TERMINÉ]` | `src/app/features/marketplace/creators/creator-profile/creator-profile.component.ts` |
| **MKT-03** | Sidebar "Studio Mobile" | Fiche détaillée du matériel vérifié (Smartphone, Gimbal, Micro, Éclairage) | Tous | `[✅ TERMINÉ]` | `src/app/features/marketplace/creators/creator-profile/creator-profile.component.ts` |
| **MKT-04** | Lecteur Lightbox Média | Modale de prévisualisation plein écran pour vidéos 4K verticales et photos haute résolution | Tous | `[✅ TERMINÉ]` | `src/app/shared/components/media-modal/media-modal.component.ts` |
| **MKT-05** | Filtres Avancés par Catégorie | Sélecteur instantané par niche (Reels & TikTok, Food & Resto, Real Estate, UGC...) | Tous | `[✅ TERMINÉ]` | `src/app/shared/components/category-card/category-card.component.ts` |
| **MKT-06** | Système de Tri | Tri par note la plus élevée (★), missions complétées et tarifs | Tous | `[✅ TERMINÉ]` | `src/app/features/marketplace/creators/creator-list/creator-list.component.ts` |

---

### 5. 💼 MODÈLE A : JOB BOARD (BRIEFS CLIENTS)

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **JOB-01** | Publication de Brief Mobile | Formulaire complet de création de job avec critère obligatoire de matériel smartphone requis | Client | `[✅ TERMINÉ]` | `src/app/features/client/jobs/job-create/job-create.component.ts` |
| **JOB-02** | Sélection du Type de Budget | Choix entre Prix Fixe du Projet ou Tarif Horaire (min/max $/h) | Client | `[✅ TERMINÉ]` | `src/app/features/client/jobs/job-create/job-create.component.ts` |
| **JOB-03** | Catalogue des Missions (Job Board) | Liste des opportunités ouvertes avec badges de matériel, lieu (sur place ou à distance) | Créateur | `[✅ TERMINÉ]` | `src/app/features/marketplace/jobs/job-list/job-list.component.ts` |
| **JOB-04** | Fiche Détaillée de la Mission | Consultation du brief complet, de l'historique du client et des compétences requises | Créateur | `[✅ TERMINÉ]` | `src/app/features/marketplace/jobs/job-detail/job-detail.component.ts` |
| **JOB-05** | Soumission de Proposition | Modale de candidature permettant au créateur de spécifier son tarif, son délai et son setup mobile | Créateur | `[✅ TERMINÉ]` | `src/app/features/marketplace/jobs/job-detail/job-detail.component.ts` |

---

### 6. ⚡ MODÈLE B : PACKAGES SERVICES CRÉATEURS

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **SRV-01** | Catalogue des Packages Mobiles | Grille des prestations prêtes à l'achat avec filtre par délai de livraison (24h, 48h, 72h) | Client | `[✅ TERMINÉ]` | `src/app/features/marketplace/services/service-list/service-list.component.ts` |
| **SRV-02** | Fiche Service avec Formules 3-Tiers | Sélecteur interactif d'options (*Basic*, *Standard*, *Premium*) avec mise à jour du prix et des livrables | Client | `[✅ TERMINÉ]` | `src/app/features/marketplace/services/service-detail/service-detail.component.ts` |
| **SRV-03** | Commande Directe de Service | Déclenchement de la création du contrat et blocage des fonds en séquestre | Client | `[✅ TERMINÉ]` | `src/app/features/marketplace/services/service-detail/service-detail.component.ts` |
| **SRV-04** | Création de Package par le Créateur | Formulaire permettant à un créateur de définir son offre, son tarif et ses livrables | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/services/service-create/service-create.component.ts` |
| **SRV-05** | FAQ Intégrée au Service | Accordéon de questions fréquentes sur le matériel smartphone et les retouches | Client | `[✅ TERMINÉ]` | `src/app/features/marketplace/services/service-detail/service-detail.component.ts` |

---

### 7. 👤 ESPACE CLIENT (CLIENT AREA)

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **CLI-01** | Dashboard Synthétique Client | Indicateurs clés : briefs actifs, propositions reçues, contrats en cours, total investi | Client | `[✅ TERMINÉ]` | `src/app/features/client/dashboard/dashboard.component.ts` |
| **CLI-02** | Suivi des Contrats en Cours | Vue rapide des tournages en production avec alertes de délais et créateurs assignés | Client | `[✅ TERMINÉ]` | `src/app/features/client/dashboard/dashboard.component.ts` |
| **CLI-03** | Raccourcis d'Action Client | Liens rapides pour poster un brief, voir les messages, explorer de nouveaux créateurs | Client | `[✅ TERMINÉ]` | `src/app/features/client/dashboard/dashboard.component.ts` |
| **CLI-04** | Gestion des Favoris | Sauvegarde et consultation des créateurs smartphone favoris pour futurs projets | Client | `[✅ TERMINÉ]` | `src/app/features/client/favorites/favorites.component.ts` |
| **CLI-05** | Gestion des Missions Publiées | Liste et suivi des briefs ouverts créés par le client | Client | `[✅ TERMINÉ]` | `src/app/features/client/jobs/client-jobs/client-jobs.component.ts` |
| **CLI-06** | Revue des Propositions Reçues | Évaluation et sélection des propositions de créateurs pour une mission | Client | `[✅ TERMINÉ]` | `src/app/features/client/jobs/job-proposals/job-proposals.component.ts` |

---

### 8. 📱 ESPACE CRÉATEUR (CREATOR STUDIO)

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **CRE-01** | Dashboard Studio Créateur | Suivi des gains du mois ($), commandes en cours, note moyenne et smartphone vérifié | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/dashboard/dashboard.component.ts` |
| **CRE-02** | Commandes à Tourner & Livrer | Liste des contrats actifs avec compte à rebours de livraison et montant du gain | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/dashboard/dashboard.component.ts` |
| **CRE-03** | Gestionnaire de Portfolio | Interface d'ajout et suppression de photos/vidéos avec association du smartphone utilisé | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/portfolio/portfolio.component.ts` |
| **CRE-04** | Dépôt des Livrables 4K | Modale d'envoi des liens ou fichiers finaux pour validation client | Créateur | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |
| **CRE-05** | Suivi des Propositions Soumises | Tableau de bord des devis envoyés et de leur statut d'acceptation | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/proposals/proposals.component.ts` |
| **CRE-06** | Gestion des Services Créateur | Visualisation et modification des packages de services en ligne | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/services/creator-services/creator-services.component.ts` |
| **CRE-07** | Espace Gains & Payouts | Historique des paiements reçus et solde disponible | Créateur | `[✅ TERMINÉ]` | `src/app/features/creator/earnings/earnings.component.ts` |

---

### 9. 🔒 CONTRAT UNIQUE & SYSTÈME DE SÉQUESTRE (ESCROW)

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **CTR-01** | Vue Contrat Universelle (AD01) | Espace de travail unique gérant à la fois les contrats issus de Jobs (A) et de Services (B) | Client / Créateur | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |
| **CTR-02** | Affichage du Séquestre Financier | Bloc visuel indiquant le montant sécurisé en Escrow jusqu'à validation | Client / Créateur | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |
| **CTR-03** | Espace de Dépôt de Fichiers | Visualisation des fichiers vidéo 4K ProRes et photos livrés par le créateur | Client / Créateur | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |
| **CTR-04** | Prévisualisation Vidéo 4K | Lecteur intégré pour vérifier la conformité du format vertical 9:16 et du cadrage | Client | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |
| **CTR-05** | Approbation & Déblocage des Fonds | Bouton client déclenchant la libération immédiate de la somme vers le créateur | Client | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |
| **CTR-06** | Demande de Retouches | Formulaire de demande de modifications avec décompte des révisions restantes | Client | `[✅ TERMINÉ]` | `src/app/features/shared-features/contract-detail/contract-detail.component.ts` |

---

### 10. 💬 MESSAGERIE INSTANTANÉE & NOTIFICATIONS

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **MSG-01** | Salon de Discussion Dédié | Interface de messagerie avec bulles de conversation, historique et saisie intuitive | Authentifié | `[✅ TERMINÉ]` | `src/app/features/shared-features/messages/messages.component.ts` |
| **MSG-02** | Header de Contexte Mobile | Affichage dans le chat du modèle de smartphone et du statut en ligne de l'interlocuteur | Authentifié | `[✅ TERMINÉ]` | `src/app/features/shared-features/messages/messages.component.ts` |
| **NTF-01** | Centre de Notifications | Flux d'alertes en temps réel pour nouveaux livrables, messages et étapes d'escrow | Authentifié | `[✅ TERMINÉ]` | `src/app/features/shared-features/notifications/notifications.component.ts` |
| **NTF-02** | Badges Live sur la Navbar | Pastille de décompte dynamique sur l'icône de cloche et de messages | Authentifié | `[✅ TERMINÉ]` | `src/app/shared/components/navbar/navbar.component.ts` |

---

### 11. 🛡️ ESPACE ADMINISTRATION & MODÉRATION

| Code | Fonctionnalité | Description | Rôle Cible | Statut | Fichier(s) Source |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **ADM-01** | Dashboard Administrateur | Statistiques globales de la plateforme (utilisateurs, volume d'escrow, litiges) | Admin | `[✅ TERMINÉ]` | `src/app/features/admin/dashboard/dashboard.component.ts` |
| **ADM-02** | Gestion des Utilisateurs | Liste, vérification des badges créateurs et gestion des statuts de compte | Admin | `[⏳ EN COURS]` | `src/app/features/admin/users/admin-users/admin-users.component.ts` |
| **ADM-03** | Modération des Jobs & Services | Validation de conformité des annonces publiées | Admin | `[⏳ EN COURS]` | `src/app/features/admin/admin-jobs/admin-jobs.component.ts` |
| **ADM-04** | Gestion des Litiges (Disputes) | Interface d'arbitrage pour débloquer ou rembourser un séquestre contesté | Admin | `[📋 PLANIFIÉ]` | `src/app/features/admin/admin-contracts/admin-contracts.component.ts` |
| **ADM-05** | Journal des Paiements & Commissions | Suivi des transactions et des commissions de plateforme | Admin | `[📋 PLANIFIÉ]` | `src/app/features/admin/admin-payments/admin-payments.component.ts` |
| **ADM-06** | Configuration des Catégories | Ajout, modification et suppression de niches de contenu mobile | Admin | `[📋 PLANIFIÉ]` | `src/app/features/admin/admin-categories/admin-categories.component.ts` |

---

## 📌 HISTORIQUE DES MISES À JOUR DU STATUT

| Date | Fonctionnalité(s) Modifiée(s) | Ancien Statut | Nouveau Statut | Commentaires |
| :--- | :--- | :---: | :---: | :--- |
| **16/08/2026** | **Phase 7 Recommandation & Matching Transparent** | `[EN COURS]` | `[✅ TERMINÉ]` | Composant de match algorithmique (`RecommendationMatchComponent`), explications transparentes (+35% matériel iPhone/Galaxy, +30% catégorie, +20% délais, +15% réputation), intégration profils créateurs (`/creators/:id`) et dashboard client (`/client/dashboard`) entièrement développés. |
| **16/08/2026** | **Phase 6 Plans d'Abonnement & Monétisation SaaS** | `[EN COURS]` | `[✅ TERMINÉ]` | Formules d'abonnement créateur (`/creator/subscription`, commission réduite de 12% à 5%, toggle annuel -20%), plans entreprises client (`/client/subscription`), routes associées et gestion des niveaux dans `SubscriptionService` entièrement développés. |
| **16/08/2026** | **Phase 5 Évaluation Bilatérale & Réputation Multi-Critères** | `[EN COURS]` | `[✅ TERMINÉ]` | Modale d'évaluation bilatérale (`ReviewModalComponent`), critères qualité vidéo 4K, délais, communication et maîtrise matériel smartphone, intégration contrat post-livraison (`/client/contracts/:id`), console modération des reviews (`/admin/reviews`) et calcul d'index réputation dans `ReputationService` entièrement développés. |
| **14/08/2026** | **Phase 4 Module Litiges & Console d'Arbitrage Admin** | `[EN COURS]` | `[✅ TERMINÉ]` | Console d'arbitrage des litiges (`/admin/contracts`), timeline probatoire, sentences financières (`FULL_REFUND_CLIENT`, `FULL_PAYMENT_CREATOR`, `PARTIAL_SPLIT`), supervision globale (`/admin/dashboard`), gestion des badges matériels (`/admin/users`), modération briefs (`/admin/jobs`), services (`/admin/services`), grand livre des commissions (`/admin/payments`), signalements (`/admin/reports`) et catégories (`/admin/categories`) entièrement développés. |
| **14/08/2026** | **Phase 3 Creator Studio & Earnings UI** | `[EN COURS]` | `[✅ TERMINÉ]` | Portefeuille créateur et retraits bancaires (`/creator/earnings`), gestion des services (`/creator/services`), devis soumis (`/creator/proposals`), contrats créateurs (`/creator/contracts`) et éditeur de profil & matériel mobile (`/creator/profile`) entièrement développés. |
| **14/08/2026** | **Phase 2 Client Escrow & Wallet UI** | `[EN COURS]` | `[✅ TERMINÉ]` | Portefeuille client (`/client/payments`), Stepper Escrow & Double Confirmation (`/client/contracts/:id`), gestion des briefs (`/client/jobs`), propositions créateurs (`/client/jobs/:id/proposals`), commandes (`/client/orders`), contrats (`/client/contracts`) et profil client (`/client/profile`) entièrement développés. |
| **14/08/2026** | **Phase 1 Système Financier Sécurisé** | `[EN COURS]` | `[✅ TERMINÉ]` | Modèles `wallet`, `dispute`, `reputation`, `subscription`, `recommendation`, 5 services réactifs Signals, `EscrowStepperComponent` et `CreatorBadgeComponent` créés et vérifiés avec 0 erreur. |
| **14/08/2026** | **Architecture Transaction Sécurisée (`AD03`)** | `[EN COURS]` | `[✅ CONÇU & VALIDÉ]` | Conception et documentation complète du système d'Escrow, Grand Livre Ledger, Litiges, Portefeuilles et Réputation dans `docs/SECURE_MARKETPLACE_ARCHITECTURE.md`. |
| **14/08/2026** | **Nettoyage Architecture CSS (`SYS-01`, `SYS-02`)** | `[EN COURS]` | `[✅ TERMINÉ]` | Suppression définitive de tous les fichiers résiduels `.scss` (`app.component.scss`, `styles/*.scss`) pour garantir 100% de conformité Pure CSS. |
| **14/08/2026** | **Toutes les fonctionnalités des Modules 1 à 10** | `[EN COURS]` | `[✅ TERMINÉ]` | Implémentation complète des composants Standalone Angular 19, Design System CSS pur, vérification build 0 erreur. |
| **14/08/2026** | **Landing Page (`PUB-01` à `PUB-03`)** | `[EN COURS]` | `[✅ TERMINÉ]` | Hero interactif, mock-up smartphone et comparatif agence vs smartphone livrés. |
| **14/08/2026** | **Contrat Unique (`CTR-01` à `CTR-06`)** | `[EN COURS]` | `[✅ TERMINÉ]` | Espace partagé pour Modèle A & B avec gestion de l'escrow et validation des fichiers 4K. |

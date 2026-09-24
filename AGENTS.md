# 🧠 SNAPCONNECT — FICHIER MÉMOIRE PROJET (AGENT CONTEXT)

> **Document de mémoire permanente pour l'assistant IA**  
> Ce fichier résume l'état d'avancement, l'architecture, les conventions, et les identifiants du projet SnapConnect. Il permet à l'agent de reprendre instantanément le travail sans relire tout l'historique de conversation.

---

## 📌 1. Identité du Projet
- **Nom du Projet :** SnapConnect
- **Nature :** Two-Sided Marketplace dédiée exclusivement aux Créateurs de Contenu Smartphone (iPhone 4K/ProRes, Samsung Galaxy Ultra, Pixel).
- **Rôles Utilisateurs :**
  - `CLIENT` (Entreprises, marques D2C, agences)
  - `CREATOR` (Vidéastes/Photographes mobiles)
  - `ADMIN` (Supervision, modération, litiges)

---

## ⚠️ RÈGLE FONDAMENTALE D'OR : STRICT RESPECT DU PÉRIMÈTRE UTILISATEUR
> **INTERDICTION FORMELLE DE MODIFIER QUOI QUE CE SOIT DANS L'APPLICATION SAUF CE QUE L'UTILISATEUR DEMANDE EXPRESSÉMENT.**
> - Ne JAMAIS modifier d'autres fichiers, composants, routes, services, backend Java ou base MySQL si l'utilisateur ne l'a pas explicitement demandé.
> - Suivre STRICTEMENT et UNIQUEMENT la demande formulée par l'utilisateur, étape par étape.
> - Ne jamais prendre d'initiative de « refactoring » ou de modification non sollicitée.
> - Si une cause externe est détectée (ex: backend ou base), TOUJOURS l'expliquer d'abord et attendre la validation explicite de l'utilisateur avant d'y toucher.

---

## 🚫 RÈGLE ABSOLUE DESIGN : INTERDICTION TOTALE DES EMOJIS
> **ATTENTION STRICTE :** Aucun émoji unicode (ex: 💼, 🌱, 🚀, 👑, 💡, 📍, 📱, 📷, 🎲, 💰, 📸, 🎵, 🎉) ne doit être utilisé dans l'interface utilisateur (UI). Les émojis font « cheap », enfantins et non professionnels.  
> **Toujours utiliser des icônes vectorielles SVG filaires épurées, modernes et minimalistes (style Upwork / Stripe / Linear).**

---

## 🛠️ 2. Stack Technologique & Ports
- **Frontend :** Angular 19 (Standalone Components, Signals réactifs, Pure CSS Glassmorphism avec typographie *Outfit*).
  - Port de développement : `http://localhost:4200`
  - Dossier : `frontend/snapconnect-frontend/`
- **Backend :** Spring Boot 4.0.7 / Java 17 (Spring Security, JWT JJWT, Spring Data JPA, WebSockets STOMP).
  - Port API REST : `http://localhost:8080`
  - Dossier : `backend/snapconnect-backend/`
- **Base de données :** MySQL (`jdbc:mysql://localhost:3306/snapconnect`, user: `root`).

---

## 🔑 3. Comptes Démo & Authentification
| Rôle | Email | Mot de passe par défaut |
| :--- | :--- | :--- |
| **Client** | `client@snapconnect.com` | `password123` |
| **Créateur** | `creator@snapconnect.com` | `password123` |
| **Admin (par défaut)** | `gh@gmail.com` | `123456` |
| **Admin (legacy)** | `admin@snapconnect.com` | `password123` |

---

## 🚀 4. État d'Avancement des Modules

### ✅ Module Authentification & Sécurité (100% Terminé)
- **Refonte UX / UI Login & Signup inspirée d'Upwork (Terminé à 100%)** :
  - **Étape 1 — Welcome & Choix du rôle (`/auth/register`)** :
    - Grand titre : *« Bienvenue sur SnapConnect »* et sous-titre *« Comment souhaitez-vous utiliser SnapConnect ? »*.
    - Deux grandes cartes Upwork professionnelles et épurées côte à côte :
      1. **Client** (*« Trouver des créateurs et commander du contenu »*) avec icône SVG silhouette + mallette.
      2. **Créateur** (*« Proposer mes services et gagner de l’argent »*) avec icône SVG silhouette + ordinateur/smartphone.
    - États visuels clairs aux couleurs SnapConnect : halo violet (`var(--color-primary-glow)`), bordure nette, radio-indicator.
    - Bouton CTA dynamique : *« Créer un compte Client »* ou *« Postuler en tant que Créateur »*.
    - Lien bas de page : *« Vous avez déjà un compte ? Se connecter »*.
  - **Étape 2 — Signup dédié (`/auth/register?role=...`)** :
    - Écran d'inscription séparé avec bouton de retour rapide *« ← Choisir un autre rôle »*.
    - Badge contextuel de rôle (`💼 Compte Client` ou `📱 Compte Créateur Mobile`).
    - Champs : Prénom et nom, Email, Mot de passe avec bouton œil d'affichage/masquage.
    - Checkbox obligatoire Conditions Générales et Confidentialité.
    - Bouton d'action *« Créer mon compte »*, séparateur *« ou »*, bouton Google (GIS officiel + Démo 1-clic).
    - Lien vers la connexion.
  - **Étape 3 — Login épuré (`/auth/login`)** :
    - Carte centrée aérée, typographie moderne *Outfit*, design minimaliste premium.
    - Champs Email, Mot de passe avec bascule œil et lien *« Mot de passe oublié ? »*.
    - Bouton *« Se connecter »*, séparateur *« ou »*, bouton Google, puces d'accès rapide Démo (Client, Créateur, Admin).
    - Lien *« Pas encore de compte ? Créer un compte »*.
  - **Étape 4 — OTP (`/auth/verify-email`)** :
    - Logique OTP de vérification 100% conservée pour les inscriptions email et Google.
- Connexion locale Email/Mot de passe (`/auth/login`).
- Inscription avec sélection de rôle Client/Créateur (`/auth/register`) :
  - Case à cocher obligatoire : *« J'accepte les Conditions générales d'utilisation et la Politique de confidentialité »* avec blocage et message d'erreur si non cochée.
- **Vérification d'email par code OTP** (`/auth/verify-email?email=...`) :
  - Génération de code à 6 chiffres avec validité 15 min via `EmailVerificationOtp` JPA.
  - Transmission transparente du `testOtp` en query params lors de l'inscription pour auto-remplissage en mode démo.
  - Support du code universel développeur `123456` pour fluidifier les tests d'évaluation.
  - Saisie interactive des 6 cases OTP (focus auto, navigation retour, synchronisation DOM native et copier-coller).
  - Bouton de renvoi de code avec compte à rebours 60 secondes.
  - Activation automatique du compte (`user.verified = true`), émission du JWT et redirection automatique vers `/onboarding/creator` (Créateur) ou Dashboard (Client).
  - Endpoints REST : `/api/auth/register`, `/api/auth/verify-otp`, `/api/auth/resend-otp`.
- **Connexion & Inscription Google OAuth 2.0** (GIS `google.accounts.id` + vérification token backend) :
  - **Vérification OTP obligatoire pour toutes les inscriptions, y compris avec Google** :
    - Après l'authentification Google (réelle via GIS ou bouton Démo), un compte est créé avec `verified = false`.
    - Un code OTP à 6 chiffres est généré, stocké en base (`EmailVerificationOtp`, validité 15 min), loggué dans la console (`📧 GOOGLE SIGNUP/LOGIN OTP FOR...`), et transmis pour le mode démo (`testOtp`).
    - Redirection automatique vers `/auth/verify-email?email=...&testOtp=...`.
    - Le compte n'est considéré comme vérifié (`user.verified = true`) qu'après validation du code OTP via `/api/auth/verify-otp`.
    - Une fois vérifié, les connexions ultérieures avec Google accèdent directement sans re-demander l'OTP.
  - **Photo de profil Google & Contournement Referrer Policy** :
    - La photo de profil Gmail (`claims.picture`) est extraite directement du token JWT côté frontend (`google-auth.service.ts`) et backend (`GoogleTokenVerifierService`), puis persistée dans `users.avatar_url` (taille étendue à 1000 caractères).
    - L'attribut `referrerpolicy="no-referrer"` est requis sur les balises `<img>` (Navbar, Dashboards) pour empêcher les serveurs CDN de Google (`lh3.googleusercontent.com`) de bloquer l'affichage avec une erreur 403 Forbidden sur `localhost`.
  - Le parcours local Email/Mot de passe avec OTP reste 100% opérationnel et inchangé.
- **Mot de passe oublié** (`/auth/forgot-password`) :
  - Formulaire de demande avec validation d'email et puces de test démo.
  - Génération de token sécurisé JPA `PasswordResetToken` (validité 1 heure).
  - Bouton d'accès direct démo/développeur.
- **Réinitialisation de mot de passe** (`/auth/reset-password?token=...`) :
  - Vérification de la validité du token côté backend et frontend.
  - Jauge dynamique de force du mot de passe (*Faible / Moyen / Bon / Très fort*).
  - Confirmation du mot de passe en temps réel.
  - Redirection automatique vers `/auth/login`.
- **Onboarding Freelancer / Créateur « Complétez votre profil » (`/onboarding/creator`) — Refonte Intégrale en Wizard Multi-Étapes Inspiré d'Upwork (100% Terminé)** :
  - Déclenché automatiquement après la vérification OTP pour le rôle `CREATOR`.
  - **Barre de progression dynamique & Stepper interactif** (5 étapes, 0% à 100%) avec calcul en temps réel, indicateurs numérotés et navigation fluide (`← Précédent`, `Suivant : Étape X →`, `Passer pour le moment`).
  - **Les 5 Étapes Upwork Adaptées à SnapConnect :**
    1. *Étape 1 : Titre & Niveau d'expérience* : Titre professionnel avec suggestions rapides + 3 cartes Upwork interactives (Débutant, Intermédiaire, Expert).
    2. *Étape 2 : Compétences clés Smartphone (Skills)* : Nuage de tags sélectionnables en 1 clic (4K 60fps, Format 9:16 Reels/TikTok, CapCut Pro, UGC, Étalonnage ProRes Log...) + tags personnalisés et compteur dynamique.
    3. *Étape 3 : Bio & Langues* : Textarea spacieux avec compteur (0/500), modèles d'inspiration rapides et sélection des langues (Arabe/Derja tunisienne maternelle, Français bilingue, Anglais).
    4. *Étape 4 : Localisation Tunisie & Matériel Certifié* : Autocomplétion géographique 100% Tunisie sur les 24 gouvernorats (`TunisiaLocationService`) + champ de saisie libre du smartphone avec suggestions populaires (iPhone 16 Pro Max, iPhone 15 Pro, S24 Ultra, Pixel, Xiaomi, OnePlus...) et accessoires (Gimbal, Micro HF sans fil, LED).
    5. *Étape 5 : Photo de profil, Tarifs en Dinars (DT) & Liens Réseaux* : Upload photo avec compression Canvas automatique, calculateur de tarifs transparents (Taux horaire DT/h, commission SnapConnect, net créateur, tarif journalier DT) et pseudos Instagram/TikTok.
  - **Gestion Stricte de la Photo de Profil (Zéro Fausse Photo / Unsplash)** :
    - Élimination intégrale de toute photo placeholder par défaut (ex: jeune femme Unsplash).
    - Si l'utilisateur n'importe pas de photo, l'avatar reste strictement **vide** avec une silhouette vectorielle SVG neutre.
    - Seule la vraie photo importée par l'utilisateur (ou issue de Google OAuth) est enregistrée et affichée dans le profil public (`/creators/:id`), le dashboard (`/creator/dashboard`) et l'édition de profil.
    - Résolution de la priorité dans la vue publique du créateur : le créateur connecté n'est plus jamais écrasé par les profils mock démo.
    - *Séparation totale des profils* : Élimination intégrale de toute clé globale partagée. Chaque profil est rattaché exclusivement au `userId` de l'utilisateur connecté en base MySQL (`users.title`, `bio`, `location`, `smartphone_model`, `daily_rate`, `hourly_rate`, `onboarded`) et exposé via les endpoints sécurisés `/api/users/me` et `/api/users/profile`.
    - *« Finaliser & Accéder au Dashboard »* : Validation, sauvegarde persistante dans MySQL via `auth.updateProfile(...)`, cache local scopé par utilisateur (`snapconnect_creator_profile_${userId}`) et redirection vers `/creator/dashboard`.
    - *« Passer pour le moment »* : Sauvegarde des valeurs initiales et redirection fluide.
    - *Déconnexion* : Purge automatique de tous les caches utilisateurs à la déconnexion pour garantir l'isolation complète des profils.

- **Persistance Définitive du Rôle Utilisateur (CLIENT vs CRÉATEUR) à l'Inscription & Reconnexion (100% Corrigé)** :
  - **Résolution du bug critique où un créateur (ex. hedifreelance) devenait CLIENT après reconnexion** :
    - *Cause racine 1 (Backend JPA)* : `User.java` utilisait des types primitifs `boolean` pour `onboarded`, `verified`, `active`. Si la base contenait des valeurs `NULL` pour des utilisateurs créés antérieurement, Hibernate levait une `PropertyAccessException`, provoquant une erreur HTTP 500/400. Remplacement par des objets `Boolean` avec accesseurs sûrs (`isOnboarded()`, `isActive()`, `isVerified()`) et migration SQL `UPDATE snapconnect.users SET onboarded = FALSE WHERE onboarded IS NULL;`.
    - *Cause racine 2 (Frontend catchError)* : `AuthService.login` interceptait aveuglément les erreurs HTTP et renvoyait un utilisateur mock dont le rôle était déduit par simple test de sous-chaîne `email.includes('creator') ? 'CREATOR' : 'CLIENT'`. Ainsi, tout email ne contenant pas le mot anglais "creator" (ex. `hedifreel@gmail.com`) était arbitrairement écrasé en `CLIENT`.
    - *Propagation normale des erreurs HTTP métier* : Les erreurs 400/401 légitimes (ex. mot de passe incorrect) sont désormais propagées fidèlement au composant de connexion sans écraser la session.
    - *Registre persistant de rôle* : Introduction de `ROLE_REGISTRY_KEY` (`snapconnect_user_role_{email}`) stockant et préservant le rôle dès l'inscription (`auth.register`), la vérification OTP (`auth.verifyOtp`) et les connexions Google.
    - *Synchronisation automatique MySQL sur démarrage* : Dès le chargement de l'application, si un token JWT existe, `AuthService` appelle `fetchMyProfile()` (`GET /api/users/me`) pour réconcilier instantanément le rôle en direct depuis MySQL.
    - *JJWT 0.12.6* : Mise à niveau de `JwtService.java` avec la syntaxe moderne `.claim("role", role).claim("userId", userId).subject(email)` pour éviter que l'appel `.claims()` n'écrase le sujet du token.

### ✅ Socle & Compilation Zero-Error (100% Terminé)
- Correction et alignement des modèles et services (`job.service.ts`, `proposal.service.ts`, `creator.service.ts`, `job.model.ts`, `creator.model.ts`, `portfolio.model.ts`).
- `npx tsc --noEmit` & `npm run build` passent à **100% avec 0 erreur**.
- Support complet des alias fonctionnels et types de données métier.

### 🔄 Feuille de Route Upwork-Like (100% Terminée) :
1. **Étape 1 (✅ Terminé) :** Assainissement du code et 0 erreur de build (`tsc` & `ng build`).
2. **Étape 2 (✅ Terminé) :** Flux complet Job Board (Publication brief client `/client/jobs/create` ➔ Affichage dynamique `/jobs` avec badge dynamique « Proposition envoyée » sur les cartes si déjà postulé ➔ Dépôt de proposition créateur `/jobs/:id` avec détection automatique Upwork-like si le créateur connecté a déjà postulé : bascule immédiate en carte « Candidature soumise » avec récapitulatif offre/délai/statut/date, bouton « Consulter mes propositions », blocage strict des doublons dans le composant, dans `ProposalService.submit()` et dans le backend Spring Boot `ProposalController` via `existsByJobIdAndCreatorId`, garantissant l'unicité stricte par créateur et par mission ➔ Gestion des propositions client `/client/jobs/:id/proposals` ➔ Embauche et création de contrat avec séquestre `/client/contracts/:id`).
3. **Étape 3 (✅ Terminé) :** Contrat unique & Séquestre Escrow (Validation des livrables 4K, libération des fonds vers wallet créateur `/creator/earnings`, avis double et notation réciproque).
4. **Étape 4 (✅ Terminé) :** Project Catalog (Gestion des packages créateur `/creator/services`, consultation du catalogue public `/services`, sélection des paliers BASIC/STANDARD/PREMIUM, commande directe et création automatique de contrat avec séquestre `/client/orders`).
5. **Étape 5 (✅ Terminé) :** Synchronisation MySQL & backend Spring Boot (Entités JPA `JobPost`, `Proposal`, `GigService`, `GigPackage`, `ContractEntity`, `ReviewEntity`, `WalletEntity`, `TransactionEntity`, Repositories et Contrôleurs REST `/api/jobs`, `/api/proposals`, `/api/services`, `/api/contracts`, `/api/wallets`, `/api/reviews`).

### ✅ Module Contrats & Escrow Séquestre (100% Terminé)
- Contrat unique unifié (`/contracts/:id`).
- Jalons (Milestones), validation des livrables 4K, libération des fonds séquestrés.

### ✅ Module Messagerie & Temps Réel (100% Terminé)
- Messagerie en temps réel WebSocket SockJS/STOMP (`/messages`).
- Historique des conversations et notifications.

### ✅ Espaces Utilisateurs (100% Terminé)
- Dashboard Client (`/client/dashboard`), gestion des briefs et favoris.
- **Dashboard Créateur (`/creator/dashboard`) — Refonte Intégrale Inspirée d'Upwork Workspace (100% Terminé)** :
  - **Header Supérieur Profil Upwork & Widget Visibilité Officiel** :
    - Avatar circulaire avec voyant d'activité vert `🟢` en haut à gauche et bouton d'édition crayon vert en bas à droite (changement instantané de photo de profil avec persistance MySQL et localStorage).
    - Nom du créateur (`displayName`), badge de vérification d'identité (`✔ Verify your identity` / `Identité vérifiée`), et localisation avec calcul dynamique de l'heure locale en temps réel (`📍 Fernana, Tunisia – 12:50 pm local time`).
    - **Bloc Officiel Upwork Profile Visibility (Remplacement de See public view)** :
      - Affichage du statut de visibilité en 1 clic : **Profile Visibility: Public** (ou *SnapConnect Users Only*, ou *Private*) avec crayon d'édition SVG filaire.
      - **Modale officielle « Edit Profile Visibility »** (conforme pixel-perfect à Upwork) :
        1. **Public** : Visible par tout le monde et référencé sur les moteurs de recherche.
        2. **SnapConnect Users Only** : Visible exclusivement par les utilisateurs connectés.
        3. **Private** : Masqué des recherches, accessible uniquement via lien direct.
      - Bouton plein vert Upwork *« Save »*, bouton *« Cancel »*, et sauvegarde persistante scopée par utilisateur (`snapconnect_profile_visibility_${userId}`).
    - **Complete your profile** : Jauge dynamique d'avancement avec pourcentage en temps réel (ex: 40%).
    - Boutons d'action supérieurs droits : **« Profile settings »** (vers `/creator/profile`) et **« Share ↗ »** (copie automatique du lien de partage).
  - **Architecture en Deux Colonnes Upwork** :
    - **Sidebar Gauche (Upwork Controls)** :
      - *Promote with ads* : Boîtier bleu marine avec bascules et boutons crayons d'édition pour *« Open for work »* (`Disponible (Full-time)` vs `Off`) et *« Boost your profile »* (`Activé (Top visibilité)` vs `Off`).
      - *Connects* : Affichage du solde de crédits (`Connects: 24`), lien *« View details »* et bouton interactif *« Buy Connects »* avec modale de recharge de packs (10, 25, 60 Connects).
      - *Video introduction* : Carte vidéo smartphone avec bouton `(+)` et lecteur de démo.
      - *Hours per week* : Disponibilité horaire hebdomadaire (`More than 30 hrs/week`) avec bouton crayon d'édition.
      - *Languages* : Langues maîtrisées (Arabe maternelle, Français bilingue, Anglais professionnel).
      - *Équipement smartphone certifié* : Smartphone (iPhone 16 Pro Max ProRes Log), Gimbal (DJI Osmo Mobile 6), Configuration Audio (Rode Wireless Pro 32-bit float) avec bouton crayon d'édition.
    - **Colonne Droite Principale (Upwork Workspace Body)** :
      - *Titre professionnel & Tarif horaire* : Titre grand format avec bouton crayon vert d'édition instantanée et tarif horaire en DT/h avec bouton crayon vert et icône de lien de partage. Modale d'édition instantanée avec sauvegarde persistante.
      - *Bio / Présentation* : Texte descriptif avec bascule dynamique *« more / less »* et bouton crayon d'édition ouvrant une modale avec compteur de caractères.
      - *Portfolio Upwork* : Titre avec bouton vert circulaire `(+)`, onglets *« Published »* et *« Drafts »* avec badges de comptage, grille de vignettes multimédia (photos et vidéos 4K avec badge play), lightbox grand écran (`MediaModalComponent`), et modale complète d'ajout de projet (glisser-déposer de fichier PC/smartphone ou URL, choix du matériel et format).
      - *Skills & Compétences Smartphone* : Nuage de tags avec puces amovibles et bouton `(+)` d'ajout rapide (4K ProRes, Montage CapCut, Format 9:16, Étalonnage...).
      - *Missions & Commandes en cours* : Suivi des contrats actifs avec délais de livraison, montants nets et bouton CTA *« Déposer les livrables 4K »*.
      - *Historique de travail & Avis clients* : Liste des missions complétées avec notes 5.0 étoiles, commentaires des marques clientes, prix et dates d'achèvement.
  - Espace Admin (`/admin/dashboard`, modération utilisateurs, catégories, contrats).

### ✅ Gestion du Portfolio Mobile Créateur (`/creator/portfolio`) — Inspiré Upwork (100% Terminé)
- **Système d'import direct de fichiers (PC / Smartphone) & Drag-and-Drop** :
  - Remplacement du simple champ URL par une dropzone intuitive permettant l'import direct de photos (`image/*`) et vidéos smartphone (`video/*`).
  - Détection automatique du type de média (`IMAGE` vs `VIDEO`) d'après le MIME type ou l'extension.
  - Prévisualisation multimédia en direct avant enregistrement (lecteur vidéo HTML5 interactif avec contrôles ou image compressée haute qualité via Canvas).
  - Métadonnées du fichier en direct : nom du fichier, taille en Mo, actions « Remplacer » et « Supprimer ».
- **Option secondaire « Ajouter un lien »** :
  - Onglet dédié conservant la possibilité d'ajouter des médias externes via URL directe, avec prévisualisation dynamique instantanée.
- **Formulaire complet conforme au cahier des charges** :
  - Titre / Légende obligatoire.
  - Smartphone & matériel utilisé avec puces de suggestions rapides (*iPhone 16 Pro Max • ProRes Log, Samsung Galaxy S24 Ultra • 8K, Pixel 9 Pro...*).
  - Type de média (*Photo smartphone haute résolution*, *Vidéo verticale 4K / Reel*).
  - Bouton d'action CTA *« Enregistrer dans le portfolio »*.
- **Persistance scopée par utilisateur (`snapconnect_creator_portfolio_${userId}`)** :
  - Isolation stricte des réalisations selon le créateur connecté.
- **Cartes de portfolio améliorées** :
  - Badge de lecture vidéo pour les réalisations vidéo, lightbox grand écran avec `MediaModalComponent`.

### ✅ Gestion des Packages de Services Créateur (`/creator/services`) & Catalogue Public (`/services`) — Project Catalog (100% Terminé)
- **Résolution définitive des erreurs 404 du lien « Services »** :
  - **Lien Navbar public `Services` (`/services`)** : Création du catalogue public de packages clé en main (`ServicesCatalogComponent`), filtres par catégorie et smartphone, bascule interactive des tiers BASIC / STANDARD / PREMIUM avec prix en DT et délais.
  - **Menu utilisateur `Mes services` (`/creator/services`)** : Création de la page de gestion des packages pour créateur (`CreatorServicesComponent`), activation/mise en pause 1 clic, modal de création d'offre et persistance scopée par créateur.
  - Synchronisation avec le contrôleur Spring Boot `GigServiceController` (`/api/services`).

### ✅ Système de Notifications Dynamiques & Temps Réel Créateur (`/creator/notifications`) — Inspiré Upwork (100% Terminé)
- **Persistance en Base MySQL & Backend Spring Boot (`/api/notifications`)** :
  - Entité JPA `NotificationEntity` (`id`, `userId`, `type`, `title`, `body`, `link`, `isRead`, `createdAt`).
  - Repository `NotificationRepository` avec requêtes indexées par utilisateur et filtrage non lu (`findByUserIdOrderByCreatedAtDesc`, `countByUserIdAndIsReadFalse`).
  - Service `NotificationService` gérant la création, lecture, marquage comme lu (`markAsRead`, `markAllAsRead`), compteur d'alertes non lues et seed initial contextuel pour tout créateur (`SYSTEM`, `NEW_JOB`, `ESCROW`).
  - Contrôleur REST `NotificationController` exposé sur `/api/notifications` (`GET /`, `GET /unread-count`, `PATCH /{id}/read`, `PATCH /read-all`, `POST /`).
- **Déclencheurs Métier Automatiques Intégrés** :
  - *Propositions & Candidatures (`ProposalController` & `job-proposals.component`)* : Notification au client dès qu'un créateur postule (`NEW_PROPOSAL`), notification au créateur dès que sa proposition est acceptée (`PROPOSAL_ACCEPTED`) ou refusée (`PROPOSAL_REJECTED`).
  - *Contrats & Séquestre (`ContractController` & `contract-detail.component`)* : Notification au créateur dès que les fonds sont consignés sous séquestre (`ESCROW`), notification au client lors du dépôt de livrables 4K (`DELIVERY`), notification de libération des fonds lors de la validation (`ESCROW`).
  - *Avis & Notations (`ReviewController` & `contract-detail.component`)* : Notification immédiate au créateur ou client lors de la réception d'une nouvelle note (`NEW_REVIEW`).
- **Frontend Angular 19 Réactif & Interface Upwork Glassmorphism (`notifications.component.ts`)** :
  - **Onglets de filtrage interactifs** : *Toutes* (avec total), *Non lues* (avec badge rose vibrant), *Missions & Candidatures*, *Contrats & Séquestre*, *Avis & Messages*.
  - **Compteur d'alertes dynamique dans la Navbar** : Pastille de notification (`nav-badge-pill` et `badge-dot`) synchronisée en temps réel via Signal `unreadNotifications()`.
  - **Gestion Lu/Non-lu en 1 clic** : Marquage instantané au clic de la notification avec redirection fluide vers la ressource associée (`link`), bouton d'action *« Tout marquer comme lu »* et bouton unitaire de lecture.
  - **Horodatage relatif intelligent** (*À l'instant*, *Il y a 15 min*, *Il y a 2 h*, *Hier*...).
  - **Design 100% vectoriel SVG** : Icônes filaires épurées avec halos lumineux adaptés selon la catégorie (vert pour acceptation, ambre pour séquestre, violet pour missions, bleu pour livrables 4K, rose pour messages).
  - **Résilience & Cache Local scopé** : Cache automatique `snapconnect_notifications_${userId}` garantissant un affichage instantané et sans latence même en cas de coupure réseau.

### ✅ Refonte UX / UI Homepage & Navigation (Inspirée d'Upwork — 100% Terminé)
- **Navbar Professionnelle Dynamique par Rôle (`navbar.component.ts`)** :
  - **Mode Créateur Connecté (`CREATOR`)** : Navigation dédiée exclusive `Accueil | Trouver des missions | Mes missions | Mon portfolio | Messages | Notifications | Mon profil`. Masquage automatique des liens réservés aux visiteurs (*« Pour Créateurs »*, *« Créateurs »*, *« Pour Entreprises »*). Pastilles de badges de messages et notifications non lus intégrées.
  - **Mode Client Connecté (`CLIENT`)** : Navigation dédiée `Accueil | Trouver des créateurs | Services | Mes briefs | Mes contrats | + Publier une mission`.
  - **Mode Visiteur Public** : `Accueil | Créateurs | Services | Missions | Comment ça marche | Pour Entreprises | Pour Créateurs` avec boutons d'accès *Connexion* & *Commencer*.
  - Logo vectoriel SVG SnapConnect avec dégradé violet/rose et avatar utilisateur avec menu déroulant complet.
- **Homepage Marketplace Haute Qualité (`landing.component.ts`)** :
  - **Hero Section avec Switcher multi-recherche Upwork** : Onglets dynamiques (*Trouver un créateur, Packages de services, Briefs*), barre de recherche avec input arrondi et bouton primaire, puces rapides avec icônes fines (*Reels & TikTok, Cafés & Restos, Mode, La Marsa, Sousse*).
  - Mockup smartphone 4K ProRes avec badges de confiance flottants.
  - **Bannière Preuve Sociale Tunisienne** : Marques réelles (*Gourmandise, Alyssa Bio Skincare, Carthage Concept, Café Journal La Marsa, Médina Craft, Baya Fashion*).
  - **Grille de Catégories (8 cartes Upwork)** : Cartes avec icônes SVG fines (*Reels & TikTok, Photos Produits, Resto & Café, Mode, Beauté, Événements, UGC, Immobilier*).
  - **« Comment fonctionne SnapConnect » (Tabs interactifs)** : Switcher interactif Entreprises / Créateurs en 4 étapes illustrées.
  - **Widget Simulateur de Tarifs / Pricing Transparency** : Estimation dynamique des tarifs moyens en Dinars Tunisiens (DT) par format avec détails inclus.
  - **Créateurs Tunisiens en Vedette** : 100% créateurs tunisiens avec équipements smartphone (iPhone 16 Pro Max, Galaxy S24 Ultra), localisations réelles en Tunisie, notes et tarifs.
  - **Packages Populaires Prêts à l'Emploi** : Offres clés en main avec livraison 48h en DT.
  - **Cas d'Usage Sectoriels en Tunisie** : Restauration, mode, cosmétique, e-commerce.
  - **Grille de Témoignages (6 cartes Upwork)** : Avis authentiques de fondateurs et créateurs tunisiens avec rôles et entreprises.
  - **Métriques & Bannière Finale** : Chiffres de confiance et double CTA SnapConnect.
- **Footer Pro en 5 Colonnes (`footer.component.ts`)** :
  - **Logo Moderne SnapConnect** : Nouvel emblème vectoriel SVG de haute précision figurant une ouverture d'obturateur de caméra (shutter aperture / iris) et lentille 4K avec reflet optique, logé dans un conteneur glassmorphism sombre aux bordures dégradées violet/rose avec halo néon et micro-animation de rotation au survol.
  - **Badges Modernes 100% Vectoriels SVG (Zéro Émoji)** : Remplacement des émojis amateur (`📱`, `🔒`, `TN`) par 3 pilules fines en SVG pur :
    1. `100% Smartphone` avec icône smartphone filaire vectorielle fine.
    2. `Séquestre Garanti` avec cadenas de sécurité vectoriel fin.
    3. `Made in Tunisia` avec pin de localisation géographique vectoriel fin.
  - 4 colonnes de liens organisés (*Pour Entreprises, Pour Créateurs, Ressources, Société & Légal*), icônes sociales SVG, copyright et mentions légales.
- **Navbar Professionnelle (`navbar.component.ts`)** :
  - Alignement parfait avec le même emblème vectoriel SnapConnect shutter aperture iris, typographie épurée *Outfit* (Snap en blanc, Connect en dégradé rose/violet) et animation au survol.
- **Refonte Iconographie & Élimination Intégrale des Émojis « Cheap » (Style Upwork)** :
  - Remplacement complet des émojis amateur (`🔍`, `🎬`, `📦`, `🏠`, `🎉`, `🤝`, `🍽️`, `📅`, `📍`, `📱`, `👤`, `📬`, `★`) par des icônes vectorielles SVG filaires et propres.
  - **Page Créateurs (`/creators`)** : Barre de recherche avec loupe SVG intégrée, options de filtre nettoyées, et pilules de catégories (chips) avec icônes SVG fines dédiées par catégorie.
  - **Job Board (`/jobs`)** : Barre de recherche avec loupe SVG, état vide avec mallette SVG moderne.
  - **Cartes de Briefs (`app-job-card`)** : Métadonnées 100% vectorielles SVG (date, pin de localisation, smartphone, silhouette client, étoile dorée SVG, enveloppe de propositions).
  - **Détail de Brief & Profil Créateur** : Remplacement des emojis par des icônes SVG et typographie épurée.

- **Unification Totale du Modèle Marketplace (Élimination Intégrale de « Modèle A » et « Modèle B »)** :
  - Suppression définitive de toute mention, badge ou dichotomie « Modèle A » / « Modèle B » dans toute l'application.
  - Refonte complète de la page **« Comment ça marche » (`/how-it-works`)** calquée exactement sur la structure d'Upwork :
    - Un seul flux marketplace unifié et cohérent.
    - Switcher de vue par onglets : *« Pour les Entreprises & Marques »* et *« Pour les Créateurs Smartphone »*.
    - Les 4 étapes universelles : 1. Publiez votre brief / Complétez votre profil ➔ 2. Recevez des propositions / Postulez ➔ 3. Bloquez les fonds en séquestre / Tournez en sécurité ➔ 4. Validez les livrables 4K & libérez les fonds.
    - Bannière de garantie séquestre bancaire SnapConnect avec ses 3 piliers (Dépôt avant tournage, Révisions incluses, Médiation & Arbitrage) et FAQ intégrée.
  - Nettoyage des badges dans `job-list`, `job-create`, `client/dashboard`, `client/contracts`, `creator/contracts`, `contract-detail` et `help` (remplacés par *« Brief Mission »*, *« Package Service »* ou *« Brief Sur Mesure »*).

### ✅ Fonctionnement du Bouton « Contacter le créateur » & Messagerie de Bout en Bout (100% Terminé)
- **Déclencheurs Frontend Connectés** :
  - **Profil Créateur (`/creators/:id`)** : Remplacement du bouton d'alerte factice par `contactCreator()`, redirection automatique vers `/client/messages` avec paramètres du créateur (`creatorId`, `creatorName`, `creatorEmail`, `creatorAvatar`, `contextType: 'CREATOR_PROFILE'`).
  - **Propositions Client (`/client/jobs/:id/proposals`)** : Clic sur *« Contacter le créateur »* (`openChat(p)`) transmet les informations de la proposition et du créateur vers la messagerie.
- **Messagerie Réactive & Gestion Automatique des Conversations (`MessagesComponent` & `MessageService`)** :
  - Écoute automatique de `queryParams` dans `MessagesComponent` :
    - Si la conversation existe déjà, elle est sélectionnée et ouverte instantanément avec tout son historique.
    - Si elle n'existe pas, `msgSvc.startConversation(...)` est appelé immédiatement pour créer la conversation en base MySQL et l'ouvrir en direct sans latence.
    - Focus automatique sur le champ de saisie `#message-input` dès l'ouverture.
- **Backend Spring Boot & Persistance MySQL (`ConversationController`, `ChatService`, `ConversationRepository`)** :
  - `ChatService.resolveTargetUser(req)` : Résolution flexible du créateur par ID, email ou nom complet, avec création automatique d'un compte `CREATOR` vérifié en base MySQL si le créateur est issu du catalogue plateforme (ex. Sarah Ben Salem, ID 28).
  - Tri optimisé : `ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC` dans `ConversationRepository` pour afficher immédiatement les nouvelles conversations au sommet de la boîte de réception.
  - Endpoint REST dédié `POST /api/conversations/{id}/messages` dans `ConversationController` : Persistance instantanée des messages dans la table `snapconnect.chat_messages`, mise à jour de `conversations.last_message` et `last_message_at`, et diffusion simultanée sur WebSocket STOMP (`/topic/conv/{id}`).
### ✅ Refonte Complète du Dashboard Client (`/client/dashboard`) — Inspiré Upwork Client Workspace (100% Terminé)
- **Header & Hero de Recrutement** :
  - Bannière d'accueil avec badge `💼 Espace Entreprise & Marque`, voyant de garantie séquestre, et grand bouton CTA vert Upwork **`+ Publier un brief mobile`** avec halo vert `#10b981`.
  - Bouton d'accès direct au catalogue de services clés en main **`Project Catalog (Services)`** (`/services`).
- **Bandeau de 4 Métriques Clés** :
  - `Briefs Actifs`, `Candidatures Reçues`, `Contrats en cours`, et `Fonds Sous Séquestre` (`activeEscrowAmount` en DT).
- **Colonne Principale (70% Flux Opérationnel)** :
  - **Module « Vos missions & briefs de tournage » (Your Postings Upwork)** : Onglets interactifs (*Actives*, *Toutes*, *Brouillons*), cartes de brief avec métadonnées techniques, compteurs d'action (*Propositions*, *Messagerie*, *Embauchés*) et bouton direct vert Upwork *« Examiner les candidatures (X) → »*.
  - **Module « Tournages & Contrats en cours »** : Cartes des contrats actifs avec séquestre bloqué, voyants en ligne, statut de tournage et bouton d'action *« Examiner livrables 4K & Payer »*.
  - **Module « Créateurs smartphone recommandés »** : Moteur de matching contextuel avec score de compatibilité (ex. 98%), modèle de smartphone certifié, tarif horaire et bouton rapide *« Inviter »* ou *« Profil → »*.
- **Sidebar Droite (30% Upwork Client Business Hub)** :
  - Profil entreprise avec badge officiel **`✔ Moyen de paiement vérifié (Garantie de séquestre bancaire activée)`**.
  - Synthèse financière et séquestre actif avec lien direct vers la facturation.
  - Alertes prioritaires (Livrables 4K à valider, nouvelles candidatures).
  - Raccourcis rapides opérationnels.

### ✅ Parcours d'Embauche Directe & Clarté Rôles Client/Créateur (100% Terminé)
- **Bouton d'action sur le profil créateur (`/creators/:id`)** :
  - Renommage clair et intuitif de *« Proposer une mission »* en **« Embaucher ce créateur »** (conforme au standard Upwork *« Hire Freelancer »*) avec icône vectorielle SVG d'ajout d'utilisateur.
  - Transmission contextuelle de l'ID et du nom du créateur via les query parameters (`?creatorId=...&creatorName=...`).
- **Page de création de brief dédiée (`/client/jobs/create`)** :
  - Détection automatique du créateur sélectionné via `ActivatedRoute`.
  - Affichage d'un bandeau glassmorphism émeraude d'offre directe : **`🤝 Offre d'embauche dédiée à [Nom du Créateur]`** (*« Cette mission sera proposée en priorité à ce créateur. Dès validation de son côté, un contrat avec séquestre sera automatiquement créé »*).
  - Pré-remplissage personnalisé du titre et du brief créatif.
  - Notification automatique temps réel envoyée au créateur ciblé dès la validation de la mission.

---

## 📂 5. Structure Clé des Fichiers

### Backend (`com.snapconnect`)
- `model/` : `User`, `Role`, `PasswordResetToken`, `ChatMessage`, `Conversation`.
- `repository/` : `UserRepository`, `PasswordResetTokenRepository`, `ChatMessageRepository`, `ConversationRepository`.
- `service/` : `AuthService`, `JwtService`, `GoogleTokenVerifierService`, `ChatService`.
- `controller/` : `AuthController`, `ChatController`, `MessageController`.
- `config/` : `SecurityConfig`, `JwtAuthFilter`, `WebSocketConfig`, `GlobalExceptionHandler`.

### Frontend (`src/app`)
- `core/services/` : `auth.service.ts`, `google-auth.service.ts`, `message.service.ts`, `job.service.ts`, `creator.service.ts`, etc.
- `core/guards/` : `auth.guard.ts`, `guest.guard.ts`, `role.guard.ts`, `admin.guard.ts`.
- `features/auth/` : `login/`, `register/`, `forgot-password/`, `reset-password/`, `verify-email/`.
- `styles.css` : Design Tokens globaux, glassmorphism, animations.

---

## 🗓️ Journal des Sessions

### ✅ Session 2026-09-11 — Champ Hybride Combobox « Format de contenu principal requis »

**Objectif :** Transformer le `<select>` statique du champ *Format de contenu principal requis* en un champ hybride combobox permettant saisie libre ET sélection dans une liste prédéfinie. Valable pour CLIENT et CRÉATEUR.

**Fichiers modifiés :**

| Fichier | Modification |
|---|---|
| `backend/.../model/User.java` | Ajout `@Column(name = "content_format") private String contentFormat;` |
| `backend/.../dto/UpdateProfileRequest.java` | Ajout `String contentFormat` au record |
| `backend/.../controller/UserController.java` | Mise à jour `user.setContentFormat(request.contentFormat().trim())` dans `updateProfile` |
| `backend/.../dto/UserDto.java` | Ajout `String contentFormat` au record |
| `backend/.../service/AuthService.java` | Ajout `user.getContentFormat()` dans `toDto()` |
| `frontend/.../core/models/user.model.ts` | Ajout `contentFormat?: string;` à l'interface `User` |
| `frontend/.../shared/components/format-combobox/format-combobox.component.ts` | **NOUVEAU** composant `FormatComboboxComponent` avec `ControlValueAccessor`, dropdown glassmorphism, 5 options prédéfinies, saisie libre acceptée |
| `frontend/.../features/client/profile/profile.component.ts` | `<select>` → `<app-format-combobox>` + `ngOnInit()` + `saveProfile()` avec `auth.updateProfile()` + cache `localStorage` scopé par `userId` |
| `frontend/.../features/creator/profile/profile.component.ts` | Ajout section *Préférences de contenu* + `<app-format-combobox>` + `contentFormat` dans `ngOnInit()` et `updateProfile()` |

**Options prédéfinies du combobox :**
1. `9:16 Vertical — TikTok / Reels / Shorts`
2. `16:9 Horizontal — YouTube / Facebook`
3. `1:1 Carré — Instagram`
4. `4:5 Portrait — Instagram`
5. `Autre — à préciser` *(vide le champ + focus immédiat pour saisie libre)*

**Comportement « Autre — à préciser » :** Sélectionner cette option vide l'input et donne le focus immédiat pour que l'utilisateur écrive un format personnalisé (ex. `1080x1920 vertical`, `4K horizontal 30fps`).

### ✅ Session 2026-09-11 (2) — Résolution de la disparition des missions publiées par un Client côté Créateur

**Problème résolu :** Lorsqu'un client publiait un brief/mission puis se connectait avec un compte créateur, la mission créée disparaissait et seules les 4 missions d'exemple apparaissaient.

**Cause racine identifiée :**
- Dans `job.service.ts`, la méthode `loadJobs()` contenait un test vestigial : `if (parsed[0].clientName?.includes('Maison Alyssa') || parsed[0].clientName?.includes('Tunis')) return parsed; else reset to INITIAL_JOBS;`.
- Lorsqu'un client créait une mission, elle était ajoutée en tête du tableau (`[newJob, ...this.jobs()]`).
- Lors de la reconnexion ou du rechargement, `parsed[0]` était la nouvelle mission (avec un nom client différent de Maison Alyssa). La condition échouait systématiquement, écrasant le cache local avec `INITIAL_JOBS` et supprimant définitivement la mission créée.
- Le même problème existait dans `proposal.service.ts` (`loadProposals`) et `contract.service.ts` (`loadContracts`).

**Fichiers modifiés :**

| Fichier | Modification |
|---|---|
| `frontend/.../core/services/job.service.ts` | Suppression du filtre destructif dans `loadJobs()`, injection de `AuthService` pour associer l'auteur réel du brief (`currentUser`), ajout de la méthode `refresh()`, rechargement frais dans `search()` et `getById()`. |
| `frontend/.../features/marketplace/jobs/job-list/job-list.component.ts` | Appel de `jobService.refresh()` au `ngOnInit()` pour garantir le chargement des dernières missions lors de la navigation créateur vers `/jobs`. |
| `frontend/.../features/client/jobs/client-jobs/client-jobs.component.ts` | Implémentation de `OnInit` et appel de `jobService.refresh()` pour rafraîchir les briefs clients. |
| `frontend/.../core/services/proposal.service.ts` | Suppression du filtre destructif dans `loadProposals()` pour préserver toutes les propositions soumises. |
| `frontend/.../core/services/contract.service.ts` | Suppression du filtre destructif dans `loadContracts()` pour préserver tous les contrats actifs. |

**Vérifications :**
- `npx tsc --noEmit` → ✅ 0 erreur TypeScript.

### ✅ Session 2026-09-12 — Affichage adapté selon le rôle sur la page de détail de mission (`/jobs/:id`)

**Problème résolu :** Le client qui publiait une mission voyait sur son propre brief le bouton *« Intéressé par ce projet ? Soumettre une proposition »*, l'invitant à postuler à son propre projet.

**Comportement corrigé :**
- **Client propriétaire du brief** (ex: Olfa) :
  - Badge vert : `● Votre brief est en ligne`
  - Titre : *« Gérer ce brief »*
  - Bouton d'action principal : **« Consulter les propositions (X) »** (redirige vers `/client/jobs/:id/proposals`)
  - Bouton secondaire : **« Voir tous mes briefs »** (redirige vers `/client/jobs`)
  - Statut : *« Ouvert aux candidatures »*
- **Autre client connecté** :
  - Carte d'information mission d'entreprise avec bouton *« + Publier votre mission »*
- **Créateur / Visiteur** :
  - Carte de candidature classique : *« Intéressé par ce projet ? Soumettre une proposition »* avec ouverture du modal de devis.

**Fichiers modifiés :**
- `frontend/.../features/marketplace/jobs/job-detail/job-detail.component.ts`

**Vérifications :**
- `npx tsc --noEmit` → ✅ 0 erreur TypeScript.

### ✅ Session 2026-09-12 (2) — Étape 1 Client : Réconciliation profil créateur, candidatures et liens de portfolio

**Problème résolu :**
1. Le nom du créateur qui postule était hardcodé à `You (Creator Studio)` avec un `creatorId: 'cr-current'`.
2. Le client ne pouvait pas ouvrir le profil du créateur (liens statiques non cliquables sur l'avatar et le nom, et ID invalide).
3. Le profil créateur `/creators/:id` retombait toujours sur les données par défaut sans charger les informations réelles de l'auteur.

**Modifications apportées :**
- `proposal.service.ts` :
  - Injection de `AuthService` pour récupérer les vraies données du créateur connecté (`user.fullName`, `user.id`, `user.avatarUrl`, `user.smartphoneModel`).
  - Ajout de la méthode `refresh()` et nettoyage rétroactif des anciennes candidatures mockées.
- `job-proposals.component.ts` :
  - L'avatar et le nom du créateur sont désormais des liens interactifs `[routerLink]="['/creators', p.creatorId]"` avec micro-animations au survol.
  - Le bouton « Voir le portfolio complet » pointe directement vers le profil du créateur.
  - Le bouton « Contacter le créateur » transmet directement l'identifiant du créateur à la messagerie.
- `creator-profile.component.ts` :
  - Résolution dynamique des profils de créateurs via `CREATORS_DIRECTORY`, cache de profil utilisateur (`snapconnect_creator_profile_${id}`), requête API MySQL (`GET /api/users/:id`), et synchronisation du portfolio réel (`snapconnect_creator_portfolio_${id}`).

**Vérifications :**
- `npx tsc --noEmit` → ✅ 0 erreur TypeScript.

### ✅ Session 2026-09-12 (3) — Étape 2 Client : Perfectionnement & Dynamisation Complète de l'Espace Client (Standard Upwork)

**Problèmes résolus :**
1. **Contrats & Séquestre (`ContractService` & `/client/contracts`)** :
   - `ClientContractsComponent` utilisait un tableau statique mocké (`[ct-1, ct-2]`) et n'injectait même pas `ContractService`. Tout contrat créé suite à une embauche n'apparaissait pas.
   - `ContractService` codait en dur le nom de client `'Maison Alyssa Cosmétiques Bio'`.
2. **Tableau de Bord Client (`/client/dashboard`)** :
   - Les 4 métriques KPIs étaient codées en dur (3 briefs, 12 propositions, 2 contrats, 840 DT).
   - Les cartes de contrats en cours étaient des éléments HTML statiques figés.
   - Les compteurs d'actions rapides étaient statiques.
3. **Gestion des Briefs Client (`/client/jobs`)** :
   - Absence de filtrage par statut, pas de bouton de clôture / réouverture de brief, et lien manquant vers la consultation publique du brief.
   - Compteur de propositions parfois déphasé.
4. **Espace Contrat & Séquestre (`/client/contracts/:id`)** :
   - Le modal d'évaluation (`ReviewModalComponent`) avait un `reviewerId: 'cl-1'` statique et le rafraîchissement au chargement n'était pas garanti.

**Modifications apportées :**
- `contract.service.ts` :
  - Injection de `AuthService`.
  - `createFromProposal()` et `createFromOrder()` utilisent désormais les informations réelles du client connecté (`id`, `fullName`, `avatarUrl`).
  - Ajout de la méthode `refresh(): Contract[]` forçant la synchronisation avec le `localStorage`.
- `contracts.component.ts` :
  - Remplacement du signal mock par `ContractService` réactif et filtré par client.
  - Système d'onglets de filtrage Upwork : *Tous*, *En tournage*, *Livrables déposés*, *Terminés* avec compteurs réactifs.
  - État vide soigné avec CTA.
- `dashboard.component.ts` :
  - Connexion réactive à `JobService`, `ProposalService`, `ContractService` et `AuthService`.
  - Calcul dynamique en direct des 4 KPIs : Briefs Actifs, Nouvelles Propositions, Contrats en Cours, Total Investi.
  - Remplacement de la section statique par une boucle réactive `@for (c of activeContracts(); track c.id)` affichant les vrais contrats avec avatar créateur, délai, montant sous séquestre et bouton d'accès direct.
  - État vide contextuel si aucun contrat en cours.
- `client-jobs.component.ts` :
  - Système d'onglets de filtrage : *Tous*, *Ouverts aux candidatures*, *Clôturés*.
  - Compteur dynamique réel de candidatures reçu par brief via `ProposalService`.
  - Actions rapides par brief : *Examiner les propositions (X) →*, *Voir en ligne ↗* (`/jobs/:id`), et bouton de bascule *Clôturer le brief / Rouvrir* avec mise à jour persistante du statut `OPEN` / `CLOSED`.
  - État vide avec CTA de publication de brief.
- `contract-detail.component.ts` :
  - `ngOnInit` appelle systématiquement `contractService.refresh()`.
  - `ReviewModalComponent` prend dynamiquement `reviewerId` et `reviewerName` du compte connecté.
- `job.model.ts` :
  - Ajout de `'CLOSED'` dans l'union `JobStatus`.
- `user.model.ts` :
  - Ajout du champ optionnel `companyName?: string;`.

**Vérifications :**
- `npx tsc --noEmit` → ✅ 0 erreur TypeScript.
- Build Angular AOT (`ng build`) → ✅ Succès sans erreur (bundle complet généré en 19s).
- **Vérification End-to-End en Navigateur Réel (Chrome)** :
  - Connexion client (`client@snapconnect.com`) ➔ Redirection instantanée vers `/client/dashboard`.
  - Dashboard : 4 KPIs calculés en direct (2 briefs actifs, 2 propositions reçues, 1 contrat en cours, 250 DT investis sous séquestre).
  - Tournages & Contrats en direct : Affichage réactif de `#ct-1` avec Sarah Ben Salem, 250 DT en séquestre et bouton direct vers l'espace de fichiers.
  - `/client/jobs` : Filtrage interactif par onglets, synchronisation des compteurs de propositions, test complet de bascule *Clôturer* (`● Brief clôturé`) ⇄ *Rouvrir* (`● Ouvert aux propositions`).
  - `/client/contracts/ct-1` : Stepper de séquestre en 5 étapes, livrables 4K et zone de double confirmation 100% fonctionnels.

### Session du 2026-09-12 (4) — Rétablissement Intégral des Liens Hypertextes Profil Créateur
- **Problème résolu** : L'utilisateur a remarqué que cliquer sur le nom d'un créateur n'emmenait pas vers son profil (« non c'est pas vrai lorsque clique sur nom createur nrmlm thezni llprofil mtaao , mais lhne fi app hedhi non »).
- **Causes racines identifiées** :
  1. Dans `CreatorCardComponent` (`app-creator-card`), le nom du créateur (`<h3 class="creator-name">{{ c.fullName }}</h3>`) et son avatar (`<div class="avatar-wrap">`) étaient du simple texte sans balise `<a>` ni `[routerLink]`. Seul un petit bouton tout en bas à droite était cliquable.
  2. `CreatorProfileComponent` n'avait que 3 créateurs dans son annuaire (`cr-1`, `cr-2`, `cr-3`). Les créateurs `cr-4` (Khalil Jaziri), `cr-5` (Mariem Mansour), `cr-6` (Aziz Khemir) tombaient sur un profil générique sans portfolio adapté.
  3. `JobProposalsComponent` n'avait pas de fonction de résolution sûre si `p.creatorId` était null ou non défini.
  4. Le header de messagerie (`MessagesComponent`) affichait l'interlocuteur sans lien cliquable vers son profil.
  5. La page `CreatorProfileEditComponent` (`/creator/profile`) n'avait pas de bouton Upwork permettant au créateur de voir son profil public (`/creators/:id`).
- **Corrections apportées** :
  - `creator-card.component.ts` :
    - Avatar enveloppé dans `<a [routerLink]="['/creators', c.id || 'cr-1']" class="avatar-wrap avatar-link">` avec micro-zoom au survol et halo.
    - Nom enveloppé dans `<h3 class="creator-name"><a [routerLink]="['/creators', c.id || 'cr-1']" class="creator-name-link">{{ c.fullName }}</a></h3>` avec survol violet et soulignement.
  - `creator-profile.component.ts` :
    - Intégration des 6 créateurs tunisiens d'élite (`cr-1` à `cr-6`) avec équipements certifiés (iPhone 16 Pro Max, S24 Ultra), tarifs en DT, bios complètes et portfolios sectoriels (`ALL_PORTFOLIO_ITEMS`).
    - Résolution flexible par ID (`cr-1`..`cr-6`), nombre (`1`..`6`), alias (`u-1`..`u-6`) et prénom (`sarah`, `mehdi`, `yassine`, `khalil`, `mariem`, `aziz`).
  - `job-proposals.component.ts` :
    - Méthode `getCreatorProfileId(p.creatorId, p.creatorName)` pour rediriger systématiquement vers le bon créateur sans risque de fallback erroné.
  - `messages.component.ts` :
    - Avatar et nom cliquables dans l'en-tête de conversation active menant directement au profil public du créateur via `getOtherUserProfileLink()`.
  - `profile.component.ts` (Créateur) :
    - Ajout du bouton Upwork *« Voir mon profil public ↗ »* dans le bandeau d'en-tête.
  - `landing.component.ts` :
    - Ajout de `creatorId?: string;` dans `ServicePackage` pour garantir le typage AOT strict.
- **Vérifications** :
  - `npx tsc --noEmit` → ✅ 0 erreur TypeScript.
  - `npm run build` → ✅ Build de production réussi avec code 0 (génération de l'ensemble des 72 chunks lazy et initiaux).

### Session du 2026-09-12 (5) — Élimination Intégrale des Mentions Publiques "Inspirée d'Upwork"
- **Demande utilisateur** : « svp chnwa inspire mn upwork mahich professionnel haka chnage » (capture de l'en-tête de la page `/how-it-works`).
- **Constat** : Upwork est notre standard architectural et fonctionnel interne, mais son nom ne doit **JAMAIS** apparaître dans les textes et slogans publics de la plateforme (cela donne un aspect "copie amateur" au lieu d'une marque tunisienne indépendante et professionnelle).
- **Corrections apportées** :
  - `how-it-works.component.ts` :
    - Remplacement de *« Une marketplace simple, transparente et sécurisée inspirée d'Upwork pour connecter entreprises et créateurs smartphone professionnels en Tunisie. »* par :
      *« La première plateforme de référence, transparente et 100% sécurisée pour connecter entreprises et créateurs de contenu smartphone en Tunisie. »*
    - Remplacement de *« Exactement comme Upwork Escrow, SnapConnect agit en tiers de confiance neutre entre entreprises et créateurs. »* par :
      *« Grâce au séquestre de paiement SnapConnect Escrow, la plateforme agit en tiers de confiance neutre entre entreprises et créateurs. »*
  - `help.component.ts` :
    - Remplacement dans la FAQ de *« SnapConnect fonctionne sur un modèle unique et sécurisé inspiré d'Upwork : ... »* par :
      *« SnapConnect fonctionne sur un modèle direct, fluide et 100% sécurisé : le client publie son besoin ou consulte les profils vérifiés, sélectionne un créateur smartphone certifié, bloque le budget en séquestre sécurisé, et libère le paiement uniquement après validation des fichiers vidéos et photos 4K livrés. »*
- **Vérification** :
  - `npx tsc --noEmit` → ✅ 0 erreur.
  - Inspection visuelle via browser subagent sur `http://localhost:4200/how-it-works` → Textes propres, professionnels et conformes à l'identité SnapConnect.

### Session du 2026-09-12 (6) — Affichage Dynamique des Nouveaux Créateurs Inscrits dans l'Annuaire Marketplace
- **Demande utilisateur** : « ena kif naaml compte createur alech maytl3ch maa les exmple hedhm corrige svp » (avec capture d'écran de la grille créateurs sur `/creators`).
- **Cause racine identifiée** :
  1. `CreatorListComponent` (`/creators`) contenait une liste statique codée en dur de 6 créateurs de démo (`allCreators = [ cr-1 ... cr-6 ]`) et ne sollicitait jamais le backend Spring Boot ni les profils créés en session.
  2. Le backend Spring Boot n'exposait aucun endpoint dédié pour lister tous les créateurs enregistrés (`GET /api/creators` ou `GET /api/users/creators`).
  3. Lorsqu'un utilisateur créait un compte créateur (ex. Chaima, Nawa, Hedi, Sirine...), son compte existait bien en base MySQL dans `users` avec le rôle `CREATOR`, mais il n'apparaissait jamais sur la marketplace.
  4. `CreatorProfileComponent` (`/creators/:id`) ne rechargeait pas les profils personnalisés non-démo créés par les utilisateurs depuis le backend.
- **Corrections apportées** :
  - **Backend Spring Boot** :
    - `UserRepository.java` : Ajout des requêtes `findByRole(Role.CREATOR)` et `findByRoleOrderByIdDesc(Role.CREATOR)`.
    - `UserController.java` : Ajout de `GET /api/users/creators` et sécurisation du pattern `@GetMapping("/{id:[0-9]+}")`.
    - `CreatorController.java` : Création du contrôleur REST `@RequestMapping("/api/creators")` avec `GET /api/creators` (liste de tous les créateurs enregistrés) et `GET /api/creators/{id}` (récupération par ID numérique ou email).
  - **Frontend Angular 19** :
    - `creator.service.ts` :
      - Ajout de la méthode de mapping `mapUserToCreatorProfile(user)` convertissant fidèlement les attributs d'un utilisateur MySQL ou d'une session vers le modèle de profil `CreatorProfile`.
      - Ajout de `getRegisteredCreators(): Observable<CreatorProfile[]>` consommant `/api/creators`.
      - Ajout de `getLocalCreators()` pour récupérer les profils stockés en session locale.
    - `creator-list.component.ts` :
      - Injection de `CreatorService` et `AuthService`.
      - Méthode `loadAllCreators()` fusionnant les créateurs de la base MySQL (ex: Gadhgadhi Chaima, nawa, lhedifreelance...), l'utilisateur actuellement connecté si rôle `CREATOR` (affiché en 1ère position absolue), les profils locaux et les 6 créateurs de référence.
      - Application des filtres (recherche texte, catégorie, smartphone, tri) sur la totalité des créateurs réels et exemples.
    - `landing.component.ts` :
      - Ajout de `ngOnInit()` pour charger également les créateurs inscrits dans la section "Créateurs Tunisiens en Vedette".
    - `creator-profile.component.ts` :
      - Liaison dynamique avec `GET /api/creators/:id` et l'utilisateur connecté pour afficher en direct le profil public complet de tout nouveau créateur (nom réel, smartphone, ville, bio, tarif en DT et portfolio).
- **Vérifications** :
  - `npx tsc --noEmit` → ✅ 0 erreur TypeScript.
  - `npm run build` → ✅ 0 erreur AOT.
  - Test en direct avec browser subagent sur `http://localhost:4200/creators` : La grille affiche maintenant **24 créateurs mobiles disponibles**, dont tous les vrais comptes créateurs inscrits (Gadhgadhi Chaima, nawa avec S24 Ultra à 50 DT/h, lhedifreelance, Hedi Pro Mobile, You Studio, etc.) aux côtés des créateurs modèles.
  - Test du profil individuel sur `/creators/24` : Affichage parfait du profil de nawa (nowa photographe, JENDOUBA tunis, S24 Ultra, 50 DT/h).

### ✅ Session 2026-09-15 — Compte Administrateur par Défaut (`gh@gmail.com` / `123456`), AdminController REST & Espace Admin Dédié
- **Compte Admin Auto-Seeder (`AdminSeeder.java`)** :
  - Création automatique au démarrage de Spring Boot via `ApplicationRunner` du compte administrateur racine :
    - Email : `gh@gmail.com`
    - Mot de passe : `123456` (hashé BCrypt)
    - Nom : `Admin SnapConnect`
    - Rôle : `ADMIN`, `verified = true`, `onboarded = true`, `active = true`.
  - Configurable dynamiquement via `application.properties` (`admin.default.email`, `admin.default.password`, `admin.default.fullname`).
- **Nouveau Contrôleur REST Backend (`AdminController.java`)** :
  - `GET /api/admin/stats` : Statistiques plateforme en direct (total utilisateurs, créateurs, clients, briefs, contrats, séquestre actif en DT, commission 10%).
  - `GET /api/admin/users` : Liste complète de tous les utilisateurs triés par date décroissante.
  - `PATCH /api/admin/users/{id}/toggle-status` : Suspension / réactivation de compte en un clic.
  - `PATCH /api/admin/users/{id}/verify-hardware` : Attribution du badge certifié équipement smartphone.
- **Frontend Angular 19 & UX Admin** :
  - `navbar.component.ts` : Navigation dédiée exclusive pour l'Admin (`Tableau de bord`, `Utilisateurs`, `Briefs`, `Contrats`, `Séquestre`, `Litiges`) et options dropdown spécifiques.
  - `login.component.ts` : Puce d'accès rapide Démo mise à jour vers `gh@gmail.com` avec mot de passe auto `123456`.
  - `auth.service.ts` : `getRememberedRole()` intègre `gh@gmail.com` vers `ADMIN` pour garantir la persistance et la redirection automatique vers `/admin/dashboard`.
  - `admin.service.ts` : Méthodes `getUsers()`, `toggleUserStatus()`, `verifyHardware()`.
  - `dashboard.component.ts` (Admin) : Connecté aux métriques réelles de `AdminService.getStats()`.
### ✅ Session 2026-09-15 (2) — Déploiement Complet du Système d'Administration Inspiré d'Upwork (6 Piliers Métier)
- **Architecture Complète Déployée** :
  1. **Trust & Safety / Certification Hardware (`/admin/users`)** :
     - Annuaire réactif des 35 comptes enregistrés en base MySQL.
     - Filtrage par rôle (`Tous`, `Créateurs`, `Clients`, `Admins`), recherche en direct.
     - Certification instantanée du matériel smartphone (iPhone 16 Pro, Galaxy S24 Ultra, Pixel 9 Pro) via `PATCH /api/admin/users/{id}/verify-hardware`.
     - Suspension / Réactivation immédiate en 1 clic via `PATCH /api/admin/users/{id}/toggle-status`.
  2. **Médiation des Litiges & Console de Contrats (`/admin/contracts`)** :
     - Switcher par onglets : *Litiges en Arbitrage* (dossiers actifs, motifs, inspection de pièces 4K, résolutions financières à 100% Client, 100% Créateur ou Split sur mesure) et *Tous les Contrats sous Séquestre* (table de supervision de tous les contrats actifs, jalons, commissions 10% et accès aux détails).
  3. **Grand Livre Financier & Retraits Créateurs (`/admin/payments`)** :
     - Deux vues complètes : *Grand Livre des Commissions (10%)* et *Demandes de Retrait Créateurs* (virements bancaires BIAT/BNA et D17/Flouci) avec actions `✓ Valider` (`PATCH /api/admin/payouts/{id}/approve`) et `✗ Rejeter` (`PATCH /api/admin/payouts/{id}/reject`).
  4. **Modération des Briefs & Missions (`/admin/jobs`)** :
     - Synchronisation en direct avec `JobService`, filtres par statut (*Ouverts*, *Clôturés*), contrôle de conformité smartphone et retrait/masquage en un clic.
  5. **Confiance, Sécurité & Signalements (`/admin/reports`)** :
     - Détection des tentatives hors-plateforme, spam et abus avec actions graduées : avertissement officiel, suspension du compte, ou classement sans suite.
  6. **Paramètres & Gouvernance Système (`/admin/settings`)** :
     - Console interactive de gouvernance : slider de commission plateforme (10%), délai d'auto-libération du séquestre (14 jours), seuil minimal de retrait, gestionnaire d'ajouts/suppressions de smartphones agréés 4K, auto-approbation et mode maintenance.
- **Backend Spring Boot & Contrôleur REST (`AdminController.java`)** :
  - `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/{id}/toggle-status`, `PATCH /api/admin/users/{id}/verify-hardware`, `GET /api/admin/payouts`, `PATCH /api/admin/payouts/{id}/approve`, `PATCH /api/admin/payouts/{id}/reject`, `GET /api/admin/settings`, `PUT /api/admin/settings`, `GET /api/admin/reports`, `PATCH /api/admin/reports/{id}/resolve`.
- **Qualité & Zéro Régression** :
  - `npx tsc --noEmit` : **0 erreur**.
  - `npm run build` : **Compilation réussie à 100% (Code 0)**.
  - Test fonctionnel et visuel complet via browser subagent avec enregistrement vidéo WebP.

### ✅ Session 2026-09-17 — Refonte Intégrale de la Page « Avis & Notations » (`ReviewsComponent`) Inspirée d'Upwork & Zéro Émoji
- **Remplacement Définitif du Stub/Placeholder Minimaliste (`/creator/reviews` et `/client/reviews`)** :
  - L'écran stub avec une étoile isolée et le texte *"Cet espace d'évaluation réciproque est en cours de synchronisation"* a été intégralement remplacé par un espace d'évaluations et de réputation complet.
- **Fonctionnalités Déployées** :
  1. **Tableau de Bord Métriques & Réputation (Upwork Style)** :
     - Note globale certifiée (ex: `4.98 / 5.0`) avec 5 étoiles dorées SVG et décompte des évaluations vérifiées.
     - Job Success Score (JSS) réactif : `98%` avec statut Top Créateur Smartphone.
     - Taux de recommandation : `100%` des clients prêts à collaborer à nouveau.
     - Respect des délais 4K : `98%` des livrables livrés sous 24h à 48h.
  2. **Histogramme de Distribution & Décomposition des Critères Smartphone 4K** :
     - Jauges de distribution des étoiles (5★ à 1★) avec pourcentages en temps réel.
     - Décomposition multicritère : *Qualité visuelle 4K & colorimétrie*, *Respect des délais de livraison*, *Communication & réactivité*, *Maîtrise smartphone & prise de son*.
  3. **Système de Filtrage, Recherche & Tri Réactif** :
     - Onglets : *Avis reçus*, *5 Étoiles*, *Commentaires détaillés*, *Avis que j'ai donnés (Réciprocité)*.
     - Barre de recherche instantanée par marque, mission ou mot-clé.
     - Tri par *Plus récents*, *Meilleures notes* et *Notes croissantes*.
  4. **Cartes d'Avis Détaillées & Preuve de Séquestre** :
     - Cartes glassmorphism avec avatar, badge vérifié, intitulé de contrat, tags de mérite (*iPhone 16 Pro Max*, *4K ProRes Log*, *Livraison Rapide*), badges de critères et sceau de protection séquestre escrow.
  5. **Intégration & Résilience Hybride** :
     - Connecté à `ReviewService` (`/api/reviews/user/:userId`), `ReputationService` et cache local `snapconnect_reviews_${userId}`.
     - Entrées directes *Avis & Notations* avec icône SVG étoile ajoutées dans le menu déroulant de la Navbar pour Créateur et Client.
  6. **Conformité Stricte aux Directives Design** :
     - **ZÉRO ÉMOJI UNICODE** : 100% des icônes sont vectorielles SVG filaires épurées.
     - Compilation `npm run build` : **0 erreur**.
     - Validation visuelle par subagent browser avec capture d'écran pleine page et vidéo WebP.

---

## 🎯 7. Instructions pour les prochaines interventions
1. Toujours vérifier la synchronisation entre le modèle backend Java et frontend Angular.
2. Utiliser le design system Pure CSS (variables CSS de `styles.css`, pas de Tailwind).
3. **Maintenir à jour ce document `AGENTS.md`** à chaque fin de session avec un résumé des fichiers modifiés.
4. Toujours redémarrer le serveur Spring Boot (`mvn spring-boot:run`) lors de modifications sur les classes backend Java pour que la JVM charge les nouveaux binaires compilés.
5. **🔒 RÈGLE D'OR ABSOLUE — NON-RÉGRESSION & MODULES VERROUILLÉS :**  
   - Dès qu'une partie/fonctionnalité est testée, vérifiée et validée par l'utilisateur, **elle est considérée comme gelée et verrouillée à 100%**.
   - **Interdiction absolue** de la modifier, la restructurer ou la toucher, sauf demande explicite de l'utilisateur.
   - Toujours avancer de manière incrémentale : construire les nouvelles briques ou corriger des points précis **sans jamais régresser, sans casser l'existant, et sans jamais recommencer de zéro**.
   - **Modifier uniquement les fonctionnalités demandées.** Pas de refactoring, pas de nettoyage, pas de réécriture non sollicitée.
   - **Arrêter immédiatement** dès que la modification est terminée et vérifiée.


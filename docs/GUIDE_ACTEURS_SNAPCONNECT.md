# 📘 GUIDE COMPLET DES ACTEURS & FONCTIONNALITÉS — SNAPCONNECT

> **SnapConnect** est une place de marché spécialisée exclusivement dans la création de contenu photo & vidéo sur smartphone (TikTok, Reels 9:16, UGC, Photographie Produit Macro, Visites Immobilières Mobiles).

Ce document détaille de manière exhaustive l'ensemble des **droits, fonctionnalités, flux de travail et interfaces** disponibles pour chacun des **4 acteurs de la plateforme** :

---

## 🗺️ SOMMAIRE DES ACTEURS
1. [👤 1. Visiteur / Utilisateur Public (Guest)](#-1-visiteur--utilisateur-public-guest)
2. [🏢 2. Client (Marque, Entreprise, Commerce)](#-2-client-marque-entreprise-commerce)
3. [📱 3. Créateur de Contenu Mobile (Vidéaste / Photographe Smartphone)](#-3-créateur-de-contenu-mobile-vidéaste--photographe-smartphone)
4. [🛡️ 4. Administrateur (Médiateur, Superviseur, Arbitre)](#-4-administrateur-médiateur-superviseur-arbitre)

---

# 👤 1. VISITEUR / UTILISATEUR PUBLIC (GUEST)

Le visiteur est un utilisateur non connecté découvrant la plateforme.

### 🎯 Ce qu'il peut faire :
1. **Découvrir la vitrine SnapConnect (`/`) :**
   - Consulter la proposition de valeur dédiée au smartphone (4K 60fps ProRes Log, formats verticaux 9:16).
   - Découvrir les créateurs vedettes, les packages tendance et les garanties de sécurité (**100% Escrow Protection**).
2. **Explorer l'annuaire des Créateurs Smartphone (`/creators`) :**
   - Filtrer les créateurs par **modèle de smartphone** (iPhone 16 Pro Max, Samsung Galaxy S24 Ultra).
   - Filtrer par accessoire mobile (Stabilisateur Gimbal, Micros sans fil Rode/DJI, Éclairage nomade).
   - Filtrer par catégorie de contenu (*Reels & TikTok*, *UGC*, *Food*, *Immobilier*, *Mode*).
   - Rechercher par ville / localisation ou tarif horaire.
3. **Consulter la fiche détaillée d'un Créateur (`/creators/:id`) :**
   - Visualiser le portfolio de vidéos 4K en mode plein écran (**Lightbox**).
   - Découvrir le score de compatibilité algorithmique (**✨ Smart Match**).
   - Consulter les badges de confiance (`✓ Créateur Vérifié`, `👑 Top Rated`, `⚡ Fast Responder`).
   - Consulter les avis clients vérifiés et la grille tarifaire.
4. **Parcourir les Packages de Services Prédéfinis (`/services`) :**
   - Comparer les offres de gigs avec formules à 3 niveaux (*Basic*, *Standard*, *Premium*) et délais garantis.
5. **Consulter le tableau des briefs ouverts (`/jobs`) :**
   - Découvrir les offres de tournage postées par les marques.
6. **Pages institutionnelles & Support :**
   - Consulter le fonctionnement (`/how-it-works`), les catégories (`/categories`), l'aide/FAQ (`/help`), les conditions d'utilisation (`/terms`) et la politique de confidentialité (`/privacy`).
7. **Création de Compte & Authentification :**
   - S'inscrire en 1-clic avec sélection du rôle : **Client** ou **Créateur** (`/auth/register`).
   - Se connecter (`/auth/login`) ou réinitialiser son mot de passe (`/auth/forgot-password`).

---

# 🏢 2. CLIENT (MARQUE, ENTREPRISE, COMMERCE)

Le client est une entreprise, un e-commerçant ou une marque recherchant du contenu mobile de haute qualité.

### 🎯 Ce qu'il peut faire :

#### A. Tableau de Bord & Pilotage (`/client/dashboard`)
- Suivre ses indicateurs clés : *Briefs actifs*, *Propositions reçues*, *Contrats en cours*, *Total investi*.
- Découvrir les **suggestions IA de créateurs recommandés** basées sur l'adéquation exacte du matériel smartphone.

#### B. Modèle A — Gestion des Briefs Sur-Mesure (Style Upwork)
- **Publier un Brief Mobile (`/client/jobs/create`) :**
  - Spécifier le titre, la description du tournage et le format requis (9:16 vertical 4K).
  - Définir le modèle de smartphone exigé (ex: iPhone 16 Pro Max 4K ProRes).
  - Fixer le budget (Fixe ou Horaire) et la date limite de livraison.
- **Suivre ses Briefs (`/client/jobs`) :** Visualiser le statut et le nombre de devis reçus.
- **Comparer les Devis Créateurs (`/client/jobs/:id/proposals`) :**
  - Examiner les tarifs proposés, délais de livraison, lettres de motivation.
  - Vérifier la confirmation du rig smartphone par le créateur.
  - **Recruter avec Verrouillage Séquestre :** Cliquer sur *"🔒 Recruter & Verrouiller en Escrow"* pour initier le contrat en gelant les fonds de manière protégée.

#### C. Modèle B — Commande de Packages Prédéfinis (Style Fiverr)
- Commander directement un package créateur (*Starter*, *Viral Pack*, *Campagne Complète*).
- Suivre l'état d'avancement dans ses commandes (`/client/orders`).

#### D. Salle de Contrat & Espace de Collaboration Sécurisé (`/client/contracts/:id`)
- **Visualiser le Stepper Escrow interactif 5 étapes ("Où est mon argent ?")** :
  1. Dépôt initial ➔ 2. Fonds sécurisés en séquestre ➔ 3. Tournage & Montage 4K ➔ 4. Inspection client ➔ 5. Paiement débloqué.
- **Inspecter les Livrables 4K :** Télécharger et visionner les vidéos ProRes et photos macro dans le lecteur intégré.
- **Messagerie Chiffrée :** Échanger des instructions en direct avec le créateur.
- **Demander des Retouches :** Ouvrir une demande de retouche formelle avec catégorie (Colorimétrie, Audio, Cadrage 9:16) et retours horodatés.
- **Double Confirmation Financière :**
  - Cliquer sur *"✅ Approuver & Libérer les Fonds"*.
  - Visualiser la ventilation financière transparente : Montant brut ($250), Commission SnapConnect 10% ($25), Net créateur ($225).
  - Confirmer le versement irréversible au créateur.
- **Ouvrir une Réclamation / Litige :** En cas de non-conformité majeure, déclencher une procédure de médiation avec gel des fonds.

#### E. Évaluation Bilatérale Post-Livraison
- Remplir la **Modale d'Évaluation Multi-Critères** :
  - Note globale (1 à 5 étoiles).
  - Critères fins : *Qualité visuelle 4K*, *Respect des délais*, *Communication*, *Maîtrise du rig smartphone & son*.
  - Switch de recommandation positive.

#### F. Portefeuille Financier Client (`/client/payments`)
- Visualiser en direct : *Solde disponible*, *Fonds verrouillés en Escrow*, *Dépenses totales*.
- Consulter le **Grand Livre Comptable (Ledger)** auditable de chaque opération (`ESCROW_HOLD`, `ESCROW_RELEASE`, `DEPOSIT`, `REFUND`).
- Déposer des fonds instantanément par carte bancaire.

#### G. Formules d'Abonnement Client (`/client/subscription`)
- Passer de la formule *Standard Gratuite* au plan *Business Growth* ($49/mois) pour débloquer : briefs illimités, filtres smartphone avancés, mise en avant prioritaire sur le Job Board et facturation consolidée TVA.

---

# 📱 3. CRÉATEUR DE CONTENU MOBILE (VIDÉASTE / PHOTOGRAPHE SMARTPHONE)

Le créateur est un professionnel spécialisé dans la production photo/vidéo sur smartphone de dernière génération.

### 🎯 Ce qu'il peut faire :

#### A. Tableau de Bord Créateur (`/creator/dashboard`)
- Suivre ses statistiques : *Shoots en cours*, *Devis en attente*, *Score de réputation*, *Gains disponibles*.

#### B. Profil & Spécifications du Matériel Smartphone (`/creator/profile`)
- Configurer sa biographie, son titre professionnel et son tarif horaire.
- **Déclarer et certifier son Rig Mobile :**
  - Smartphone principal (iPhone 16 Pro Max 4K ProRes Log, S24 Ultra).
  - Stabilisateur (DJI Osmo Mobile 6, Zhiyun Smooth 5S).
  - Micros (Rode Wireless Pro 32-bit float, DJI Mic 2).
  - Éclairage nomade (Aputure Amaran MC RGB).
- Obtenir et afficher ses badges de réputation (`✓ Vérifié`, `👑 Top Creator`, `⚡ Fast Responder`).

#### C. Gestion du Portfolio 4K (`/creator/portfolio`)
- Ajouter, catégoriser et mettre en avant ses meilleures vidéos verticales 9:16 et photos macro.

#### D. Modèle B — Création & Gestion de Packages de Services (`/creator/services`)
- Créer des offres de services avec 3 formules tarifaires (*Basic*, *Standard*, *Premium*) incluant prix, délais de livraison et nombre de révisions incluses.
- Activer ou mettre en pause ses packages en 1-clic.

#### E. Modèle A — Réponses aux Briefs & Suivi des Devis (`/creator/proposals`)
- Explorer les briefs clients ouverts sur le Job Board (`/jobs`).
- Soumettre des propositions personnalisées avec tarif, délai garanti, lettre de motivation et confirmation du matériel mobile utilisé.
- Suivre le statut de ses candidatures (*Soumis*, *Accepté*, *Rejeté*).

#### F. Exécution des Contrats & Téléversement des Livrables (`/creator/contracts`)
- Accéder à la salle de contrat dédiée :
  - Échanger avec le client via le chat chiffré.
  - Téléverser les fichiers livrables finaux en 4K 60fps avec notes de tournage et d'étalonnage.
  - Répondre aux demandes de retouches du client.
- **Évaluer le Client** : Noter la clarté du brief, la réactivité et le professionnalisme du client après clôture.

#### G. Portefeuille des Revenus & Virements Bancaires (`/creator/earnings`)
- Visualiser ses métriques financières :
  - **Solde disponible au retrait** (fonds libérés par les clients).
  - **Gains en attente en Escrow** (tournages en cours garantis par séquestre).
  - **Gains bruts cumulés** et **Total viré en banque**.
- Consulter le Grand Livre des écritures comptables et des déductions de commissions.
- **Demander un virement bancaire** (*"💳 Request Bank Payout"*) vers son compte bancaire (IBAN) ou compte Payoneer.

#### H. Pass Créateur Pro & Monétisation SaaS (`/creator/subscription`)
- Comparer les 3 formules créateur :
  - *Starter Free* : 12% de commission, 10 devis/mois.
  - *Pro Creator Pass* ($29/mois) : **Commission réduite à 8%**, 40 devis/mois, badge Pro, boost de visibilité x2.
  - *Elite Creator Studio* ($69/mois) : **Commission minimale de 5%** (conserve 95% des gains), devis illimités, mise en avant sur la page d'accueil.
- Basculer en facturation annuelle pour bénéficier de **-20% de réduction**.

---

# 🛡️ 4. ADMINISTRATEUR (MÉDIATEUR, SUPERVISEUR, ARBITRE)

L'administrateur supervise la plateforme, assure la sécurité des transactions et arbitre les litiges.

### 🎯 Ce qu'il peut faire :

#### A. Tableau de Bord d'Exploitation & KPIs (`/admin/dashboard`)
- Superviser en temps réel :
  - Volume total d'argent bloqué en séquestre (**Total Escrow in Transit**).
  - Chiffre d'affaires généré par les commissions de la plateforme (10%).
  - Nombre de créateurs certifiés smartphone.
  - Nombre de litiges ouverts nécessitant une médiation.

#### B. Console d'Arbitrage des Litiges (`/admin/contracts`)
- Examiner les réclamations ouvertes avec affichage des montants en séquestre contestés.
- **Instruction Probatoire :**
  - Consulter la **timeline chronologique probatoire** horodatée de l'ensemble des interactions.
  - Inspecter les pièces à conviction (captures d'écran, logs de discussion, fichiers 4K livrés).
- **Exécuter les 3 Sentences Arbitrales Contraignantes :**
  1. ↩️ **Remboursement intégral Client** (`FULL_REFUND_CLIENT`) : Restitution des 100% des fonds au client.
  2. 💰 **Paiement intégral Créateur** (`FULL_PAYMENT_CREATOR`) : Versement des 90% au créateur et encaissement des 10% de frais.
  3. ⚖️ **Partage financier personnalisé** (`PARTIAL_SPLIT`) : Définition des montants exacts alloués à chaque partie avec justification formelle obligatoire.

#### C. Gestion des Utilisateurs & Vérification du Matériel (`/admin/users`)
- Vérifier les équipements smartphone des créateurs et leur attribuer le badge de certification matériel.
- Suspendre ou réactiver des comptes en cas d'infraction.

#### D. Modération des Contenus Marketplace (`/admin/jobs` & `/admin/services`)
- Modérer et supprimer les briefs ou les packages non conformes aux exigences de qualité mobile.

#### E. Grand Livre des Commissions Plateforme (`/admin/payments`)
- Auditer l'ensemble des encaissements de commissions (10%) et des mouvements financiers.

#### F. Modération des Avis & Réputation (`/admin/reviews`)
- Superviser les évaluations croisées, auditer les scores de réputation calculés par l'algorithme et supprimer les avis frauduleux.

#### G. Configuration des Catégories & Niches Mobile (`/admin/categories`)
- Définir et gérer les niches de contenu smartphone (*Reels & TikTok*, *UGC*, *Produit Macro*, *Immobilier*, *Food*) ainsi que les contraintes techniques associées (9:16, 4K 60fps ProRes).

---

## 📊 MATRICE RÉCAPITULATIVE DES DROITS PAR ACTEUR

| Fonctionnalité / Module | 👤 Visiteur | 🏢 Client | 📱 Créateur | 🛡️ Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Consultation Annuaire & Profils 4K** | ✅ | ✅ | ✅ | ✅ |
| **Publication de Brief Mobile (Modèle A)** | ❌ | ✅ | ❌ | Modération |
| **Soumission de Devis / Candidatures** | ❌ | ❌ | ✅ | Modération |
| **Création de Packages de Services (Modèle B)**| ❌ | ❌ | ✅ | Modération |
| **Paiement & Verrouillage Séquestre (Escrow)** | ❌ | ✅ | ❌ | Arbitrage |
| **Salle de Contrat & Stepper Visuel 5 étapes** | ❌ | ✅ | ✅ | Audit |
| **Demandes de Retouches Horodatées** | ❌ | ✅ | Réception | Audit |
| **Double Confirmation & Libération Financière** | ❌ | ✅ | ❌ | Arbitrage |
| **Évaluation Bilatérale Multi-Critères** | ❌ | ✅ | ✅ | Modération |
| **Portefeuille & Historique Grand Livre** | ❌ | Portefeuille Client | Portefeuille Créateur | Grand Livre Global |
| **Demande de Virement Bancaire (IBAN)** | ❌ | ❌ | ✅ | Validation |
| **Souscription Pass Pro / Business (SaaS)** | ❌ | Formule Client | Formule Créateur | Gestion |
| **Arbitrage des Litiges & Sentences Financières** | ❌ | Réclamation | Réclamation | Exécution |
| **Attribution des Badges Matériel Smartphone** | ❌ | ❌ | Demande | Attribution |

---

*Document généré et intégré pour le projet PFE SnapConnect.*

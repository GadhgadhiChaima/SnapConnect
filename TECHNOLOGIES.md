# 🛠️ Technologies, Langages et Outils — SnapConnect

Ce document récapitule l'ensemble des langages de programmation, frameworks, bibliothèques, moteurs de base de données et outils de développement utilisés pour concevoir et faire fonctionner la plateforme web **SnapConnect**.

---

## 📌 1. Vue d'Ensemble de la Stack

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (SPA)                       │
│    Angular 19 • TypeScript 5.7 • Pure CSS Modern       │
│    Signals réactifs • WebSockets STOMP • Google GIS    │
└───────────────────────────▲────────────────────────────┘
                            │  HTTP REST / JSON / WebSockets
┌───────────────────────────▼────────────────────────────┐
│                    BACKEND (API)                       │
│    Java 17 • Spring Boot 4.0.7 • Spring Security       │
│    Spring Data JPA • JJWT • STOMP WebSocket Broker     │
└───────────────────────────▲────────────────────────────┘
                            │  JDBC (mysql-connector-j)
┌───────────────────────────▼────────────────────────────┐
│                 BASE DE DONNÉES (RDBMS)                │
│            MySQL 8.0+ (Port par défaut 3306)           │
└────────────────────────────────────────────────────────┘
```

---

## 💻 2. Langages de Programmation & Balisage

| Langage | Version | Usage principal dans l'application |
| :--- | :--- | :--- |
| **TypeScript** | `v5.7` | Logique applicative Frontend, typage statique rigoureux, interfaces et modèles métier. |
| **Java** | `Java 17 (LTS)` | Développement Backend, logique métier, contrôleurs REST, sécurité et persistance. |
| **JavaScript (ES2022+)** | Moderne | Exécution navigateur, APIs natives (HTML5 Canvas pour compression d'images, `FileReader`, Web Storage). |
| **HTML5** | Standard W3C | Structure sémantique des composants d'interface et accessibilité. |
| **CSS3 Pur (Vanilla)** | Spécification moderne | Design System sur-mesure (Glassmorphism, variables CSS/Tokens, Flexbox, Grid, micro-animations, responsive sans dépendance lourde comme Tailwind). |
| **SQL** | Dialecte MySQL | Définition des schémas, requêtes relationnelles et contraintes de tables. |

---

## 🎨 3. Frontend (Client Web)

- **Framework principal :** [Angular](https://angular.dev/) `v19.1`
  - **Standalone Components :** Architecture moderne sans `NgModule`.
  - **Signals réactifs :** Gestion d'état fluide et ultra-performante (`signal`, `computed`, réactivité granulaire).
  - **Angular Router & Guards :** Protection des routes (`authGuard`, `roleGuard('CLIENT')`, `roleGuard('CREATOR')`, `guestGuard`).
  - **FormsModule :** Formulaires réactifs et liaisons bidirectionnelles (`[(ngModel)]`).
- **Communication & Réactivité :**
  - **RxJS `v7.8` :** Gestion des flux asynchrones, Observables, requêtes HTTP et opérateurs de transformation (`pipe`, `map`, `catchError`).
  - **SockJS-Client `v1.6.1` & STOMP.js `v7.3.0` :** Messagerie instantanée et notifications en temps réel par WebSockets.
- **Authentification & Identité :**
  - **Google Identity Services (GIS) :** Bouton officiel Google One-Tap & OAuth 2.0 (`https://accounts.google.com/gsi/client`).
  - **Système OTP à 6 chiffres :** Saisie interactive avec auto-focus et synchronisation presse-papiers.
- **Performances & Médias :**
  - **HTML5 Canvas API :** Compression et redimensionnement automatique des photos côté client avant mise en cache locale.
  - **Typographie :** Police Google Fonts *Outfit* & *Plus Jakarta Sans*.

---

## ⚙️ 4. Backend (Serveur API)

- **Framework principal :** [Spring Boot](https://spring.io/projects/spring-boot) `v4.0.7`
  - **Spring Web / WebMVC :** Création des API RESTful (`@RestController`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`).
  - **Spring Security :** Filtres d'authentification personnalisés, contrôle d'accès basé sur les rôles (`CLIENT`, `CREATOR`, `ADMIN`), hachage sécurisé des mots de passe (`BCryptPasswordEncoder`).
  - **Spring Data JPA & Hibernate :** Couche ORM (Object-Relational Mapping), entités relationnelles, gestion des transactions (`@Transactional`).
  - **Spring WebSocket & Messaging :** Configuration du broker de messages STOMP (`/topic`, `/app`, `/user`) pour le chat instantané.
  - **Spring Starter Validation :** Validation des payloads JSON entrants (`@Valid`, `@NotNull`, `@NotBlank`, `@Email`).
- **Sécurité des Sessions & Jetons :**
  - **JJWT (Java JSON Web Token) `v0.12.6` :** Génération et vérification cryptographique des tokens d'authentification stateless (HMAC-SHA256).
- **Utilitaires & Productivité :**
  - **Project Lombok :** Réduction du code verbeux via annotations (`@Data`, `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`).

---

## 🗄️ 5. Base de Données & Stockage

- **SGBD :** **MySQL 8.0+**
- **Connecteur :** `mysql-connector-j` (Runtime JDBC Driver)
- **Modèle de données relationnel :**
  - `users` : Comptes utilisateurs, rôles, statut vérifié, avatars, coordonnées.
  - `email_verification_otps` : Codes OTP temporaires à 6 chiffres avec date d'expiration.
  - `password_reset_tokens` : Jetons sécurisés pour la réinitialisation de mot de passe.
  - `job_posts` : Briefs et annonces de tournage publiées par les clients.
  - `proposals` : Devis et candidatures déposés par les créateurs smartphone.
  - `gig_services` & `gig_packages` : Catalogue de services clé-en-main (Basic, Standard, Premium).
  - `contracts` : Contrats unifiés avec statut de séquestre (*Escrow*), jalons et montants bloqués.
  - `wallets` & `transactions` : Soldes créateurs, commissions et historique des libérations de fonds.
  - `reviews` : Avis et notes bilatérales.
  - `conversations` & `chat_messages` : Historique des discussions directes entre client et créateur.
- **Stockage Navigateur :**
  - `localStorage` : Conservation du token JWT, de la session utilisateur active et des préférences d'onboarding.

---

## 🔨 6. Outils de Développement, Build & Déploiement

| Outil | Catégorie | Description |
| :--- | :--- | :--- |
| **Node.js & npm** | Environnement JS | Gestionnaire de dépendances pour l'écosystème frontend. |
| **Angular CLI (`ng`)** | Outil de Build Frontend | Serveur de développement à rechargement à chaud (`ng serve`), compilation et bundling (`ng build`). |
| **Apache Maven (`mvn`)** | Outil de Build Java | Gestion du cycle de vie du backend, résolution des dépendances `pom.xml`, compilation et exécution (`mvn spring-boot:run`). |
| **TypeScript Compiler (`tsc`)** | Vérification statique | Validation des types et détection d'erreurs avant compilation. |
| **Git** | Contrôle de versions | Gestionnaire de versions de code source. |
| **Antigravity IDE / VS Code** | IDE | Éditeur de code et environnement de développement intégré. |
| **Navigateurs Web (DevTools)** | Débogage | Chrome / Firefox / Edge pour l'inspection des requêtes réseau, du DOM, de la console et du stockage local. |

---

## 🏛️ 7. Architecture & Principes Clés

1. **Architecture Two-Sided Marketplace :**  
   Séparation claire des parcours et des interfaces entre Clients (entreprises/marques) et Créateurs de contenu smartphone (vidéastes 4K/ProRes), supervisée par un rôle Admin.

2. **Système de Séquestre Garanti (Escrow System) :**  
   Les fonds sont consignés avant le tournage et débloqués vers le portefeuille du créateur uniquement après validation conforme des livrables 4K.

3. **Authentification Hybride Robuste :**  
   Supporte à la fois la connexion classique par Email/Mot de passe sécurisé et Google OAuth 2.0, toutes deux protégées par une vérification OTP obligatoire à 6 chiffres.

4. **Zero-Tailwind & Design System Glassmorphism :**  
   Interface premium 100% sur-mesure basée sur des variables CSS, offrant un contrôle visuel total, un halo néon moderne et une typographie raffinée sans surcharge de dépendances externes.

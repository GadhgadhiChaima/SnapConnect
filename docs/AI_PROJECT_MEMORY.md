# 🧠 SNAPCONNECT — PERMANENT AI PROJECT MEMORY

---

**Project Name:** SnapConnect  
**Academic Context:** Projet de Fin d'Études (PFE)  
**Primary Domain:** Specialized Marketplace for Smartphone Photography & Videography  
**Stack:** Angular 19.1.8 (Standalone, Pure CSS, Signals) | Spring Boot 4.0.7 | Java 17 | MySQL 8.0.46  
**Status:** Architecture Designed & Phase 1-3 Frontend Completed (90% feature coverage)  
**Last Updated:** August 2026  

---

## 📌 1. CORE MISSION & BUSINESS MODEL

SnapConnect is a two-sided marketplace specialized strictly in **mobile smartphone content creation** (TikTok, 4K Reels, YouTube Shorts, UGC, product photos, real estate mobile tours, food photography).

### Key Value Proposition:
1. **100% Smartphone Driven:** High-end mobile cameras (iPhone 15/16 Pro, S24 Ultra, Pixel 9 Pro), 4K 60fps / 10-bit ProRes Log, mobile gimbals (DJI OM 6), wireless audio.
2. **Speed & Affordability:** Turnarounds in 24h to 48h (vs 2-4 weeks for agency crews), 70% cost reduction.
3. **Dual Economic Model (Unified Contract Model - AD01):**
   - **Model A (Job Board):** Client posts brief with smartphone requirements → Creators submit custom proposals.
   - **Model B (Services):** Creator posts fixed packages (Basic, Standard, Premium) with turnaround guarantees → Client orders directly.
   - **Convergence (AD01):** Both models generate a **Single Unified Contract** instance with Escrow protection, deliverable inspection, and revisions.

---

## 🏛️ 2. SYSTEM ARCHITECTURE & CODEBASE STATUS

### 2.1 Technology Stack & Guidelines:
- **Frontend:** Angular 19.1.8, Pure CSS (No Tailwind, No SCSS syntax), Reactive Signals (`signal()`, `computed()`).
- **Documentation & Acteurs :** Guide complet des rôles et cas d'utilisation disponible dans `docs/GUIDE_ACTEURS_SNAPCONNECT.md`.
- **Backend:** Spring Boot 4.0.7 (REST API, Stateless JWT). *DO NOT MODIFY without explicit instruction*.
- **Database:** MySQL 8.0.46. *DO NOT MODIFY*.
- **Design System:** `src/styles.css` containing all CSS variables (HSL palette `#8b5cf6`, `#ec4899`, glassmorphism, buttons, inputs, responsive grids).

### 2.2 Implemented Core Modules & Features:
- **Design System & Foundations:** 18 TypeScript models, 20 reactive services, 4 guards, 2 interceptors.
- **Shared Components:** Navbar (with live counters), Footer, RatingStars, MediaModal (4K video lightbox), CreatorCard, ServiceCard, JobCard, CategoryCard.
- **Public & Auth:** Landing page (animated smartphone mockup, 3-mode hero search, agency vs mobile comparison), Login (with 1-click test accounts), Register (role selector), About, How-It-Works, Categories, Help, Contact, Terms, Privacy.
- **Marketplace:** `/creators` (filters by smartphone & rate), `/creators/:id` (portfolio lightbox & mobile gear sidebar), `/services` & `/services/:id` (3-tier packages), `/jobs` & `/jobs/:id` (proposal submit modal).
- **Client & Creator Dashboards:** `/client/dashboard`, `/creator/dashboard`.
- **Contract & Escrow Hub:** `/client/contracts/:id` (milestones, 4K deliverable preview, escrow release, revision request).
- **Messaging & Portfolio Studio:** `/client/messages`, `/creator/portfolio`, `/creator/services/create`.
- **Phase 1 Financial Architecture:** `wallet.model.ts`, `dispute.model.ts`, `reputation.model.ts`, `subscription.model.ts`, `recommendation.model.ts`, `WalletService`, `DisputeService`, `ReputationService`, `SubscriptionService`, `RecommendationService`, `EscrowStepperComponent`, `CreatorBadgeComponent`.
- **Phase 2 Client Escrow & Wallet UI:** `PaymentsComponent` (Client Wallet, Deposit flow, Ledger table), `ContractDetailComponent` (Escrow stepper, Double-confirmation approval modal, Revision flow, Dispute trigger), `ClientJobsComponent`, `JobProposalsComponent`, `ClientContractsComponent`, `ClientOrdersComponent`, `ClientProfileComponent`.
- **Phase 3 Creator Studio & Earnings UI:** `EarningsComponent` (Creator Wallet, Available Balance, Pending Escrow, Withdrawal simulation, Payout ledger), `CreatorServicesComponent` (Manage mobile packages, pause/activate), `CreatorProposalsComponent` (Submitted custom bids with gear details), `CreatorContractsComponent` (Active mobile shoots), `CreatorProfileEditComponent` (Mobile hardware & rig specs editor).
- **Phase 4 Dispute Arbitration & Admin Area:** `AdminDashboardComponent` (Platform operations & KPIs), `AdminContractsComponent` (Dispute arbitration console, timeline & evidence review, 3-way financial rulings: refund/payout/split), `AdminUsersComponent` (User management & smartphone hardware badge verification), `AdminJobsComponent`, `AdminServicesComponent`, `AdminPaymentsComponent`, `AdminReportsComponent`, `AdminCategoriesComponent`.
- **Phase 5 Two-Sided Ratings & Reputation System:** `ReviewModalComponent` (Two-sided multi-criteria review flow: 4K visual quality, deadlines, communication, smartphone gear mastery), `ContractDetailComponent` (Trigger review once completed), `AdminReviewsComponent` (Moderation of reviews & algorithmic scoring audit), `ReputationService` (Dynamic weighted score calculation 0-100 and badge triggers).
- **Phase 6 Subscriptions & Monetization Plans (SaaS Marketplace):** `CreatorSubscriptionComponent` (`/creator/subscription`, Free Starter vs Pro Creator Pass 5% take rate vs Elite Studio, monthly/annual toggle), `ClientSubscriptionComponent` (`/client/subscription`, Pay-as-you-go vs Business Growth Hub), `SubscriptionService` (Upgrade & recurring management).
- **Phase 7 Transparent Recommendation Engine:** `RecommendationMatchComponent` (Smart Match badge with transparent reasoning breakdown: gear match, category expertise, turnaround, ratings), `RecommendationService` (Personalized suggestions for Clients and Creators), integrated into `CreatorProfileComponent` and `ClientDashboardComponent`.

---

## 📜 3. ARCHITECTURAL DECISIONS (ADR) LOG

- **AD01 — Unified Contract Model:** All marketplace transactions (Model A & B) converge into one single Contract entity and UI lifecycle.
- **AD02 — Pure CSS Design System:** Zero external CSS libraries or preprocessors (No Tailwind, No SCSS) for maximum performance and strict maintainability.
- **AD03 — Escrow-First Financial Security (Designed):** Strict two-sided transaction lifecycle, double confirmation, structured disputes, two-sided reputation, wallet ledger, and configurable platform fees.

---

## 📑 4. REFERENCE DOCUMENTS

- [Architecture des Transactions Sécurisées](file:///c:/Users/lenovo/SnapConnect/docs/SECURE_MARKETPLACE_ARCHITECTURE.md)
- [Mémoire de Projet PFE](file:///c:/Users/lenovo/SnapConnect/MEMOIRE_PROJET_SNAPCONNECT.md)
- [Matrice de Suivi des Statuts](file:///c:/Users/lenovo/SnapConnect/DESCRIPTION_FONCTIONNALITES_ET_STATUTS.md)

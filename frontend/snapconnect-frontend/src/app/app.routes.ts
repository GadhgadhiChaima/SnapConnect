import { Routes } from '@angular/router';
import { authGuard }  from './core/guards/auth.guard';
import { roleGuard }  from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [

  /* ══════════════════════════════════════════════════════════
     PUBLIC PAGES
     ══════════════════════════════════════════════════════════ */
  {
    path: '',
    loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent),
    title: 'SnapConnect — Marketplace de Créateurs de Contenu Smartphone'
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./features/public/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent),
    title: 'Comment ça marche — SnapConnect'
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/public/categories/categories.component').then(m => m.CategoriesComponent),
    title: 'Catégories de Contenu — SnapConnect'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent),
    title: 'À propos — SnapConnect'
  },
  {
    path: 'help',
    loadComponent: () => import('./features/public/help/help.component').then(m => m.HelpComponent),
    title: 'Aide & FAQ — SnapConnect'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact — SnapConnect'
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/public/terms/terms.component').then(m => m.TermsComponent),
    title: 'Conditions Générales — SnapConnect'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/public/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Politique de Confidentialité — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     MARKETPLACE — Public (role-aware actions inside components)
     ══════════════════════════════════════════════════════════ */
  {
    path: 'creators',
    loadComponent: () => import('./features/marketplace/creators/creator-list/creator-list.component').then(m => m.CreatorListComponent),
    title: 'Trouver des Créateurs Mobile — SnapConnect'
  },
  {
    path: 'creators/:id',
    loadComponent: () => import('./features/marketplace/creators/creator-profile/creator-profile.component').then(m => m.CreatorProfileComponent),
    title: 'Profil Créateur — SnapConnect'
  },
  {
    path: 'services',
    loadComponent: () => import('./features/marketplace/services/services-catalog.component').then(m => m.ServicesCatalogComponent),
    title: 'Catalogue de Packages de Services — SnapConnect'
  },

  {
    path: 'jobs',
    loadComponent: () => import('./features/marketplace/jobs/job-list/job-list.component').then(m => m.JobListComponent),
    title: 'Missions & Briefs Mobile — SnapConnect'
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./features/marketplace/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent),
    title: 'Détail de la Mission — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     AUTH
     ══════════════════════════════════════════════════════════ */
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Se connecter — SnapConnect'
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Créer un compte — SnapConnect'
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Mot de passe oublié — SnapConnect'
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Réinitialiser le mot de passe — SnapConnect'
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Vérification Email — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     ONBOARDING
     ══════════════════════════════════════════════════════════ */
  {
    path: 'onboarding/client',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/client-onboarding/client-onboarding.component').then(m => m.ClientOnboardingComponent),
    title: 'Complétez votre profil — SnapConnect'
  },
  {
    path: 'onboarding/creator',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/creator-onboarding/creator-onboarding.component').then(m => m.CreatorOnboardingComponent),
    title: 'Complétez votre profil — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     CLIENT AREA
     ══════════════════════════════════════════════════════════ */
  {
    path: 'client/dashboard',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.ClientDashboardComponent),
    title: 'Tableau de bord Client — SnapConnect'
  },
  {
    path: 'client/profile',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/profile/profile.component').then(m => m.ClientProfileComponent),
    title: 'Mon Profil Entreprise — SnapConnect'
  },
  {
    path: 'client/jobs',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/jobs/client-jobs/client-jobs.component').then(m => m.ClientJobsComponent),
    title: 'Mes Briefs — SnapConnect'
  },
  {
    path: 'client/jobs/create',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/jobs/job-create/job-create.component').then(m => m.JobCreateComponent),
    title: 'Publier une Mission — SnapConnect'
  },
  {
    path: 'client/jobs/:id/proposals',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/jobs/job-proposals/job-proposals.component').then(m => m.JobProposalsComponent),
    title: 'Propositions Reçues — SnapConnect'
  },

  {
    path: 'client/contracts',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/contracts/contracts.component').then(m => m.ClientContractsComponent),
    title: 'Mes Contrats — SnapConnect'
  },
  {
    path: 'client/contracts/:id',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/shared-features/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent),
    title: 'Contrat & Séquestre — SnapConnect'
  },
  {
    path: 'client/messages',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/shared-features/messages/messages.component').then(m => m.MessagesComponent),
    title: 'Messagerie — SnapConnect'
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/messages/messages.component').then(m => m.MessagesComponent),
    title: 'Messagerie — SnapConnect'
  },
  {
    path: 'client/favorites',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/favorites/favorites.component').then(m => m.FavoritesComponent),
    title: 'Mes Favoris — SnapConnect'
  },
  {
    path: 'client/notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/notifications/notifications.component').then(m => m.NotificationsComponent),
    title: 'Notifications — SnapConnect'
  },
  {
    path: 'client/reviews',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/reviews/reviews.component').then(m => m.ReviewsComponent),
    title: 'Avis & Notations — SnapConnect'
  },
  {
    path: 'client/payments',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/payments/payments.component').then(m => m.PaymentsComponent),
    title: 'Portefeuille & Paiements — SnapConnect'
  },
  {
    path: 'client/subscription',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/subscription/subscription.component').then(m => m.ClientSubscriptionComponent),
    title: 'Formules & Abonnements — SnapConnect'
  },
  {
    path: 'client/settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Paramètres — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     CREATOR AREA
     ══════════════════════════════════════════════════════════ */
  {
    path: 'creator/dashboard',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/dashboard/dashboard.component').then(m => m.CreatorDashboardComponent),
    title: 'Tableau de bord Créateur — SnapConnect'
  },
  {
    path: 'creator/profile',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/profile/profile.component').then(m => m.CreatorProfileEditComponent),
    title: 'Modifier mon Profil — SnapConnect'
  },
  {
    path: 'creator/portfolio',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/portfolio/portfolio.component').then(m => m.PortfolioManageComponent),
    title: 'Mon Portfolio Mobile — SnapConnect'
  },
  {
    path: 'creator/services',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/services/creator-services.component').then(m => m.CreatorServicesComponent),
    title: 'Mes Services & Packages — SnapConnect'
  },

  {
    path: 'creator/proposals',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/proposals/proposals.component').then(m => m.CreatorProposalsComponent),
    title: 'Mes Propositions — SnapConnect'
  },
  {
    path: 'creator/contracts',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/contracts/contracts.component').then(m => m.CreatorContractsComponent),
    title: 'Mes Contrats — SnapConnect'
  },
  {
    path: 'creator/contracts/:id',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/shared-features/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent),
    title: 'Contrat & Séquestre — SnapConnect'
  },
  {
    path: 'creator/messages',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/shared-features/messages/messages.component').then(m => m.MessagesComponent),
    title: 'Messagerie — SnapConnect'
  },
  {
    path: 'creator/notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/notifications/notifications.component').then(m => m.NotificationsComponent),
    title: 'Notifications — SnapConnect'
  },
  {
    path: 'creator/earnings',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/earnings/earnings.component').then(m => m.EarningsComponent),
    title: 'Revenus & Retraits — SnapConnect'
  },
  {
    path: 'creator/reviews',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/reviews/reviews.component').then(m => m.ReviewsComponent),
    title: 'Avis Reçus — SnapConnect'
  },
  {
    path: 'creator/settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Paramètres — SnapConnect'
  },
  {
    path: 'creator/subscription',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/subscription/subscription.component').then(m => m.CreatorSubscriptionComponent),
    title: 'Pass Pro & Abonnements — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     ADMIN AREA
     ══════════════════════════════════════════════════════════ */
  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'Administration — SnapConnect'
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/users/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    title: 'Gestion Utilisateurs — SnapConnect Admin'
  },
  {
    path: 'admin/users/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/users/admin-user-detail/admin-user-detail.component').then(m => m.AdminUserDetailComponent),
    title: 'Détail Utilisateur — SnapConnect Admin'
  },
  {
    path: 'admin/jobs',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-jobs/admin-jobs.component').then(m => m.AdminJobsComponent),
    title: 'Modération des Briefs — SnapConnect Admin'
  },

  {
    path: 'admin/contracts',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-contracts/admin-contracts.component').then(m => m.AdminContractsComponent),
    title: 'Supervision Contrats — SnapConnect Admin'
  },
  {
    path: 'admin/payments',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-payments/admin-payments.component').then(m => m.AdminPaymentsComponent),
    title: 'Gestion Séquestre & Flux — SnapConnect Admin'
  },
  {
    path: 'admin/reviews',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-reviews/admin-reviews.component').then(m => m.AdminReviewsComponent),
    title: 'Modération Avis — SnapConnect Admin'
  },
  {
    path: 'admin/reports',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent),
    title: 'Signalements & Litiges — SnapConnect Admin'
  },
  {
    path: 'admin/categories',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
    title: 'Gestion Catégories — SnapConnect Admin'
  },
  {
    path: 'admin/settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent),
    title: 'Configuration Plateforme — SnapConnect Admin'
  },

  /* ══════════════════════════════════════════════════════════
     ERRORS & FALLBACKS
     ══════════════════════════════════════════════════════════ */
  {
    path: 'forbidden',
    loadComponent: () => import('./features/errors/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
    title: 'Accès Refusé — SnapConnect'
  },
  {
    path: '404',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Non Trouvée — SnapConnect'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

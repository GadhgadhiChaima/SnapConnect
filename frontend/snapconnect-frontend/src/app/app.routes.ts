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
    title: 'SnapConnect — Mobile Content Creators Marketplace'
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./features/public/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent),
    title: 'How It Works — SnapConnect'
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/public/categories/categories.component').then(m => m.CategoriesComponent),
    title: 'Content Categories — SnapConnect'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent),
    title: 'About — SnapConnect'
  },
  {
    path: 'help',
    loadComponent: () => import('./features/public/help/help.component').then(m => m.HelpComponent),
    title: 'Help & FAQ — SnapConnect'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact — SnapConnect'
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/public/terms/terms.component').then(m => m.TermsComponent),
    title: 'Terms of Service — SnapConnect'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/public/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     MARKETPLACE — Public (role-aware actions inside components)
     ══════════════════════════════════════════════════════════ */
  {
    path: 'creators',
    loadComponent: () => import('./features/marketplace/creators/creator-list/creator-list.component').then(m => m.CreatorListComponent),
    title: 'Find Mobile Creators — SnapConnect'
  },
  {
    path: 'creators/:id',
    loadComponent: () => import('./features/marketplace/creators/creator-profile/creator-profile.component').then(m => m.CreatorProfileComponent),
    title: 'Creator Profile — SnapConnect'
  },
  {
    path: 'services',
    loadComponent: () => import('./features/marketplace/services/service-list/service-list.component').then(m => m.ServiceListComponent),
    title: 'Browse Services — SnapConnect'
  },
  {
    path: 'services/:id',
    loadComponent: () => import('./features/marketplace/services/service-detail/service-detail.component').then(m => m.ServiceDetailComponent),
    title: 'Service Detail — SnapConnect'
  },
  {
    path: 'jobs',
    loadComponent: () => import('./features/marketplace/jobs/job-list/job-list.component').then(m => m.JobListComponent),
    title: 'Job Board — SnapConnect'
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./features/marketplace/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent),
    title: 'Job Detail — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     AUTH
     ══════════════════════════════════════════════════════════ */
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In — SnapConnect'
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Join SnapConnect'
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password — SnapConnect'
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Reset Password — SnapConnect'
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Verify Email — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     ONBOARDING
     ══════════════════════════════════════════════════════════ */
  {
    path: 'onboarding/client',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/client-onboarding/client-onboarding.component').then(m => m.ClientOnboardingComponent),
    title: 'Complete Your Profile — SnapConnect'
  },
  {
    path: 'onboarding/creator',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/creator-onboarding/creator-onboarding.component').then(m => m.CreatorOnboardingComponent),
    title: 'Set Up Your Creator Profile — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     CLIENT AREA
     ══════════════════════════════════════════════════════════ */
  {
    path: 'client/dashboard',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.ClientDashboardComponent),
    title: 'Dashboard — SnapConnect'
  },
  {
    path: 'client/profile',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/profile/profile.component').then(m => m.ClientProfileComponent),
    title: 'My Profile — SnapConnect'
  },
  {
    path: 'client/jobs',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/jobs/client-jobs/client-jobs.component').then(m => m.ClientJobsComponent),
    title: 'My Jobs — SnapConnect'
  },
  {
    path: 'client/jobs/create',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/jobs/job-create/job-create.component').then(m => m.JobCreateComponent),
    title: 'Post a Job — SnapConnect'
  },
  {
    path: 'client/jobs/:id/proposals',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/jobs/job-proposals/job-proposals.component').then(m => m.JobProposalsComponent),
    title: 'Job Proposals — SnapConnect'
  },
  {
    path: 'client/orders',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/orders/orders.component').then(m => m.ClientOrdersComponent),
    title: 'My Orders — SnapConnect'
  },
  {
    path: 'client/contracts',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/contracts/contracts.component').then(m => m.ClientContractsComponent),
    title: 'My Contracts — SnapConnect'
  },
  {
    path: 'client/contracts/:id',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/shared-features/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent),
    title: 'Contract — SnapConnect'
  },
  {
    path: 'client/messages',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/shared-features/messages/messages.component').then(m => m.MessagesComponent),
    title: 'Messages — SnapConnect'
  },
  {
    path: 'client/favorites',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/favorites/favorites.component').then(m => m.FavoritesComponent),
    title: 'Favorites — SnapConnect'
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
    title: 'Reviews — SnapConnect'
  },
  {
    path: 'client/payments',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/payments/payments.component').then(m => m.PaymentsComponent),
    title: 'Payments — SnapConnect'
  },
  {
    path: 'client/subscription',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadComponent: () => import('./features/client/subscription/subscription.component').then(m => m.ClientSubscriptionComponent),
    title: 'Subscription & Plans — SnapConnect'
  },
  {
    path: 'client/settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     CREATOR AREA
     ══════════════════════════════════════════════════════════ */
  {
    path: 'creator/dashboard',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/dashboard/dashboard.component').then(m => m.CreatorDashboardComponent),
    title: 'Dashboard — SnapConnect'
  },
  {
    path: 'creator/profile',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/profile/profile.component').then(m => m.CreatorProfileEditComponent),
    title: 'Edit Profile — SnapConnect'
  },
  {
    path: 'creator/portfolio',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/portfolio/portfolio.component').then(m => m.PortfolioManageComponent),
    title: 'My Portfolio — SnapConnect'
  },
  {
    path: 'creator/services',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/services/creator-services/creator-services.component').then(m => m.CreatorServicesComponent),
    title: 'My Services — SnapConnect'
  },
  {
    path: 'creator/services/create',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/services/service-create/service-create.component').then(m => m.ServiceCreateComponent),
    title: 'Create a Service — SnapConnect'
  },
  {
    path: 'creator/services/:id/edit',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/services/service-edit/service-edit.component').then(m => m.ServiceEditComponent),
    title: 'Edit Service — SnapConnect'
  },
  {
    path: 'creator/proposals',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/proposals/proposals.component').then(m => m.CreatorProposalsComponent),
    title: 'My Proposals — SnapConnect'
  },
  {
    path: 'creator/contracts',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/contracts/contracts.component').then(m => m.CreatorContractsComponent),
    title: 'My Contracts — SnapConnect'
  },
  {
    path: 'creator/contracts/:id',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/shared-features/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent),
    title: 'Contract — SnapConnect'
  },
  {
    path: 'creator/messages',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/shared-features/messages/messages.component').then(m => m.MessagesComponent),
    title: 'Messages — SnapConnect'
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
    title: 'Earnings — SnapConnect'
  },
  {
    path: 'creator/reviews',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/reviews/reviews.component').then(m => m.ReviewsComponent),
    title: 'Reviews — SnapConnect'
  },
  {
    path: 'creator/settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings — SnapConnect'
  },
  {
    path: 'creator/subscription',
    canActivate: [authGuard, roleGuard('CREATOR')],
    loadComponent: () => import('./features/creator/subscription/subscription.component').then(m => m.CreatorSubscriptionComponent),
    title: 'Pro Pass & Plans — SnapConnect'
  },

  /* ══════════════════════════════════════════════════════════
     ADMIN AREA
     ══════════════════════════════════════════════════════════ */
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'Admin Dashboard — SnapConnect'
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/users/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    title: 'Users — Admin'
  },
  {
    path: 'admin/users/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/users/admin-user-detail/admin-user-detail.component').then(m => m.AdminUserDetailComponent),
    title: 'User Detail — Admin'
  },
  {
    path: 'admin/jobs',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-jobs/admin-jobs.component').then(m => m.AdminJobsComponent),
    title: 'Jobs — Admin'
  },
  {
    path: 'admin/services',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-services/admin-services.component').then(m => m.AdminServicesComponent),
    title: 'Services — Admin'
  },
  {
    path: 'admin/contracts',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-contracts/admin-contracts.component').then(m => m.AdminContractsComponent),
    title: 'Contracts — Admin'
  },
  {
    path: 'admin/payments',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-payments/admin-payments.component').then(m => m.AdminPaymentsComponent),
    title: 'Payments — Admin'
  },
  {
    path: 'admin/reviews',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-reviews/admin-reviews.component').then(m => m.AdminReviewsComponent),
    title: 'Reviews — Admin'
  },
  {
    path: 'admin/reports',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent),
    title: 'Reports — Admin'
  },
  {
    path: 'admin/categories',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
    title: 'Categories — Admin'
  },
  {
    path: 'admin/settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent),
    title: 'Settings — Admin'
  },

  /* ══════════════════════════════════════════════════════════
     ERRORS & FALLBACKS
     ══════════════════════════════════════════════════════════ */
  {
    path: 'forbidden',
    loadComponent: () => import('./features/errors/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
    title: 'Access Denied — SnapConnect'
  },
  {
    path: '404',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found — SnapConnect'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

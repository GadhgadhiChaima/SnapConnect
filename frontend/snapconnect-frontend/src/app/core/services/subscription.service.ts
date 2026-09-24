import { Injectable, signal } from '@angular/core';
import { SubscriptionPlan, UserSubscription } from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  creatorPlans = signal<SubscriptionPlan[]>([
    {
      id: 'plan-cr-free',
      targetRole: 'CREATOR',
      code: 'FREE',
      title: 'Créateur Débutant',
      priceMonthly: 0,
      currency: 'DT',
      platformFeePercent: 12,
      proposalsMonthlyLimit: 10,
      featuredPlacement: false,
      features: [
        { text: '10 propositions de briefs par mois', included: true },
        { text: 'Portfolio mobile standard (jusqu\'à 6 réalisations)', included: true },
        { text: 'Frais de plateforme de 12%', included: true },
        { text: 'Visibilité standard dans les recherches', included: true },
        { text: 'Badge Vérifié Pro Créateur', included: false },
        { text: 'Mise en avant sur la page d\'accueil', included: false }
      ]
    },
    {
      id: 'plan-cr-pro',
      targetRole: 'CREATOR',
      code: 'PRO',
      title: 'Créateur Pro',
      badgeLabel: 'POPULAIRE',
      priceMonthly: 29,
      currency: 'DT',
      platformFeePercent: 8,
      proposalsMonthlyLimit: 40,
      featuredPlacement: false,
      features: [
        { text: '40 propositions de briefs par mois', included: true, highlight: true },
        { text: 'Portfolio mobile 4K illimité', included: true },
        { text: 'Frais réduits à 8% (économisez 33%)', included: true, highlight: true },
        { text: 'Badge vérifié Pro Créateur sur le profil', included: true },
        { text: 'Boost de visibilité x2 dans la recherche', included: true },
        { text: 'Mise en avant sur la page d\'accueil', included: false }
      ]
    },
    {
      id: 'plan-cr-prem',
      targetRole: 'CREATOR',
      code: 'PREMIUM',
      title: 'Studio Créateur Élite',
      badgeLabel: 'REVENUS MAX',
      priceMonthly: 69,
      currency: 'DT',
      platformFeePercent: 5,
      proposalsMonthlyLimit: -1,
      featuredPlacement: true,
      features: [
        { text: 'Propositions de briefs illimitées', included: true, highlight: true },
        { text: 'Frais minimum de 5% (conservez 95% de vos revenus)', included: true, highlight: true },
        { text: 'Mise en avant sur la page d\'accueil SnapConnect', included: true, highlight: true },
        { text: 'Badge Élite Or sur votre profil et vos cartes', included: true },
        { text: 'Support dédié prioritaire & médiation 24/7', included: true },
        { text: 'Accès prioritaire aux briefs entreprises haut budget', included: true }
      ]
    }
  ]);

  clientPlans = signal<SubscriptionPlan[]>([
    {
      id: 'plan-cl-free',
      targetRole: 'CLIENT',
      code: 'FREE',
      title: 'Client Standard',
      priceMonthly: 0,
      currency: 'DT',
      platformFeePercent: 0,
      featuredPlacement: false,
      features: [
        { text: 'Jusqu\'à 3 briefs mobiles actifs en simultané', included: true },
        { text: 'Recherche standard dans le catalogue de créateurs', included: true },
        { text: 'Protection acheteur 100% avec séquestre', included: true },
        { text: 'Espace d\'équipe multi-utilisateurs', included: false }
      ]
    },
    {
      id: 'plan-cl-biz',
      targetRole: 'CLIENT',
      code: 'BUSINESS',
      title: 'Croissance Entreprise',
      badgeLabel: 'POUR MARQUES',
      priceMonthly: 49,
      currency: 'DT',
      platformFeePercent: 0,
      featuredPlacement: false,
      features: [
        { text: 'Briefs mobiles actifs illimités', included: true, highlight: true },
        { text: 'Filtres avancés (modèles de smartphone & stabilisateurs)', included: true },
        { text: 'Mise en avant prioritaire en tête de la liste des missions', included: true, highlight: true },
        { text: 'Facturation TVA centralisée & rapports mensuels', included: true },
        { text: 'Compte d\'équipe multi-membres (jusqu\'à 5 accès)', included: true }
      ]
    }
  ]);

  currentSubscription = signal<UserSubscription>({
    userId: 'cr-1',
    planId: 'plan-cr-pro',
    planCode: 'PRO',
    status: 'ACTIVE',
    startDate: '2026-08-01',
    renewalDate: '2026-09-01',
    autoRenew: true
  });

  upgradePlan(planId: string, planCode: string): void {
    this.currentSubscription.set({
      userId: 'cr-1',
      planId,
      planCode,
      status: 'ACTIVE',
      startDate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      autoRenew: true
    });
  }
}

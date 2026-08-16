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
      title: 'Starter Creator',
      priceMonthly: 0,
      currency: 'USD',
      platformFeePercent: 12,
      proposalsMonthlyLimit: 10,
      featuredPlacement: false,
      features: [
        { text: '10 custom brief proposals per month', included: true },
        { text: 'Standard mobile portfolio (up to 6 items)', included: true },
        { text: '12% platform transaction fee', included: true },
        { text: 'Standard search ranking', included: true },
        { text: 'Verified Pro Creator badge', included: false },
        { text: 'Homepage featured showcase', included: false }
      ]
    },
    {
      id: 'plan-cr-pro',
      targetRole: 'CREATOR',
      code: 'PRO',
      title: 'Pro Creator',
      badgeLabel: 'POPULAR',
      priceMonthly: 29,
      currency: 'USD',
      platformFeePercent: 8,
      proposalsMonthlyLimit: 40,
      featuredPlacement: false,
      features: [
        { text: '40 custom brief proposals per month', included: true, highlight: true },
        { text: 'Unlimited mobile portfolio showcase (4K)', included: true },
        { text: 'Reduced 8% platform fee (save 33%)', included: true, highlight: true },
        { text: 'Pro Creator verified profile badge', included: true },
        { text: '2x Visibility Boost in creator search', included: true },
        { text: 'Homepage featured showcase', included: false }
      ]
    },
    {
      id: 'plan-cr-prem',
      targetRole: 'CREATOR',
      code: 'PREMIUM',
      title: 'Elite Creator Studio',
      badgeLabel: 'MAX EARNINGS',
      priceMonthly: 69,
      currency: 'USD',
      platformFeePercent: 5,
      proposalsMonthlyLimit: -1,
      featuredPlacement: true,
      features: [
        { text: 'Unlimited custom brief proposals', included: true, highlight: true },
        { text: 'Lowest 5% platform fee (keep 95% of earnings)', included: true, highlight: true },
        { text: 'Featured Placement on SnapConnect Homepage', included: true, highlight: true },
        { text: 'Elite Gold Badge on profile & cards', included: true },
        { text: 'Priority 24/7 dedicated support & mediation', included: true },
        { text: 'Early access to high-budget enterprise briefs', included: true }
      ]
    }
  ]);

  clientPlans = signal<SubscriptionPlan[]>([
    {
      id: 'plan-cl-free',
      targetRole: 'CLIENT',
      code: 'FREE',
      title: 'Standard Client',
      priceMonthly: 0,
      currency: 'USD',
      platformFeePercent: 0,
      featuredPlacement: false,
      features: [
        { text: 'Up to 3 active mobile briefs at once', included: true },
        { text: 'Standard creator marketplace search', included: true },
        { text: '100% Escrow buyer protection', included: true },
        { text: 'Multi-user team workspace', included: false }
      ]
    },
    {
      id: 'plan-cl-biz',
      targetRole: 'CLIENT',
      code: 'BUSINESS',
      title: 'Business Growth',
      badgeLabel: 'FOR BRANDS',
      priceMonthly: 49,
      currency: 'USD',
      platformFeePercent: 0,
      featuredPlacement: false,
      features: [
        { text: 'Unlimited active mobile briefs', included: true, highlight: true },
        { text: 'Advanced filters (specific smartphone models & gimbals)', included: true },
        { text: 'Priority brief placement at the top of Job Board', included: true, highlight: true },
        { text: 'Centralized VAT invoicing & monthly reporting', included: true },
        { text: 'Multi-member team account (up to 5 seats)', included: true }
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

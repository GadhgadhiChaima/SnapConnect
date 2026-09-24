import { Injectable, signal } from '@angular/core';
import {
  CreatorReputationProfile,
  CreatorRatingBreakdown,
  ClientRatingBreakdown,
  TwoSidedReview,
  ReviewSubmitRequest
} from '../models/reputation.model';

@Injectable({
  providedIn: 'root'
})
export class ReputationService {
  /* Sample Reviews Store */
  reviews = signal<TwoSidedReview[]>([
    {
      id: 'rev-1',
      contractId: 'ct-1',
      reviewerId: 'cl-1',
      reviewerName: 'Maison Alyssa Cosmétiques Bio',
      reviewerRole: 'CLIENT',
      revieweeId: 'cr-1',
      revieweeName: 'Sarah Ben Salem',
      revieweeRole: 'CREATOR',
      overallRating: 5.0,
      qualityRating: 5.0,
      communicationRating: 5.0,
      deadlinesRating: 5.0,
      equipmentMasteryRating: 5.0,
      comment: 'Qualité 4K exceptionnelle ! Ses prises de vue sur iPhone 16 Pro sont plus nettes que notre ancienne équipe DSLR en studio, et livraison en 36h !',
      recommended: true,
      status: 'PUBLISHED',
      createdAt: '2026-08-12 15:30'
    },
    {
      id: 'rev-2',
      contractId: 'ct-2',
      reviewerId: 'cr-1',
      reviewerName: 'Sarah Ben Salem',
      reviewerRole: 'CREATOR',
      revieweeId: 'cl-1',
      revieweeName: 'Maison Alyssa Cosmétiques Bio',
      revieweeRole: 'CLIENT',
      overallRating: 5.0,
      communicationRating: 5.0,
      comment: 'Excellent client ! Brief créatif très clair, retours rapides et déblocage immédiat des fonds en séquestre.',
      recommended: true,
      status: 'PUBLISHED',
      createdAt: '2026-08-12 16:00'
    }
  ]);

  /* Sample Creator Reputation Profile */
  sampleProfile = signal<CreatorReputationProfile>({
    creatorId: 'cr-1',
    level: 'TOP_CREATOR',
    weightedScore: 96.4,
    overallRating: 4.95,
    totalReviewsCount: 38,
    completedProjectsCount: 47,
    completionRate: 98,
    onTimeDeliveryRate: 96,
    averageResponseHours: 1.2,
    disputeRate: 0,
    repeatClientsRate: 34,
    badges: [
      {
        type: 'VERIFIED_CREATOR',
        label: 'Créateur Smartphone Certifié',
        icon: 'verified',
        description: 'Identité et matériel mobile 4K vérifiés par SnapConnect',
        earnedAt: '2026-06-01'
      },
      {
        type: 'TOP_CREATOR',
        label: 'Top Créateur Recommandé',
        icon: 'crown',
        description: 'Maintien d\'une note de 4.9+ sur plus de 40 commandes',
        earnedAt: '2026-07-15'
      },
      {
        type: 'FAST_RESPONDER',
        label: 'Réponse Éclair (< 2h)',
        icon: 'zap',
        description: 'Temps moyen de réponse aux messages client inférieur à 2h',
        earnedAt: '2026-06-10'
      },
      {
        type: 'IPHONE_PRO_EXPERT',
        label: 'Expert iPhone 16 Pro Max 4K',
        icon: 'smartphone',
        description: 'Vidéaste certifié 4K 60fps ProRes Log sur smartphone',
        earnedAt: '2026-06-05'
      }
    ],
    recentReviews: [
      {
        overall: 5.0,
        videoQuality: 5.0,
        gearMastery: 5.0,
        communication: 5.0,
        deadlineRespect: 5.0,
        valueForMoney: 4.8,
        tags: ['Livraison Rapide', 'Cinématique 4K', 'Super Éclairage', 'Expert iPhone Pro'],
        comment: 'Qualité 4K exceptionnelle ! Ses prises de vue sur iPhone 16 Pro sont plus nettes que notre ancienne équipe DSLR en studio, et livraison en 36h !',
        ratedAt: '2026-08-12'
      }
    ]
  });

  /* Calculate Weighted Ranking Score */
  calculateScore(r: number, completion: number, onTime: number, responseHrs: number, disputes: number): number {
    const normRating = (r / 5) * 40;            // Max 40 points
    const normCompletion = (completion / 100) * 25; // Max 25 points
    const normOnTime = (onTime / 100) * 20;     // Max 20 points
    const normResponse = Math.max(0, 15 - responseHrs * 2); // Max 15 points
    const penaltyDisputes = disputes * 15;      // -15 points per lost dispute

    return Math.max(0, Math.min(100, normRating + normCompletion + normOnTime + normResponse - penaltyDisputes));
  }

  /* Submit Two-Sided Review */
  submitReview(req: ReviewSubmitRequest): void {
    const newRev: TwoSidedReview = {
      id: 'rev-' + (this.reviews().length + 1),
      contractId: req.contractId,
      reviewerId: req.reviewerId,
      reviewerName: req.reviewerName,
      reviewerRole: req.reviewerRole,
      revieweeId: req.revieweeId,
      revieweeName: req.reviewerRole === 'CLIENT' ? 'Sarah Ben Salem' : 'Maison Alyssa Cosmétiques Bio',
      revieweeRole: req.reviewerRole === 'CLIENT' ? 'CREATOR' : 'CLIENT',
      overallRating: req.overallRating,
      qualityRating: req.qualityRating,
      communicationRating: req.communicationRating,
      deadlinesRating: req.deadlinesRating,
      equipmentMasteryRating: req.equipmentMasteryRating,
      comment: req.comment,
      recommended: req.recommended,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    this.reviews.update(prev => [newRev, ...prev]);

    // Recalculate profile score
    if (req.reviewerRole === 'CLIENT') {
      this.sampleProfile.update(prev => ({
        ...prev,
        totalReviewsCount: prev.totalReviewsCount + 1,
        overallRating: Number(((prev.overallRating * prev.totalReviewsCount + req.overallRating) / (prev.totalReviewsCount + 1)).toFixed(2)),
        weightedScore: Number(this.calculateScore(
          (prev.overallRating * prev.totalReviewsCount + req.overallRating) / (prev.totalReviewsCount + 1),
          prev.completionRate,
          prev.onTimeDeliveryRate,
          prev.averageResponseHours,
          0
        ).toFixed(1))
      }));
    }
  }

  submitCreatorReview(contractId: string, breakdown: CreatorRatingBreakdown): void {
    alert('Creator rating submitted! Your feedback has been recorded in the creator reputation score.');
  }

  submitClientReview(contractId: string, breakdown: ClientRatingBreakdown): void {
    alert('Client review submitted! Added to client reputation profile.');
  }
}

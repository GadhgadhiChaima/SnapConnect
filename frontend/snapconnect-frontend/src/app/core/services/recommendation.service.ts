import { Injectable, signal } from '@angular/core';
import { CreatorRecommendation, JobRecommendation } from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  /* Client Personalized Recommendations */
  recommendedCreatorsForClient = signal<CreatorRecommendation[]>([
    {
      creator: {
        id: 'cr-1',
        userId: 'u-1',
        fullName: 'Sarah Ben Salem',
        email: 'sarah.bensalem@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        title: 'Spécialiste TikTok & Reels UGC Viral',
        bio: 'Vidéaste mobile basée à Tunis avec plus de 500K vues cumulées. Spécialisée dans les montages dynamiques et le storytelling.',
        location: 'Tunis (La Marsa), Tunisie',
        hourlyRate: 45,
        rating: 4.95,
        reviewsCount: 38,
        completedProjectsCount: 47,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['Reels & TikTok', 'UGC Content', 'Fashion'],
        equipment: { smartphoneModel: 'iPhone 16 Pro Max (4K ProRes)', gimbal: 'DJI OM 6' }
      },
      matchScore: 98,
      matchReasons: [
        'Correspond à vos exigences vidéo 4K ProRes (iPhone 16 Pro Max)',
        'Top Créatrice notée 4.95/5 dans la catégorie Reels & TikTok',
        'Temps moyen de réponse inférieur à 1.2 heure'
      ]
    },
    {
      creator: {
        id: 'cr-2',
        userId: 'u-2',
        fullName: 'Mehdi Trabelsi',
        email: 'mehdi.trabelsi@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        title: 'Storyteller Mobile Food & Gastronomie',
        bio: 'Création de Reels 4K 60fps alléchants pour restaurants et salons de thé. Tournage sur Galaxy S24 Ultra avec macro.',
        location: 'Sousse, Tunisie',
        hourlyRate: 50,
        rating: 5.0,
        reviewsCount: 29,
        completedProjectsCount: 34,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['Food & Restaurant', 'Product Photography'],
        equipment: { smartphoneModel: 'Samsung Galaxy S24 Ultra', gimbal: 'Zhiyun Smooth 5S' }
      },
      matchScore: 92,
      matchReasons: [
        'Spécialisé dans les tournages mobiles Gastronomie & Restaurants',
        '100% de respect des délais sur plus de 34 commandes',
        'Dans votre tranche de budget (45-55 DT/h)'
      ]
    }
  ]);

  /* Creator Personalized Recommendations */
  recommendedJobsForCreator = signal<JobRecommendation[]>([
    {
      job: {
        id: 'jb-1',
        clientId: 'cl-1',
        clientName: 'Maison Alyssa Cosmétiques Bio',
        title: '5 Vidéos Verticales Esthétiques Unboxing pour TikTok / Reels',
        description: 'Recherche d\'un vidéaste mobile pour filmer 5 clips verticaux mettant en valeur notre nouvelle gamme de soins bio tunisiens.',
        categoryName: 'Reels & TikTok',
        budgetType: 'FIXED',
        budgetMin: 250,
        budgetMax: 250,
        deadline: '2026-08-20',
        location: 'À distance (Tunisie)',
        isRemote: true,
        status: 'OPEN',
        proposalsCount: 6,
        requiredGear: 'iPhone 15 Pro / 16 Pro (4K 60fps ProRes)',
        postedDate: '2026-08-12'
      },
      matchScore: 97,
      matchReasons: [
        'Exige votre configuration exacte : iPhone 16 Pro Max',
        'Correspond à votre niche principale : Reels & TikTok',
        'Budget fixe de 250 DT correspond à vos tarifs habituels'
      ]
    }
  ]);
}

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
        fullName: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        title: 'TikTok & Reels Viral Specialist',
        bio: 'Mobile videographer with 400K+ views on client TikToks. Specializing in fast-paced cuts and hook psychology.',
        location: 'Paris, France',
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
        'Matches your 4K ProRes mobile video requirements (iPhone 16 Pro Max)',
        'Top Rated with 4.95/5 in Reels & TikTok category',
        'Average response time under 1.2 hours'
      ]
    },
    {
      creator: {
        id: 'cr-2',
        userId: 'u-2',
        fullName: 'Marc Dupont',
        email: 'marc.d@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        title: 'Food & Restaurant Mobile Storyteller',
        bio: 'Creating mouthwatering 4K 60fps reels for upscale bistros. Shot on Galaxy S24 Ultra with macro lenses.',
        location: 'Lyon, France',
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
        'Specialized in Restaurant & Food Mobile Shoots',
        '100% On-Time Delivery Rate over 34 orders',
        'Within your budget range ($45-$55/hr)'
      ]
    }
  ]);

  /* Creator Personalized Recommendations */
  recommendedJobsForCreator = signal<JobRecommendation[]>([
    {
      job: {
        id: 'jb-1',
        clientId: 'cl-1',
        clientName: 'Bloom Cosmetics',
        title: '5 Aesthetic Vertical Unboxing Videos for TikTok / Reels',
        description: 'Looking for a skilled mobile videographer to film 5 vertical clips highlighting our new organic skincare line.',
        categoryName: 'Reels & TikTok',
        budgetType: 'FIXED',
        budgetMin: 250,
        budgetMax: 250,
        deadline: '2026-08-20',
        location: 'Remote',
        isRemote: true,
        status: 'OPEN',
        proposalsCount: 6,
        requiredGear: 'iPhone 15 Pro / 16 Pro (4K 60fps ProRes)',
        postedDate: '2026-08-12'
      },
      matchScore: 97,
      matchReasons: [
        'Requires your exact smartphone setup: iPhone 16 Pro Max',
        'Matches your primary niche: Reels & TikTok',
        'Fixed budget of $250 matches your typical pricing'
      ]
    }
  ]);
}

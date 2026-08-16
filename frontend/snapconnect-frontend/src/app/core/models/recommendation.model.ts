/* Transparent Rule-Based Recommendations domain model */

import { CreatorProfile } from './creator.model';
import { Job } from './job.model';

export interface CreatorRecommendation {
  creator: CreatorProfile;
  matchScore: number;          // e.g. 96%
  matchReasons: string[];      // e.g. ["Matches your iPhone 16 Pro requirement", "Top rated in Reels & TikTok", "Located in Paris"]
}

export interface JobRecommendation {
  job: Job;
  matchScore: number;          // e.g. 94%
  matchReasons: string[];      // e.g. ["Matches your iPhone gear", "Budget above $200", "Category: Food & Restaurant"]
}

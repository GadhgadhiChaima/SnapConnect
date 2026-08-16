/* Dispute domain model */

export type DisputeStatus =
  | 'OPEN'                   // Dispute filed, awaiting response
  | 'WAITING_FOR_RESPONSE'   // Awaiting other party's statement/evidence
  | 'UNDER_REVIEW'           // Admin arbitration active
  | 'RESOLVED_CLIENT'        // Resolved: 100% refund to client
  | 'RESOLVED_CREATOR'       // Resolved: 100% payout to creator
  | 'PARTIAL_RESOLUTION'     // Resolved: split refund/payout
  | 'CLOSED';                // Dispute archived

export type DisputeReasonClient =
  | 'WORK_NOT_DELIVERED'
  | 'WORK_DIFFERS_FROM_BRIEF'
  | 'POOR_QUALITY'
  | 'MISSING_FILES'
  | 'DEADLINE_EXCEEDED'
  | 'CREATOR_UNRESPONSIVE'
  | 'UNAUTHORIZED_CONTENT';

export type DisputeReasonCreator =
  | 'CLIENT_UNRESPONSIVE'
  | 'SCOPE_CREEP_REFUSAL'
  | 'UNJUSTIFIED_REJECTION'
  | 'REVISION_ABUSE'
  | 'PAYMENT_ISSUE'
  | 'FALSE_COMPLAINT';

export interface DisputeEvidence {
  id: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: 'CLIENT' | 'CREATOR' | 'ADMIN';
  fileUrl: string;
  fileName: string;
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  note?: string;
  uploadedAt: string;
}

export interface DisputeTimelineEvent {
  id: string;
  timestamp: string;
  actor: 'CLIENT' | 'CREATOR' | 'ADMIN' | 'SYSTEM';
  actorName: string;
  title: string;
  description: string;
}

export interface DisputeResolution {
  decision: 'FULL_REFUND_CLIENT' | 'FULL_PAYMENT_CREATOR' | 'PARTIAL_SPLIT';
  clientRefundAmount: number;
  creatorPayoutAmount: number;
  platformFeeAmount: number;
  adminNotes: string;
  resolvedAt: string;
  resolvedBy: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  contractTitle: string;
  openedByUserId: string;
  openedByName: string;
  openedByRole: 'CLIENT' | 'CREATOR';
  respondentId: string;
  respondentName: string;
  amountDisputed: number;
  currency: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEvent[];
  resolution?: DisputeResolution;
  createdAt: string;
  updatedAt: string;
}

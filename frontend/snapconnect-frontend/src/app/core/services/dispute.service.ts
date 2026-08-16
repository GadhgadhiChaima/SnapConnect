import { Injectable, signal } from '@angular/core';
import { Dispute, DisputeResolution } from '../models/dispute.model';

@Injectable({
  providedIn: 'root'
})
export class DisputeService {
  disputes = signal<Dispute[]>([
    {
      id: 'dsp-101',
      contractId: 'ct-8',
      contractTitle: 'Real Estate 4K Mobile Tour - Luxury Loft',
      openedByUserId: 'cl-2',
      openedByName: 'Immo Prestige',
      openedByRole: 'CLIENT',
      respondentId: 'cr-3',
      respondentName: 'Lucas Bernard',
      amountDisputed: 320,
      currency: 'USD',
      reason: 'DEADLINE_EXCEEDED',
      description: 'The creator was supposed to deliver the 4K vertical tour within 48h for our open house. 5 days have passed with no response.',
      status: 'UNDER_REVIEW',
      createdAt: '2026-08-11 10:00',
      updatedAt: '2026-08-13 15:30',
      evidence: [
        {
          id: 'ev-1',
          uploaderId: 'cl-2',
          uploaderName: 'Immo Prestige',
          uploaderRole: 'CLIENT',
          fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          fileName: 'Brief_Confirmation_Screenshot.png',
          fileType: 'IMAGE',
          note: 'Screenshot showing agreed deadline for Friday 18:00',
          uploadedAt: '2026-08-11 10:05'
        }
      ],
      timeline: [
        {
          id: 'tl-1',
          timestamp: '2026-08-08 09:00',
          actor: 'SYSTEM',
          actorName: 'SnapConnect Escrow',
          title: 'Escrow Secured',
          description: '$320 locked in Escrow'
        },
        {
          id: 'tl-2',
          timestamp: '2026-08-11 10:00',
          actor: 'CLIENT',
          actorName: 'Immo Prestige',
          title: 'Dispute Opened',
          description: 'Reason: Deadline exceeded with no delivery'
        },
        {
          id: 'tl-3',
          timestamp: '2026-08-13 15:30',
          actor: 'ADMIN',
          actorName: 'SnapConnect Mediation Team',
          title: 'Under Review',
          description: 'Mediation specialist assigned. Investigating logs.'
        }
      ]
    }
  ]);

  /* Open a new dispute */
  openDispute(contractId: string, contractTitle: string, reason: string, description: string, amount: number): Dispute {
    const newDispute: Dispute = {
      id: 'dsp-' + Date.now(),
      contractId,
      contractTitle,
      openedByUserId: 'cl-1',
      openedByName: 'Bloom Cosmetics',
      openedByRole: 'CLIENT',
      respondentId: 'cr-1',
      respondentName: 'Sarah Jenkins',
      amountDisputed: amount,
      currency: 'USD',
      reason,
      description,
      status: 'OPEN',
      evidence: [],
      timeline: [
        {
          id: 'tl-init',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          actor: 'CLIENT',
          actorName: 'Bloom Cosmetics',
          title: 'Dispute Opened',
          description: reason + ': ' + description
        }
      ],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    this.disputes.update(prev => [newDispute, ...prev]);
    return newDispute;
  }

  /* Admin Dispute Resolution */
  resolveDispute(disputeId: string, resolution: DisputeResolution): void {
    this.disputes.update(prev =>
      prev.map(d => {
        if (d.id !== disputeId) return d;
        let newStatus: Dispute['status'] = 'CLOSED';
        if (resolution.decision === 'FULL_REFUND_CLIENT') newStatus = 'RESOLVED_CLIENT';
        if (resolution.decision === 'FULL_PAYMENT_CREATOR') newStatus = 'RESOLVED_CREATOR';
        if (resolution.decision === 'PARTIAL_SPLIT') newStatus = 'PARTIAL_RESOLUTION';

        return {
          ...d,
          status: newStatus,
          resolution,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          timeline: [
            ...d.timeline,
            {
              id: 'tl-res-' + Date.now(),
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
              actor: 'ADMIN',
              actorName: resolution.resolvedBy,
              title: 'Dispute Resolved: ' + resolution.decision,
              description: resolution.adminNotes
            }
          ]
        };
      })
    );
  }
}

import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CreatorCardComponent } from '../../../shared/components/creator-card/creator-card.component';
import { CreatorProfile } from '../../../core/models/creator.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, CreatorCardComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="favorites-page">
      <div class="container">
        <div class="page-header">
          <span class="badge badge-accent">Talents Sauvegardés</span>
          <h1>Mes créateurs favoris</h1>
          <p>Créateurs que vous avez enregistrés pour vos prochains tournages et campagnes vidéo.</p>
        </div>

        <div class="favorites-grid">
          @for (creator of savedCreators(); track creator.id) {
            <app-creator-card [creator]="creator"></app-creator-card>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .favorites-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: var(--space-2) 0; }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .favorites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-6); }
  `]
})
export class FavoritesComponent {
  savedCreators = signal<CreatorProfile[]>([
    {
      id: 'cr-1',
      userId: 'u-1',
      fullName: 'Sarah Ben Salem',
      email: 'sarah.bensalem@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      title: 'Spécialiste TikTok & Reels UGC Viral',
      bio: 'Vidéaste mobile basée à Tunis avec plus de 500K vues cumulées. Spécialisée dans les montages dynamiques, transitions tendances et le storytelling pour marques tunisiennes.',
      location: 'Tunis (La Marsa), Tunisie',
      hourlyRate: 45,
      rating: 4.95,
      reviewsCount: 38,
      completedProjectsCount: 47,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Reels & TikTok', 'UGC Content', 'Fashion'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro Max',
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'Rode Wireless Pro'
      }
    },
    {
      id: 'cr-2',
      userId: 'u-2',
      fullName: 'Mehdi Trabelsi',
      email: 'mehdi.trabelsi@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      title: 'Storyteller Mobile Food & Gastronomie',
      bio: 'Création de Reels 4K 60fps alléchants pour restaurants gastronomiques, salons de thé et hôtels de charme en Tunisie. Tournage sur Galaxy S24 Ultra avec objectifs macro.',
      location: 'Sousse, Tunisie',
      hourlyRate: 50,
      rating: 5.0,
      reviewsCount: 29,
      completedProjectsCount: 34,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Food & Restaurant', 'Product Photo', 'Promo Video'],
      equipment: {
        smartphoneModel: 'Samsung Galaxy S24 Ultra',
        gimbal: 'Zhiyun Smooth 5S',
        audioGear: 'DJI Mic 2'
      }
    }
  ]);
}

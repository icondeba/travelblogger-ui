import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardService } from '../core/services/award.service';
import { AwardCardComponent } from '../shared/award-card.component';
import { Award } from '../core/models/award.model';

@Component({
  selector: 'app-awards-list',
  standalone: true,
  imports: [CommonModule, AwardCardComponent],
  templateUrl: './awards-list.component.html',
  styleUrl: './awards-list.component.scss'
})
export class AwardsListComponent {
  private awardService = inject(AwardService);

  awards: Award[] = [];
  isLoading = true;
  error = '';

  constructor() {
    this.awardService.getAwards().subscribe({
      next: (awards) => {
        this.awards = awards;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load awards.';
        this.isLoading = false;
      }
    });
  }
}

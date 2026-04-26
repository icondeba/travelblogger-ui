import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Award } from '../core/models/award.model';

@Component({
  selector: 'app-award-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './award-card.component.html',
  styleUrl: './award-card.component.scss'
})
export class AwardCardComponent {
  @Input() award!: Award;
}

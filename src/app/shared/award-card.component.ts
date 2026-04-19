import { Component, Input } from '@angular/core';
import { Award } from '../core/models/award.model';

@Component({
  selector: 'app-award-card',
  standalone: true,
  templateUrl: './award-card.component.html',
  styleUrl: './award-card.component.scss'
})
export class AwardCardComponent {
  @Input() award!: Award;
}

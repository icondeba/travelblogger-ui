import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StorySummary } from '../core/models/story.model';

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './story-card.component.html',
  styleUrl: './story-card.component.scss'
})
export class StoryCardComponent {
  @Input() story!: StorySummary;
}

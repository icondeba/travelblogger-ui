import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() ctaText = '';
  @Input() ctaLink = '/contact';
  @Input() backgroundImage = '';
}

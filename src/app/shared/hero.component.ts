import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, afterNextRender, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnDestroy {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() ctaText = '';
  @Input() ctaLink = '/contact';
  @Input() backgroundImage = '';
  @Input() backgroundImages: string[] = [];

  activeSlide = signal(0);

  private slideTimer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      this.startSlideshow();
    });
  }

  get heroImages(): string[] {
    const images = this.backgroundImages.filter(Boolean);

    if (images.length) {
      return images;
    }

    return this.backgroundImage ? [this.backgroundImage] : [];
  }

  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  selectSlide(index: number): void {
    this.activeSlide.set(index);
    this.startSlideshow();
  }

  private startSlideshow(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }

    this.slideTimer = setInterval(() => {
      const slideCount = this.heroImages.length;

      if (slideCount > 1) {
        this.activeSlide.update((currentSlide) => (currentSlide + 1) % slideCount);
      }
    }, 3600);
  }
}

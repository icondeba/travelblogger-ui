import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, map, of, startWith } from 'rxjs';
import { AboutService } from '../core/services/about.service';
import { MilestoneService } from '../core/services/milestone.service';
import { AboutContent } from '../core/models/about.model';
import { Milestone } from '../core/models/milestone.model';

interface AboutHero {
  heading: string;
  paragraphs: string[];
  image: string;
}

interface AboutHeroState {
  status: 'loading' | 'success';
  data?: AboutHero;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private aboutService = inject(AboutService);
  private milestoneService = inject(MilestoneService);

  milestones = signal<Milestone[]>([]);
  milestonesLoading = signal(true);

  private readonly fallbackHero: AboutHero = {
    heading: 'Decades of alpine leadership and storytelling.',
    paragraphs: [
      'Debasish is a professional mountaineer who blends expedition leadership with deep respect for local cultures and the fragile alpine ecosystem. From the Himalayas to the Andes, his focus remains the same: guide with clarity, climb with humility, and document the lessons of the mountain.',
      'His work spans summit expeditions, alpine training programs, and multimedia storytelling that empowers the next generation of climbers.'
    ],
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
  };

  aboutHeroState$ = this.aboutService.getAbout().pipe(
    map((about) => ({ status: 'success', data: this.toHero(about) } as AboutHeroState)),
    startWith({ status: 'loading' } as AboutHeroState),
    catchError(() => of({ status: 'success', data: this.fallbackHero } as AboutHeroState))
  );

  constructor() {
    afterNextRender(() => {
      this.milestoneService.getMilestones().pipe(
        catchError(() => of([] as Milestone[]))
      ).subscribe(items => {
        this.milestones.set(items);
        this.milestonesLoading.set(false);
      });
    });
  }

  private toHero(about: AboutContent): AboutHero {
    const paragraphs = this.toParagraphs(about.content);
    return {
      heading: about.heading?.trim() || this.fallbackHero.heading,
      paragraphs: paragraphs.length > 0 ? paragraphs : this.fallbackHero.paragraphs,
      image: about.image?.trim() || this.fallbackHero.image
    };
  }

  private toParagraphs(content: string): string[] {
    if (!content?.trim()) return [];
    return content
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }
}

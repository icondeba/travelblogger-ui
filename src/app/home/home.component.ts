import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map, catchError, startWith, of } from 'rxjs';
import { HomeService } from '../core/services/home.service';
import { VideoService } from '../core/services/video.service';
import { AwardService } from '../core/services/award.service';
import { HeroComponent } from '../shared/hero.component';
import { AwardCardComponent } from '../shared/award-card.component';
import { StoryCardComponent } from '../shared/story-card.component';
import { VideoCardComponent } from '../shared/video-card.component';
import { LoadState } from '../core/models/load-state.model';
import { HomeContent } from '../core/models/home.model';
import { Award } from '../core/models/award.model';
import { Video } from '../core/models/video.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent, AwardCardComponent, StoryCardComponent, VideoCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private homeService = inject(HomeService);
  private videoService = inject(VideoService);
  private awardService = inject(AwardService);

  featuredVideos = signal<Video[]>([]);
  featuredAwards = signal<Award[]>([]);

  homeState$ = this.homeService.getHome().pipe(
    map((data) => ({ status: 'success', data } as LoadState<HomeContent>)),
    startWith({ status: 'loading' } as LoadState<HomeContent>),
    catchError(() => of({ status: 'error', error: 'Unable to load home content.' } as LoadState<HomeContent>))
  );

  constructor() {
    afterNextRender(() => {
      this.videoService.getFeaturedVideos(10).pipe(
        map(videos => videos.slice(0, 3)),
        catchError(() => of([] as Video[]))
      ).subscribe(videos => this.featuredVideos.set(videos));

      this.awardService.getAwards().pipe(
        map(awards => awards.slice(0, 3)),
        catchError(() => of([] as Award[]))
      ).subscribe(awards => this.featuredAwards.set(awards));
    });
  }
}

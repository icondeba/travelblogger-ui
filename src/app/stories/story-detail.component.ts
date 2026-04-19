import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, catchError, startWith, of, switchMap, tap } from 'rxjs';
import { StoryService } from '../core/services/story.service';
import { LoadState } from '../core/models/load-state.model';
import { Story } from '../core/models/story.model';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-story-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './story-detail.component.html',
  styleUrl: './story-detail.component.scss'
})
export class StoryDetailComponent {
  private route = inject(ActivatedRoute);
  private storyService = inject(StoryService);
  private seoService = inject(SeoService);

  storyState$ = this.route.paramMap.pipe(
    switchMap((params) => this.storyService.getStory(params.get('slug') ?? '')),
    tap((story) => {
      this.seoService.applyRouteSeo({
        title: `${story.title} | Stories | Mountaineer Debasish`,
        description: this.toDescription(story.excerpt, story.content),
        type: 'article'
      });
    }),
    map((data) => ({ status: 'success', data } as LoadState<Story>)),
    startWith({ status: 'loading' } as LoadState<Story>),
    catchError(() => of({ status: 'error', error: 'Unable to load story.' } as LoadState<Story>))
  );

  private toDescription(excerpt: string, content: string): string {
    const source = excerpt?.trim() || content?.trim() || 'Read this expedition story.';
    const normalized = source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  }
}

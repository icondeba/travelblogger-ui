import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, catchError, startWith, of, switchMap, tap } from 'rxjs';
import { VideoService } from '../core/services/video.service';
import { LoadState } from '../core/models/load-state.model';
import { Video } from '../core/models/video.model';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-detail.component.html',
  styleUrl: './video-detail.component.scss'
})
export class VideoDetailComponent {
  private route = inject(ActivatedRoute);
  private videoService = inject(VideoService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);

  videoState$ = this.route.paramMap.pipe(
    switchMap((params) => this.videoService.getVideo(params.get('id') ?? '')),
    tap((video) => {
      this.seoService.applyRouteSeo({
        title: `${video.title} | Videos | Mountaineer Debasish`,
        description: this.toDescription(video.description),
        type: 'video.other'
      });
    }),
    map((data) => ({ status: 'success', data } as LoadState<Video>)),
    startWith({ status: 'loading' } as LoadState<Video>),
    catchError(() => of({ status: 'error', error: 'Unable to load video.' } as LoadState<Video>))
  );

  getSafeUrl(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }

  private toDescription(value: string): string {
    const normalized = (value || 'Watch this expedition video.')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  }
}

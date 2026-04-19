import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../core/services/video.service';
import { Video } from '../core/models/video.model';
import { VideoCardComponent } from '../shared/video-card.component';

@Component({
  selector: 'app-videos-list',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './videos-list.component.html',
  styleUrl: './videos-list.component.scss'
})
export class VideosListComponent {
  private readonly pageSize = 20;
  private videoService = inject(VideoService);
  private nextPageToken: string | null = null;

  videos: Video[] = [];
  isLoading = true;
  isLoadingMore = false;
  error = '';
  hasMore = false;

  constructor() {
    this.loadInitial();
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMore) {
      return;
    }

    this.isLoadingMore = true;
    this.fetchPage(false);
  }

  private loadInitial(): void {
    this.videos = [];
    this.error = '';
    this.nextPageToken = null;
    this.hasMore = false;
    this.isLoading = true;
    this.isLoadingMore = false;
    this.fetchPage(true);
  }

  private fetchPage(reset: boolean): void {
    this.videoService.getVideosPage(this.pageSize, this.nextPageToken ?? undefined).subscribe({
      next: (page) => {
        this.videos = reset ? page.items : this.appendVideos(this.videos, page.items);
        this.nextPageToken = page.nextPageToken;
        this.hasMore = page.hasMore;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error: Error) => {
        this.error = error.message?.trim() || 'Unable to load videos.';
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private appendVideos(existing: Video[], incoming: Video[]): Video[] {
    const map = new Map<string, Video>();
    for (const video of existing) {
      map.set(video.id, video);
    }

    for (const video of incoming) {
      map.set(video.id, video);
    }

    return Array.from(map.values());
  }
}

import { Component, Input } from '@angular/core';
import { Video } from '../core/models/video.model';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss'
})
export class VideoCardComponent {
  @Input() video!: Video;

  get thumbnailUrl(): string {
    return `https://img.youtube.com/vi/${this.video.id}/hqdefault.jpg`;
  }

  get videoUrl(): string {
    const fromApi = this.video.youtubeUrl?.trim();
    if (fromApi) {
      return fromApi;
    }

    return `https://www.youtube.com/watch?v=${this.video.id}`;
  }
}

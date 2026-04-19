import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Video } from '../models/video.model';

interface ApiEnvelope<T> {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  data?: T | null;
  Data?: T | null;
  errors?: string[];
  Errors?: string[];
}

interface VideoApiModel {
  id?: string;
  Id?: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  videoId?: string;
  VideoId?: string;
  youTubeUrl?: string;
  YouTubeUrl?: string;
  publishedAt?: string | null;
  PublishedAt?: string | null;
}

interface VideoListApiModel {
  items?: VideoApiModel[];
  Items?: VideoApiModel[];
  nextPageToken?: string | null;
  NextPageToken?: string | null;
  hasMore?: boolean;
  HasMore?: boolean;
}

export interface VideoPage {
  items: Video[];
  nextPageToken: string | null;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private readonly endpoint = environment.videosEndpoint;

  constructor(private http: HttpClient) {}

  getFeaturedVideos(limit = 3): Observable<Video[]> {
    return this.getVideosPage(limit).pipe(map((page) => page.items));
  }

  getVideosPage(limit: number, pageToken?: string): Observable<VideoPage> {
    let params = new HttpParams().set('limit', this.normalizeLimit(limit).toString());
    if (pageToken && pageToken.trim().length > 0) {
      params = params.set('pageToken', pageToken.trim());
    }

    return this.http.get<ApiEnvelope<VideoListApiModel>>(this.endpoint, { params }).pipe(
      map((response) => {
        const payload = this.unwrapData(response, 'Failed to load videos.');
        const items = this.readProp<VideoApiModel[]>(payload, 'items', 'Items') ?? [];
        const videos = items.map((item) => this.toVideo(item));
        const nextPageToken = this.readProp<string | null>(payload, 'nextPageToken', 'NextPageToken') ?? null;

        return {
          items: videos,
          nextPageToken,
          hasMore: this.readProp<boolean>(payload, 'hasMore', 'HasMore') ?? Boolean(nextPageToken)
        };
      }),
      catchError((error) => this.handleError(error, 'Unable to load videos.'))
    );
  }

  getVideo(id: string): Observable<Video> {
    const trimmedId = id.trim();
    if (!trimmedId) {
      return throwError(() => new Error('Video not found.'));
    }

    return this.http.get<ApiEnvelope<VideoListApiModel>>(this.endpoint).pipe(
      map((response) => {
        const payload = this.unwrapData(response, 'Failed to load video.');
        const items = this.readProp<VideoApiModel[]>(payload, 'items', 'Items') ?? [];
        const videos = items.map((item) => this.toVideo(item));

        const match = videos.find((video) => video.id === trimmedId);
        if (!match) {
          throw new Error('Video not found.');
        }

        return match;
      }),
      catchError((error) => this.handleError(error, 'Unable to load video.'))
    );
  }

  private toVideo(item: VideoApiModel): Video {
    const videoId = this.readProp<string>(item, 'videoId', 'VideoId', 'id', 'Id') ?? '';
    const publishedAt = this.readProp<string | null>(item, 'publishedAt', 'PublishedAt') ?? null;
    const title = this.readProp<string>(item, 'title', 'Title') ?? '';
    const description = this.readProp<string>(item, 'description', 'Description') ?? '';
    const youtubeUrl = this.readProp<string>(item, 'youTubeUrl', 'YouTubeUrl') ?? '';

    return {
      id: videoId,
      title,
      description: description.trim().length > 0 ? description : 'Watch this expedition video on YouTube.',
      date: this.formatDate(publishedAt),
      location: 'YouTube',
      duration: 'Video',
      youtubeUrl,
      publishedAt
    };
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return 'Recent';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Recent';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(parsed);
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit)) {
      return 20;
    }

    return Math.min(50, Math.max(1, Math.trunc(limit)));
  }

  private unwrapData<T>(response: ApiEnvelope<T>, fallbackMessage: string): T {
    const success = response.success ?? response.Success ?? false;
    const data = response.data ?? response.Data ?? null;
    const message = response.message ?? response.Message ?? fallbackMessage;

    if (!success || data === null || data === undefined) {
      throw new Error(message);
    }

    return data;
  }

  private handleError(error: unknown, fallbackMessage: string): Observable<never> {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return throwError(() => error);
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as Partial<ApiEnvelope<unknown>> | string | null;

      if (typeof apiError === 'string' && apiError.trim().length > 0) {
        return throwError(() => new Error(apiError));
      }

      if (apiError && typeof apiError === 'object') {
        const message = apiError.message ?? apiError.Message;
        const errors = apiError.errors ?? apiError.Errors;

        if (typeof message === 'string' && message.trim().length > 0) {
          return throwError(() => new Error(message));
        }

        if (Array.isArray(errors) && errors.length > 0) {
          return throwError(() => new Error(errors.join(' ')));
        }
      }
    }

    return throwError(() => new Error(fallbackMessage));
  }

  private readProp<T>(obj: unknown, ...keys: string[]): T | undefined {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const record = obj as Record<string, unknown>;
    for (const key of keys) {
      if (key in record) {
        return record[key] as T;
      }
    }

    return undefined;
  }
}

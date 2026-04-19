import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Story } from '../models/story.model';
import { environment } from '../../../environments/environment';

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

interface StoryApiModel {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  status: 'Draft' | 'Published' | 0 | 1;
  publishedAt: string | null;
  createdAt: string;
}

interface StoryListApiModel {
  items?: StoryApiModel[];
  Items?: StoryApiModel[];
  nextOffset?: number | null;
  NextOffset?: number | null;
  hasMore?: boolean;
  HasMore?: boolean;
}

export interface StoryPage {
  items: Story[];
  nextOffset: number | null;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly endpoint = `${environment.functionAppUrl}/api/articles`;

  constructor(private http: HttpClient) {}

  getStoriesPage(limit: number, offset: number): Observable<StoryPage> {
    const params = new HttpParams()
      .set('limit', this.normalizeLimit(limit).toString())
      .set('offset', this.normalizeOffset(offset).toString())
      .set('publishedOnly', 'true');

    return this.http.get<ApiEnvelope<StoryListApiModel>>(this.endpoint, { params }).pipe(
      map((response) => {
        const payload = this.unwrapData(response, 'Failed to load stories');
        const items = this.readProp<StoryApiModel[]>(payload, 'items', 'Items') ?? [];
        const stories = items.map((item) => this.toStory(item));
        const nextOffset = this.readProp<number | null>(payload, 'nextOffset', 'NextOffset') ?? null;

        return {
          items: stories,
          nextOffset,
          hasMore: this.readProp<boolean>(payload, 'hasMore', 'HasMore') ?? nextOffset !== null
        };
      }),
      catchError((error) => this.handleError(error, 'Failed to load stories.'))
    );
  }

  getStories(): Observable<Story[]> {
    return this.http.get<ApiEnvelope<StoryApiModel[]>>(this.endpoint).pipe(
      map((response) =>
        this.unwrapData(response, 'Failed to load stories')
          .filter((item) => this.isPublished(item))
          .map((item) => this.toStory(item))
      ),
      catchError((error) => this.handleError(error, 'Failed to load stories.'))
    );
  }

  getStory(slug: string): Observable<Story> {
    return this.http.get<ApiEnvelope<StoryApiModel>>(`${this.endpoint}/${encodeURIComponent(slug)}`).pipe(
      map((response) => {
        const item = this.unwrapData(response, 'Failed to load story');
        if (!this.isPublished(item)) {
          throw new Error('Story not found');
        }

        return this.toStory(item);
      }),
      catchError((error) => this.handleError(error, 'Failed to load story.'))
    );
  }

  private toStory(item: StoryApiModel): Story {
    const publishedAt = this.readProp<string | null>(item, 'publishedAt', 'PublishedAt') ?? null;
    const createdAt = this.readProp<string>(item, 'createdAt', 'CreatedAt') ?? '';
    const displayDate = this.formatDate(publishedAt || createdAt);
    const image = this.readProp<string>(item, 'image', 'Image') ?? '';

    return {
      slug: this.readProp<string>(item, 'slug', 'Slug') ?? '',
      title: this.readProp<string>(item, 'title', 'Title') ?? '',
      excerpt: this.readProp<string>(item, 'excerpt', 'Excerpt') ?? '',
      image,
      date: displayDate,
      location: 'Travel Blogger',
      content: this.readProp<string>(item, 'content', 'Content') ?? '',
      highlights: this.extractHighlights(this.readProp<string>(item, 'content', 'Content') ?? ''),
      gallery: []
    };
  }

  private formatDate(value: string): string {
    if (!value) {
      return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(parsed);
  }

  private extractHighlights(content: string): string[] {
    if (!content) {
      return [];
    }

    const listMatches = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => this.stripHtml(match[1]));
    if (listMatches.length > 0) {
      return listMatches.filter((item) => item.length > 0).slice(0, 5);
    }

    return [];
  }

  private isPublished(item: StoryApiModel): boolean {
    const status = this.readProp<StoryApiModel['status']>(item, 'status', 'Status');
    return status === 'Published' || status === 1;
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit)) {
      return 20;
    }

    return Math.min(50, Math.max(1, Math.trunc(limit)));
  }

  private normalizeOffset(offset: number): number {
    if (!Number.isFinite(offset)) {
      return 0;
    }

    return Math.max(0, Math.trunc(offset));
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

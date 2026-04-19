import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Event } from '../models/event.model';
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

interface EventApiModel {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
  eventDate: string;
  createdAt: string;
}

interface EventListApiModel {
  items?: EventApiModel[];
  Items?: EventApiModel[];
  nextOffset?: number | null;
  NextOffset?: number | null;
  hasMore?: boolean;
  HasMore?: boolean;
}

export interface EventPage {
  items: Event[];
  nextOffset: number | null;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly endpoint = `${environment.functionAppUrl}/api/events`;

  constructor(private http: HttpClient) {}

  getEventsPage(limit: number, offset: number): Observable<EventPage> {
    const params = new HttpParams()
      .set('limit', this.normalizeLimit(limit).toString())
      .set('offset', this.normalizeOffset(offset).toString());

    return this.http.get<ApiEnvelope<EventListApiModel>>(this.endpoint, { params }).pipe(
      map((response) => {
        const payload = this.unwrapData(response, 'Failed to load events');
        const items = this.readProp<EventApiModel[]>(payload, 'items', 'Items') ?? [];
        const events = items.map((item) => this.toEvent(item));
        const nextOffset = this.readProp<number | null>(payload, 'nextOffset', 'NextOffset') ?? null;

        return {
          items: events,
          nextOffset,
          hasMore: this.readProp<boolean>(payload, 'hasMore', 'HasMore') ?? nextOffset !== null
        };
      }),
      catchError((error) => this.handleError(error, 'Failed to load events.'))
    );
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<ApiEnvelope<EventApiModel[]>>(this.endpoint).pipe(
      map((response) => this.unwrapData(response, 'Failed to load events').map((item) => this.toEvent(item))),
      catchError((error) => this.handleError(error, 'Failed to load events.'))
    );
  }

  getEvent(slug: string): Observable<Event> {
    return this.http.get<ApiEnvelope<EventApiModel>>(`${this.endpoint}/${encodeURIComponent(slug)}`).pipe(
      map((response) => this.toEvent(this.unwrapData(response, 'Failed to load event'))),
      catchError((error) => this.handleError(error, 'Failed to load event.'))
    );
  }

  private toEvent(item: EventApiModel): Event {
    const eventDateValue = this.readProp<string>(item, 'eventDate', 'EventDate') ?? '';
    const date = this.formatDate(eventDateValue);
    const time = this.formatTime(eventDateValue);
    const description = this.readProp<string>(item, 'description', 'Description') ?? '';
    const points = this.extractPoints(description);

    return {
      slug: this.readProp<string>(item, 'id', 'Id') ?? '',
      title: this.readProp<string>(item, 'title', 'Title') ?? '',
      summary: this.toSummary(description),
      image: this.readProp<string>(item, 'image', 'Image') ?? '',
      date,
      time,
      location: this.readProp<string>(item, 'location', 'Location') ?? '',
      description,
      agenda: points.slice(0, 3),
      details: points.slice(3, 6)
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(parsed);
  }

  private formatTime(value: string): string {
    if (!value) {
      return 'All Day';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'All Day';
    }

    if (parsed.getHours() === 0 && parsed.getMinutes() === 0) {
      return 'All Day';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  }

  private toSummary(description: string): string {
    const normalized = description.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 140) {
      return normalized;
    }

    return `${normalized.slice(0, 137)}...`;
  }

  private extractPoints(description: string): string[] {
    if (!description) {
      return [];
    }

    const listMatches = [...description.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => this.stripHtml(match[1]));
    if (listMatches.length > 0) {
      return listMatches.filter((item) => item.length > 0);
    }

    const lines = description
      .split(/\r?\n/)
      .map((line) => this.stripHtml(line))
      .filter((line) => line.length > 0);

    if (lines.length > 1) {
      return lines;
    }

    return [];
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

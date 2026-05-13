import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrekkingInfo } from '../models/trekking-info.model';

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

interface TrekkingInfoApiModel {
  id: string;
  title: string;
  location: string;
  difficulty: string;
  duration: string;
  bestSeason: string;
  details: string;
  route: string;
  mapEmbedUrl: string;
  image: string;
}

interface TrekkingInfoListApiModel {
  items?: TrekkingInfoApiModel[];
  Items?: TrekkingInfoApiModel[];
  nextOffset?: number | null;
  NextOffset?: number | null;
  hasMore?: boolean;
  HasMore?: boolean;
}

export interface TrekkingInfoPage {
  items: TrekkingInfo[];
  nextOffset: number | null;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TrekkingInfoService {
  private readonly endpoint = `${environment.functionAppUrl}/api/trekking`;
  private readonly pageCache = new Map<string, Observable<TrekkingInfoPage>>();
  private itemCache = new Map<string, Observable<TrekkingInfo>>();

  constructor(private http: HttpClient) {}

  getItemsPage(limit: number, offset: number): Observable<TrekkingInfoPage> {
    const key = `${this.normalizeLimit(limit)}_${this.normalizeOffset(offset)}`;
    if (!this.pageCache.has(key)) {
      const params = new HttpParams()
        .set('limit', this.normalizeLimit(limit).toString())
        .set('offset', this.normalizeOffset(offset).toString());

      const obs = this.http.get<ApiEnvelope<TrekkingInfoListApiModel>>(this.endpoint, { params }).pipe(
        map((response) => {
          const payload = this.unwrapData(response, 'Failed to load trekking information');
          const items = this.readProp<TrekkingInfoApiModel[]>(payload, 'items', 'Items') ?? [];
          const nextOffset = this.readProp<number | null>(payload, 'nextOffset', 'NextOffset') ?? null;

          return {
            items: items.map((item) => this.toItem(item)),
            nextOffset,
            hasMore: this.readProp<boolean>(payload, 'hasMore', 'HasMore') ?? nextOffset !== null
          };
        }),
        catchError((error) => this.handleError(error, 'Failed to load trekking information.')),
        shareReplay(1)
      );
      this.pageCache.set(key, obs);
    }

    return this.pageCache.get(key)!;
  }

  getItem(id: string): Observable<TrekkingInfo> {
    if (!this.itemCache.has(id)) {
      const obs = this.http.get<ApiEnvelope<TrekkingInfoApiModel>>(`${this.endpoint}/${encodeURIComponent(id)}`).pipe(
        map((response) => this.toItem(this.unwrapData(response, 'Failed to load trekking information'))),
        catchError((error) => this.handleError(error, 'Failed to load trekking information.')),
        shareReplay(1)
      );
      this.itemCache.set(id, obs);
    }

    return this.itemCache.get(id)!;
  }

  private toItem(item: TrekkingInfoApiModel): TrekkingInfo {
    const details = this.readProp<string>(item, 'details', 'Details') ?? '';
    const route = this.readProp<string>(item, 'route', 'Route') ?? '';

    return {
      slug: this.readProp<string>(item, 'id', 'Id') ?? '',
      title: this.readProp<string>(item, 'title', 'Title') ?? '',
      summary: this.toSummary(details),
      location: this.readProp<string>(item, 'location', 'Location') ?? '',
      difficulty: this.readProp<string>(item, 'difficulty', 'Difficulty') ?? '',
      duration: this.readProp<string>(item, 'duration', 'Duration') ?? '',
      bestSeason: this.readProp<string>(item, 'bestSeason', 'BestSeason') ?? '',
      image: this.readProp<string>(item, 'image', 'Image') ?? '',
      details,
      route,
      routePoints: this.extractPoints(route),
      mapEmbedUrl: this.readProp<string>(item, 'mapEmbedUrl', 'MapEmbedUrl') ?? ''
    };
  }

  private toSummary(details: string): string {
    const normalized = details.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (normalized.length <= 150) {
      return normalized;
    }

    return `${normalized.slice(0, 147)}...`;
  }

  private extractPoints(value: string): string[] {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*•\d.\s]+/, '').trim())
      .filter((line) => line.length > 0);
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

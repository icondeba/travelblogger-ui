import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AboutContent } from '../models/about.model';
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

interface AboutApiModel {
  id: string;
  heading: string;
  content: string;
  image: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  private readonly endpoint = `${environment.functionAppUrl}/api/about-me`;

  constructor(private http: HttpClient) {}

  getAbout(): Observable<AboutContent> {
    return this.http.get<ApiEnvelope<AboutApiModel>>(this.endpoint).pipe(
      map((response) => this.toAbout(this.unwrapData(response, 'Failed to load about content'))),
      catchError((error) => this.handleError(error, 'Failed to load about content.'))
    );
  }

  private toAbout(item: AboutApiModel): AboutContent {
    return {
      id: this.readProp<string>(item, 'id', 'Id') ?? '',
      heading: this.readProp<string>(item, 'heading', 'Heading') ?? '',
      content: this.readProp<string>(item, 'content', 'Content') ?? '',
      image: this.readProp<string>(item, 'image', 'Image') ?? '',
      updatedAt: this.readProp<string>(item, 'updatedAt', 'UpdatedAt') ?? ''
    };
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

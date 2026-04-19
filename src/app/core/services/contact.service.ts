import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactFormData, ContactSubmissionResponse } from '../models/contact.model';

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly endpoint = environment.contactEndpoint;

  constructor(private http: HttpClient) {}

  submitContactForm(formData: ContactFormData): Observable<ContactSubmissionResponse> {
    return this.http.post<ApiEnvelope<unknown>>(this.endpoint, formData).pipe(
      map((response) => ({
        success: response.success ?? true,
        message: response.message?.trim() || 'Thanks for reaching out. We will respond within 48 hours.'
      })),
      catchError((error: HttpErrorResponse) =>
        of({
          success: false,
          message: this.resolveErrorMessage(error)
        })
      )
    );
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error as ApiEnvelope<unknown> | string | null;

    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload.trim();
    }

    if (payload && typeof payload === 'object') {
      if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
        return payload.message.trim();
      }

      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        return payload.errors.join(' ');
      }
    }

    return 'Unable to send your message right now. Please try again later.';
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Award } from '../models/award.model';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class AwardService {
  private readonly endpoint = `${environment.functionAppUrl}/api/awards`;

  constructor(private http: HttpClient) {}

  getAwards(): Observable<Award[]> {
    return this.http.get<ApiEnvelope<Award[]>>(this.endpoint).pipe(
      map((r) => r.data ?? (r as unknown as Award[]))
    );
  }
}

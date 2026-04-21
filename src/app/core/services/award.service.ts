import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Award } from '../models/award.model';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class AwardService {
  private readonly endpoint = `${environment.functionAppUrl}/api/awards`;

  private awards$: Observable<Award[]>;

  constructor(private http: HttpClient) {
    this.awards$ = this.http.get<ApiEnvelope<Award[]>>(this.endpoint).pipe(
      map((r) => r.data ?? (r as unknown as Award[])),
      shareReplay(1)
    );
  }

  getAwards(): Observable<Award[]> {
    return this.awards$;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Award } from '../models/award.model';

interface ApiEnvelope<T> {
  success?: boolean;
  Success?: boolean;
  data?: T;
  Data?: T;
}

@Injectable({ providedIn: 'root' })
export class AwardService {
  private readonly endpoint = `${environment.functionAppUrl}/api/awards`;

  private awards$: Observable<Award[]>;

  constructor(private http: HttpClient) {
    this.awards$ = this.http.get<ApiEnvelope<Award[]>>(this.endpoint).pipe(
      map((r) => r.data ?? r.Data ?? []),
      shareReplay(1)
    );
  }

  getAwards(): Observable<Award[]> {
    return this.awards$;
  }

  getAward(id: string): Observable<Award> {
    return this.http.get<ApiEnvelope<Award>>(`${this.endpoint}/${id}`).pipe(
      map((r) => {
        const award = r.data ?? r.Data;
        if (!award) throw new Error('Award not found');
        return award;
      })
    );
  }
}

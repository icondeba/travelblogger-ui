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

type RawAward = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class AwardService {
  private readonly endpoint = `${environment.functionAppUrl}/api/awards`;

  private awards$: Observable<Award[]>;

  constructor(private http: HttpClient) {
    this.awards$ = this.http.get<ApiEnvelope<RawAward[]>>(this.endpoint).pipe(
      map((r) => (r.data ?? r.Data ?? []).map((item) => this.toAward(item))),
      shareReplay(1)
    );
  }

  getAwards(): Observable<Award[]> {
    return this.awards$;
  }

  getAward(id: string): Observable<Award> {
    return this.http.get<ApiEnvelope<RawAward>>(`${this.endpoint}/${id}`).pipe(
      map((r) => {
        const raw = r.data ?? r.Data;
        if (!raw) throw new Error('Award not found');
        return this.toAward(raw as RawAward);
      })
    );
  }

  private toAward(raw: RawAward): Award {
    return {
      id:           String(raw['id']           ?? raw['Id']           ?? ''),
      year:         String(raw['year']         ?? raw['Year']         ?? ''),
      title:        String(raw['title']        ?? raw['Title']        ?? ''),
      organization: String(raw['organization'] ?? raw['Organization'] ?? ''),
      description:  String(raw['description']  ?? raw['Description']  ?? ''),
      image:        String(raw['image']        ?? raw['Image']        ?? ''),
      createdAt:    String(raw['createdAt']    ?? raw['CreatedAt']    ?? '')
    };
  }
}

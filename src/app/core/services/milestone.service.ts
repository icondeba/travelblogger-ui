import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Milestone } from '../models/milestone.model';

interface ApiEnvelope<T> {
  success?: boolean;
  Success?: boolean;
  data?: T;
  Data?: T;
}

type RawMilestone = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  private readonly endpoint = `${environment.functionAppUrl}/api/milestones`;

  private milestones$: Observable<Milestone[]>;

  constructor(private http: HttpClient) {
    this.milestones$ = this.http.get<ApiEnvelope<RawMilestone[]>>(this.endpoint).pipe(
      map((r) => (r.data ?? r.Data ?? []).map((item) => this.toMilestone(item))),
      shareReplay(1)
    );
  }

  getMilestones(): Observable<Milestone[]> {
    return this.milestones$;
  }

  private toMilestone(raw: RawMilestone): Milestone {
    return {
      id:          String(raw['id']          ?? raw['Id']          ?? ''),
      year:        String(raw['year']        ?? raw['Year']        ?? ''),
      title:       String(raw['title']       ?? raw['Title']       ?? ''),
      description: String(raw['description'] ?? raw['Description'] ?? ''),
      createdAt:   String(raw['createdAt']   ?? raw['CreatedAt']   ?? '')
    };
  }
}

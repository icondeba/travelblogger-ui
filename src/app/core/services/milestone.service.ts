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

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  private readonly endpoint = `${environment.functionAppUrl}/api/milestones`;

  private milestones$: Observable<Milestone[]>;

  constructor(private http: HttpClient) {
    this.milestones$ = this.http.get<ApiEnvelope<Milestone[]>>(this.endpoint).pipe(
      map((r) => r.data ?? r.Data ?? []),
      shareReplay(1)
    );
  }

  getMilestones(): Observable<Milestone[]> {
    return this.milestones$;
  }
}

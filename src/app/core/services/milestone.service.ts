import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Milestone } from '../models/milestone.model';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  private readonly endpoint = `${environment.functionAppUrl}/api/milestones`;

  constructor(private http: HttpClient) {}

  getMilestones(): Observable<Milestone[]> {
    return this.http.get<ApiEnvelope<Milestone[]>>(this.endpoint).pipe(
      map((r) => r.data ?? (r as unknown as Milestone[]))
    );
  }
}

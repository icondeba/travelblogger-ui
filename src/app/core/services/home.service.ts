import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomeContent } from '../models/home.model';
import { Award } from '../models/award.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(private http: HttpClient) {}

  getHome(): Observable<HomeContent> {
    return this.http.get<HomeContent>(`${environment.apiBaseUrl}/home.json`);
  }

  getAwards(): Observable<Award[]> {
    return this.http.get<Award[]>(`${environment.apiBaseUrl}/awards.json`);
  }
}

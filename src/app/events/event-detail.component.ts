import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, catchError, startWith, of, switchMap, tap } from 'rxjs';
import { EventService } from '../core/services/event.service';
import { LoadState } from '../core/models/load-state.model';
import { Event } from '../core/models/event.model';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private seoService = inject(SeoService);

  eventState$ = this.route.paramMap.pipe(
    switchMap((params) => this.eventService.getEvent(params.get('slug') ?? '')),
    tap((event) => {
      this.seoService.applyRouteSeo({
        title: `${event.title} | Events | Mountaineer Debasish`,
        description: this.toDescription(event.summary, event.description),
        type: 'article'
      });
    }),
    map((data) => ({ status: 'success', data } as LoadState<Event>)),
    startWith({ status: 'loading' } as LoadState<Event>),
    catchError(() => of({ status: 'error', error: 'Unable to load event.' } as LoadState<Event>))
  );

  private toDescription(summary: string, description: string): string {
    const source = summary?.trim() || description?.trim() || 'Event details and schedule.';
    const normalized = source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  }
}

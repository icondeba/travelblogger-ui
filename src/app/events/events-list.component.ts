import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../core/services/event.service';
import { Event } from '../core/models/event.model';
import { EventCardComponent } from '../shared/event-card.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent {
  private readonly pageSize = 20;
  private eventService = inject(EventService);
  private nextOffset: number | null = 0;

  events: Event[] = [];
  isLoading = true;
  isLoadingMore = false;
  error = '';
  hasMore = false;

  constructor() {
    this.loadInitial();
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMore || this.nextOffset === null) {
      return;
    }

    this.isLoadingMore = true;
    this.fetchPage(false);
  }

  private loadInitial(): void {
    this.events = [];
    this.error = '';
    this.nextOffset = 0;
    this.hasMore = false;
    this.isLoading = true;
    this.isLoadingMore = false;
    this.fetchPage(true);
  }

  private fetchPage(reset: boolean): void {
    const offset = this.nextOffset ?? 0;
    this.eventService.getEventsPage(this.pageSize, offset).subscribe({
      next: (page) => {
        this.events = reset ? page.items : this.appendEvents(this.events, page.items);
        this.nextOffset = page.nextOffset;
        this.hasMore = page.hasMore;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error: Error) => {
        this.error = error.message?.trim() || 'Unable to load events.';
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private appendEvents(existing: Event[], incoming: Event[]): Event[] {
    const map = new Map<string, Event>();
    for (const event of existing) {
      map.set(event.slug, event);
    }

    for (const event of incoming) {
      map.set(event.slug, event);
    }

    return Array.from(map.values());
  }
}

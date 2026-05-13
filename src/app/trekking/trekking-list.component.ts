import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrekkingInfoService } from '../core/services/trekking-info.service';
import { TrekkingInfo } from '../core/models/trekking-info.model';

@Component({
  selector: 'app-trekking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trekking-list.component.html',
  styleUrl: './trekking-list.component.scss'
})
export class TrekkingListComponent {
  private readonly pageSize = 20;
  private trekkingService = inject(TrekkingInfoService);
  private nextOffset: number | null = 0;

  items: TrekkingInfo[] = [];
  isLoading = true;
  isLoadingMore = false;
  error = '';
  hasMore = false;

  constructor() {
    this.fetchPage(true);
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMore || this.nextOffset === null) {
      return;
    }

    this.isLoadingMore = true;
    this.fetchPage(false);
  }

  private fetchPage(reset: boolean): void {
    const offset = this.nextOffset ?? 0;
    this.trekkingService.getItemsPage(this.pageSize, offset).subscribe({
      next: (page) => {
        this.items = reset ? page.items : this.appendItems(this.items, page.items);
        this.nextOffset = page.nextOffset;
        this.hasMore = page.hasMore;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error: Error) => {
        this.error = error.message?.trim() || 'Unable to load trekking information.';
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private appendItems(existing: TrekkingInfo[], incoming: TrekkingInfo[]): TrekkingInfo[] {
    const map = new Map<string, TrekkingInfo>();
    for (const item of existing) {
      map.set(item.slug, item);
    }

    for (const item of incoming) {
      map.set(item.slug, item);
    }

    return Array.from(map.values());
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryService } from '../core/services/story.service';
import { StoryCardComponent } from '../shared/story-card.component';
import { Story } from '../core/models/story.model';

@Component({
  selector: 'app-stories-list',
  standalone: true,
  imports: [CommonModule, StoryCardComponent],
  templateUrl: './stories-list.component.html',
  styleUrl: './stories-list.component.scss'
})
export class StoriesListComponent {
  private readonly pageSize = 20;
  private storyService = inject(StoryService);
  private nextOffset: number | null = 0;

  stories: Story[] = [];
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
    this.stories = [];
    this.error = '';
    this.nextOffset = 0;
    this.hasMore = false;
    this.isLoading = true;
    this.isLoadingMore = false;
    this.fetchPage(true);
  }

  private fetchPage(reset: boolean): void {
    const offset = this.nextOffset ?? 0;
    this.storyService.getStoriesPage(this.pageSize, offset).subscribe({
      next: (page) => {
        this.stories = reset ? page.items : this.appendStories(this.stories, page.items);
        this.nextOffset = page.nextOffset;
        this.hasMore = page.hasMore;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error: Error) => {
        this.error = error.message?.trim() || 'Unable to load stories.';
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private appendStories(existing: Story[], incoming: Story[]): Story[] {
    const map = new Map<string, Story>();
    for (const story of existing) {
      map.set(story.slug, story);
    }

    for (const story of incoming) {
      map.set(story.slug, story);
    }

    return Array.from(map.values());
  }
}

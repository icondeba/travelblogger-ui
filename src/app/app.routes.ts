import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { StoriesListComponent } from './stories/stories-list.component';
import { StoryDetailComponent } from './stories/story-detail.component';
import { VideosListComponent } from './videos/videos-list.component';
import { VideoDetailComponent } from './videos/video-detail.component';
import { ContactComponent } from './contact/contact.component';
import { EventsListComponent } from './events/events-list.component';
import { EventDetailComponent } from './events/event-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      seo: {
        title: 'Mountaineer Debasish | Alpine Expeditions, Stories & Videos',
        description:
          'Official website of mountaineer Debasish featuring expedition stories, event updates, and alpine training videos.',
        type: 'website',
        keywords: 'mountaineer, alpine expeditions, trekking stories, climbing videos'
      }
    }
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {
      seo: {
        title: 'About Debasish | Mountaineer & Expedition Leader',
        description:
          'Learn about Debasish, his high-altitude expeditions, training programs, and leadership in mountain environments.',
        type: 'website'
      }
    }
  },
  {
    path: 'stories',
    component: StoriesListComponent,
    data: {
      seo: {
        title: 'Stories | Mountaineer Debasish',
        description:
          'Read alpine field notes, expedition reports, and mountain lessons from recent and past climbs.',
        type: 'website'
      }
    }
  },
  {
    path: 'stories/:slug',
    component: StoryDetailComponent,
    data: {
      seo: {
        title: 'Story | Mountaineer Debasish',
        description: 'Read this expedition story from Mountaineer Debasish.',
        type: 'article'
      }
    }
  },
  {
    path: 'videos',
    component: VideosListComponent,
    data: {
      seo: {
        title: 'Videos | Mountaineer Debasish',
        description:
          'Watch expedition videos from the official YouTube channel, including route planning and summit experiences.',
        type: 'website'
      }
    }
  },
  {
    path: 'videos/:id',
    component: VideoDetailComponent,
    data: {
      seo: {
        title: 'Video | Mountaineer Debasish',
        description: 'Watch this climbing and expedition video.',
        type: 'video.other'
      }
    }
  },
  {
    path: 'events',
    component: EventsListComponent,
    data: {
      seo: {
        title: 'Events | Mountaineer Debasish',
        description: 'Explore upcoming workshops, climbs, and mountain training events.',
        type: 'website'
      }
    }
  },
  {
    path: 'events/:slug',
    component: EventDetailComponent,
    data: {
      seo: {
        title: 'Event | Mountaineer Debasish',
        description: 'Get complete details of this upcoming mountaineering event.',
        type: 'article'
      }
    }
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      seo: {
        title: 'Contact | Mountaineer Debasish',
        description: 'Contact the team for expedition planning, events, partnerships, and media inquiries.',
        type: 'website'
      }
    }
  },
  { path: '**', redirectTo: '' }
];

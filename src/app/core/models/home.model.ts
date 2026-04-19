import { StorySummary } from './story.model';
import { Video } from './video.model';

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

export interface HomeIntroStat {
  label: string;
  value: string;
}

export interface HomeIntro {
  headline: string;
  description: string;
  stats: HomeIntroStat[];
}

export interface HomeContent {
  hero: HeroContent;
  intro: HomeIntro;
  featuredStories: StorySummary[];
  featuredVideos: Video[];
}

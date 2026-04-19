export interface StorySummary {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  location: string;
}

export interface Story extends StorySummary {
  content: string;
  highlights: string[];
  gallery: string[];
}

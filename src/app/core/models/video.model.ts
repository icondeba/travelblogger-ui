export interface Video {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  duration: string;
  youtubeUrl?: string;
  publishedAt?: string | null;
}

export interface SeoRouteData {
  title: string;
  description: string;
  type?: 'website' | 'article' | 'video.other';
  keywords?: string;
  noindex?: boolean;
  image?: string;
}

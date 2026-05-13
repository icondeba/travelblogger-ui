export interface TrekkingInfoSummary {
  slug: string;
  title: string;
  summary: string;
  location: string;
  difficulty: string;
  duration: string;
  bestSeason: string;
  image: string;
}

export interface TrekkingInfo extends TrekkingInfoSummary {
  details: string;
  route: string;
  routePoints: string[];
  mapEmbedUrl: string;
}

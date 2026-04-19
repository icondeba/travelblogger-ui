export interface EventSummary {
  slug: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  time: string;
  location: string;
}

export interface Event extends EventSummary {
  description: string;
  agenda: string[];
  details: string[];
}

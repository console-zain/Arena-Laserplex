export type EventCategory = string;

export interface CinemaEvent {
  slug: string;
  title: string;
  category: EventCategory;
  summary: string;
  description: string;
  date: string;
  time: string;
  timeZone: string;
  location: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
}

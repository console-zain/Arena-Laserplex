export type NewsCategory = string;

export interface NewsArticle {
  slug: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  content: readonly string[];
  publishedAt: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
}

export type NewsCategory = 'demarches' | 'fiscalite' | 'spectacle' | 'autre';
export type NewsPublisher = 'service-public' | 'culture' | 'france-travail' |
  'dgfip' | 'unedic' | 'audiens';
export interface NewsBase {
  id: string;
  publisher: NewsPublisher;
  sourceLabel: string;
  canonicalUrl: string;
  title: string;
  publishedAt?: string;
  category: NewsCategory;
}
export type NewsItem = NewsBase & (
  | { origin: 'rss'; publisher: 'service-public'; fetchedAt: string }
  | { origin: 'editorial'; reviewedOn: string; summary?: string }
);

export type RawNewsEntry = { title?: unknown; link?: unknown; guid?: unknown; dcDate?: unknown; pubDate?: unknown };
export type NormalizeResult = { items: NewsItem[]; rejectedCount: number; duplicateCount: number };

import type { NewsCategory, NewsItem, NormalizeResult, RawNewsEntry } from './types';
const ALLOWED_HOSTS = new Set(['www.service-public.gouv.fr', 'entreprendre.service-public.gouv.fr']);
const MAX_ENTRIES = 100, MAX_TITLE = 1000, MAX_URL = 2048;
export class NewsCoreError extends Error {
  constructor(readonly code: 'validation' | 'invalid_feed', message: string) {
    super(message); this.name = 'NewsCoreError';
  }
}
function isCanonicalUtcIso(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 20) return false;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) && d.toISOString() === value;
}
export function normalizeArticleUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > MAX_URL) return;
  const raw = value.trim();
  if (!raw) return;
  let url: URL;
  try { url = new URL(raw); } catch { return; }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !ALLOWED_HOSTS.has(url.hostname)) return;
  url.hash = '';
  url.searchParams.delete('xtor');
  const canonical = url.toString();
  return canonical.length <= MAX_URL ? canonical : undefined;
}
function normalizeTitle(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  const title = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  return title && title.length <= MAX_TITLE ? title : undefined;
}
export function classifyNewsTitle(title: string): NewsCategory {
  const n = title.normalize('NFC').toLocaleLowerCase('fr').replace(/\s+/g, ' ').trim();
  if (['impôt', 'fiscal', 'déclaration de revenus'].some(w => n.includes(w))) return 'fiscalite';
  if (['spectacle', 'artiste', 'culture', 'audiovisuel'].some(w => n.includes(w))) return 'spectacle';
  if (['chômage', 'emploi', 'allocation', 'démarche'].some(w => n.includes(w))) return 'demarches';
  return 'autre';
}
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function offsetMinutes(zone: string): number | undefined {
  if (/^(Z|GMT|UT)$/i.test(zone)) return 0;
  const m = /^([+-])(\d{2}):?(\d{2})$/.exec(zone);
  if (!m || Number(m[2]) > 23 || Number(m[3]) > 59) return;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}
// Validate the original wall-clock calendar before applying its explicit offset.
// setUTCFullYear avoids Date.UTC's special mapping of years 00–99 to 1900–1999.
function calendarInstant(year: number, month: number, day: number, hour: number, minute: number, second: number, millis: number, zone: string, weekday?: string): string | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return;
  const wall = new Date(0);
  wall.setUTCFullYear(year, month - 1, day);
  wall.setUTCHours(hour, minute, second, millis);
  if (wall.getUTCFullYear() !== year || wall.getUTCMonth() !== month - 1 || wall.getUTCDate() !== day) return;
  if (weekday && WEEKDAYS[wall.getUTCDay()] !== weekday.toLowerCase()) return;
  const offset = offsetMinutes(zone);
  if (offset === undefined) return;
  const instant = new Date(wall.getTime() - offset * 60000);
  return Number.isFinite(instant.getTime()) ? instant.toISOString() : undefined;
}
function parseDcDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:?\d{2})$/.exec(value.trim());
  if (!m) return;
  return calendarInstant(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0), Number((m[7] ?? '').padEnd(3, '0').slice(0, 3)), m[8]);
}
function parsePubDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  const m = /^(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+)?(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\s+(GMT|UT|[+-]\d{2}:?\d{2})$/i.exec(value.trim());
  if (!m) return;
  return calendarInstant(Number(m[4]), MONTHS.indexOf(m[3].toLowerCase()) + 1, Number(m[2]), Number(m[5]), Number(m[6]), Number(m[7] ?? 0), 0, m[8], m[1]);
}
function entryToItem(entry: RawNewsEntry, fetchedAt: string): NewsItem | undefined {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
  const title = normalizeTitle(entry.title), canonicalUrl = normalizeArticleUrl(entry.link);
  if (!title || !canonicalUrl) return;
  const publishedAt = parseDcDate(entry.dcDate) ?? parsePubDate(entry.pubDate);
  return {
    id: `service-public:${canonicalUrl}`, publisher: 'service-public', sourceLabel: 'Service Public',
    canonicalUrl, title, category: classifyNewsTitle(title), origin: 'rss', fetchedAt,
    ...(publishedAt === undefined ? {} : { publishedAt }),
  };
}
function preferItem(a: NewsItem, b: NewsItem): NewsItem {
  if (!b.publishedAt) return a;
  if (!a.publishedAt || Date.parse(b.publishedAt) > Date.parse(a.publishedAt)) return b;
  return a;
}
export function normalizeNewsEntries(entries: readonly RawNewsEntry[], fetchedAt: string): NormalizeResult {
  if (!isCanonicalUtcIso(fetchedAt)) throw new NewsCoreError('validation', 'fetchedAt doit être un timestamp UTC canonique réel.');
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES) throw new NewsCoreError('validation', 'Tableau de 100 entrées maximum attendu.');
  const byUrl = new Map<string, NewsItem>();
  let rejectedCount = 0, duplicateCount = 0;
  for (const entry of entries) {
    const item = entryToItem(entry, fetchedAt);
    if (!item) { rejectedCount++; continue; }
    const prev = byUrl.get(item.canonicalUrl);
    if (prev) { duplicateCount++; byUrl.set(item.canonicalUrl, preferItem(prev, item)); }
    else byUrl.set(item.canonicalUrl, item);
  }
  if (entries.length && !byUrl.size) throw new NewsCoreError('invalid_feed', 'Aucune entrée admissible dans le flux non vide.');
  const items = [...byUrl.values()].sort((a, b) => {
    if (a.publishedAt && b.publishedAt) {
      const delta = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      if (delta) return delta;
    } else if (a.publishedAt) return -1;
    else if (b.publishedAt) return 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return { items, rejectedCount, duplicateCount };
}

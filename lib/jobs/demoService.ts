import type { JobOffer, JobSearchQuery, JobsService } from './types';

type Method = 'search' | 'getById' | 'listFavoriteIds' | 'setFavorite';
export type DemoJobsOptions = {
  now?: () => Date;
  seed?: JobOffer[];
  pageSize?: number;
  latencyMs?: number;
  failNext?: Partial<Record<Method, Error | true>>;
};

const kinds = ['casting', 'salaried', 'service', 'volunteer'];
const units = ['day', 'hour', 'cachet', 'month', 'total'];
const bases = ['gross', 'net', 'invoice_excl_tax', 'invoice_incl_tax'];
const statuses = ['known', 'unknown', 'not_applicable'];

function dateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function timestamp(value: string): number {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match || !dateOnly(match[1]) || +match[2] > 23 || +match[3] > 59 || +match[4] > 59 ||
      (match[6] !== undefined && (+match[6] > 23 || +match[7] > 59)) || !Number.isFinite(Date.parse(value))) {
    throw new Error('Timestamp ISO avec fuseau invalide.');
  }
  return Date.parse(value);
}
function https(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}
function period(start?: string, end?: string) {
  if ((start !== undefined && !dateOnly(start)) || (end !== undefined && !dateOnly(end))) throw new Error('Date calendaire invalide.');
  if (start && end && start > end) throw new Error('Période inversée.');
}
function validateOffer(offer: JobOffer) {
  if (!offer.id.trim() || !offer.title.trim() || !offer.publisher.id.trim() || !kinds.includes(offer.kind) ||
      !['active', 'expired', 'withdrawn'].includes(offer.status)) throw new Error('Offre invalide.');
  timestamp(offer.createdAt);
  if (offer.expiresAt !== undefined) timestamp(offer.expiresAt);
  timestamp(offer.source.collectedAt);
  if (offer.source.type === 'external') {
    if (!https(offer.source.canonicalUrl)) throw new Error('URL source HTTPS requise.');
    if (offer.source.lastVerifiedAt !== undefined) timestamp(offer.source.lastVerifiedAt);
  } else if (!['demo', 'author'].includes(offer.source.type)) throw new Error('Source invalide.');
  period(offer.dates?.start, offer.dates?.end);
  const pay = offer.remuneration;
  if (!statuses.includes(pay.status) || (offer.kind === 'volunteer') !== (pay.status === 'not_applicable')) throw new Error('Rémunération et bénévolat incohérents.');
  if (pay.status === 'known' && (!Number.isSafeInteger(pay.amountCents) || pay.amountCents < 0 || pay.currency !== 'EUR' ||
      !units.includes(pay.unit) || ![...bases, 'unspecified'].includes(pay.basis))) throw new Error('Rémunération invalide.');
  const application = offer.application;
  if (application.mode === 'external' && !https(application.url)) throw new Error('URL de candidature HTTPS requise.');
  if (application.mode === 'internal' && application.publisherId !== offer.publisher.id) throw new Error('Identité du contact incohérente.');
  if (!['none', 'internal', 'external'].includes(application.mode)) throw new Error('Mode de candidature invalide.');
}
function normalize(value?: string) { return value?.trim().toLocaleLowerCase('fr') || ''; }
function validateQuery(query: JobSearchQuery) {
  period(query.startsOnOrAfter, query.endsOnOrBefore);
  if (query.kind !== undefined && !kinds.includes(query.kind)) throw new Error('Type d’offre invalide.');
  if (query.remunerationStatus !== undefined && !statuses.includes(query.remunerationStatus)) throw new Error('Statut de rémunération invalide.');
  if (query.pay && (!Number.isSafeInteger(query.pay.minimumCents) || query.pay.minimumCents < 0 || !units.includes(query.pay.unit) || !bases.includes(query.pay.basis))) throw new Error('Seuil de rémunération invalide.');
}
function filterKey(query: JobSearchQuery) {
  return JSON.stringify([normalize(query.text), normalize(query.category), normalize(query.city), query.kind ?? '',
    query.startsOnOrAfter ?? '', query.endsOnOrBefore ?? '', query.remunerationStatus ?? '',
    query.pay ? [query.pay.minimumCents, query.pay.unit, query.pay.basis] : null]);
}
function effectiveStatus(offer: JobOffer, now: number): JobOffer['status'] {
  if (offer.status === 'withdrawn' || offer.status === 'expired') return offer.status;
  return offer.expiresAt !== undefined && timestamp(offer.expiresAt) <= now ? 'expired' : 'active';
}
function copyOffer(offer: JobOffer): JobOffer {
  return { ...offer, source: { ...offer.source }, location: { ...offer.location }, dates: offer.dates ? { ...offer.dates } : undefined,
    remuneration: { ...offer.remuneration }, publisher: { ...offer.publisher }, application: { ...offer.application } };
}
function matches(offer: JobOffer, query: JobSearchQuery) {
  if (query.kind && offer.kind !== query.kind) return false;
  if (!normalize(offer.category).includes(normalize(query.category)) || !normalize(offer.location.city).includes(normalize(query.city))) return false;
  if (!normalize([offer.title, offer.description, offer.category, offer.location.city ?? ''].join(' ')).includes(normalize(query.text))) return false;
  if (query.startsOnOrAfter && (!offer.dates?.start || offer.dates.start < query.startsOnOrAfter)) return false;
  if (query.endsOnOrBefore && (!offer.dates?.end || offer.dates.end > query.endsOnOrBefore)) return false;
  const pay = offer.remuneration;
  if (query.remunerationStatus && pay.status !== query.remunerationStatus) return false;
  return !query.pay || (pay.status === 'known' && pay.unit === query.pay.unit && pay.basis === query.pay.basis && pay.amountCents >= query.pay.minimumCents);
}
type Cursor = { version: 1; at: number; id: string; filters: string };
function decodeCursor(value: string, filters: string): Cursor {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Cursor;
    if (!parsed || parsed.version !== 1 || !Number.isSafeInteger(parsed.at) || !Number.isFinite(new Date(parsed.at).getTime()) ||
        typeof parsed.id !== 'string' || !parsed.id.trim() || parsed.filters !== filters) throw new Error();
    return parsed;
  } catch { throw new Error('Curseur invalide ou recherche modifiée. Relancez la recherche.'); }
}
function makeSeed(now: Date): JobOffer[] {
  const iso = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();
  const date = (days: number) => iso(days).slice(0, 10);
  const base = (id: number): JobOffer => ({ id: `job-${id}`, source: { type: 'demo', name: 'intermittent-plus-demo', collectedAt: now.toISOString() },
    status: 'active', title: '', description: 'Offre fictive de démonstration.', kind: 'salaried', category: '', location: { country: 'FR' },
    remuneration: { status: 'unknown' }, publisher: { id: 'demo-publisher', displayName: 'Démo — Production Test' }, application: { mode: 'none' },
    createdAt: new Date(now.getTime() - id).toISOString() });
  return [
    { ...base(1), title: 'Régisseur lumière — tournée (démo)', description: 'Recherche régisseur lumière pour 4 dates. Offre fictive de démonstration.',
      expiresAt: iso(30), contractType: 'CDDU', category: 'Régie lumière', location: { city: 'Paris', department: '75', country: 'FR' }, dates: { start: date(14), end: date(21) },
      remuneration: { status: 'known', amountCents: 28000, currency: 'EUR', unit: 'day', basis: 'gross' } },
    { ...base(2), title: 'Casting danse contemporaine (démo)', description: 'Audition ouverte. Annonce fictive.', expiresAt: iso(20), kind: 'casting', category: 'Danse', location: { city: 'Lyon', country: 'FR' }, dates: { start: date(40), flexible: true } },
    { ...base(3), title: 'Prestation son festival (démo)', description: 'Mixage live. Fictif.', expiresAt: iso(15), kind: 'service', category: 'Son', location: { city: 'Marseille', country: 'FR' }, dates: { start: date(10), end: date(12) },
      remuneration: { status: 'known', amountCents: 45000, currency: 'EUR', unit: 'day', basis: 'invoice_excl_tax' } },
    { ...base(4), title: 'Bénévolat accueil public (démo)', description: 'Accueil bénévoles. Fictif.', kind: 'volunteer', category: 'Accueil', location: { city: 'Bordeaux', country: 'FR' }, dates: { end: date(60) }, remuneration: { status: 'not_applicable' } },
    { ...base(5), title: 'Cachet comédien — lecture (démo)', description: 'Lecture publique. Fictif.', expiresAt: iso(5), contractType: 'CDDU', category: 'Jeu', location: { city: 'Paris', country: 'FR' }, dates: { start: date(7), end: date(7) },
      remuneration: { status: 'known', amountCents: 18000, currency: 'EUR', unit: 'cachet', basis: 'net' } },
    { ...base(6), title: 'Offre expirée — machiniste (démo)', description: 'Expirée pour tests. Fictif.', expiresAt: iso(-1), category: 'Machinerie', location: { city: 'Nantes', country: 'FR' }, dates: { start: date(-10), end: date(-8) },
      remuneration: { status: 'known', amountCents: 25000, currency: 'EUR', unit: 'day', basis: 'gross' } },
    { ...base(7), title: 'Offre retirée — costumier (démo)', description: 'Ne doit plus être exposée.', status: 'withdrawn', category: 'Costumes', location: { city: 'Toulouse', country: 'FR' } },
    { ...base(8), title: 'Technicien plateau — dates flexibles (démo)', description: 'Dates partielles et flexible. Fictif.', expiresAt: iso(45), category: 'Plateau', location: { city: 'Lille', country: 'FR', remote: false }, dates: { start: date(20), flexible: true },
      remuneration: { status: 'known', amountCents: 22000, currency: 'EUR', unit: 'day', basis: 'unspecified' } },
  ];
}

/** Per-instance in-memory demonstration. No persistence, identity proof or external request. */
export function createDemoJobsService(options: DemoJobsOptions = {}): JobsService & {
  __setFailNext: (value: DemoJobsOptions['failNext']) => void;
  __all: () => JobOffer[];
  __insertForTest: (offer: JobOffer) => void;
  __removeForTest: (id: string) => void;
} {
  const nowFn = options.now ?? (() => new Date());
  function now() { const value = nowFn().getTime(); if (!Number.isFinite(value)) throw new Error('Horloge invalide.'); return value; }
  const pageSize = options.pageSize ?? 3;
  const latency = options.latencyMs ?? 0;
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new Error('Taille de page invalide.');
  if (!Number.isSafeInteger(latency) || latency < 0 || latency > 2147483647) throw new Error('Latence invalide.');
  const items = new Map<string, JobOffer>();
  function insert(offer: JobOffer) {
    validateOffer(offer);
    if (items.has(offer.id)) throw new Error('Identifiant déjà présent.');
    items.set(offer.id, copyOffer(offer));
  }
  (options.seed ?? makeSeed(new Date(now()))).forEach(insert);
  const favorites = new Set<string>();
  let failures = { ...options.failNext };
  async function before(method: Method) {
    if (latency) await new Promise<void>((resolve) => setTimeout(resolve, latency));
    const failure = failures[method]; delete failures[method];
    if (failure) throw failure instanceof Error ? failure : new Error('Erreur de démonstration. Réessayez.');
  }
  return {
    async search(query) {
      // Snapshot arguments before an asynchronous boundary; caller mutation cannot alter the request.
      const input = { ...query, pay: query.pay ? { ...query.pay } : undefined };
      validateQuery(input);
      const clock = now();
      const key = filterKey(input);
      const cursor = input.cursor === undefined ? undefined : decodeCursor(input.cursor, key);
      await before('search');
      const sorted = [...items.values()].filter((offer) => effectiveStatus(offer, clock) === 'active' && matches(offer, input))
        .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt) || (a.id === b.id ? 0 : a.id < b.id ? 1 : -1))
        .filter((offer) => !cursor || timestamp(offer.createdAt) < cursor.at || (timestamp(offer.createdAt) === cursor.at && offer.id < cursor.id));
      const page = sorted.slice(0, pageSize);
      const last = page[page.length - 1];
      return { items: page.map((offer) => copyOffer({ ...offer, status: 'active' })),
        nextCursor: sorted.length > pageSize && last ? encodeURIComponent(JSON.stringify({ version: 1, at: timestamp(last.createdAt), id: last.id, filters: key } satisfies Cursor)) : undefined };
    },
    async getById(id) {
      const clock = now(); await before('getById');
      const offer = items.get(id);
      if (!offer) return { status: 'not_found' };
      const status = effectiveStatus(offer, clock);
      if (status === 'withdrawn') return { status };
      return { status, offer: copyOffer({ ...offer, status }) };
    },
    async listFavoriteIds() { await before('listFavoriteIds'); return [...favorites]; },
    async setFavorite(id, favorite) {
      const clock = now(); await before('setFavorite');
      if (!favorite) { favorites.delete(id); return; }
      const offer = items.get(id);
      if (!offer) throw new Error('Offre introuvable.');
      const status = effectiveStatus(offer, clock);
      if (status !== 'active') throw new Error(status === 'expired' ? 'Offre expirée : favori impossible.' : 'Offre retirée : favori impossible.');
      favorites.add(id);
    },
    __setFailNext(value) { failures = { ...value }; },
    __all() { return [...items.values()].map(copyOffer); },
    __insertForTest: insert,
    __removeForTest(id) { items.delete(id); },
  };
}

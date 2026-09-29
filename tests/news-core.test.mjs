import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (mod, path) => mod._compile(ts.transpileModule(readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, path);
const { normalizeNewsEntries: normalize, normalizeArticleUrl: url, classifyNewsTitle: category, NewsCoreError } = require('../lib/news-core/index.ts');
const FETCHED = '2026-09-28T12:00:00.000Z';
const HOST = 'https://www.service-public.gouv.fr';
function entry(over = {}) { return { title: 'Actualité de test', link: `${HOST}/test-1`, guid: 'guid-1', dcDate: '2026-09-28T10:00:00+02:00', ...over }; }
const feed = entries => normalize(entries, FETCHED);
const date = (dcDate, pubDate) => feed([entry({ dcDate, pubDate })]).items[0].publishedAt;
const code = expected => e => e instanceof NewsCoreError && e.code === expected;

test('empty list is valid; all invalid nonempty lists fail', () => {
  assert.deepEqual(feed([]), { items: [], rejectedCount: 0, duplicateCount: 0 });
  for (const entries of [[{ title: '', link: HOST }, null, []], new Array(2)]) assert.throws(() => feed(entries), code('invalid_feed'));
});
test('fetchedAt must be real canonical UTC and collections bounded', () => {
  for (const value of ['2026-09-28', '2026-09-28T12:00:00+02:00', '2026-09-28T12:00:00Z', '2026-02-30T00:00:00.000Z', '2026-09-28T24:00:00.000Z', null, NaN]) assert.throws(() => normalize([], value), code('validation'));
  for (const entries of [null, {}, 'feed', Array.from({ length: 101 }, () => entry())]) assert.throws(() => feed(entries), code('validation'));
  const hundred = feed(Array.from({ length: 100 }, (_, i) => entry({ link: `${HOST}/${i}` })));
  assert.equal(hundred.items.length, 100);
});
test('titles: absent and overlong rejected; hostile markup remains literal text', () => {
  for (const title of ['', ' ', undefined, 123, 'x'.repeat(1001)]) assert.throws(() => feed([entry({ title })]), code('invalid_feed'));
  const title = '<img src=x onerror=alert(1)> Impôt 2026';
  const item = feed([entry({ title })]).items[0];
  assert.equal(item.title, title); assert.equal(item.category, 'fiscalite');
  assert.equal(feed([entry({ title: 'x'.repeat(1000) })]).items[0].title.length, 1000);
});
test('title normalization NFC trim whitespace and no double entity decoding', () => {
  assert.equal(feed([entry({ title: '  De\u0301claration\n de  revenus  ' })]).items[0].title, 'Déclaration de revenus');
  assert.equal(feed([entry({ title: '&lt;b&gt;actualité&lt;/b&gt;' })]).items[0].title, '&lt;b&gt;actualité&lt;/b&gt;');
});
test('URL allowlist, credentials, ports, protocols and lookalikes', () => {
  assert.equal(url(`${HOST}:443/a?x=1#frag`), `${HOST}/a?x=1`);
  assert.equal(url('https://entreprendre.service-public.gouv.fr/path?xtor=RSS-111&keep=1'), 'https://entreprendre.service-public.gouv.fr/path?keep=1');
  for (const bad of ['http://www.service-public.gouv.fr/a', 'https://user:pass@www.service-public.gouv.fr/a', `${HOST}:8443/a`, 'https://evil.service-public.gouv.fr/a', 'https://service-public.gouv.fr/a', 'https://www.service-public.gouv.fr.evil.example/a', 'javascript:alert(1)', 'data:text/html,hi', 'https://example.com/', null]) assert.equal(url(bad), undefined);
});
test('URL length before and after canonical encoding, idempotence and parameters', () => {
  assert.equal(url(`${HOST}/x?xtor=RSS&id=42&xtor=again#frag`), `${HOST}/x?id=42`);
  const input = `${HOST}/x?keep=a%2Bb&keep=two&XTOR=stay`;
  const result = url(input); assert.equal(url(result), result);
  assert.deepEqual(new URL(result).searchParams.getAll('keep'), ['a+b', 'two']);
  assert.equal(new URL(result).searchParams.get('XTOR'), 'stay');
  assert.equal(url(HOST + '/' + 'a'.repeat(2048 - HOST.length - 1)).length, 2048);
  assert.equal(url(HOST + '/' + 'a'.repeat(2048)), undefined);
  assert.equal(url(HOST + '/' + 'é'.repeat(500)), undefined);
  assert.equal(url(' '.repeat(2048) + HOST), undefined);
});
test('GUID changes do not change identity; newer duplicate wins; different URLs remain', () => {
  const result = feed([entry({ link: `${HOST}/same`, guid: 'g1', title: 'Old', dcDate: '2026-09-20T00:00:00Z' }), entry({ link: `${HOST}/same?xtor=rss`, guid: 'g2', title: 'New', dcDate: '2026-09-27T00:00:00Z' }), entry({ link: `${HOST}/other`, guid: 'g1' })]);
  assert.equal(result.items.length, 2); assert.equal(result.duplicateCount, 1); assert.equal(result.rejectedCount, 0);
  const same = result.items.find(i => i.canonicalUrl.endsWith('/same'));
  assert.equal(same.id, `service-public:${HOST}/same`); assert.equal(same.title, 'New'); assert.equal(same.publishedAt, '2026-09-27T00:00:00.000Z');
});
test('duplicate preference: known over unknown, equality and unknown ties keep first', () => {
  for (const list of [
    [entry({ title: 'Unknown', dcDate: undefined }), entry({ title: 'Known' })],
    [entry({ title: 'Known' }), entry({ title: 'Unknown', dcDate: undefined })],
    [entry({ title: 'Known' }), entry({ title: 'Equal later entry' })],
  ]) assert.equal(feed(list).items[0].title, 'Known');
  assert.equal(feed([entry({ title: 'First', dcDate: undefined }), entry({ title: 'Second', dcDate: undefined })]).items[0].title, 'First');
});
test('date priority and fallback; fetchedAt never supplies publication date', () => {
  assert.equal(date('2026-09-28T10:00:00+02:00', 'Mon, 01 Jan 2024 00:00:00 GMT'), '2026-09-28T08:00:00.000Z');
  assert.equal(date('bad', 'Sun, 27 Sep 2026 12:00:00 GMT'), '2026-09-27T12:00:00.000Z');
  assert.equal(date(undefined, '27 Sep 2026 12:00 UT'), '2026-09-27T12:00:00.000Z');
  const item = feed([entry({ dcDate: undefined })]).items[0];
  assert.equal(Object.hasOwn(item, 'publishedAt'), false); assert.equal(item.fetchedAt, FETCHED);
});
test('ISO calendar, leap years, years under 100, time and zone bounds', () => {
  for (const bad of ['2026-02-30T10:00:00Z', '2025-02-29T00:00:00Z', '2026-04-31T10:00:00Z', '2026-00-01T00:00:00Z', '2026-13-01T00:00:00Z', '2026-09-28T24:00:00Z', '2026-09-28T10:60:00Z', '2026-09-28T10:00:60Z', '2026-09-28T10:00:00+24:00', '2026-09-28T10:00:00+02:60', '2026-09-28T10:00:00']) assert.equal(date(bad), undefined, bad);
  assert.equal(date('2024-02-29T23:00:00-02:00'), '2024-03-01T01:00:00.000Z');
  assert.equal(date('0000-02-29T00:00:00Z'), '0000-02-29T00:00:00.000Z');
  assert.equal(date('2026-09-28T10:00:00.123+0230'), '2026-09-28T07:30:00.123Z');
});
test('RFC calendar validation rejects impossible dates and ambiguous formats', () => {
  for (const bad of ['30 Feb 2026 12:00:00 GMT', '29 Feb 2025 12:00:00 GMT', '31 Apr 2026 12:00 GMT', '27 Sep 2026 24:00:00 GMT', '27 Sep 2026 12:60:00 GMT', '27 Sep 2026 12:00:00 +0260', '27 Sep 2026 12:00:00 +2400', 'Sun, 27 Sep 2026 12:00:00', '27 Sep 2026 12:00:00 CET', '2026-09-27 GMT', 'Mon, 27 Sep 2026 12:00:00 GMT']) assert.equal(date(undefined, bad), undefined, bad);
  assert.equal(date(undefined, 'Thu, 29 Feb 2024 23:30:00 -0200'), '2024-03-01T01:30:00.000Z');
  assert.equal(date(undefined, '27 Sep 2026 12:00:00 +02:30'), '2026-09-27T09:30:00.000Z');
});
test('sort: dates DESC, ties ID ASC, unknown last', () => {
  const result = feed([
    entry({ link: `${HOST}/z`, dcDate: '2026-01-01T00:00:00Z' }),
    entry({ link: `${HOST}/m`, dcDate: '2026-09-01T00:00:00Z' }),
    entry({ link: `${HOST}/k`, dcDate: '2026-09-01T02:00:00+02:00' }),
    entry({ link: `${HOST}/b`, dcDate: undefined }), entry({ link: `${HOST}/a`, dcDate: undefined }),
  ]);
  assert.deepEqual(result.items.map(i => i.canonicalUrl), ['k', 'm', 'z', 'a', 'b'].map(p => `${HOST}/${p}`));
});
test('categories use the documented keywords in priority order', () => {
  for (const [title, expected] of [['Nouvelle déclaration de revenus', 'fiscalite'], ['IMPÔT et culture', 'fiscalite'], ['Fiscalité', 'fiscalite'], ['Spectacle et emploi', 'spectacle'], ['Artistes', 'spectacle'], ['Culture', 'spectacle'], ['Audiovisuel', 'spectacle'], ['Allocation chômage', 'demarches'], ['Démarche', 'demarches'], ['Emploi', 'demarches'], ['Annonce diverse', 'autre'], ['impot', 'autre']]) assert.equal(category(title), expected, title);
});
test('does not mutate inputs or share returned objects', () => {
  const e = Object.freeze(entry()); const list = Object.freeze([e]);
  const first = feed(list); first.items[0].title = 'Modified';
  assert.equal(feed(list).items[0].title, 'Actualité de test'); assert.equal(e.title, 'Actualité de test');
});
test('counters distinguish duplicates and invalid entries', () => {
  const result = feed([entry({ title: 'Old', dcDate: '2026-09-01T00:00:00Z' }), entry({ title: 'New' }), { title: 123, link: null }, null, []]);
  assert.equal(result.items.length, 1); assert.equal(result.duplicateCount, 1); assert.equal(result.rejectedCount, 3); assert.equal(result.items[0].title, 'New');
});

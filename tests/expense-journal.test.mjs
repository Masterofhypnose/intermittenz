import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (mod, path) => mod._compile(ts.transpileModule(readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, path);
const { parseEuroCents, parseKilometersMeters, validateExpense, validateTrip, validateVehicle, validateAnnualPreparation, summarizeYear, SummaryError } = require('../lib/expense-journal/index.ts');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const [A, B, C] = [id(1), id(2), id(3)];
const T0 = '2026-09-01T10:00:00.000Z', T1 = '2026-09-01T11:00:00.000Z';
const meta = (i = A) => ({ id: i, version: 1, createdAt: T0, updatedAt: T1 });
function expense(over = {}) { return { ...meta(), state: 'recorded', ...over, data: { paidOn: '2026-05-10', label: 'Achat', amountCents: 1000, category: 'materiel', reimbursement: { kind: 'unknown' }, ...over.data } }; }
function trip(over = {}) { return { ...meta(B), state: 'recorded', ...over, data: { date: '2026-05-10', reason: 'Tournée', origin: 'Paris', destination: 'Lyon', distanceMeters: 100000, vehicleId: C, purpose: 'professional', ...over.data } }; }
function vehicle(over = {}) { return { ...meta(C), ...over, data: { label: 'Voiture', kind: 'car', fiscalHorsepower: 5, motorization: 'thermal', ...over.data } }; }
function prep(mileage = [], over = {}) { return { ...meta(), revenueYear: 2026, declarationYear: 2027, mileage, ...over }; }
const summarize = (over = {}) => summarizeYear({ revenueYear: 2026, expenses: [], trips: [], vehicles: [], ...over });
const validationError = e => e.code === 'validation' && Array.isArray(e.issues) && e.issues.length > 0;

test('parsers: exact cents, meters, zeros and safe integer boundaries', () => {
  for (const [v, n] of [['0', 0], ['0,00', 0], ['12', 1200], ['12,1', 1210], [' 12.50 ', 1250], ['90071992547409.91', Number.MAX_SAFE_INTEGER]]) assert.equal(parseEuroCents(v), n);
  for (const [v, n] of [['1', 1000], ['1,5', 1500], ['1.234', 1234], ['0.001', 1], ['9007199254740.991', Number.MAX_SAFE_INTEGER]]) assert.equal(parseKilometersMeters(v), n);
});
test('parsers: trailing separator, signs, exponent, precision, Unicode and overflow rejected with code', () => {
  for (const v of ['', ' ', ',5', '5,', '5.', '.', '1.234', '1,234', 'NaN', '-1', '+1', '1e3', '1 000', '１', '1\n2', '90071992547409.92', undefined, null]) assert.throws(() => parseEuroCents(v), validationError);
  for (const v of ['0', '0.000', '1.2345', '1,', '-1', '9007199254740.992']) assert.throws(() => parseKilometersMeters(v), validationError);
});
test('expense: valid recorded and genuine incomplete draft', () => {
  assert.equal(validateExpense(expense()).ok, true);
  assert.equal(validateExpense({ ...meta(), state: 'draft', data: {} }).ok, true);
  const r = validateExpense({ ...meta(), state: 'recorded', data: { label: 'Sans montant' } });
  assert.equal(r.ok, false); assert.ok(r.issues.some(i => i.path === 'data.amountCents'));
});
test('civil dates: calendar, leap years and boundaries', () => {
  for (const date of ['2026-02-30', '2026-13-01', '2026-00-10', '2026-04-31', '2025-02-29', '1999-12-31', '2101-01-01']) {
    assert.equal(validateExpense(expense({ data: { paidOn: date } })).ok, false);
    assert.equal(validateTrip(trip({ data: { date } })).ok, false);
  }
  for (const date of ['2024-02-29', '2000-01-01', '2100-12-31']) assert.equal(validateExpense(expense({ data: { paidOn: date } })).ok, true);
});
test('metadata: canonical real UTC and update ordering', () => {
  for (const stamp of ['2026-02-30T10:00:00.000Z', '2026-09-01T24:00:00.000Z', '2026-09-01T10:00:00Z', '2026-09-01T10:00:00.00Z', '2026-09-01T10:00:00+00:00']) assert.equal(validateExpense(expense({ createdAt: stamp })).ok, false);
  assert.equal(validateExpense(expense({ createdAt: T1, updatedAt: T0 })).ok, false);
  assert.equal(validateExpense(expense({ updatedAt: T0 })).ok, true);
  for (const over of [{ id: 'bad' }, { version: 0 }, { version: 1.2 }]) assert.equal(validateExpense(expense(over)).ok, false);
});
test('expense: money, cross-field and variants validated', () => {
  for (const data of [{ amountCents: -1 }, { amountCents: NaN }, { amountCents: 1.2 }, { amountCents: Number.MAX_SAFE_INTEGER + 1 }, { professionalCents: 1001 }, { reimbursement: { kind: 'received', amountCents: 1001 } }, { reimbursement: { kind: 'received', amountCents: 0 } }, { reimbursement: { kind: 'planned' } }, { category: 'bad' }, { label: ' ' }, { note: 'x'.repeat(1001) }]) assert.equal(validateExpense(expense({ data })).ok, false);
  assert.equal(validateExpense(expense({ data: { amountCents: 0, professionalCents: 0, reimbursement: { kind: 'none' } } })).ok, true);
});
test('draft: present fields validated, cross-fields deferred only if amount absent', () => {
  const data = { professionalCents: 500, reimbursement: { kind: 'received', amountCents: 900 } };
  assert.equal(validateExpense({ ...meta(), state: 'draft', data }).ok, true);
  assert.equal(validateExpense({ ...meta(), state: 'draft', data: { ...data, amountCents: 400 } }).ok, false);
  for (const d of [{ paidOn: null }, { amountCents: -1 }, { reimbursement: {} }, { receipt: {} }]) assert.equal(validateExpense({ ...meta(), state: 'draft', data: d }).ok, false);
});
test('receipt: real canonical timestamp, explicit fields, no invented presence', () => {
  const good = validateExpense(expense({ data: { receipt: { documentId: 'doc-1', linkedAt: T0, status: 'present' } } }));
  assert.equal(good.ok, true); assert.deepEqual(good.value.data.receipt, { documentId: 'doc-1', linkedAt: T0 });
  for (const receipt of [null, { documentId: ' ' }, { documentId: 'x', linkedAt: '2026-02-30T00:00:00.000Z' }]) assert.equal(validateExpense(expense({ data: { receipt } })).ok, false);
});
test('normalization: trim, drop unknown properties, deep copy without mutation', () => {
  const raw = expense({ secret: 'discard', data: { label: ' Achat ', note: ' note ', extra: true, reimbursement: { kind: 'received', amountCents: 1, extra: true } } });
  const before = structuredClone(raw), r = validateExpense(raw);
  assert.equal(r.ok, true); assert.equal(r.value.data.label, 'Achat'); assert.equal(r.value.data.note, 'note');
  assert.equal('secret' in r.value, false); assert.equal('extra' in r.value.data, false);
  r.value.data.reimbursement.amountCents = 2; assert.deepEqual(raw, before);
});
test('trip: UUID, distance and purpose', () => {
  assert.equal(validateTrip(trip()).ok, true);
  for (const data of [{ vehicleId: 'bad' }, { distanceMeters: 0 }, { distanceMeters: -1 }, { distanceMeters: 1.2 }, { purpose: 'other' }, { origin: '' }]) assert.equal(validateTrip(trip({ data })).ok, false);
});
test('vehicle: car-only and product bounds', () => {
  assert.equal(validateVehicle(vehicle()).ok, true);
  for (const data of [{ fiscalHorsepower: 0 }, { fiscalHorsepower: 51 }, { fiscalHorsepower: 1.5 }, { kind: 'bike' }, { motorization: 'nuclear' }]) assert.equal(validateVehicle(vehicle({ data })).ok, false);
});
test('annual preparation: year, unique selections and manual distance', () => {
  assert.equal(validateAnnualPreparation(prep()).ok, true);
  assert.equal(validateAnnualPreparation(prep([], { revenueYear: 2100, declarationYear: 2101 })).ok, true);
  for (const p of [prep([], { declarationYear: 2028 }), prep([{ vehicleId: C, mode: 'manual' }]), prep([{ vehicleId: C, mode: 'journal' }, { vehicleId: C, mode: 'unselected' }]), prep([{ vehicleId: C, mode: 'journal', manualDistanceMeters: -1 }]), prep(new Array(1))]) assert.equal(validateAnnualPreparation(p).ok, false);
});
test('summary: exact cents, category zeros and separation of years', () => {
  const expenses = [1, 2, 3].map(i => expense({ id: id(i), data: { amountCents: 33, category: 'repas' } }));
  expenses.push(expense({ id: id(4), data: { paidOn: '2025-05-10', amountCents: 999 } }));
  const s = summarize({ expenses }); assert.equal(s.totalAmountCents, 99); assert.equal(s.expenseCount, 3);
  assert.deepEqual(s.expensesByCategory, { materiel: 0, logiciels: 0, transport: 0, repas: 99, hebergement: 0, formation: 0, local: 0, telecom: 0, assurance: 0, autre: 0 });
  assert.equal(summarize({ revenueYear: 2025, expenses }).totalAmountCents, 999);
});
test('summary: reimbursements separate, zero known vs missing unknown', () => {
  const expenses = [expense({ data: { amountCents: 10000, professionalCents: 6000, reimbursement: { kind: 'received', amountCents: 4000 } } }), expense({ id: B, data: { amountCents: 0, professionalCents: 0, reimbursement: { kind: 'none' } } }), expense({ id: C })];
  const s = summarize({ expenses }); assert.equal(s.totalAmountCents, 11000); assert.equal(s.professionalKnownCents, 6000); assert.equal(s.reimbursementReceivedCents, 4000); assert.equal(s.professionalUnknownCount, 1); assert.equal(s.reimbursementUnknownCount, 1);
});
test('summary: two cars, journal/manual and no double count', () => {
  const vehicles = [vehicle({ id: A }), vehicle({ id: B })];
  const trips = [trip({ id: id(4), data: { vehicleId: A } }), trip({ id: id(5), data: { vehicleId: A } }), trip({ id: id(6), data: { vehicleId: B } })];
  const preparation = prep([{ vehicleId: A, mode: 'journal', manualDistanceMeters: 999999 }, { vehicleId: B, mode: 'manual', manualDistanceMeters: 1000000 }]);
  const s = summarize({ vehicles, trips, preparation });
  assert.deepEqual(s.tripsByVehicle, [{ vehicleId: A, tripCount: 2, distanceMeters: 200000, mode: 'journal', selectedDistanceMeters: 200000 }, { vehicleId: B, tripCount: 1, distanceMeters: 100000, mode: 'manual', selectedDistanceMeters: 1000000 }]);
  assert.equal(s.tripsByVehicle.reduce((n, v) => n + v.selectedDistanceMeters, 0), 1200000);
});
test('summary: sort by ID, absent selection property truly omitted, empty cars retained', () => {
  const s = summarize({ vehicles: [vehicle({ id: B, data: { label: 'Alpha' } }), vehicle({ id: A, data: { label: 'Zeta' } })] });
  assert.deepEqual(s.tripsByVehicle.map(v => v.vehicleId), [A, B]);
  assert.deepEqual(s.tripsByVehicle[0], { vehicleId: A, tripCount: 0, distanceMeters: 0, mode: 'unselected' });
  assert.equal(Object.hasOwn(s.tripsByVehicle[0], 'selectedDistanceMeters'), false);
});
test('summary: undated drafts visible every year but excluded even with amounts', () => {
  const expenses = [{ ...meta(B), state: 'draft', data: { amountCents: 100 } }, { ...meta(A), state: 'draft', data: {} }];
  const trips = [{ ...meta(C), state: 'draft', data: { distanceMeters: 100 } }];
  const s = summarize({ revenueYear: 2030, expenses, trips });
  assert.deepEqual(s.undatedExpenseDraftIds, [A, B]); assert.deepEqual(s.undatedTripDraftIds, [C]); assert.equal(s.totalAmountCents, 0); assert.equal(s.expenseCount, 0);
});
test('summary: entire runtime input, invalid years, sparse collections and outside-year records', () => {
  for (const revenueYear of [undefined, NaN, Infinity, '2026', 1999, 2101, 2026.5]) assert.throws(() => summarize({ revenueYear }), validationError);
  for (const input of [null, [], {}, { revenueYear: 2026, expenses: null, trips: [], vehicles: [] }]) assert.throws(() => summarizeYear(input), validationError);
  assert.throws(() => summarize({ expenses: new Array(1) }), validationError);
  assert.throws(() => summarize({ expenses: [expense({ data: { paidOn: '2025-02-30' } })] }), validationError);
});
test('summary: duplicate IDs rejected in each collection', () => {
  for (const over of [{ expenses: [expense(), expense()] }, { trips: [trip(), trip()], vehicles: [vehicle()] }, { vehicles: [vehicle(), vehicle()] }]) assert.throws(() => summarize(over), validationError);
});
test('summary: missing car references include drafts, other years and preparation', () => {
  for (const trips of [[trip()], [trip({ data: { date: '2025-05-01' } })], [{ ...meta(), state: 'draft', data: { vehicleId: C } }]]) assert.throws(() => summarize({ trips }), validationError);
  assert.throws(() => summarize({ preparation: prep([{ vehicleId: C, mode: 'journal' }]) }), validationError);
  assert.throws(() => summarize({ preparation: prep([], { revenueYear: 2025, declarationYear: 2026 }) }), validationError);
});
test('summary: overflow codes for expenses and distances', () => {
  const check = e => e instanceof SummaryError && e.code === 'overflow';
  assert.throws(() => summarize({ expenses: [expense({ data: { amountCents: Number.MAX_SAFE_INTEGER } }), expense({ id: B, data: { amountCents: 1 } })] }), check);
  assert.throws(() => summarize({ vehicles: [vehicle()], trips: [trip({ id: A, data: { distanceMeters: Number.MAX_SAFE_INTEGER } }), trip({ id: B, data: { distanceMeters: 1 } })] }), check);
});
test('summary: normalized result does not mutate inputs', () => {
  const input = { revenueYear: 2026, expenses: [expense()], trips: [trip()], vehicles: [vehicle()] };
  const before = structuredClone(input); summarizeYear(input); assert.deepEqual(input, before);
});

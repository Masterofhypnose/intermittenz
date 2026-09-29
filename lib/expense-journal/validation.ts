import {
  EXPENSE_CATEGORIES, JournalError, type AnnualPreparation, type CivilDate,
  type Expense, type ExpenseInput, type FieldIssue, type MileageSelection,
  type ReceiptReference, type RecordMeta, type Reimbursement, type Trip,
  type TripInput, type ValidationResult, type Vehicle, type VehicleInput,
} from './types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Obj = Record<string, unknown>;
function object(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function integer(v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max;
}
function civil(v: unknown): v is CivilDate {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  if (y < 2000 || y > 2100) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function utc(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) return false;
  const t = Date.parse(v);
  return Number.isFinite(t) && new Date(t).toISOString() === v;
}
function uuid(v: unknown): v is string { return typeof v === 'string' && UUID_RE.test(v); }
function issue(issues: FieldIssue[], path: string, message: string) { issues.push({ path, message }); }

// Integer digit accumulation avoids floating point rounding at the safe-integer boundary.
function scaled(raw: string, decimals: number, positive: boolean): number {
  const fail = () => { throw new JournalError('validation', 'Montant ou distance invalide.', [{ path: '', message: 'Chiffres non signés et précision exacte attendus.' }]); };
  if (typeof raw !== 'string') return fail();
  const s = raw.trim();
  if (!new RegExp(`^[0-9]+(?:[.,][0-9]{1,${decimals}})?$`).test(s)) return fail();
  const [whole, fraction = ''] = s.split(/[.,]/);
  const digits = whole + fraction.padEnd(decimals, '0');
  let total = 0;
  for (const char of digits) {
    const digit = Number(char);
    if (total > Math.floor((Number.MAX_SAFE_INTEGER - digit) / 10)) return fail();
    total = total * 10 + digit;
  }
  if (positive && total === 0) return fail();
  return total;
}
export function parseEuroCents(value: string): number { return scaled(value, 2, false); }
export function parseKilometersMeters(value: string): number { return scaled(value, 3, true); }

function meta(input: Obj, issues: FieldIssue[]): RecordMeta | undefined {
  if (!uuid(input.id)) issue(issues, 'id', 'UUID syntaxique attendu.');
  if (!integer(input.version, 1)) issue(issues, 'version', 'Entier sûr >= 1 attendu.');
  if (!utc(input.createdAt)) issue(issues, 'createdAt', 'Timestamp UTC canonique attendu.');
  if (!utc(input.updatedAt)) issue(issues, 'updatedAt', 'Timestamp UTC canonique attendu.');
  if (utc(input.createdAt) && utc(input.updatedAt) && input.updatedAt < input.createdAt) issue(issues, 'updatedAt', 'Doit être >= createdAt.');
  if (issues.length) return;
  return { id: input.id as string, version: input.version as number, createdAt: input.createdAt as string, updatedAt: input.updatedAt as string };
}
function receipt(value: unknown, path: string, issues: FieldIssue[]): ReceiptReference | undefined {
  if (!object(value)) { issue(issues, path, 'Objet attendu.'); return; }
  if (typeof value.documentId !== 'string' || !value.documentId.trim()) issue(issues, `${path}.documentId`, 'Identifiant non vide attendu.');
  if (!utc(value.linkedAt)) issue(issues, `${path}.linkedAt`, 'Timestamp UTC canonique attendu.');
  if (typeof value.documentId === 'string' && utc(value.linkedAt)) return { documentId: value.documentId.trim(), linkedAt: value.linkedAt };
}
function reimbursement(value: unknown, amount: number | undefined, issues: FieldIssue[]): Reimbursement | undefined {
  const path = 'data.reimbursement';
  if (!object(value)) { issue(issues, path, 'Objet attendu.'); return; }
  if (value.kind === 'unknown' || value.kind === 'none') return { kind: value.kind };
  if (value.kind !== 'received') { issue(issues, `${path}.kind`, 'Variante inconnue.'); return; }
  if (!integer(value.amountCents, 1) || (amount !== undefined && value.amountCents > amount)) {
    issue(issues, `${path}.amountCents`, 'Remboursement positif inférieur ou égal au montant attendu.'); return;
  }
  return { kind: 'received', amountCents: value.amountCents };
}
function text(value: unknown, path: string, issues: FieldIssue[], note = false): string | undefined {
  if (typeof value !== 'string') { issue(issues, path, 'Chaîne attendue.'); return; }
  const t = value.trim();
  if (t.length < (note ? 0 : 1) || t.length > (note ? 1000 : 160)) { issue(issues, path, 'Longueur de texte invalide.'); return; }
  return t;
}
function result<T>(value: T, issues: FieldIssue[]): ValidationResult<T> {
  return issues.length ? { ok: false, issues } : { ok: true, value };
}
function root(value: unknown, issues: FieldIssue[]): { input: Obj; data: Obj; meta: RecordMeta } | undefined {
  if (!object(value)) { issue(issues, '', 'Objet attendu.'); return; }
  const m = meta(value, issues);
  if (!object(value.data)) issue(issues, 'data', 'Objet attendu.');
  if (!m || !object(value.data)) return;
  return { input: value, data: value.data, meta: m };
}
function present(data: Obj, field: string, required: boolean, issues: FieldIssue[]): boolean {
  if (data[field] !== undefined) return true;
  if (required) issue(issues, `data.${field}`, 'Champ requis.');
  return false;
}
export function validateExpense(value: unknown): ValidationResult<Expense> {
  const issues: FieldIssue[] = [];
  const r = root(value, issues);
  if (!r) return { ok: false, issues };
  const { input, data } = r;
  if (input.state !== 'draft' && input.state !== 'recorded') return { ok: false, issues: [{ path: 'state', message: 'draft ou recorded attendu.' }] };
  const required = input.state === 'recorded';
  const out: Partial<ExpenseInput> = {};
  if (present(data, 'paidOn', required, issues)) {
    if (civil(data.paidOn)) out.paidOn = data.paidOn;
    else issue(issues, 'data.paidOn', 'Date civile réelle attendue.');
  }
  if (present(data, 'label', required, issues)) out.label = text(data.label, 'data.label', issues);
  if (present(data, 'amountCents', required, issues)) {
    if (integer(data.amountCents)) out.amountCents = data.amountCents;
    else issue(issues, 'data.amountCents', 'Centimes entiers sûrs >= 0 attendus.');
  }
  if (present(data, 'category', required, issues)) {
    const category = EXPENSE_CATEGORIES.find(c => c === data.category);
    if (category) out.category = category;
    else issue(issues, 'data.category', 'Catégorie inconnue.');
  }
  if (data.professionalCents !== undefined) {
    if (integer(data.professionalCents) && (out.amountCents === undefined || data.professionalCents <= out.amountCents)) out.professionalCents = data.professionalCents;
    else issue(issues, 'data.professionalCents', 'Part professionnelle invalide.');
  }
  if (present(data, 'reimbursement', required, issues)) out.reimbursement = reimbursement(data.reimbursement, out.amountCents, issues);
  if (data.receipt !== undefined) out.receipt = receipt(data.receipt, 'data.receipt', issues);
  if (data.note !== undefined) out.note = text(data.note, 'data.note', issues, true);
  return result<Expense>(input.state === 'draft' ? { ...r.meta, state: 'draft', data: out } : { ...r.meta, state: 'recorded', data: out as ExpenseInput }, issues);
}
export function validateTrip(value: unknown): ValidationResult<Trip> {
  const issues: FieldIssue[] = [];
  const r = root(value, issues);
  if (!r) return { ok: false, issues };
  const { input, data } = r;
  if (input.state !== 'draft' && input.state !== 'recorded') return { ok: false, issues: [{ path: 'state', message: 'draft ou recorded attendu.' }] };
  const required = input.state === 'recorded';
  const out: Partial<TripInput> = {};
  if (present(data, 'date', required, issues)) {
    if (civil(data.date)) out.date = data.date;
    else issue(issues, 'data.date', 'Date civile réelle attendue.');
  }
  for (const field of ['reason', 'origin', 'destination'] as const) if (present(data, field, required, issues)) out[field] = text(data[field], `data.${field}`, issues);
  if (present(data, 'distanceMeters', required, issues)) {
    if (integer(data.distanceMeters, 1)) out.distanceMeters = data.distanceMeters;
    else issue(issues, 'data.distanceMeters', 'Mètres entiers sûrs > 0 attendus.');
  }
  if (present(data, 'vehicleId', required, issues)) {
    if (uuid(data.vehicleId)) out.vehicleId = data.vehicleId;
    else issue(issues, 'data.vehicleId', 'UUID syntaxique attendu.');
  }
  if (present(data, 'purpose', required, issues)) {
    if (data.purpose === 'commute' || data.purpose === 'professional' || data.purpose === 'unspecified') out.purpose = data.purpose;
    else issue(issues, 'data.purpose', 'Variante inconnue.');
  }
  if (data.receipt !== undefined) out.receipt = receipt(data.receipt, 'data.receipt', issues);
  if (data.note !== undefined) out.note = text(data.note, 'data.note', issues, true);
  return result<Trip>(input.state === 'draft' ? { ...r.meta, state: 'draft', data: out } : { ...r.meta, state: 'recorded', data: out as TripInput }, issues);
}
export function validateVehicle(value: unknown): ValidationResult<Vehicle> {
  const issues: FieldIssue[] = [];
  const r = root(value, issues);
  if (!r) return { ok: false, issues };
  const data = r.data;
  const label = text(data.label, 'data.label', issues);
  if (data.kind !== 'car') issue(issues, 'data.kind', 'Voiture attendue.');
  if (!integer(data.fiscalHorsepower, 1, 50)) issue(issues, 'data.fiscalHorsepower', 'Entier entre 1 et 50 attendu.');
  if (!['thermal', 'electric', 'hybrid', 'other'].includes(data.motorization as string)) issue(issues, 'data.motorization', 'Variante inconnue.');
  return result({ ...r.meta, data: { label: label as string, kind: 'car', fiscalHorsepower: data.fiscalHorsepower as number, motorization: data.motorization as VehicleInput['motorization'] } }, issues);
}
export function validateAnnualPreparation(value: unknown): ValidationResult<AnnualPreparation> {
  const issues: FieldIssue[] = [];
  if (!object(value)) return { ok: false, issues: [{ path: '', message: 'Objet attendu.' }] };
  const m = meta(value, issues);
  if (!integer(value.revenueYear, 2000, 2100)) issue(issues, 'revenueYear', 'Année entre 2000 et 2100 attendue.');
  // Income year 2100 has declaration year 2101; date bounds concern civil input dates.
  if (!integer(value.declarationYear, 2001, 2101) || value.declarationYear !== Number(value.revenueYear) + 1) issue(issues, 'declarationYear', 'Année des revenus + 1 attendue.');
  const mileage: MileageSelection[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(value.mileage)) issue(issues, 'mileage', 'Tableau attendu.');
  else for (let i = 0; i < value.mileage.length; i++) {
    const e: unknown = value.mileage[i];
    const p = `mileage[${i}]`;
    if (!object(e)) { issue(issues, p, 'Objet attendu.'); continue; }
    if (!uuid(e.vehicleId)) issue(issues, `${p}.vehicleId`, 'UUID syntaxique attendu.');
    else if (seen.has(e.vehicleId)) issue(issues, `${p}.vehicleId`, 'Sélection dupliquée.');
    else seen.add(e.vehicleId);
    if (e.mode !== 'manual' && e.mode !== 'journal' && e.mode !== 'unselected') issue(issues, `${p}.mode`, 'Variante inconnue.');
    if ((e.mode === 'manual' || e.manualDistanceMeters !== undefined) && !integer(e.manualDistanceMeters)) issue(issues, `${p}.manualDistanceMeters`, 'Mètres entiers sûrs >= 0 attendus.');
    mileage.push({ vehicleId: e.vehicleId as string, mode: e.mode as MileageSelection['mode'], ...(e.manualDistanceMeters === undefined ? {} : { manualDistanceMeters: e.manualDistanceMeters as number }) });
  }
  if (!m || issues.length) return { ok: false, issues };
  return { ok: true, value: { ...m, revenueYear: value.revenueYear as number, declarationYear: value.declarationYear as number, mileage } };
}

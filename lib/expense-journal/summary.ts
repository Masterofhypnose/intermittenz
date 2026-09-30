import {
  EXPENSE_CATEGORIES, JournalError, type AnnualPreparation, type AnnualSummary,
  type Expense, type ExpenseCategory, type FieldIssue, type MileageSelection,
  type Trip, type ValidationResult, type Vehicle,
} from './types';
import { validateAnnualPreparation, validateExpense, validateTrip, validateVehicle } from './validation';

export class SummaryError extends JournalError {}
export interface SummarizeInput {
  revenueYear: number;
  expenses: readonly Expense[];
  trips: readonly Trip[];
  vehicles: readonly Vehicle[];
  preparation?: AnnualPreparation;
}
function add(a: number, b: number, path: string): number {
  if (a > Number.MAX_SAFE_INTEGER - b) throw new SummaryError('overflow', 'Somme hors limite entière sûre.', [{ path, message: 'Somme trop grande.' }]);
  return a + b;
}
function collection<T extends { id: string }>(values: readonly unknown[], name: string, validate: (v: unknown) => ValidationResult<T>, issues: FieldIssue[]): T[] {
  const ids = new Set<string>();
  const result: T[] = [];
  for (let i = 0; i < values.length; i++) {
    const r = validate(values[i]);
    if (!r.ok) issues.push(...r.issues.map(issue => ({ ...issue, path: `${name}[${i}]${issue.path ? '.' + issue.path : ''}` })));
    else {
      if (ids.has(r.value.id)) issues.push({ path: `${name}[${i}].id`, message: 'Identifiant dupliqué.' });
      ids.add(r.value.id);
      result.push(r.value);
    }
  }
  return result;
}
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
export function summarizeYear(input: SummarizeInput): AnnualSummary {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new SummaryError('validation', 'Objet attendu.', [{ path: '', message: 'Objet attendu.' }]);
  const issues: FieldIssue[] = [];
  if (!Number.isInteger(input.revenueYear) || input.revenueYear < 2000 || input.revenueYear > 2100) issues.push({ path: 'revenueYear', message: 'Année entre 2000 et 2100 attendue.' });
  for (const name of ['expenses', 'trips', 'vehicles'] as const) if (!Array.isArray(input[name])) issues.push({ path: name, message: 'Tableau attendu.' });
  if (issues.length) throw new SummaryError('validation', 'Entrées invalides.', issues);
  const expenses = collection(input.expenses, 'expenses', validateExpense, issues);
  const trips = collection(input.trips, 'trips', validateTrip, issues);
  const vehicles = collection(input.vehicles, 'vehicles', validateVehicle, issues);
  let preparation: AnnualPreparation | undefined;
  if (input.preparation !== undefined) {
    const r = validateAnnualPreparation(input.preparation);
    if (!r.ok) issues.push(...r.issues.map(issue => ({ ...issue, path: `preparation.${issue.path}` })));
    else {
      preparation = r.value;
      if (preparation.revenueYear !== input.revenueYear) issues.push({ path: 'preparation.revenueYear', message: 'Année différente de celle demandée.' });
    }
  }
  // Bail before reference checks so indices in normalized collections still match input.
  if (issues.length) throw new SummaryError('validation', 'Entrées invalides.', issues);
  const vehicleIds = new Set(vehicles.map(v => v.id));
  trips.forEach((trip, i) => {
    if (trip.data.vehicleId !== undefined && !vehicleIds.has(trip.data.vehicleId)) issues.push({ path: `trips[${i}].data.vehicleId`, message: 'Véhicule inconnu.' });
  });
  preparation?.mileage.forEach((s, i) => {
    if (!vehicleIds.has(s.vehicleId)) issues.push({ path: `preparation.mileage[${i}].vehicleId`, message: 'Véhicule inconnu.' });
  });
  if (issues.length) throw new SummaryError('validation', 'Références invalides.', issues);

  const summary: AnnualSummary = {
    revenueYear: input.revenueYear, expenseCount: 0, totalAmountCents: 0,
    professionalKnownCents: 0, professionalUnknownCount: 0,
    reimbursementReceivedCents: 0, reimbursementUnknownCount: 0,
    expensesByCategory: Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c, 0])) as Record<ExpenseCategory, number>,
    tripsByVehicle: [], undatedExpenseDraftIds: [], undatedTripDraftIds: [],
  };
  const year = String(input.revenueYear);
  for (const e of expenses) {
    if (e.state === 'draft') {
      if (e.data.paidOn === undefined) summary.undatedExpenseDraftIds.push(e.id);
      continue;
    }
    if (e.data.paidOn.slice(0, 4) !== year) continue;
    summary.expenseCount++;
    summary.totalAmountCents = add(summary.totalAmountCents, e.data.amountCents, 'totalAmountCents');
    const c = e.data.category;
    summary.expensesByCategory[c] = add(summary.expensesByCategory[c], e.data.amountCents, `expensesByCategory.${c}`);
    if (e.data.professionalCents === undefined) summary.professionalUnknownCount++;
    else summary.professionalKnownCents = add(summary.professionalKnownCents, e.data.professionalCents, 'professionalKnownCents');
    if (e.data.reimbursement.kind === 'unknown') summary.reimbursementUnknownCount++;
    else if (e.data.reimbursement.kind === 'received') summary.reimbursementReceivedCents = add(summary.reimbursementReceivedCents, e.data.reimbursement.amountCents, 'reimbursementReceivedCents');
  }
  const totals = new Map(vehicles.map(v => [v.id, { distanceMeters: 0, tripCount: 0 }]));
  for (const t of trips) {
    if (t.state === 'draft') {
      if (t.data.date === undefined) summary.undatedTripDraftIds.push(t.id);
      continue;
    }
    if (t.data.date.slice(0, 4) !== year) continue;
    const total = totals.get(t.data.vehicleId)!;
    total.tripCount++;
    total.distanceMeters = add(total.distanceMeters, t.data.distanceMeters, `tripsByVehicle.${t.data.vehicleId}.distanceMeters`);
  }
  const selections = new Map<string, MileageSelection>(preparation?.mileage.map(s => [s.vehicleId, s]) ?? []);
  summary.tripsByVehicle = [...totals].sort(([a], [b]) => compare(a, b)).map(([vehicleId, total]) => {
    const selection = selections.get(vehicleId);
    const mode = selection?.mode ?? 'unselected';
    return {
      vehicleId, ...total, mode,
      ...(mode === 'unselected' ? {} : { selectedDistanceMeters: mode === 'journal' ? total.distanceMeters : selection!.manualDistanceMeters! }),
    };
  });
  summary.undatedExpenseDraftIds.sort(compare);
  summary.undatedTripDraftIds.sort(compare);
  return summary;
}

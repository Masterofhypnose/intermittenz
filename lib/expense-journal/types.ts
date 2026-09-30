export type CivilDate = string; // YYYY-MM-DD calendaire réel
export type ExpenseCategory = 'materiel' | 'logiciels' | 'transport' | 'repas' |
  'hebergement' | 'formation' | 'local' | 'telecom' | 'assurance' | 'autre';
export type Reimbursement =
  | { kind: 'unknown' }
  | { kind: 'none' }
  | { kind: 'received'; amountCents: number };
export interface ReceiptReference {
  documentId: string;
  linkedAt: string;
}
export type ReceiptLookup =
  | { status: 'unavailable' } // coffre non connecté ou échec d'accès
  | { status: 'missing' }     // absence confirmée par le coffre
  | { status: 'present' };    // présence uniquement, pas authenticité fiscale
export interface ExpenseInput {
  paidOn: CivilDate;
  label: string;
  amountCents: number;
  category: ExpenseCategory;
  professionalCents?: number; // revendiqué par l'utilisateur, inconnu si absent
  reimbursement: Reimbursement;
  receipt?: ReceiptReference;
  note?: string;
}
export interface TripInput {
  date: CivilDate;
  reason: string;
  origin: string;
  destination: string;
  distanceMeters: number;
  vehicleId: string;
  purpose: 'commute' | 'professional' | 'unspecified';
  receipt?: ReceiptReference;
  note?: string;
}
export interface VehicleInput {
  label: string;
  kind: 'car'; // autres véhicules hors premier lot
  fiscalHorsepower: number;
  motorization: 'thermal' | 'electric' | 'hybrid' | 'other';
}
export interface RecordMeta {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export type Expense = RecordMeta & (
  | { state: 'draft'; data: Partial<ExpenseInput> }
  | { state: 'recorded'; data: ExpenseInput }
);
export type Trip = RecordMeta & (
  | { state: 'draft'; data: Partial<TripInput> }
  | { state: 'recorded'; data: TripInput }
);
export type Vehicle = RecordMeta & { data: VehicleInput };
export type MileageSelection = {
  vehicleId: string;
  mode: 'unselected' | 'journal' | 'manual';
  manualDistanceMeters?: number; // conservé si on change de mode, jamais additionné
};
export type AnnualPreparation = RecordMeta & {
  revenueYear: number;
  declarationYear: number;
  mileage: MileageSelection[];
};
export type Entity = Expense | Trip | Vehicle | AnnualPreparation;
export interface JournalExport {
  format: 'intermittent-plus-declaration-journal';
  formatVersion: 1;
  exportedAt: string;
  expenses: Expense[];
  trips: Trip[];
  vehicles: Vehicle[];
  annualPreparations: AnnualPreparation[];
}
export interface ImportReport {
  admissible: number;
  skipped: number;
  conflicts: Array<{ collection: string; id: string; reason: string }>;
  invalid: Array<{ collection: string; index: number; reason: string }>;
}
export type JournalErrorCode = 'validation' | 'conflict' | 'not_found' |
  'request_conflict' | 'request_deleted' | 'storage_unavailable' |
  'storage_corrupt' | 'quota_exceeded' | 'unsupported_version';

export type FieldIssue = { path: string; message: string };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: FieldIssue[] };
export type AnnualSummary = {
  revenueYear: number;
  expenseCount: number;
  totalAmountCents: number;
  professionalKnownCents: number;
  professionalUnknownCount: number;
  reimbursementReceivedCents: number;
  reimbursementUnknownCount: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  tripsByVehicle: Array<{ vehicleId: string; tripCount: number; distanceMeters: number; selectedDistanceMeters?: number; mode: MileageSelection['mode'] }>;
  undatedExpenseDraftIds: string[];
  undatedTripDraftIds: string[];
};
export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = Object.freeze([
  'materiel', 'logiciels', 'transport', 'repas', 'hebergement',
  'formation', 'local', 'telecom', 'assurance', 'autre',
]);
export class JournalError extends Error {
  constructor(readonly code: JournalErrorCode | 'overflow', message: string, readonly issues: FieldIssue[] = []) {
    super(message);
    this.name = 'JournalError';
  }
}

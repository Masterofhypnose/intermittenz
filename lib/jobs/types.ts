import type { Page, PublicProfile, ModuleContext } from '../contracts/modules';

export type JobKind = 'casting' | 'salaried' | 'service' | 'volunteer';
export type PayUnit = 'day' | 'hour' | 'cachet' | 'month' | 'total';
export type Remuneration =
  | { status: 'known'; amountCents: number; currency: 'EUR'; unit: PayUnit;
      basis: 'gross' | 'net' | 'invoice_excl_tax' | 'invoice_incl_tax' | 'unspecified' }
  | { status: 'unknown' }
  | { status: 'not_applicable' };
export type JobSource =
  | { type: 'demo'; name: string; collectedAt: string }
  | { type: 'author'; name: string; collectedAt: string }
  | { type: 'external'; name: string; canonicalUrl: string; externalId?: string;
      collectedAt: string; lastVerifiedAt?: string };
export type JobOffer = {
  id: string;
  source: JobSource;
  status: 'active' | 'expired' | 'withdrawn';
  expiresAt?: string; // ISO timestamp avec fuseau : échéance de candidature
  title: string;
  description: string; // texte brut
  kind: JobKind;
  contractType?: string; // casting n'indique pas à lui seul la nature du contrat
  category: string;
  location: { city?: string; department?: string; region?: string;
    country: string; remote?: boolean };
  dates?: { start?: string; end?: string; flexible?: boolean }; // YYYY-MM-DD, période de travail
  remuneration: Remuneration;
  publisher: PublicProfile; // référence d'affichage, pas compte interne authentifié garanti
  application:
    | { mode: 'none' }
    | { mode: 'external'; url: string }
    | { mode: 'internal'; publisherId: string };
  createdAt: string;
};
export type JobSearchQuery = {
  text?: string;
  category?: string;
  city?: string;
  kind?: JobKind;
  startsOnOrAfter?: string; // YYYY-MM-DD inclusif
  endsOnOrBefore?: string; // YYYY-MM-DD inclusif
  remunerationStatus?: Remuneration['status'];
  pay?: { minimumCents: number; unit: PayUnit;
    basis: 'gross' | 'net' | 'invoice_excl_tax' | 'invoice_incl_tax' };
  cursor?: string;
};
export type JobLookup =
  | { status: 'active'; offer: JobOffer }
  | { status: 'expired'; offer: JobOffer }
  | { status: 'withdrawn' }
  | { status: 'not_found' };
export interface JobsService {
  search(query: JobSearchQuery): Promise<Page<JobOffer>>;
  getById(id: string): Promise<JobLookup>;
  listFavoriteIds(): Promise<string[]>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
}
export type JobsModuleProps = {
  context: ModuleContext;
  service: JobsService;
  onContactPublisher?: (publisherId: string, offerId: string) => void;
};

export const KIND_LABEL: Record<JobKind, string> = {
  casting: 'Casting', salaried: 'Emploi salarié', service: 'Prestation', volunteer: 'Bénévolat',
};
export const KIND_OPTIONS: { value: JobKind | ''; label: string }[] = [
  { value: '', label: 'Tous les types' },
  ...Object.entries(KIND_LABEL).map(([value, label]) => ({ value: value as JobKind, label })),
];

import type { Listing } from '../contracts/modules';
export type { Listing, ListingDraft, MarketplaceService, Page, PublicProfile } from '../contracts/modules';
export type ListingKind = Listing['kind'];
export const KIND_LABEL = {sale:'Vente',rental:'Location',service:'Prestation'} as const;
export const KIND_OPTIONS = Object.entries(KIND_LABEL).map(([value,label])=>({value:value as ListingKind,label}));
export const CATEGORIES = ['Son','Lumière','Costumes','Décors','Instruments','Accessoires','Studios','Services','Autre'];
export type FormErrors = Partial<Record<'title'|'description'|'category'|'kind'|'priceEuros'|'city'|'imageUrls',string>>;

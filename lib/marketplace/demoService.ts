import type {Listing,ListingDraft,MarketplaceService,PublicProfile} from '../contracts/modules';
import {validateDraft} from './validation';
type Method='search'|'create'|'listFavoriteIds'|'setFavorite';
export type DemoServiceOptions={latencyMs?:number;seed?:Listing[];seller?:PublicProfile;failNext?:Partial<Record<Method,Error|true>>};
const SELLER={id:'demo-seller',displayName:'Démo — Compagnie Test'};
function makeSeed():Listing[]{return [
 ['Console son 32 pistes (démo)','Son','rental',45000,'Paris','Location à la semaine, hors transport.'],
 ['Projecteur LED 200W (démo)','Lumière','sale',32000,'Lyon','Vente à l’unité.'],
 ['Prestation régie générale (démo)','Services','service',35000,'Marseille','Tarif indicatif par jour.'],
 ['Costume de scène (démo)','Costumes','rental',6000,'Paris','Location à la semaine.'],
 ['Don de praticables (démo)','Décors','sale',0,'Bordeaux','À venir chercher.'],
].map(([title,category,kind,priceCents,city,description],i)=>({id:`demo-${i+1}`,seller:SELLER,title:String(title),category:String(category),kind:kind as Listing['kind'],priceCents:Number(priceCents),city:String(city),description:String(description)+' Annonce fictive de démonstration.',currency:'EUR',imageUrls:[],createdAt:`2026-09-${String(10+i).padStart(2,'0')}T12:00:00.000Z`}));}
const copy=(item:Listing):Listing=>({...item,seller:{...item.seller},imageUrls:[...item.imageUrls]});
export function createDemoMarketplaceService(options:DemoServiceOptions={}):MarketplaceService & {__setFailNext:(value:DemoServiceOptions['failNext'])=>void;__all:()=>Listing[]}{
 const items=(options.seed??makeSeed()).map(copy);const favorites=new Set<string>();const requests=new Map<string,{payload:string;listing:Listing}>();let failures={...options.failNext};
 async function before(method:Method){if(options.latencyMs)await new Promise(resolve=>setTimeout(resolve,options.latencyMs));const failure=failures[method];delete failures[method];if(failure)throw failure instanceof Error?failure:new Error('Erreur de démonstration. Réessayez.');}
 return {
 async search(query){await before('search');const normalize=(s:string)=>s.trim().toLocaleLowerCase('fr');const text=normalize(query.text);const sorted=items.filter(l=>(!query.category||normalize(l.category)===normalize(query.category))&&(!query.city||normalize(l.city).includes(normalize(query.city)))&&normalize([l.title,l.description,l.category,l.city].join(' ')).includes(text)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));const start=query.cursor?sorted.findIndex(l=>l.id===query.cursor)+1:0;if(query.cursor&&!start)throw new Error('La recherche a changé. Relancez-la.');const page=sorted.slice(start,start+3);return {items:page.map(copy),nextCursor:start+3<sorted.length?page.at(-1)?.id:undefined};},
 async create(draft:ListingDraft,id:string){await before('create');if(!id)throw new Error('Identifiant de requête requis.');const payload=JSON.stringify(draft);const previous=requests.get(id);if(previous){if(previous.payload!==payload)throw new Error('Cette requête correspond à une autre annonce.');return copy(previous.listing);}
 if(!Number.isSafeInteger(draft.priceCents)||draft.priceCents<0)throw new Error('Prix invalide.');
 const check=validateDraft({...draft,priceEuros:`${Math.floor(draft.priceCents/100)}.${String(draft.priceCents%100).padStart(2,'0')}`,imageUrls:draft.imageUrls.join('\n')});if(!check.draft)throw new Error(Object.values(check.errors)[0]);
 const listing:Listing={...check.draft,id:crypto.randomUUID(),seller:{...(options.seller??SELLER)},currency:'EUR',createdAt:new Date().toISOString()};items.unshift(listing);requests.set(id,{payload,listing});return copy(listing);},
 async listFavoriteIds(){await before('listFavoriteIds');return [...favorites];},
 async setFavorite(id,value){await before('setFavorite');if(!items.some(l=>l.id===id))throw new Error('Annonce introuvable.');if(value)favorites.add(id);else favorites.delete(id);},
 __setFailNext(value){failures={...value};},__all(){return items.map(copy);}
 };
}

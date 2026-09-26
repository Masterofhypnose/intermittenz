# MARKET-02 — code complet pour lecteur web

Snapshot du dépôt public Masterofhypnose/intermittenz au commit f2b90a69dbb537fc85fc0cd9f1cc3af363f57c8a.

Ce document contient les neuf fichiers demandés par DeepSeek et la mission. Les blocs sont des copies exactes, non des réimplémentations. Travailler sur cette base ; si les sources ont changé, demander une actualisation du paquet. Ne pas modifier ce document pour livrer du code : fournir un patch avec les chemins des fichiers sources.

## Mode de travail

Lire la mission puis les sources. Corriger uniquement les défauts démontrables dans le périmètre MARKET-02. Ne pas reconstruire le module. Ne pas prétendre exécuter tests ou PR sans ces capacités. Un lecteur web peut faire une revue statique et produire un patch ; l’intégrateur exécutera les tests. Ne pas recopier l’implémentation dans les tests.

## Inventaire

- lib/contracts/modules.ts — blob 1ce60faa573932ceb78d8d393be156aa0bb9b8a9
- components/marketplace/MarketplaceModule.tsx — blob cbec380d007d536c95956b00f715a2f6ef524bed
- components/marketplace/Marketplace.module.css — blob aa8121ff7af8bfac75cb35fa28c1463627acb5e2
- lib/marketplace/types.ts — blob 68800e53e534468ab7775eb032fb6e1bbe2ebfa8
- lib/marketplace/validation.ts — blob 6973228089149d15f01a490f69fb66a19987bfce
- lib/marketplace/demoService.ts — blob bad6814705d77925be4c3f72c05f5c86d94cdd99
- tests/marketplace.test.mjs — blob 0ac5f51cd6aedaebb0b829ce730c03d5e8c9e49c
- AGENTS.md — blob c73bdd5b4295f8e8311d580d8177b6277f4b9a9a
- package.json — blob c5ae3cf5d2c0444ec4788593697205984121a312
- docs/missions/MARKET-02.md — blob f646b642c5eeb0dac58bc1d8064c071b0891508c

## Fichier : docs/missions/MARKET-02.md

~~~~markdown
# MARKET-02 — Améliorations ciblées de la marketplace existante

Ne pas régénérer MARKET-01 : le code livré a déjà été revu et intégré. Lire les fichiers existants et tests/marketplace.test.mjs.

Scope : components/marketplace/**, lib/marketplace/**, tests/marketplace*.test.mjs. Contrats et shell inchangés.

Objectif : améliorer la navigation clavier et le focus après retour de fiche/création, puis vérifier les transitions de service et réponses obsolètes des favoris. Ajouter uniquement les corrections justifiées par des tests reproductibles. Préserver la pagination et le retry idempotent ; ne pas ajouter de stockage global ni de dépendance.

Acceptation : recherche, prix zéro et prix invalide, création/retry, filtre sans résultat, favori en erreur, retour catalogue et focus, réponse tardive après changement de service. Tests sur les vrais imports, pas copies de fonctions. Rapporter les tests exécutés. Données toujours en mémoire, labels démo visibles.

Ne pas implémenter le contact vendeur : il reste un callback vers la messagerie. Ne pas prétendre exposer tous les favoris avec un contrat qui ne renvoie que les identifiants.

~~~~

## Fichier : lib/contracts/modules.ts

~~~~ts
/** Contracts for isolated contributions. Not an authentication or authorization layer. */
export type PublicProfile = { id: string; displayName: string; avatarUrl?: string };
export type Page<T> = { items: T[]; nextCursor?: string };
export type ModuleContext = { viewer: PublicProfile; organizationId?: string; mode: 'demo' | 'connected' };
export type Conversation = { id: string; members: PublicProfile[]; title: string; unreadCount: number };
export type Message = { id: string; conversationId: string; senderId: string; text: string; sentAt: string };
/** Connected adapters must authorize membership on the server for every operation. */
export interface ChatService {
  listConversations(cursor?: string): Promise<Page<Conversation>>;
  listMessages(conversationId: string, cursor?: string): Promise<Page<Message>>;
  sendMessage(conversationId: string, text: string, clientRequestId: string): Promise<Message>;
}
export type ChatModuleProps = { context: ModuleContext; service: ChatService };
export type Listing = { id: string; seller: PublicProfile; title: string; description: string; category: string; kind: 'sale' | 'rental' | 'service'; priceCents: number; currency: 'EUR'; city: string; imageUrls: string[]; createdAt: string };
export type ListingDraft = Omit<Listing, 'id' | 'seller' | 'createdAt' | 'currency'>;
export interface MarketplaceService {
  search(query: { text: string; category?: string; city?: string; cursor?: string }): Promise<Page<Listing>>;
  create(draft: ListingDraft, clientRequestId: string): Promise<Listing>;
  listFavoriteIds(): Promise<string[]>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
}
export type MarketplaceModuleProps = { context: ModuleContext; service: MarketplaceService; onContactSeller: (sellerId: string, listingId: string) => void };

~~~~

## Fichier : components/marketplace/MarketplaceModule.tsx

~~~~tsx
'use client';
import {useState,useEffect,useRef,useCallback,type FormEvent} from 'react';
import Image from 'next/image';
import type {Listing,MarketplaceModuleProps} from '../../lib/contracts/modules';
import {KIND_LABEL,KIND_OPTIONS,CATEGORIES,type FormErrors} from '../../lib/marketplace/types';
import {formatPriceCents,isHttpsUrl,makeClientRequestId,validateDraft,type DraftInput} from '../../lib/marketplace/validation';
import styles from './Marketplace.module.css';

function Picture({url,alt}:{url?:string;alt:string}){
 const [failed,setFailed]=useState(false);
 return <div className={styles.picture}>{url&&isHttpsUrl(url)&&!failed?<Image src={url} alt={alt} fill unoptimized referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:<span>Sans visuel</span>}</div>;
}
const message=(error:unknown)=>error instanceof Error?error.message:'Une erreur est survenue. Réessayez.';
export function MarketplaceModule({context,service,onContactSeller}:MarketplaceModuleProps){
 const [view,setView]=useState<'catalog'|'detail'|'create'>('catalog');
 const [selected,setSelected]=useState<Listing|null>(null);
 const [filters,setFilters]=useState({text:'',category:'',city:''});
 const [items,setItems]=useState<Listing[]>([]);
 const [cursor,setCursor]=useState<string>();
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const seq=useRef(0);const generation=useRef(0);
 const [favorites,setFavorites]=useState<Set<string>>(new Set());
 const [favoritesReady,setFavoritesReady]=useState(false);
 const [favoriteError,setFavoriteError]=useState('');
 const favoriteLocks=useRef(new Set<string>());
 const [pendingFavorites,setPendingFavorites]=useState<Set<string>>(new Set());
 const [formErrors,setFormErrors]=useState<FormErrors>({});
 const [createError,setCreateError]=useState('');
 const [sending,setSending]=useState(false);
 const sendLock=useRef(false);
 const request=useRef<{id:string;payload:string}|null>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(view!=='catalog')heading.current?.focus();},[view]);
 const invalidate=useCallback(()=>{generation.current++;seq.current++;},[]);
 const invalidateSearch=useCallback(()=>{seq.current++;},[]);
 useEffect(()=>{invalidate();return invalidate;},[service,invalidate]);
 const search=useCallback(async(next?:string,append=false)=>{
  const current=++seq.current;setLoading(true);setError('');
  if(!append){setItems([]);setCursor(undefined);}
  try{const page=await service.search({text:filters.text,category:filters.category||undefined,city:filters.city||undefined,cursor:next});if(current!==seq.current)return;
   setItems(previous=>append?[...new Map([...previous,...page.items].map(item=>[item.id,item])).values()]:page.items);setCursor(page.nextCursor);
  }catch(e){if(current===seq.current)setError(message(e));}finally{if(current===seq.current)setLoading(false);}
 },[filters,service]);
 useEffect(()=>{let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void search();});return ()=>{cancelled=true;invalidateSearch();};},[search,invalidateSearch]);
 const loadFavorites=useCallback(async()=>{const current=generation.current;setFavoritesReady(false);setFavoriteError('');try{const ids=await service.listFavoriteIds();if(current!==generation.current)return;setFavorites(new Set(ids));setFavoritesReady(true);}catch(e){if(current===generation.current)setFavoriteError(message(e));}},[service]);
 useEffect(()=>{let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void loadFavorites();});return ()=>{cancelled=true;};},[loadFavorites]);
 async function toggleFavorite(item:Listing){
  if(!favoritesReady||favoriteLocks.current.has(item.id))return;
  const before=favorites.has(item.id);const current=generation.current;
  favoriteLocks.current.add(item.id);setPendingFavorites(new Set(favoriteLocks.current));setFavoriteError('');
  setFavorites(previous=>{const next=new Set(previous);if(before)next.delete(item.id);else next.add(item.id);return next;});
  try{await service.setFavorite(item.id,!before);}catch(e){if(current!==generation.current)return;setFavoriteError(message(e));setFavorites(previous=>{const next=new Set(previous);if(before)next.add(item.id);else next.delete(item.id);return next;});}
  finally{favoriteLocks.current.delete(item.id);if(current===generation.current)setPendingFavorites(new Set(favoriteLocks.current));}
 }
 function favoriteButton(item:Listing){return <button className={styles.fav} type="button" aria-pressed={favorites.has(item.id)} disabled={!favoritesReady||pendingFavorites.has(item.id)} aria-label={`${favorites.has(item.id)?'Retirer':'Ajouter'} ${item.title} ${favorites.has(item.id)?'des':'aux'} favoris`} onClick={()=>void toggleFavorite(item)}>{favorites.has(item.id)?'♥ Favori':'♡ Favori'}</button>;}
 function openDetail(item:Listing){setSelected(item);setView('detail');}
 function openCreate(){request.current=null;setFormErrors({});setCreateError('');setNotice('');setView('create');}
 async function create(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(sendLock.current)return;
  const fields=Object.fromEntries(new FormData(event.currentTarget).entries()) as DraftInput;
  const checked=validateDraft(fields);setFormErrors(checked.errors);setCreateError('');if(!checked.draft)return;
  const payload=JSON.stringify(checked.draft);if(!request.current||request.current.payload!==payload)request.current={id:makeClientRequestId(),payload};
  sendLock.current=true;setSending(true);const current=generation.current;
  try{const listing=await service.create(checked.draft,request.current.id);if(current!==generation.current)return;request.current=null;setNotice(context.mode==='demo'?'Annonce ajoutée à la démonstration. Elle disparaîtra au rechargement.':'Annonce créée.');openDetail(listing);}
  catch(e){if(current===generation.current)setCreateError(message(e));}finally{sendLock.current=false;if(current===generation.current)setSending(false);}
 }
 const title=view==='create'?'Créer une annonce':view==='detail'?selected?.title:'Marketplace';
 return <section className={styles.root} aria-label="Marketplace Intermittent+">
  <header><h1 ref={heading} tabIndex={-1}>{title}</h1><p className={styles.muted}>Matériel, costumes, décors, instruments, studios et prestations.</p>{context.mode==='demo'&&<p className={styles.muted}>Démonstration : annonces fictives. Vos essais et favoris disparaissent au rechargement.</p>}</header>
  {notice&&<p role="status" className={styles.state}>{notice}</p>}
  {favoriteError&&<div role="alert" className={styles.alert}>Favoris : {favoriteError} {!favoritesReady?<button onClick={()=>void loadFavorites()}>Recharger les favoris</button>:<span>Réessayez avec le bouton Favori de l’annonce.</span>}</div>}
  {view==='catalog'&&<>
   <div role="search" className={styles.toolbar}>
    <label className={styles.field}>Recherche<input type="search" aria-label="Recherche d’annonces" value={filters.text} onChange={e=>setFilters({...filters,text:e.target.value})}/></label>
    <label className={styles.field}>Catégorie<select aria-label="Filtrer par catégorie" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}><option value="">Toutes</option>{CATEGORIES.map(category=><option key={category}>{category}</option>)}</select></label>
    <label className={styles.field}>Ville<input aria-label="Filtrer par ville" value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})}/></label>
    <button className={styles.primary} onClick={openCreate}>Créer une annonce</button>
   </div>
   <div className={styles.row}><span role="status">{loading?'Chargement…':`${items.length} annonce(s) affichée(s)`}</span>{favoritesReady&&<span>Favoris : {favorites.size}</span>}</div>
   {error&&<div role="alert" className={styles.alert}>{error}<button onClick={()=>void search()}>Réessayer la recherche</button></div>}
   {!loading&&!error&&!items.length&&<p className={styles.state}>Aucune annonce ne correspond à votre recherche.</p>}
   <ul className={styles.grid} aria-label="Résultats">{items.map(item=><li key={item.id}><article className={styles.card}><Picture key={item.imageUrls[0]||item.id} url={item.imageUrls[0]} alt={item.title}/><div className={styles.cardBody}><h3>{item.title}</h3><p className={styles.meta}>{KIND_LABEL[item.kind]} · {item.category} · {item.city}</p><p className={styles.price}>{item.priceCents===0?(item.kind==='sale'?'Don':'Gratuit'):formatPriceCents(item.priceCents)}</p><div className={styles.row}>{favoriteButton(item)}<button aria-label={`Voir ${item.title}`} onClick={()=>openDetail(item)}>Voir la fiche</button></div></div></article></li>)}</ul>
   {cursor&&!error&&<button disabled={loading} onClick={()=>void search(cursor,true)}>Charger plus</button>}
  </>}
  {view==='detail'&&selected&&<>
   <div className={styles.row}><button onClick={()=>{setView('catalog');void search();}}>← Retour au catalogue</button>{favoriteButton(selected)}</div>
   <div className={styles.detail}><div className={styles.gallery}>{selected.imageUrls.length?selected.imageUrls.map((url,i)=><Picture key={url+i} url={url} alt={`${selected.title} — photo ${i+1}`}/>):<Picture alt={selected.title}/>}</div>
    <aside className={styles.section} aria-label="Informations de l’annonce"><p>{KIND_LABEL[selected.kind]} · {selected.category} · {selected.city}</p><p className={styles.price}>{formatPriceCents(selected.priceCents)}</p><p>Vendeur : {selected.seller.displayName}</p><button className={styles.primary} onClick={()=>onContactSeller(selected.seller.id,selected.id)}>Contacter le vendeur</button></aside></div>
   <div className={styles.section}><h2>Description</h2><p className={styles.description}>{selected.description}</p></div>
  </>}
  {view==='create'&&<form onSubmit={create} noValidate>
   <div className={styles.row}><button type="button" disabled={sending} onClick={()=>setView('catalog')}>← Retour au catalogue</button></div>
   {createError&&<p role="alert" className={styles.alert}>{createError} Votre saisie est conservée ; vous pouvez réessayer.</p>}
   <fieldset disabled={sending} style={{border:0,padding:0,margin:0,minWidth:0}}><legend>Votre annonce{context.mode==='demo'?' de démonstration':''}</legend><div className={styles.formGrid}>
    {(['title','kind','description','category','city','priceEuros','imageUrls'] as const).map(name=>{
     const labels={title:'Titre',kind:'Type',description:'Description',category:'Catégorie',city:'Ville',priceEuros:'Prix en euros',imageUrls:'Images HTTPS, une URL par ligne (facultatif)'};
     const props={name,id:`market-${name}`,'aria-invalid':!!formErrors[name],'aria-describedby':formErrors[name]?`market-error-${name}`:undefined};
     return <label className={`${styles.field} ${name==='description'||name==='imageUrls'?styles.full:''}`} key={name}>{labels[name]}
      {name==='kind'?<select {...props}>{KIND_OPTIONS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>:name==='description'||name==='imageUrls'?<textarea {...props}/>:name==='category'?<select {...props}><option value="">Choisir</option>{CATEGORIES.map(category=><option key={category}>{category}</option>)}</select>:<input {...props} inputMode={name==='priceEuros'?'decimal':undefined}/>}
      {name==='description'&&<small>Pour une location, préciser l’unité du prix : jour, semaine ou mois.</small>}
      {formErrors[name]&&<span id={`market-error-${name}`} className={styles.error}>{formErrors[name]}</span>}
     </label>;
    })}
   </div><button type="submit" className={styles.primary}>{sending?'Envoi…':context.mode==='demo'?'Ajouter à la démo':'Publier'}</button></fieldset>
  </form>}
 </section>;
}
export default MarketplaceModule;

~~~~

## Fichier : components/marketplace/Marketplace.module.css

~~~~css
/* Adapted from the DeepSeek contribution supplied by the founder. */
.root{--bg:#0b1220;--panel:#111a2e;--line:#2a3a5e;--text:#e8eefc;--muted:#a4b2cd;--accent:#87a2ff;color:var(--text);font-size:15px;line-height:1.5;min-width:0}
.root *{box-sizing:border-box}.root header{display:block;margin-bottom:20px}.root h1{font-size:28px;margin:0 0 8px}.root h2{font-size:21px}.root h3{font-size:17px}.root p{overflow-wrap:anywhere}.muted{color:var(--muted)}
.toolbar,.formGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:20px}.field{display:flex;flex-direction:column;gap:7px;min-width:0}.field input,.field select,.field textarea{width:100%;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:16px}.field textarea{min-height:120px;resize:vertical}.full{grid-column:1/-1}
.root button{min-height:44px;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);cursor:pointer;font:inherit}.root button:disabled{opacity:.55;cursor:wait}.root :is(button,input,select,textarea):focus-visible{outline:2px solid var(--accent);outline-offset:3px}.root .primary{background:linear-gradient(135deg,#436fe5,#7750c3);font-weight:700}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0}.row span{flex:1}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;list-style:none;padding:0}.card,.section{background:var(--bg);border:1px solid var(--line);border-radius:14px;overflow:hidden}.cardBody,.section{padding:16px}.card h3{margin:0 0 12px;overflow-wrap:anywhere}.meta{color:var(--muted);font-size:13px}.price{font-size:22px;font-weight:700}.picture{position:relative;aspect-ratio:16/10;display:grid;place-items:center;background:linear-gradient(135deg,#16203a,#0b1220);color:var(--muted);overflow:hidden}.picture img{object-fit:cover}.detail{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:18px}.gallery{display:grid;gap:12px}.description{white-space:pre-wrap;overflow-wrap:anywhere}.alert{color:#ffd7d7;background:#391b2c;border:1px solid #984d66;padding:12px;border-radius:10px;margin:12px 0}.error{color:#ffb1b1;font-size:13px}.state{padding:24px;background:var(--bg);border:1px dashed var(--line);border-radius:14px}.fav[aria-pressed=true]{color:#ff8faf}.root h1:focus{outline:none}
@media(max-width:1024px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.grid,.detail,.toolbar,.formGrid{grid-template-columns:minmax(0,1fr)}.full{grid-column:auto}.root h1{font-size:24px}}

~~~~

## Fichier : lib/marketplace/types.ts

~~~~ts
import type { Listing } from '../contracts/modules';
export type { Listing, ListingDraft, MarketplaceService, Page, PublicProfile } from '../contracts/modules';
export type ListingKind = Listing['kind'];
export const KIND_LABEL = {sale:'Vente',rental:'Location',service:'Prestation'} as const;
export const KIND_OPTIONS = Object.entries(KIND_LABEL).map(([value,label])=>({value:value as ListingKind,label}));
export const CATEGORIES = ['Son','Lumière','Costumes','Décors','Instruments','Accessoires','Studios','Services','Autre'];
export type FormErrors = Partial<Record<'title'|'description'|'category'|'kind'|'priceEuros'|'city'|'imageUrls',string>>;

~~~~

## Fichier : lib/marketplace/validation.ts

~~~~ts
import type { ListingDraft } from '../contracts/modules';
import type { FormErrors } from './types';
export type DraftInput = {title:string;description:string;category:string;kind:string;priceEuros:string;city:string;imageUrls:string};
export function parsePriceToCents(raw:string): {cents:number}|{error:string} {
 const normalized=raw.trim().replace(',','.');
 if(!/^\d+(\.\d{1,2})?$/.test(normalized))return {error:'Saisir un prix positif ou nul avec deux décimales maximum.'};
 const [whole,fraction='']=normalized.split('.');
 const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(cents)?{cents}:{error:'Le montant est trop élevé.'};
}
export const formatPriceCents=(cents:number)=>(cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
export function isHttpsUrl(raw:string){try{const url=new URL(raw);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}}
export function parseImageUrls(raw:string){return raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);}
export function validateDraft(input:DraftInput):{errors:FormErrors;draft?:ListingDraft}{
 const errors:FormErrors={};
 for(const [key,max] of [['title',120],['description',4000],['category',60],['city',80]] as const){if(!input[key].trim())errors[key]='Champ requis.';else if(input[key].trim().length>max)errors[key]=`${max} caractères maximum.`;}
 if(!['sale','rental','service'].includes(input.kind))errors.kind='Type invalide.';
 const price=parsePriceToCents(input.priceEuros);if('error'in price)errors.priceEuros=price.error;
 const imageUrls=parseImageUrls(input.imageUrls);if(imageUrls.length>6||imageUrls.some(url=>!isHttpsUrl(url)))errors.imageUrls='Six images maximum, avec une URL HTTPS valide par ligne.';
 if(Object.keys(errors).length||'error'in price)return {errors};
 return {errors,draft:{title:input.title.trim(),description:input.description.trim(),category:input.category.trim(),city:input.city.trim(),kind:input.kind as ListingDraft['kind'],priceCents:price.cents,imageUrls}};
}
export const makeClientRequestId=()=>crypto.randomUUID();

~~~~

## Fichier : lib/marketplace/demoService.ts

~~~~ts
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

~~~~

## Fichier : tests/marketplace.test.mjs

~~~~js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url);
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,path)=>mod._compile(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,path);
require.extensions['.css']=mod=>{mod.exports={};};
const {parsePriceToCents,validateDraft,isHttpsUrl}=require('../lib/marketplace/validation.ts');
const {createDemoMarketplaceService}=require('../lib/marketplace/demoService.ts');
const draft={title:'Console',description:'Description',category:'Son',city:'Paris',kind:'sale',priceCents:1210,imageUrls:[]};
test('marketplace actual validator: cents, unsafe integers, fields and HTTPS',()=>{
 for(const [value,cents] of [['0',0],['12,10',1210],['0.29',29],['12.1',1210]])assert.deepEqual(parsePriceToCents(value),{cents});
 for(const value of ['-1','1.234','NaN','','9007199254740992'])assert.ok('error'in parsePriceToCents(value));
 assert.equal(isHttpsUrl('https://example.com/image.png'),true);assert.equal(isHttpsUrl('https://user:pass@example.com'),false);assert.equal(isHttpsUrl('javascript:alert(1)'),false);
 assert.ok(validateDraft({...draft,title:'',priceEuros:'12.10',imageUrls:''}).errors.title);
 assert.ok(validateDraft({...draft,priceEuros:'12.10',imageUrls:'http://example.com/a'}).errors.imageUrls);
});
test('marketplace actual adapter: filters, cursor, idempotency, rollback and isolated state',async()=>{
 const service=createDemoMarketplaceService();const first=await service.search({text:''});const second=await service.search({text:'',cursor:first.nextCursor});assert.equal(new Set([...first.items,...second.items].map(x=>x.id)).size,5);
 assert.equal((await service.search({text:'console',category:'son',city:'par'})).items.length,1);
 const [a,b]=await Promise.all([service.create(draft,'same'),service.create(draft,'same')]);assert.equal(a.id,b.id);assert.equal(service.__all().length,6);
 await assert.rejects(()=>service.create({...draft,title:'Other'},'same'));
 await service.setFavorite(a.id,true);service.__setFailNext({setFavorite:true});await assert.rejects(()=>service.setFavorite(a.id,false));assert.deepEqual(await service.listFavoriteIds(),[a.id]);
 assert.equal(createDemoMarketplaceService().__all().length,5);
 a.title='Tampered';assert.notEqual(service.__all()[0].title,'Tampered');
});
test('marketplace real React flow: create validation, ambiguous retry, favorites errors, contact, XSS and stale searches',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
 const React=require('react');const {createRoot}=require('react-dom/client');const {MarketplaceModule}=require('../components/marketplace');
 const root=createRoot(document.getElementById('root'));const adapter=createDemoMarketplaceService();let loseResponse=true;let creates=0;const requests=[];const searchPending=[];
 const service={...adapter,async create(payload,id){creates++;requests.push(id);const result=await adapter.create(payload,id);if(loseResponse){loseResponse=false;throw new Error('Réponse perdue');}return result;},search(query){if(query.text==='old'||query.text==='new')return new Promise(resolve=>searchPending.push({query,resolve}));return adapter.search(query);}};
 let contact;const props={context:{viewer:{id:'demo',displayName:'Démo'},mode:'demo'},service,onContactSeller:(...args)=>{contact=args;}};
 const click=async(el)=>{assert.ok(el);await React.act(async()=>el.click());};
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent===text);
 const input=(name,value)=>{document.querySelector(`[name="${name}"]`).value=value;};
 const submit=async()=>React.act(async()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
 try{
  adapter.__setFailNext({listFavoriteIds:true});await React.act(async()=>root.render(React.createElement(MarketplaceModule,props)));
  assert.match(document.querySelector('[role="alert"]').textContent,/Favoris/);await click(button('Recharger les favoris'));
  adapter.__setFailNext({setFavorite:true});await click(document.querySelector('[aria-pressed]'));assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'false');assert.match(document.querySelector('[role="alert"]').textContent,/Réessayez/);
  await click(document.querySelector('[aria-pressed]'));assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'true');
  await click(button('Charger plus'));assert.equal(document.querySelectorAll('article').length,5);
  await click(button('Créer une annonce'));await submit();assert.equal(creates,0);assert.ok(document.querySelector('[aria-invalid="true"]'));
  input('title','Mon annonce');input('description','<img src=x onerror=alert(1)>');input('category','Son');input('city','Paris');input('priceEuros','12,10');
  await submit();assert.match(document.querySelector('form [role="alert"]').textContent,/Réponse perdue/);assert.equal(document.querySelector('[name="title"]').value,'Mon annonce');
  await React.act(async()=>{const form=document.querySelector('form');form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));});
  assert.equal(creates,2);assert.equal(requests[0],requests[1]);assert.equal(adapter.__all().length,6);assert.equal(document.querySelector('h1').textContent,'Mon annonce');assert.match(document.body.textContent,/<img src=x onerror=alert\(1\)>/);assert.equal(document.querySelector('img[src="x"]'),null);
  await click(button('Contacter le vendeur'));assert.deepEqual(contact,[adapter.__all()[0].seller.id,adapter.__all()[0].id]);
  await click(button('← Retour au catalogue'));
  const search=document.querySelector('[type="search"]');const setter=Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set;
  async function change(value){await React.act(async()=>{setter.call(search,value);search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});}
  await change('old');await change('new');assert.equal(searchPending.length,2);
  const base=adapter.__all()[0];await React.act(async()=>searchPending[1].resolve({items:[{...base,id:'new',title:'Newest'}]}));await React.act(async()=>searchPending[0].resolve({items:[{...base,id:'old',title:'Obsolete'}]}));
  assert.match(document.querySelector('[aria-label="Résultats"]').textContent,/Newest/);assert.doesNotMatch(document.querySelector('[aria-label="Résultats"]').textContent,/Obsolete/);
 }finally{await React.act(async()=>root.unmount());dom.window.close();}
});

~~~~

## Fichier : AGENTS.md

~~~~markdown
# Instructions communes

1. Lire README.md, docs/CONTEXT.md, docs/TASKS.md puis sa mission.
2. Travailler par modifications ciblées, avec branche propre à la mission. Ne pas recréer le projet.
3. Contrats dans lib/contracts/modules.ts : imports relatifs (pas d'alias @/). Ne pas les modifier sans proposition d'intégration distincte.
4. Chaque mission possède son dossier. Ne pas modifier le module d'un autre agent ni le shell, package.json, le lockfile ou les workflows. Fournir une note si un raccordement est nécessaire.
5. Pas de nouvelle dépendance sans justification. CSS Modules, responsive Android, français, focus clavier, états vides/chargement/erreur.
6. Données fictives uniquement. Aucun token, secret, document utilisateur, clé API ou variable d'environnement à publier. Les adaptateurs démo sont explicitement marqués, en mémoire par instance.
7. Ne pas toucher au moteur des droits ou inventer de réglementation : il est hors de ce dépôt.
8. Tester les vrais imports et composants ; jamais une copie de leur implémentation dans les tests. Ne pas prétendre avoir exécuté un test non exécuté.
9. Avant livraison : lint, typecheck, build, tests. Proposer PR/patch avec commit de base, scope, tests et limites. Ne pas fusionner ni déployer.
10. Les champs organizationId/viewer sont un contexte UI, pas une preuve d'autorisation. Le futur backend autorisera chaque accès côté serveur.
11. Ne pas créer de boucle de commentaires entre bots ou déclencher des services payants. Les contributeurs sont lancés depuis leur propre environnement autorisé.

~~~~

## Fichier : package.json

~~~~json
{"name":"intermittent-plus","version":"0.1.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start","lint":"eslint .","typecheck":"tsc --noEmit","test":"node --test tests/*.test.mjs"},"dependencies":{"@heroicons/react":"2.2.0","next":"16.3.6","react":"19.1.1","react-dom":"19.1.1","recharts":"3.2.1"},"devDependencies":{"@types/node":"24.5.2","@types/react":"19.1.13","@types/react-dom":"19.1.9","eslint":"9.36.0","eslint-config-next":"16.3.6","jsdom":"26.1.0","typescript":"5.9.2"}}
~~~~

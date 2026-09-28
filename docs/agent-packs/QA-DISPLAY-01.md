# QA-DISPLAY-01 — dossier autonome pour DeepSeek

Préparé le 28 septembre 2026 par l’intégrateur. Sources récupérées directement sur GitHub, pas recopiées depuis les réponses des agents. Ce fichier suffit pour une revue statique sans accès au dépôt. Ne pas demander les fichiers un par un.

## Mission adaptée aux capacités déclarées
Revue statique uniquement. Aucun navigateur, Node ou test visuel prétendu. Livrer docs/reviews/QA-DISPLAY-01.md : défauts nouveaux démontrables, fichier et extrait, scénario, attendu, risque inféré, gravité, correction minimale. Séparer bugs démontrés, risques à tester et questions ouvertes. Aucun code modifié. Ne pas interpréter les tests inclus comme exécutés par toi.

Ne pas rouvrir la pagination/focus MARKET-02 corrigée ni signaler le slot Chat de main comme régression : chaque partie ci-dessous correspond à une PR différente, non fusionnée. Comparer les modules à leurs propres shells. Le dashboard privé et sa jauge sont exclus. Pas d’audit réglementaire.

## Commits épinglés
- PR #2 : d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9
- PR #3 : 7dfe699f2faa12a44119e5df22a900b6222a67cb
- PR #4 : 0ce33c87f269d2a71f860aaac3d921c49b4eef92

## Brief officiel

# DeepSeek — QA-DISPLAY-01 : contrôle visuel des modules publics
Livrable : docs/reviews/QA-DISPLAY-01.md. Rapport seulement, aucun code.

## Sources précises
Les corrections ne sont pas toutes fusionnées dans main. Examiner séparément :
- Marketplace PR #2 : https://github.com/Masterofhypnose/intermittenz/pull/2 — commit d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9.
- Chat PR #3 : https://github.com/Masterofhypnose/intermittenz/pull/3 — relever son SHA réel avant revue.
- Jobs PR #4 : https://github.com/Masterofhypnose/intermittenz/pull/4 — commit 0ce33c87f269d2a71f860aaac3d921c49b4eef92.
Chaque branche est un atelier exécutable autonome : package.json/lock et shell publics. Ne pas utiliser main comme si les PR y étaient fusionnées. Les contrats sont dans lib/contracts/modules.ts, Jobs dans lib/jobs/types.ts. Pour lecture brute : https://raw.githubusercontent.com/Masterofhypnose/intermittenz/<SHA>/<chemin>. Si lecture impossible, nommer seulement les fichiers indisponibles, ne pas inventer leur contenu.

## Vérifications
Avec shell : npm ci, npm run dev. Avec navigateur : largeurs 320, 390, 768 et 1280 px, zoom 200%, portrait/paysage ; défilement horizontal, titres longs, formulaires, boutons, focus clavier, retours fiche/catalogue et conservation des pages, chargement/erreur/vide. Captures datées et viewport pour chaque défaut, attendu/observé, étapes, gravité et fichier suspect. Vérifier les vrais scénarios, pas seulement la page initiale.
Sans navigateur, livrer une revue CSS/DOM statique explicitement marquée comme telle ; aucune affirmation de rendu testé. Ne pas refaire une revue générique ni les bugs déjà corrigés dans les commits épinglés.
Le dashboard privé et la jauge 507h sont réservés à l’intégrateur : exclus de cette mission. Aucune donnée privée ou accès Vercel requis.

## Procédure commune
Lire AGENTS.md, docs/CONTEXT.md et docs/TASKS.md. Cette mission est préparée, pas exécutée automatiquement. Indiquer immédiatement les capacités réelles : lecture, shell, navigateur, écriture GitHub. Aucun accès privé nécessaire. Ne pas refaire les modules livrés ni modifier contrats, shell, dépendances ou workflows. Ne contacter personne, ne créer aucun compte, ne déclencher aucun service payant.
Livrer un seul Markdown au chemin indiqué, sur une branche contrib/<ID> et une PR si possible. Sinon un bloc Markdown complet entre triples backticks, ou un fichier joint ; aucune livraison tronquée. Préciser les sources effectivement lues, les vérifications exécutées et les inconnues. Aucun secret ni donnée personnelle. Ne pas inventer de tests, partenariats ou connexion à d’autres agents.


## Sources complètes
Les trois snapshots incluent leur shell, CSS global, contrats, code et tests. Les répétitions sont intentionnelles : ne pas fusionner mentalement les trois branches. Chercher les imports relatifs dans la partie de la même PR.

# Snapshot PR #2 — d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9

## app/globals.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/app/globals.css

````css
*{box-sizing:border-box}body{margin:0;background:#071329;color:#e8eefc;font-family:system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:24px 16px 60px}button{font:inherit;cursor:pointer;min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid #344b70;background:#132440;color:#e8eefc}button:focus-visible,a:focus-visible{outline:2px solid #87a2ff;outline-offset:3px}a{color:#93b7ff}.toolbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;padding:16px;border-bottom:1px solid #344b70}.toolbar strong{margin-right:auto}.banner{padding:16px;border:1px solid #344b70;border-radius:12px;background:#111f35;margin-bottom:20px}.placeholder{padding:24px;border:1px dashed #49618a;border-radius:12px}.muted{color:#a4b2cd}

````

## app/page.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/app/page.tsx

````tsx
'use client';
import {useState} from 'react';
import {MarketplaceModule} from '../components/marketplace';
import {createDemoMarketplaceService} from '../lib/marketplace/demoService';
import {ChatModule} from '../components/chat/ChatModule';
import {createDemoChatService} from '../lib/chat/demoService';
const context={viewer:{id:'demo-viewer',displayName:'Camille Démo'},mode:'demo' as const};
export default function Page(){
 const [view,setView]=useState<'home'|'marketplace'|'chat'>('home');
 const [marketplace]=useState(()=>createDemoMarketplaceService());
 const [chat]=useState(()=>createDemoChatService());
 const [contact,setContact]=useState('');
 return <><nav className="toolbar" aria-label="Navigation atelier"><strong>i+ · Atelier public</strong><button onClick={()=>setView('home')}>Contexte</button><button onClick={()=>setView('marketplace')}>Marketplace</button><button onClick={()=>setView('chat')}>Chat</button></nav><main><p className="banner">Kit de contribution public · Données fictives · Pas de compte réel ni de droits calculés.</p>
 {view==='home'?<><h1>Construire les modules ensemble</h1><p>Ce dépôt est un atelier exécutable pour les contributeurs, pas la copie intégrale du produit privé.</p><p>La marketplace est une démonstration intégrée. Le chat possède son point de montage et attend sa contribution.</p><p>Instructions : README.md, AGENTS.md, docs/CONTEXT.md et docs/TASKS.md.</p><button onClick={()=>setView('marketplace')}>Tester la marketplace</button></>:view==='marketplace'?<>{contact&&<p role="status">{contact}</p>}<MarketplaceModule context={context} service={marketplace} onContactSeller={(sellerId,listingId)=>setContact(`Contact demandé : vendeur ${sellerId}, annonce ${listingId}. Messagerie non branchée : aucun message envoyé.`)}/></>:<ChatModule context={context} service={chat}/>}
 </main></>;
}

````

## components/marketplace/Marketplace.module.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/components/marketplace/Marketplace.module.css

````css
/* Adapted from the DeepSeek contribution supplied by the founder. */
.root{--bg:#0b1220;--panel:#111a2e;--line:#2a3a5e;--text:#e8eefc;--muted:#a4b2cd;--accent:#87a2ff;color:var(--text);font-size:15px;line-height:1.5;min-width:0}
.root *{box-sizing:border-box}.root header{display:block;margin-bottom:20px}.root h1{font-size:28px;margin:0 0 8px}.root h2{font-size:21px}.root h3{font-size:17px}.root p{overflow-wrap:anywhere}.muted{color:var(--muted)}
.toolbar,.formGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:20px}.field{display:flex;flex-direction:column;gap:7px;min-width:0}.field input,.field select,.field textarea{width:100%;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:16px}.field textarea{min-height:120px;resize:vertical}.full{grid-column:1/-1}
.root button{min-height:44px;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);cursor:pointer;font:inherit}.root button:disabled{opacity:.55;cursor:wait}.root :is(button,input,select,textarea):focus-visible{outline:2px solid var(--accent);outline-offset:3px}.root .primary{background:linear-gradient(135deg,#436fe5,#7750c3);font-weight:700}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0}.row span{flex:1}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;list-style:none;padding:0}.card,.section{background:var(--bg);border:1px solid var(--line);border-radius:14px;overflow:hidden}.cardBody,.section{padding:16px}.card h3{margin:0 0 12px;overflow-wrap:anywhere}.meta{color:var(--muted);font-size:13px}.price{font-size:22px;font-weight:700}.picture{position:relative;aspect-ratio:16/10;display:grid;place-items:center;background:linear-gradient(135deg,#16203a,#0b1220);color:var(--muted);overflow:hidden}.picture img{object-fit:cover}.detail{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:18px}.gallery{display:grid;gap:12px}.description{white-space:pre-wrap;overflow-wrap:anywhere}.alert{color:#ffd7d7;background:#391b2c;border:1px solid #984d66;padding:12px;border-radius:10px;margin:12px 0}.error{color:#ffb1b1;font-size:13px}.state{padding:24px;background:var(--bg);border:1px dashed var(--line);border-radius:14px}.fav[aria-pressed=true]{color:#ff8faf}.root h1:focus{outline:none}
@media(max-width:1024px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.grid,.detail,.toolbar,.formGrid{grid-template-columns:minmax(0,1fr)}.full{grid-column:auto}.root h1{font-size:24px}}

````

## components/marketplace/MarketplaceModule.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/components/marketplace/MarketplaceModule.tsx

````tsx
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
 const createButton=useRef<HTMLButtonElement>(null);
 const detailButtons=useRef(new Map<string,HTMLButtonElement>());
 const returnTarget=useRef<string|null>(null);
 const previousView=useRef(view);
 const refreshCatalog=useRef(false);
 useEffect(()=>{
  if(previousView.current===view)return;
  previousView.current=view;
  if(view!=='catalog'){heading.current?.focus();return;}
  const target=returnTarget.current;
  (target==='create'?createButton.current:target?detailButtons.current.get(target):null)?.focus();
  if(!target||(target==='create'?!createButton.current:!detailButtons.current.has(target)))heading.current?.focus();
  returnTarget.current=null;
 },[view]);
 const invalidate=useCallback(()=>{generation.current++;seq.current++;favoriteLocks.current=new Set();},[]);
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
 const loadFavorites=useCallback(async()=>{const current=generation.current;setFavoritesReady(false);setPendingFavorites(new Set());setFavoriteError('');try{const ids=await service.listFavoriteIds();if(current!==generation.current)return;setFavorites(new Set(ids));setFavoritesReady(true);}catch(e){if(current===generation.current)setFavoriteError(message(e));}},[service]);
 useEffect(()=>{let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void loadFavorites();});return ()=>{cancelled=true;};},[loadFavorites]);
 async function toggleFavorite(item:Listing){
  if(!favoritesReady||favoriteLocks.current.has(item.id))return;
  const before=favorites.has(item.id);const current=generation.current;const locks=favoriteLocks.current;
  locks.add(item.id);setPendingFavorites(new Set(locks));setFavoriteError('');
  setFavorites(previous=>{const next=new Set(previous);if(before)next.delete(item.id);else next.add(item.id);return next;});
  try{await service.setFavorite(item.id,!before);}catch(e){if(current!==generation.current)return;setFavoriteError(message(e));setFavorites(previous=>{const next=new Set(previous);if(before)next.add(item.id);else next.delete(item.id);return next;});}
  finally{locks.delete(item.id);if(current===generation.current)setPendingFavorites(new Set(locks));}
 }
 function favoriteButton(item:Listing){return <button className={styles.fav} type="button" aria-pressed={favorites.has(item.id)} disabled={!favoritesReady||pendingFavorites.has(item.id)} aria-label={`${favorites.has(item.id)?'Retirer':'Ajouter'} ${item.title} ${favorites.has(item.id)?'des':'aux'} favoris`} onClick={()=>void toggleFavorite(item)}>{favorites.has(item.id)?'♥ Favori':'♡ Favori'}</button>;}
 function openDetail(item:Listing){setSelected(item);setView('detail');}
 function openCreate(){returnTarget.current='create';request.current=null;setFormErrors({});setCreateError('');setNotice('');setView('create');}
 async function create(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(sendLock.current)return;
  const fields=Object.fromEntries(new FormData(event.currentTarget).entries()) as DraftInput;
  const checked=validateDraft(fields);setFormErrors(checked.errors);setCreateError('');if(!checked.draft)return;
  const payload=JSON.stringify(checked.draft);if(!request.current||request.current.payload!==payload)request.current={id:makeClientRequestId(),payload};
  sendLock.current=true;setSending(true);const current=generation.current;
  try{const listing=await service.create(checked.draft,request.current.id);if(current!==generation.current)return;request.current=null;setNotice(context.mode==='demo'?'Annonce ajoutée à la démonstration. Elle disparaîtra au rechargement.':'Annonce créée.');refreshCatalog.current=true;openDetail(listing);}
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
    <button ref={createButton} className={styles.primary} onClick={openCreate}>Créer une annonce</button>
   </div>
   <div className={styles.row}><span role="status">{loading?'Chargement…':`${items.length} annonce(s) affichée(s)`}</span>{favoritesReady&&<span>Favoris : {favorites.size}</span>}</div>
   {error&&<div role="alert" className={styles.alert}>{error}<button onClick={()=>void search()}>Réessayer la recherche</button></div>}
   {!loading&&!error&&!items.length&&<p className={styles.state}>Aucune annonce ne correspond à votre recherche.</p>}
   <ul className={styles.grid} aria-label="Résultats">{items.map(item=><li key={item.id}><article className={styles.card}><Picture key={item.imageUrls[0]||item.id} url={item.imageUrls[0]} alt={item.title}/><div className={styles.cardBody}><h3>{item.title}</h3><p className={styles.meta}>{KIND_LABEL[item.kind]} · {item.category} · {item.city}</p><p className={styles.price}>{item.priceCents===0?(item.kind==='sale'?'Don':'Gratuit'):formatPriceCents(item.priceCents)}</p><div className={styles.row}>{favoriteButton(item)}<button ref={node=>{if(node)detailButtons.current.set(item.id,node);else detailButtons.current.delete(item.id);}} aria-label={`Voir ${item.title}`} onClick={()=>{returnTarget.current=item.id;openDetail(item);}}>Voir la fiche</button></div></div></article></li>)}</ul>
   {cursor&&!error&&<button disabled={loading} onClick={()=>void search(cursor,true)}>Charger plus</button>}
  </>}
  {view==='detail'&&selected&&<>
   <div className={styles.row}><button onClick={()=>{setView('catalog');if(refreshCatalog.current){refreshCatalog.current=false;void search();}}}>← Retour au catalogue</button>{favoriteButton(selected)}</div>
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

````

## components/marketplace/index.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/components/marketplace/index.ts

````ts
export {MarketplaceModule, default} from './MarketplaceModule';

````

## lib/contracts/modules.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/lib/contracts/modules.ts

````ts
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

````

## lib/marketplace/demoService.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/lib/marketplace/demoService.ts

````ts
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

````

## lib/marketplace/types.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/lib/marketplace/types.ts

````ts
import type { Listing } from '../contracts/modules';
export type { Listing, ListingDraft, MarketplaceService, Page, PublicProfile } from '../contracts/modules';
export type ListingKind = Listing['kind'];
export const KIND_LABEL = {sale:'Vente',rental:'Location',service:'Prestation'} as const;
export const KIND_OPTIONS = Object.entries(KIND_LABEL).map(([value,label])=>({value:value as ListingKind,label}));
export const CATEGORIES = ['Son','Lumière','Costumes','Décors','Instruments','Accessoires','Studios','Services','Autre'];
export type FormErrors = Partial<Record<'title'|'description'|'category'|'kind'|'priceEuros'|'city'|'imageUrls',string>>;

````

## lib/marketplace/validation.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/lib/marketplace/validation.ts

````ts
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

````

## tests/marketplace.test.mjs

Source : https://github.com/Masterofhypnose/intermittenz/blob/d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9/tests/marketplace.test.mjs

````js
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

test('MARKET-02: return focus survives remount, preserves loaded pages, and creation return',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
 const React=require('react');const {createRoot}=require('react-dom/client');const {MarketplaceModule}=require('../components/marketplace');
 const root=createRoot(document.getElementById('root'));
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent===text);
 const click=async el=>{assert.ok(el);await React.act(async()=>el.click());};
 try{
  await React.act(async()=>root.render(React.createElement(MarketplaceModule,{context:{mode:'demo',viewer:{id:'me',displayName:'Demo'}},service:createDemoMarketplaceService(),onContactSeller:()=>{}})));
  assert.notEqual(document.activeElement,document.querySelector('h1'),'initial render must not steal focus');
  await click(button('Charger plus'));
  const original=[...document.querySelectorAll('button[aria-label^="Voir "]')].at(-1);const label=original.getAttribute('aria-label');original.focus();
  await click(original);assert.equal(document.activeElement,document.querySelector('h1'));assert.equal(original.isConnected,false);
  await click(button('← Retour au catalogue'));
  assert.equal(document.querySelectorAll('article').length,5);
  assert.equal(document.activeElement.getAttribute('aria-label'),label);
  await click(button('Créer une annonce'));assert.equal(document.activeElement,document.querySelector('h1'));
  await click(button('← Retour au catalogue'));assert.equal(document.activeElement,button('Créer une annonce'));
 }finally{await React.act(async()=>root.unmount());dom.window.close();}
});

test('MARKET-02: obsolete success/rejection cannot unlock current favorite or alter new service state',async()=>{
 for(const outcome of ['resolve','reject']){
  const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
  const React=require('react');const {createRoot}=require('react-dom/client');const {MarketplaceModule}=require('../components/marketplace');
  const root=createRoot(document.getElementById('root'));
  const a=createDemoMarketplaceService();const b=createDemoMarketplaceService();const page=await b.search({text:''});const first=page.items[0],second=page.items[1];
  await b.setFavorite(second.id,true);
  let finishA,finishB;let callsB=0;
  const serviceA={...a,setFavorite:()=>new Promise((resolve,reject)=>{finishA=()=>outcome==='resolve'?resolve():reject(new Error('obsolete failure'));})};
  const serviceB={...b,setFavorite:()=>{callsB++;return new Promise(resolve=>{finishB=resolve;});}};
  const props={context:{mode:'demo',viewer:{id:'me',displayName:'Demo'}},onContactSeller:()=>{}};
  const fav=title=>[...document.querySelectorAll('button[aria-pressed]')].find(el=>el.getAttribute('aria-label').includes(title));
  const click=async el=>React.act(async()=>el.click());
  try{
   await React.act(async()=>root.render(React.createElement(MarketplaceModule,{...props,service:serviceA})));
   await click(fav(first.title));assert.equal(fav(first.title).disabled,true);
   await React.act(async()=>root.render(React.createElement(MarketplaceModule,{...props,service:serviceB})));
   assert.equal(fav(first.title).disabled,false,'new service must not inherit old locks');
   assert.equal(fav(first.title).getAttribute('aria-pressed'),'false');assert.equal(fav(second.title).getAttribute('aria-pressed'),'true');
   await click(fav(first.title));assert.equal(callsB,1);
   await React.act(async()=>finishA());
   assert.equal(fav(first.title).disabled,true,'old finally must not release the new service lock');
   assert.equal(fav(first.title).getAttribute('aria-pressed'),'true');assert.equal(fav(second.title).getAttribute('aria-pressed'),'true');
   assert.equal(document.querySelector('[role="alert"]'),null);
   await click(fav(first.title));assert.equal(callsB,1);
   await React.act(async()=>finishB());assert.equal(fav(first.title).disabled,false);
  }finally{await React.act(async()=>root.unmount());dom.window.close();}
 }
});

````

# Snapshot PR #3 — 7dfe699f2faa12a44119e5df22a900b6222a67cb

## app/globals.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/app/globals.css

````css
*{box-sizing:border-box}body{margin:0;background:#071329;color:#e8eefc;font-family:system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:24px 16px 60px}button{font:inherit;cursor:pointer;min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid #344b70;background:#132440;color:#e8eefc}button:focus-visible,a:focus-visible{outline:2px solid #87a2ff;outline-offset:3px}a{color:#93b7ff}.toolbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;padding:16px;border-bottom:1px solid #344b70}.toolbar strong{margin-right:auto}.banner{padding:16px;border:1px solid #344b70;border-radius:12px;background:#111f35;margin-bottom:20px}.placeholder{padding:24px;border:1px dashed #49618a;border-radius:12px}.muted{color:#a4b2cd}

````

## app/page.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/app/page.tsx

````tsx
'use client';
import {useState} from 'react';
import {MarketplaceModule} from '../components/marketplace';
import {createDemoMarketplaceService} from '../lib/marketplace/demoService';
import {ChatModule} from '../components/chat/ChatModule';
import {createDemoChatService} from '../lib/chat/demoService';
const context={viewer:{id:'demo-viewer',displayName:'Camille Démo'},mode:'demo' as const};
export default function Page(){
 const [view,setView]=useState<'home'|'marketplace'|'chat'>('home');
 const [marketplace]=useState(()=>createDemoMarketplaceService());
 const [chat]=useState(()=>createDemoChatService());
 const [contact,setContact]=useState('');
 return <><nav className="toolbar" aria-label="Navigation atelier"><strong>i+ · Atelier public</strong><button onClick={()=>setView('home')}>Contexte</button><button onClick={()=>setView('marketplace')}>Marketplace</button><button onClick={()=>setView('chat')}>Chat</button></nav><main><p className="banner">Kit de contribution public · Données fictives · Pas de compte réel ni de droits calculés.</p>
 {view==='home'?<><h1>Construire les modules ensemble</h1><p>Ce dépôt est un atelier exécutable pour les contributeurs, pas la copie intégrale du produit privé.</p><p>La marketplace est une démonstration intégrée. La messagerie de démonstration permet de parcourir des conversations fictives et de tester un envoi local.</p><p>Instructions : README.md, AGENTS.md, docs/CONTEXT.md et docs/TASKS.md.</p><button onClick={()=>setView('marketplace')}>Tester la marketplace</button></>:view==='marketplace'?<>{contact&&<p role="status">{contact}</p>}<MarketplaceModule context={context} service={marketplace} onContactSeller={(sellerId,listingId)=>setContact(`Contact demandé : vendeur ${sellerId}, annonce ${listingId}. Messagerie non branchée : aucun message envoyé.`)}/></>:<ChatModule context={context} service={chat}/>}
 </main></>;
}

````

## components/chat/ChatModule.module.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/ChatModule.module.css

````css
.root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #0d1117;
  color: #e8edf5;
  font-family: inherit;
  border-radius: 0.85rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.demoBanner {
  flex-shrink: 0;
  background: rgba(245, 158, 11, 0.08);
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  text-align: center;
  letter-spacing: 0.01em;
}

.layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.listPane {
  width: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.threadPane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.noSelection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.85rem;
  color: #4b5a7a;
  font-size: 0.88rem;
  padding: 2rem;
  text-align: center;
}

.noSelectionIcon { font-size: 2.5rem; opacity: 0.35; }

/* ── Desktop: side by side ────────────────────────────────── */
@media (min-width: 768px) {
  .listPane { width: 300px; }
  .mobileHidden { display: flex !important; flex-direction: column; }
}

/* ── Mobile: one pane at a time ───────────────────────────── */
@media (max-width: 767px) {
  .mobileHidden { display: none !important; }
  .listPane { border-right: none; }
}

.root {height: min(680px, 78dvh); min-height: 360px;}
.visitedThread {height:100%; min-height:0;}
.visitedThread[hidden] {display:none;}

````

## components/chat/ChatModule.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/ChatModule.tsx

````tsx
'use client';
import { useState, useCallback } from 'react';
import type { ChatModuleProps, Conversation } from '../../lib/contracts/modules';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import styles from './ChatModule.module.css';

export function ChatModule(props: ChatModuleProps) {
  const identity=props.context.viewer.id+'|'+(props.context.organizationId??'');
  const [session,setSession]=useState({service:props.service,identity,version:0});
  if(session.service!==props.service||session.identity!==identity){
    setSession({service:props.service,identity,version:session.version+1});
    return null;
  }
  return <ChatSession key={session.version} {...props}/>;
}
function ChatSession({ context, service }: ChatModuleProps) {
  const [active, setActive] = useState<Conversation | null>(null);
  const [visited,setVisited]=useState<Conversation[]>([]);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const handleSelect = useCallback((conv: Conversation) => {
    setVisited(previous=>previous.some(item=>item.id===conv.id)?previous:[...previous,conv]);
    setActive(conv);
    setMobileShowThread(true);
  }, []);

  const handleBack = useCallback(() => {setMobileShowThread(false);setTimeout(()=>document.getElementById('chat-conv-'+active?.id)?.focus(),0);}, [active]);

  return (
    <div className={styles.root}>
      {context.mode === 'demo' && (
        <div className={styles.demoBanner} role="status" aria-live="polite">
          ⚠ Démonstration — aucun message réel n&apos;est envoyé ni reçu
        </div>
      )}
      <div className={styles.layout}>
        <section
          aria-label="Liste des conversations"
          className={`${styles.listPane}${mobileShowThread ? ` ${styles.mobileHidden}` : ''}`}
        >
          <ConversationList
            context={context}
            service={service}
            activeId={active?.id ?? null}
            onSelect={handleSelect}
          />
        </section>
        <section
          aria-label={active ? active.title : 'Messagerie'}
          className={`${styles.threadPane}${!mobileShowThread ? ` ${styles.mobileHidden}` : ''}`}
        >
          {visited.map(conv=><div key={conv.id} hidden={conv.id!==active?.id} className={styles.visitedThread}>
            <MessageThread context={context} service={service} conversation={conv} active={conv.id===active?.id && mobileShowThread} onBack={handleBack}/>
          </div>)}
          {!active && (

            <div className={styles.noSelection}>
              <span className={styles.noSelectionIcon} aria-hidden="true">💬</span>
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ChatModule;

````

## components/chat/ConversationList.module.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/ConversationList.module.css

````css
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 0.75rem;
  text-align: center;
  flex: 1;
}

.stateIcon { font-size: 1.8rem; opacity: 0.4; }
.hint { font-size: 0.82rem; color: #7888a8; }

.spinner {
  width: 26px; height: 26px;
  border: 3px solid rgba(59, 130, 246, 0.12);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.spinnerSm {
  width: 18px; height: 18px;
  border: 2px solid rgba(59, 130, 246, 0.12);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

.retryBtn {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.28);
  color: #3b82f6;
  border-radius: 0.5rem;
  padding: 0.38rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.retryBtn:hover { background: rgba(59, 130, 246, 0.18); }

/* List */
.list {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 0.12rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.72rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.65rem;
  cursor: pointer;
  color: #e8edf5;
  text-align: left;
  transition: all 0.13s;
  font-family: inherit;
}
.item:hover { background: rgba(255, 255, 255, 0.04); }
.item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}
.itemActive {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.22);
}

.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.88rem; color: #fff;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}
.title {
  font-size: 0.83rem; font-weight: 600; color: #e8edf5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.subtitle {
  font-size: 0.7rem; color: #7888a8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.badge {
  min-width: 20px; height: 20px;
  background: #3b82f6; border-radius: 999px;
  font-size: 0.65rem; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 0 0.3rem; flex-shrink: 0;
}

.loadMore {
  margin: 0.4rem auto 0.5rem;
  display: block;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.09);
  color: #7888a8; border-radius: 0.5rem;
  padding: 0.38rem 1rem; font-size: 0.75rem;
  cursor: pointer; transition: all 0.13s;
  font-family: inherit;
}
.loadMore:hover { border-color: #3b82f6; color: #3b82f6; }

.loadingMore { padding: 0.6rem; display: flex; justify-content: center; }

.inlineError {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.45rem 0.7rem; gap: 0.5rem;
  background: rgba(239, 68, 68, 0.07);
  border: 1px solid rgba(239, 68, 68, 0.18);
  border-radius: 0.5rem;
  font-size: 0.75rem; color: #ef4444;
}

````

## components/chat/ConversationList.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/ConversationList.tsx

````tsx
'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { ChatService, Conversation, ModuleContext } from '../../lib/contracts/modules';
import styles from './ConversationList.module.css';

interface Props {
  context: ModuleContext;
  service: ChatService;
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
}

type ListState = {
  items: Conversation[];
  nextCursor: string | undefined;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

function getDisplayTitle(conv: Conversation, viewerId: string): string {
  if (conv.title) return conv.title;
  return conv.members
    .filter(m => m.id !== viewerId)
    .map(m => m.displayName)
    .join(', ') || 'Conversation';
}

function getSubtitle(conv: Conversation, viewerId: string): string {
  return conv.members
    .filter(m => m.id !== viewerId)
    .map(m => m.displayName)
    .join(', ');
}

export function ConversationList({ context, service, activeId, onSelect }: Props) {
  const [state, setState] = useState<ListState>({
    items: [],
    nextCursor: undefined,
    loading: true,
    loadingMore: false,
    error: null,
  });

  const seq=useRef(0);
  const busy=useRef(false);
  const load = useCallback(async (cursor?: string) => {
    if(busy.current)return;
    busy.current=true;const current=++seq.current;
    setState(s =>
      cursor
        ? { ...s, loadingMore: true, error: null }
        : { ...s, loading: true, error: null },
    );
    try {
      const page = await service.listConversations(cursor);
      if(current!==seq.current)return;
      setState(s => ({
        items: cursor ? [...new Map([...s.items, ...page.items].map(c=>[c.id,c])).values()] : page.items,
        nextCursor: page.nextCursor,
        loading: false,
        loadingMore: false,
        error: null,
      }));
    } catch (err) {
      if(current!==seq.current)return;
      setState(s => ({
        ...s,
        loading: false,
        loadingMore: false,
        error: err instanceof Error ? err.message : 'Erreur de chargement.',
      }));
    } finally {if(current===seq.current)busy.current=false;}
  }, [service]);

  const invalidate=useCallback(()=>{seq.current++;busy.current=false;},[]);
  useEffect(() => {let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void load();});return ()=>{cancelled=true;invalidate();};}, [load,invalidate]);

  if (state.loading) {
    return (
      <div className={styles.center} aria-busy="true" aria-label="Chargement">
        <div className={styles.spinner} />
        <span className={styles.hint}>Chargement…</span>
      </div>
    );
  }

  if (state.error && state.items.length === 0) {
    return (
      <div className={styles.center} role="alert">
        <span className={styles.stateIcon}>⚠️</span>
        <p className={styles.hint}>{state.error}</p>
        <button className={styles.retryBtn} onClick={() => load()}>Réessayer</button>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className={styles.center} aria-label="Aucune conversation">
        <span className={styles.stateIcon}>💬</span>
        <p className={styles.hint}>Aucune conversation pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className={styles.list} aria-label="Conversations">
      {state.items.map(conv => {
        const title    = getDisplayTitle(conv, context.viewer.id);
        const subtitle = getSubtitle(conv, context.viewer.id);
        const isActive = conv.id === activeId;
        return (
          <button
            key={conv.id}
            id={"chat-conv-"+conv.id}
            className={`${styles.item}${isActive ? ` ${styles.itemActive}` : ''}`}
            onClick={() => onSelect(conv)}
            aria-pressed={isActive}
            aria-label={`${title}${conv.unreadCount > 0 ? `, ${conv.unreadCount} non lu${conv.unreadCount > 1 ? 's' : ''}` : ''}`}
          >
            <div className={styles.avatar} aria-hidden="true">
              {title.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <span className={styles.title}>{title}</span>
              {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>
            {conv.unreadCount > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </span>
            )}
          </button>
        );
      })}

      {state.error && (
        <div className={styles.inlineError} role="alert">
          <span>{state.error}</span>
          <button className={styles.retryBtn} onClick={() => load(state.nextCursor)}>Réessayer</button>
        </div>
      )}

      {state.nextCursor && !state.loadingMore && (
        <button
          className={styles.loadMore}
          onClick={() => load(state.nextCursor)}
        >
          Charger plus
        </button>
      )}
      {state.loadingMore && (
        <div className={styles.loadingMore} aria-busy="true">
          <div className={styles.spinnerSm} />
        </div>
      )}
    </div>
  );
}

export default ConversationList;

````

## components/chat/MessageThread.module.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/MessageThread.module.css

````css
.root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #0d1117;
}

/* ── Header ──────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: #111827;
  flex-shrink: 0;
}

.backBtn {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.5rem;
  color: #e8edf5; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.13s;
  font-family: inherit;
}
.backBtn:hover { background: rgba(255,255,255,0.1); }
.backBtn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 1px; }

@media (min-width: 768px) { .backBtn { display: none; } }

.headerInfo {
  display: flex; flex-direction: column; gap: 0.08rem; min-width: 0;
}
.headerTitle {
  font-size: 0.88rem; font-weight: 700; color: #e8edf5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.headerSub {
  font-size: 0.68rem; color: #7888a8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Messages ─────────────────────────────────────────── */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-height: 0;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.75rem;
  padding: 2rem;
}
.emptyText { font-size: 0.82rem; color: #4b5a7a; text-align: center; }
.errText   { font-size: 0.82rem; color: #ef4444; text-align: center; }

.spinner {
  width: 24px; height: 24px;
  border: 3px solid rgba(59, 130, 246, 0.12);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Message rows ─────────────────────────────────────── */
.row {
  display: flex;
  align-items: flex-end;
  gap: 0.45rem;
}
.rowOwn { flex-direction: row-reverse; }

.avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.bubble {
  max-width: 72%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 0.9rem;
  border-bottom-left-radius: 0.2rem;
  padding: 0.55rem 0.85rem;
  display: flex; flex-direction: column; gap: 0.18rem;
}
.bubbleOwn {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.25);
  border-bottom-left-radius: 0.9rem;
  border-bottom-right-radius: 0.2rem;
}

.sender {
  font-size: 0.65rem; font-weight: 700; color: #3b82f6;
}
.text {
  font-size: 0.84rem; color: #e8edf5;
  white-space: pre-wrap; word-break: break-word; line-height: 1.45;
}
.time {
  font-size: 0.63rem; color: #4b5a7a; align-self: flex-end;
}

/* ── Input area ───────────────────────────────────────── */
.inputArea {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 0.7rem 1rem;
  background: #111827;
  flex-shrink: 0;
  padding-bottom: max(0.7rem, env(safe-area-inset-bottom, 0.7rem));
}

.sendError {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.4rem 0.7rem; margin-bottom: 0.5rem;
  background: rgba(239,68,68,0.07);
  border: 1px solid rgba(239,68,68,0.18);
  border-radius: 0.5rem;
  font-size: 0.73rem; color: #ef4444;
}

.retryBtn {
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.28);
  color: #3b82f6; border-radius: 0.45rem;
  padding: 0.28rem 0.65rem;
  font-size: 0.7rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: background 0.13s; font-family: inherit;
}
.retryBtn:hover { background: rgba(59,130,246,0.18); }

.inputRow {
  display: flex; align-items: flex-end; gap: 0.5rem;
}

.textarea {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem;
  color: #e8edf5; font-family: inherit; font-size: 0.85rem;
  padding: 0.6rem 0.85rem;
  resize: none; outline: none;
  max-height: 120px; overflow-y: auto;
  transition: border-color 0.13s; line-height: 1.45;
}
.textarea:focus { border-color: rgba(59,130,246,0.5); }
.textarea:disabled { opacity: 0.45; cursor: not-allowed; }
.textarea::placeholder { color: #4b5a7a; }

.sendBtn {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none; color: #fff; font-size: 1.05rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.13s;
  box-shadow: 0 3px 12px rgba(59,130,246,0.3);
}
.sendBtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(59,130,246,0.4); }
.sendBtn:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }
.sendBtn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

.spinnerSm {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.srOnly {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

.backBtn,.sendBtn {min-width:44px;min-height:44px;}
.textarea {font-size:16px;}
.headerTitle {margin:0;}
.retryBtn {min-height:44px;}

````

## components/chat/MessageThread.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/MessageThread.tsx

````tsx
'use client';
import {
  useReducer, useEffect, useRef, useCallback, useId,
} from 'react';
import type {
  ChatService, Conversation, Message, ModuleContext,
} from '../../lib/contracts/modules';
import styles from './MessageThread.module.css';

interface Props {
  context:      ModuleContext;
  service:      ChatService;
  conversation: Conversation;
  onBack:       () => void;
  active: boolean;
}

/* ── State machine ──────────────────────────────────────────── */
type State = {
  messages:       Message[];
  loadingMsgs:    boolean;
  loadError:      string | null;
  draft:          string;
  sending:        boolean;
  sendError:      string | null;
  /** clientRequestId held across retries to guarantee idempotency */
  pendingId:      string | null;
  cursor?: string;
};

type Action =
  | { type: 'RESET' }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_OK';   messages: Message[]; cursor?:string; older:boolean }
  | { type: 'LOAD_ERR';  error: string }
  | { type: 'SET_DRAFT'; draft: string }
  | { type: 'SEND_START'; pendingId: string }
  | { type: 'SEND_OK';   message: Message }
  | { type: 'SEND_ERR';  error: string }
  | { type: 'SEND_RETRY' };

const INIT: State = {
  messages: [], loadingMsgs: true, loadError: null,
  draft: '', sending: false, sendError: null, pendingId: null,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'RESET':      return { ...INIT };
    case 'LOAD_START': return { ...s, loadingMsgs: true, loadError: null };
    case 'LOAD_OK':    return { ...s, loadingMsgs: false, loadError:null, cursor:a.cursor, messages:[...new Map((a.older?[...a.messages,...s.messages]:[...s.messages,...a.messages]).map(m=>[m.id,m])).values()] }; 
    case 'LOAD_ERR':   return { ...s, loadingMsgs: false, loadError: a.error };
    case 'SET_DRAFT':  return { ...s, draft: a.draft, sendError: null };
    case 'SEND_START': return { ...s, sending: true,  sendError: null, pendingId: a.pendingId };
    case 'SEND_OK':    return { ...s, sending: false, sendError: null, pendingId: null, draft: '', messages: [...new Map([...s.messages, a.message].map(m=>[m.id,m])).values()] };
    case 'SEND_ERR':   return { ...s, sending: false, sendError: a.error };
    case 'SEND_RETRY': return { ...s, sendError: null };
    default:           return s;
  }
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
    }).format(new Date(iso));
  } catch { return iso; }
}

function senderLabel(senderId: string, conv: Conversation, viewerId: string): string {
  if (senderId === viewerId) return 'Vous';
  return conv.members.find(m => m.id === senderId)?.displayName ?? senderId;
}

/* ── Component ──────────────────────────────────────────────── */
export function MessageThread({ context, service, conversation, onBack, active }: Props) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const inputId   = useId();

  const generation=useRef(0);
  const loadSeq=useRef(0);
  const loadingLock=useRef(false);
  const sendLock=useRef(false);
  const pending=useRef<{id:string;text:string}|null>(null);
  const scrollNext=useRef(true);
  const headerRef=useRef<HTMLHeadingElement>(null);
  const loadMessages=useCallback(async(cursor?:string)=>{
    if(loadingLock.current)return;
    loadingLock.current=true;const seq=++loadSeq.current;const current=generation.current;
    scrollNext.current=!cursor;dispatch({type:'LOAD_START'});
    try{
      const page=await service.listMessages(conversation.id,cursor);
      if(current!==generation.current||seq!==loadSeq.current)return;
      dispatch({type:'LOAD_OK',messages:page.items,cursor:page.nextCursor,older:!!cursor});
    }catch(err){if(current===generation.current&&seq===loadSeq.current)dispatch({type:'LOAD_ERR',error:err instanceof Error?err.message:'Erreur de chargement.'});}
    finally{if(current===generation.current&&seq===loadSeq.current)loadingLock.current=false;}
  },[service,conversation.id]);
  const invalidate=useCallback(()=>{generation.current++;loadSeq.current++;loadingLock.current=false;},[]);
  useEffect(()=>{
    generation.current++;let cancelled=false;
    void Promise.resolve().then(()=>{if(!cancelled)void loadMessages();});
    return ()=>{cancelled=true;invalidate();};
  },[loadMessages,invalidate]);
  useEffect(()=>{if(active)headerRef.current?.focus();},[active]);
  useEffect(()=>{if(active&&scrollNext.current)bottomRef.current?.scrollIntoView?.({behavior:'smooth'});},[active,state.messages.length]);

  const doSend=useCallback(async()=>{
    const text=state.draft.trim();if(!text||sendLock.current)return;
    if(!pending.current||pending.current.text!==text)pending.current={id:crypto.randomUUID(),text};
    const current=generation.current;sendLock.current=true;
    dispatch({type:'SEND_START',pendingId:pending.current.id});
    try{
      const msg=await service.sendMessage(conversation.id,text,pending.current.id);
      if(current!==generation.current)return;
      pending.current=null;scrollNext.current=true;dispatch({type:'SEND_OK',message:msg});
    }catch(err){if(current===generation.current)dispatch({type:'SEND_ERR',error:err instanceof Error?err.message:"Erreur d'envoi."});}
    finally{if(current===generation.current)sendLock.current=false;}
  },[state.draft,service,conversation.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      doSend();
    }
  }, [doSend]);


  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Retour à la liste des conversations"
        >
          ←
        </button>
        <div className={styles.headerInfo}>
          <h2 ref={headerRef} tabIndex={-1} className={styles.headerTitle}>{conversation.title}</h2>
          <span className={styles.headerSub}>
            {conversation.members
              .filter(m => m.id !== context.viewer.id)
              .map(m => m.displayName)
              .join(', ')}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className={styles.messages}
        role="log"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {state.loadingMsgs && (
          <div className={styles.center} aria-busy="true">
            <div className={styles.spinner} />
          </div>
        )}

        {state.loadError && (
          <div className={styles.center} role="alert">
            <p className={styles.errText}>{state.loadError}</p><button className={styles.retryBtn} onClick={()=>void loadMessages(state.cursor)}>Réessayer messages</button>
          </div>
        )}

        {!state.loadingMsgs && !state.loadError && state.messages.length === 0 && (
          <div className={styles.center}>
            <p className={styles.emptyText}>Aucun message. Lancez la conversation !</p>
          </div>
        )}

        {state.cursor&&!state.loadError&&<button disabled={state.loadingMsgs} className={styles.retryBtn} onClick={()=>void loadMessages(state.cursor)}>Messages plus anciens</button>}
        {state.messages.map(msg => {
          const own = msg.senderId === context.viewer.id;
          return (
            <div key={msg.id} className={`${styles.row}${own ? ` ${styles.rowOwn}` : ''}`}>
              {!own && (
                <div className={styles.avatar} aria-hidden="true">
                  {senderLabel(msg.senderId, conversation, context.viewer.id).charAt(0)}
                </div>
              )}
              <div className={`${styles.bubble}${own ? ` ${styles.bubbleOwn}` : ''}`}>
                {!own && (
                  <span className={styles.sender}>
                    {senderLabel(msg.senderId, conversation, context.viewer.id)}
                  </span>
                )}
                {/* Text node only — never dangerouslySetInnerHTML */}
                <p className={styles.text}>{msg.text}</p>
                <time className={styles.time} dateTime={msg.sentAt}>
                  {fmt(msg.sentAt)}
                </time>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* ── Input ── */}
      <div className={styles.inputArea}>
        {state.sendError && (
          <div className={styles.sendError} role="alert">
            <span>{state.sendError}</span>
            <button className={styles.retryBtn} onClick={()=>void doSend()}>
              Réessayer envoi
            </button>
          </div>
        )}
        <div className={styles.inputRow}>
          <label htmlFor={inputId} className={styles.srOnly}>
            Écrire un message
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            className={styles.textarea}
            value={state.draft}
            onChange={e => dispatch({ type: 'SET_DRAFT', draft: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message… (Entrée pour envoyer)"
            disabled={state.sending}
            rows={1}
            aria-disabled={state.sending}
          />
          <button
            className={styles.sendBtn}
            onClick={() => doSend()}
            disabled={!state.draft.trim() || state.sending}
            aria-label="Envoyer"
          >
            {state.sending
              ? <span className={styles.spinnerSm} aria-hidden="true" />
              : <span aria-hidden="true">↑</span>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageThread;

````

## components/chat/index.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/components/chat/index.ts

````ts
export { ChatModule } from './ChatModule';
export { ConversationList } from './ConversationList';
export { MessageThread } from './MessageThread';

````

## lib/chat/demoAdapter.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/lib/chat/demoAdapter.ts

````ts
/**
 * In-memory demo adapter — demonstration only.
 * No real messages are sent or received.
 * Replace with a real ChatService implementation backed by Supabase (see docs/chat-integration.md).
 */
import type {
  ChatService, Conversation, Message, Page, PublicProfile,
} from '../contracts/modules';



const PERSONAS: PublicProfile[] = [
  { id: 'demo-sophie', displayName: 'Sophie Martin' },
  { id: 'demo-marc',   displayName: 'Marc Dubois'   },
  { id: 'demo-julie',  displayName: 'Julie Lefort'   },
  { id: 'demo-prod',   displayName: 'Production Les Arts Vivants' },
];

export function createDemoAdapter(viewerId: string, viewerName: string, pageSize = 2): ChatService {
  if(!Number.isSafeInteger(pageSize)||pageSize<1)throw new Error('Taille de page invalide.');
  const viewer: PublicProfile = { id: viewerId, displayName: viewerName };

  const convos: Conversation[] = [
    { id: 'c1', title: 'Sophie Martin',       members: [viewer, PERSONAS[0]],                    unreadCount: 2 },
    { id: 'c2', title: 'Marc Dubois',         members: [viewer, PERSONAS[1]],                    unreadCount: 0 },
    { id: 'c3', title: 'Projet Été — Équipe', members: [viewer, PERSONAS[1], PERSONAS[2], PERSONAS[3]],       unreadCount: 5 },
  ];

  const threads: Record<string, Message[]> = {
    c1: [
      { id: 'm1-1', conversationId: 'c1', senderId: 'demo-sophie', text: 'Bonjour ! Disponible pour les répétitions du 15 mars ?', sentAt: '2025-03-10T09:00:00Z' },
      { id: 'm1-2', conversationId: 'c1', senderId: viewerId,       text: 'Oui, je suis libre ce jour-là.',                         sentAt: '2025-03-10T09:15:00Z' },
      { id: 'm1-3', conversationId: 'c1', senderId: 'demo-sophie', text: 'Parfait ! Je vous envoie le calendrier complet.',          sentAt: '2025-03-10T09:20:00Z' },
      { id: 'm1-4', conversationId: 'c1', senderId: 'demo-sophie', text: 'Encore merci pour votre travail sur ce projet.',           sentAt: '2025-03-10T10:00:00Z' },
    ],
    c2: [
      { id: 'm2-1', conversationId: 'c2', senderId: 'demo-marc',   text: 'Concernant le plan lumière pour la tournée…',            sentAt: '2025-03-09T14:00:00Z' },
      { id: 'm2-2', conversationId: 'c2', senderId: viewerId,       text: "J'ai regardé les plans. Questions sur les spots face.",   sentAt: '2025-03-09T14:30:00Z' },
    ],
    c3: [
      { id: 'm3-1', conversationId: 'c3', senderId: 'demo-prod',   text: 'Réunion de production demain à 10h.',               sentAt: '2025-03-11T08:00:00Z' },
      { id: 'm3-2', conversationId: 'c3', senderId: 'demo-julie',  text: 'Confirmé de mon côté.',                             sentAt: '2025-03-11T08:05:00Z' },
      { id: 'm3-3', conversationId: 'c3', senderId: 'demo-marc',   text: 'Pareil, je serai là.',                              sentAt: '2025-03-11T08:10:00Z' },
      { id: 'm3-4', conversationId: 'c3', senderId: 'demo-prod',   text: "N'oubliez pas d'apporter vos contrats signés.",     sentAt: '2025-03-11T08:15:00Z' },
      { id: 'm3-5', conversationId: 'c3', senderId: 'demo-julie',  text: 'Noté !',                                            sentAt: '2025-03-11T08:20:00Z' },
    ],
  };

  // All state belongs to this demo instance. No network or automatic replies.
  const sent = new Map<string, Message>();
  let seq = 0;
  function requireConversation(id: string) {
    if (!convos.some(c => c.id === id)) throw new Error('Conversation introuvable.');
  }
  function decode(cursor: string | undefined, scope: string): string | undefined {
    if(!cursor)return undefined;
    try { const data=JSON.parse(decodeURIComponent(cursor));
      if(data.scope!==scope||typeof data.id!=='string')throw new Error();
      return data.id;
    } catch {throw new Error('Curseur invalide.');}
  }
  const encode=(scope:string,id:string)=>encodeURIComponent(JSON.stringify({scope,id}));
  return {
    async listConversations(cursor?: string): Promise<Page<Conversation>> {
      const id=decode(cursor,'conversations');
      const previous=id===undefined?-1:convos.findIndex(c=>c.id===id);
      if(id!==undefined&&previous<0)throw new Error('Curseur invalide.');
      const items=convos.slice(previous+1,previous+1+pageSize);
      return {items:structuredClone(items),nextCursor:previous+1+items.length<convos.length?encode('conversations',items.at(-1)!.id):undefined};
    },
    // Latest page first, each page chronological; cursor loads earlier messages.
    async listMessages(conversationId: string, cursor?: string): Promise<Page<Message>> {
      requireConversation(conversationId);
      const all=threads[conversationId];const id=decode(cursor,conversationId);
      const end=id===undefined?all.length:all.findIndex(m=>m.id===id);
      if(end<0)throw new Error('Curseur invalide.');
      const start=Math.max(0,end-pageSize);const items=all.slice(start,end);
      return {items:structuredClone(items),nextCursor:start>0?encode(conversationId,items[0].id):undefined};
    },
    async sendMessage(conversationId: string, text: string, clientRequestId: string): Promise<Message> {
      requireConversation(conversationId);
      const trimmed=text.trim();
      if(!trimmed)throw new Error('Le message ne peut pas être vide.');
      if(!clientRequestId.trim())throw new Error('Identifiant de requête requis.');
      const existing=sent.get(clientRequestId);
      if(existing){
        if(existing.conversationId!==conversationId||existing.text!==trimmed)throw new Error('Identifiant déjà utilisé pour un autre message.');
        return {...existing};
      }
      // No await between lookup and insertion: concurrent retries are atomic in this demo.
      const msg:Message={id:`m-new-${++seq}`,conversationId,senderId:viewerId,text:trimmed,sentAt:new Date().toISOString()};
      threads[conversationId].push(msg);sent.set(clientRequestId,msg);
      return {...msg};
    },
  };
}

````

## lib/chat/demoService.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/lib/chat/demoService.ts

````ts
import type {PublicProfile} from '../contracts/modules';
import {createDemoAdapter} from './demoAdapter';
export function createDemoChatService({viewer={id:'demo-viewer',displayName:'Camille Démo'},pageSize=2}:{viewer?:PublicProfile;pageSize?:number}={}){return createDemoAdapter(viewer.id,viewer.displayName,pageSize);}

````

## lib/contracts/modules.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/lib/contracts/modules.ts

````ts
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

````

## tests/chat.test.mjs

Source : https://github.com/Masterofhypnose/intermittenz/blob/7dfe699f2faa12a44119e5df22a900b6222a67cb/tests/chat.test.mjs

````js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url);
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,path)=>mod._compile(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,path);
require.extensions['.css']=mod=>{mod.exports={};};
const {createDemoChatService}=require('../lib/chat/demoService.ts');
const visible=selector=>[...document.querySelectorAll(selector)].find(el=>!el.closest('[hidden]'));
const context={viewer:{id:'demo-viewer',displayName:'Démo'},mode:'demo'};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
async function allMessages(service,id){let cursor;const items=[];do{const page=await service.listMessages(id,cursor);items.push(...page.items);cursor=page.nextCursor;}while(cursor);return items;}

test('chat actual adapter: cursor pagination, chronological recent pages, validation, immutable retries and isolation',async()=>{
 const service=createDemoChatService({pageSize:2});
 const p1=await service.listConversations();assert.equal(p1.items.length,2);assert.ok(p1.nextCursor);
 const p2=await service.listConversations(p1.nextCursor);assert.equal(p2.items.length,1);assert.equal(new Set([...p1.items,...p2.items].map(x=>x.id)).size,3);
 const recent=await service.listMessages('c1');const older=await service.listMessages('c1',recent.nextCursor);
 assert.equal(recent.items.length,2);assert.equal(older.items.length,2);
 assert.ok(Date.parse(older.items.at(-1).sentAt)<=Date.parse(recent.items[0].sentAt));
 for(const page of [recent,older])assert.deepEqual(page.items.map(x=>x.sentAt),page.items.map(x=>x.sentAt).sort());
 const count=(await allMessages(service,'c1')).length;
 const [a,b]=await Promise.all([service.sendMessage('c1','Bonjour','request-1'),service.sendMessage('c1','Bonjour','request-1')]);
 assert.equal(a.id,b.id);assert.equal((await allMessages(service,'c1')).length,count+1);
 await assert.rejects(()=>service.sendMessage('c1','Autre texte','request-1'));
 await assert.rejects(()=>service.sendMessage('c2','Bonjour','request-1'));
 await assert.rejects(()=>service.sendMessage('missing','Bonjour','request-2'));
 await assert.rejects(()=>service.listMessages('missing'));
 await assert.rejects(()=>service.sendMessage('c1','  ','request-3'));
 p1.items[0].members[0].displayName='Tampered';recent.items[0].text='Tampered';a.text='Tampered';
 assert.notEqual((await service.listConversations()).items[0].members[0].displayName,'Tampered');
 assert.ok((await allMessages(service,'c1')).every(x=>x.text!=='Tampered'));
 assert.equal((await allMessages(createDemoChatService(),'c1')).length,count);
});

async function mount(service){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
 dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 const React=require('react');const {createRoot}=require('react-dom/client');const {ChatModule}=require('../components/chat');
 const root=createRoot(document.getElementById('root'));
 const render=async(next)=>React.act(async()=>root.render(React.createElement(ChatModule,{context,service:next})));
 const button=label=>[...document.querySelectorAll('button')].find(b=>!b.closest('[hidden]')&&(b.getAttribute('aria-label')===label||b.textContent.trim()===label));
 const conversation=title=>[...document.querySelectorAll('button[aria-label]')].find(b=>b.getAttribute('aria-label').startsWith(title));
 const click=async(el)=>{assert.ok(el,'expected button exists');await React.act(async()=>el.click());};
 const change=async(text)=>{const input=visible('textarea');assert.ok(input);await React.act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value').set.call(input,text);input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});};
 await render(service);
 return {React,dom,root,render,button,conversation,click,change,log:()=>visible('[role="log"]'),close:async()=>{await React.act(async()=>root.unmount());dom.window.close();}};
}

test('chat React: drafts survive switching, old send stays in its conversation, double click sends once',async()=>{
 const adapter=createDemoChatService();const pending=deferred();let calls=0;
 const service={...adapter,sendMessage:(...args)=>{calls++;return pending.promise.then(()=>adapter.sendMessage(...args));}};
 const ui=await mount(service);
 try{
  await ui.click(ui.conversation('Sophie Martin'));await ui.change('Brouillon Sophie');
  await ui.click(ui.conversation('Marc Dubois'));await ui.change('Brouillon Marc');
  await ui.click(ui.conversation('Sophie Martin'));assert.equal(visible('textarea').value,'Brouillon Sophie');
  const send=ui.button('Envoyer');await ui.React.act(async()=>{send.click();send.click();});assert.equal(calls,1);
  await ui.click(ui.conversation('Marc Dubois'));assert.equal(visible('textarea').value,'Brouillon Marc');
  await ui.React.act(async()=>pending.resolve());
  assert.doesNotMatch(ui.log().textContent,/Brouillon Sophie/);assert.equal(visible('textarea').value,'Brouillon Marc');
  await ui.click(ui.conversation('Sophie Martin'));assert.match(ui.log().textContent,/Brouillon Sophie/);
  assert.equal((await allMessages(adapter,'c1')).filter(m=>m.text==='Brouillon Sophie').length,1);
 }finally{await ui.close();}
});

test('chat React: lost-response retry keeps its key, changed payload gets a new key, hostile text stays text',async()=>{
 const adapter=createDemoChatService();const requests=[];let lose=true;
 const service={...adapter,async sendMessage(id,text,key){requests.push({id,text,key});const result=await adapter.sendMessage(id,text,key);if(lose){lose=false;throw new Error('Réponse perdue');}return result;}};
 const ui=await mount(service);const malicious='<img src=x onerror=alert(1)>';
 try{
  await ui.click(ui.conversation('Sophie Martin'));assert.equal(ui.button('Envoyer').disabled,true);
  await ui.change(malicious);await ui.click(ui.button('Envoyer'));assert.match(visible('[role="alert"]').textContent,/Réponse perdue/);
  assert.equal(visible('textarea').value,malicious);
  await ui.click(ui.button('Réessayer envoi'));assert.equal(requests[0].key,requests[1].key);
  assert.equal((await allMessages(adapter,'c1')).filter(m=>m.text===malicious).length,1);
  assert.ok(ui.log().textContent.includes(malicious));assert.equal(document.querySelector('img[src="x"]'),null);
  lose=true;await ui.change('Avant modification');await ui.click(ui.button('Envoyer'));
  await ui.change('Après modification');await ui.click(ui.button('Envoyer'));
  assert.notEqual(requests[2].key,requests[3].key);assert.equal(requests[3].text,'Après modification');
 }finally{await ui.close();}
});

test('chat React: message load retry and older page prepend',async()=>{
 const adapter=createDemoChatService({pageSize:2});let fail=true;
 const service={...adapter,listMessages:(id,cursor)=>{if(fail){fail=false;return Promise.reject(new Error('Chargement interrompu'));}return adapter.listMessages(id,cursor);}};
 const ui=await mount(service);
 try{
  await ui.click(ui.conversation('Sophie Martin'));assert.match(visible('[role="alert"]').textContent,/Chargement interrompu/);
  await ui.click(ui.button('Réessayer messages'));const recent=await adapter.listMessages('c1');
  for(const msg of recent.items)assert.ok(ui.log().textContent.includes(msg.text));
  await ui.click(ui.button('Messages plus anciens'));const full=await allMessages(adapter,'c1');
  for(const msg of full)assert.ok(ui.log().textContent.includes(msg.text));
  const chronological=[...full].sort((a,b)=>a.sentAt.localeCompare(b.sentAt));
  for(let i=1;i<chronological.length;i++)assert.ok(ui.log().textContent.indexOf(chronological[i-1].text)<ui.log().textContent.indexOf(chronological[i].text));
 }finally{await ui.close();}
});

test('chat React: obsolete conversation-list response cannot replace a new service list',async()=>{
 const adapter=createDemoChatService();const stale=deferred();const ui=await mount({...adapter,listConversations:()=>stale.promise});
 const conversation={id:'new',title:'Nouveau service',members:[context.viewer],unreadCount:0};
 try{
  await ui.render({...adapter,listConversations:async()=>({items:[conversation]})});assert.ok(ui.conversation('Nouveau service'));
  await ui.React.act(async()=>stale.resolve({items:[{...conversation,id:'old',title:'Ancien service'}]}));
  assert.ok(ui.conversation('Nouveau service'));assert.equal(ui.conversation('Ancien service'),undefined);
 }finally{await ui.close();}
});


test('chat React: a deferred first thread load cannot contaminate a different active conversation',async()=>{
 const adapter=createDemoChatService();const old=deferred();let firstLoads=0;
 const ui=await mount({...adapter,listMessages:(id,cursor)=>{if(id==='c1'){firstLoads++;return old.promise;}return adapter.listMessages(id,cursor);}});
 try{
  await ui.click(ui.conversation('Sophie Martin'));assert.equal(firstLoads,1);
  await ui.click(ui.conversation('Marc Dubois'));
  const marker='Obsolete thread response';
  await ui.React.act(async()=>old.resolve({items:[{id:'late',conversationId:'c1',senderId:'demo-sophie',text:marker,sentAt:'2026-09-27T09:00:00Z'}]}));
  assert.ok(ui.log());assert.ok(!ui.log().textContent.includes(marker));
  for(const msg of (await adapter.listMessages('c2')).items)assert.ok(ui.log().textContent.includes(msg.text));
 }finally{await ui.close();}
});

test('chat React: late send rejection after service replacement cannot leak errors or clear the new draft',async()=>{
 const adapter=createDemoChatService();const pending=deferred();let oldCalls=0;
 const ui=await mount({...adapter,sendMessage:()=>{oldCalls++;return pending.promise;}});
 try{
  await ui.click(ui.conversation('Sophie Martin'));await ui.change('Ancien envoi');await ui.click(ui.button('Envoyer'));assert.equal(oldCalls,1);
  const replacement=createDemoChatService();await ui.render(replacement);
  await ui.click(ui.conversation('Sophie Martin'));await ui.change('Nouveau brouillon');
  await ui.React.act(async()=>pending.reject(new Error('Ancien échec')));
  assert.equal(visible('[role="alert"]'),undefined);assert.equal(visible('textarea').value,'Nouveau brouillon');
  assert.equal(ui.button('Envoyer').disabled,false);assert.ok(!ui.log().textContent.includes('Ancien envoi'));
 }finally{await ui.close();}
});

````

# Snapshot PR #4 — 0ce33c87f269d2a71f860aaac3d921c49b4eef92

## app/globals.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/app/globals.css

````css
*{box-sizing:border-box}body{margin:0;background:#071329;color:#e8eefc;font-family:system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:24px 16px 60px}button{font:inherit;cursor:pointer;min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid #344b70;background:#132440;color:#e8eefc}button:focus-visible,a:focus-visible{outline:2px solid #87a2ff;outline-offset:3px}a{color:#93b7ff}.toolbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;padding:16px;border-bottom:1px solid #344b70}.toolbar strong{margin-right:auto}.banner{padding:16px;border:1px solid #344b70;border-radius:12px;background:#111f35;margin-bottom:20px}.placeholder{padding:24px;border:1px dashed #49618a;border-radius:12px}.muted{color:#a4b2cd}

````

## app/page.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/app/page.tsx

````tsx
'use client';
import {useState} from 'react';
import {JobsModule} from '../components/jobs';
import {createDemoJobsService} from '../lib/jobs/demoService';
import {MarketplaceModule} from '../components/marketplace';
import {createDemoMarketplaceService} from '../lib/marketplace/demoService';
import {ChatModule} from '../components/chat/ChatModule';
import {createDemoChatService} from '../lib/chat/demoService';
const context={viewer:{id:'demo-viewer',displayName:'Camille Démo'},mode:'demo' as const};
export default function Page(){
 const [view,setView]=useState<'home'|'marketplace'|'chat'|'jobs'>('home');
 const [jobs]=useState(()=>createDemoJobsService());
 const [marketplace]=useState(()=>createDemoMarketplaceService());
 const [chat]=useState(()=>createDemoChatService());
 const [contact,setContact]=useState('');
 return <><nav className="toolbar" aria-label="Navigation atelier"><strong>i+ · Atelier public</strong><button onClick={()=>setView('home')}>Contexte</button><button onClick={()=>setView('marketplace')}>Marketplace</button><button onClick={()=>setView('chat')}>Chat</button><button onClick={()=>setView('jobs')}>Emploi</button></nav><main><p className="banner">Kit de contribution public · Données fictives · Pas de compte réel ni de droits calculés.</p>
 {view==='home'?<><h1>Construire les modules ensemble</h1><p>Ce dépôt est un atelier exécutable pour les contributeurs, pas la copie intégrale du produit privé.</p><p>La marketplace est une démonstration intégrée. Le chat possède son point de montage et attend sa contribution.</p><p>Instructions : README.md, AGENTS.md, docs/CONTEXT.md et docs/TASKS.md.</p><button onClick={()=>setView('marketplace')}>Tester la marketplace</button></>:view==='marketplace'?<>{contact&&<p role="status">{contact}</p>}<MarketplaceModule context={context} service={marketplace} onContactSeller={(sellerId,listingId)=>setContact(`Contact demandé : vendeur ${sellerId}, annonce ${listingId}. Messagerie non branchée : aucun message envoyé.`)}/></>:view==='jobs'?<JobsModule context={context} service={jobs}/>:<ChatModule context={context} service={chat}/>}
 </main></>;
}

````

## components/jobs/Jobs.module.css

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/components/jobs/Jobs.module.css

````css
.root {--bg:#0b1220;--panel:#111a2e;--line:#2a3a5e;--text:#e8eefc;--muted:#a4b2cd;--accent:#87a2ff;color:var(--text);font-size:15px;line-height:1.5;min-width:0}
.root * {box-sizing:border-box}
.root header {display:block;margin-bottom:20px}
.root h1 {font-size:28px;margin:0 0 8px}
.root h2 {font-size:21px}.root h3 {font-size:17px;margin:0 0 8px}.root p {overflow-wrap:anywhere}.muted {color:var(--muted)}
.toolbar,.advanced {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:16px}
.advanced {padding:14px;border:1px dashed var(--line);border-radius:12px;margin-bottom:20px}
.field {display:flex;flex-direction:column;gap:7px;min-width:0}
.field input,.field select {width:100%;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:16px}
.root button,.root a {min-height:44px;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);cursor:pointer;font:inherit}
.root a {display:inline-flex;align-items:center}
.root button:disabled {opacity:.55;cursor:not-allowed}
.root :is(button,input,select,a):focus-visible {outline:2px solid var(--accent);outline-offset:3px}
.root .primary {background:linear-gradient(135deg,#436fe5,#7750c3);font-weight:700}
.row {display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0}.row span {flex:1}
.grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;list-style:none;padding:0;margin:0}
.card,.section {background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:16px}
.meta {color:var(--muted);font-size:13px}.pay {font-size:18px;font-weight:700}
.alert {color:#ffd7d7;background:#391b2c;border:1px solid #984d66;padding:12px;border-radius:10px;margin:12px 0}
.state {padding:24px;background:var(--bg);border:1px dashed var(--line);border-radius:14px}
.fav[aria-pressed='true'] {color:#ff8faf}.root h1:focus {outline:none}
.badge {display:inline-block;padding:2px 8px;border-radius:999px;background:#1a2744;color:var(--muted);font-size:12px;margin-right:6px}
.description {white-space:pre-wrap;overflow-wrap:anywhere}
@media(max-width:650px){.grid,.toolbar,.advanced{grid-template-columns:minmax(0,1fr)}.root h1{font-size:24px}}

````

## components/jobs/JobsModule.tsx

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/components/jobs/JobsModule.tsx

````tsx
'use client';
import {useState,useEffect,useRef,useCallback} from 'react';
import type {JobOffer,JobsModuleProps,JobSearchQuery,JobKind,JobLookup,PayUnit,Remuneration} from '../../lib/jobs/types';
import {KIND_LABEL,KIND_OPTIONS} from '../../lib/jobs/types';
import styles from './Jobs.module.css';

const message=(error:unknown)=>error instanceof Error?error.message:'Une erreur est survenue. Réessayez.';
const unitLabels:Record<PayUnit,string>={day:'jour',hour:'heure',cachet:'cachet',month:'mois',total:'total'};
const basisLabels={gross:'brut',net:'net',invoice_excl_tax:'HT',invoice_incl_tax:'TTC',unspecified:'base non précisée'};
function formatRemuneration(offer:JobOffer){
 const r=offer.remuneration;
 if(r.status==='not_applicable')return 'Bénévolat';
 if(r.status==='unknown')return 'Rémunération non indiquée';
 return `${(r.amountCents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})} / ${unitLabels[r.unit]} ${basisLabels[r.basis]}`;
}
function locationLabel(o:JobOffer){return [o.location.city,o.location.department,o.location.region].filter(Boolean).join(', ')||o.location.country;}
function safeUrl(raw:string){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
function cents(raw:string){
 if(!/^\d+(?:[.,]\d{1,2})?$/.test(raw.trim()))throw new Error('Minimum invalide : indiquez un montant positif avec deux décimales maximum.');
 const [whole,fraction='']=raw.trim().replace(',','.').split('.');const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 if(!Number.isSafeInteger(n))throw new Error('Minimum trop élevé.');return n;
}
// Remount on service/viewer change: no old details, favorites or request locks leak.
export function JobsModule(props:JobsModuleProps){
 const identity=JSON.stringify([props.context.viewer.id,props.context.organizationId,props.context.mode]);
 const [session,setSession]=useState({service:props.service,identity,version:0});
 if(session.service!==props.service||session.identity!==identity){setSession({service:props.service,identity,version:session.version+1});return null;}
 return <JobsSession key={session.version} {...props}/>;
}
function JobsSession({context,service,onContactPublisher}:JobsModuleProps){
 const [view,setView]=useState<'catalog'|'detail'>('catalog');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [detail,setDetail]=useState<JobLookup|null>(null);
 const [detailLoading,setDetailLoading]=useState(false);
 const [detailError,setDetailError]=useState('');
 const [advanced,setAdvanced]=useState(false);
 const [filters,setFilters]=useState({text:'',category:'',city:'',kind:'' as JobKind|'',startsOnOrAfter:'',endsOnOrBefore:'',remunerationStatus:'' as Remuneration['status']|'',minimum:'',unit:'day' as PayUnit,basis:'gross' as NonNullable<JobSearchQuery['pay']>['basis']});
 const [items,setItems]=useState<JobOffer[]>([]);
 const [cursor,setCursor]=useState<string>();
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [retryCursor,setRetryCursor]=useState<string>();
 const seq=useRef(0),detailSeq=useRef(0),generation=useRef(0),searchBusy=useRef(false);
 const [favorites,setFavorites]=useState<Set<string>>(new Set());
 const [favoritesReady,setFavoritesReady]=useState(false);
 const [favoriteError,setFavoriteError]=useState('');
 const favoriteLocks=useRef(new Set<string>());
 const [pendingFavorites,setPendingFavorites]=useState<Set<string>>(new Set());
 const heading=useRef<HTMLHeadingElement>(null);
 const detailButtons=useRef(new Map<string,HTMLButtonElement>());
 const returnId=useRef<string|null>(null);
 const previousView=useRef(view);
 useEffect(()=>{
  if(previousView.current===view)return;
  previousView.current=view;
  if(view==='detail'){heading.current?.focus();return;}
  const button=returnId.current?detailButtons.current.get(returnId.current):null;
  (button??heading.current)?.focus();
 },[view]);
 const invalidate=useCallback(()=>{generation.current++;seq.current++;detailSeq.current++;},[]);
 useEffect(()=>{return invalidate;},[invalidate]);
 const search=useCallback(async(next?:string,append=false)=>{
  if(append&&searchBusy.current)return;
  searchBusy.current=true;const current=++seq.current;setLoading(true);setError('');setRetryCursor(next);
  if(!append){setItems([]);setCursor(undefined);}
  try{
   const query:JobSearchQuery={text:filters.text,category:filters.category,city:filters.city,kind:filters.kind||undefined,startsOnOrAfter:filters.startsOnOrAfter||undefined,endsOnOrBefore:filters.endsOnOrBefore||undefined,remunerationStatus:filters.remunerationStatus||undefined,cursor:next};
   if(filters.minimum.trim())query.pay={minimumCents:cents(filters.minimum),unit:filters.unit,basis:filters.basis};
   const page=await service.search(query);if(current!==seq.current)return;
   setItems(previous=>append?[...new Map([...previous,...page.items].map(o=>[o.id,o])).values()]:page.items);setCursor(page.nextCursor);
  }catch(e){if(current===seq.current)setError(message(e));}
  finally{if(current===seq.current){searchBusy.current=false;setLoading(false);}}
 },[filters,service]);
 const invalidateSearch=useCallback(()=>{seq.current++;},[]);
 useEffect(()=>{let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void search();});return ()=>{cancelled=true;invalidateSearch();};},[search,invalidateSearch]);
 const loadFavorites=useCallback(async()=>{
  const current=generation.current;setFavoritesReady(false);setFavoriteError('');
  try{const ids=await service.listFavoriteIds();if(current!==generation.current)return;setFavorites(new Set(ids));setFavoritesReady(true);}
  catch(e){if(current===generation.current)setFavoriteError(message(e));}
 },[service]);
 useEffect(()=>{let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void loadFavorites();});return ()=>{cancelled=true;};},[loadFavorites]);
 const toggleFavorite=useCallback(async(id:string)=>{
  if(!favoritesReady||favoriteLocks.current.has(id))return;
  const before=favorites.has(id),current=generation.current,locks=favoriteLocks.current;
  locks.add(id);setPendingFavorites(new Set(locks));setFavoriteError('');
  setFavorites(previous=>{const n=new Set(previous);if(before)n.delete(id);else n.add(id);return n;});
  try{await service.setFavorite(id,!before);}
  catch(e){if(current!==generation.current)return;setFavoriteError(message(e));setFavorites(previous=>{const n=new Set(previous);if(before)n.add(id);else n.delete(id);return n;});}
  finally{locks.delete(id);if(current===generation.current)setPendingFavorites(new Set(locks));}
 },[favoritesReady,favorites,service]);
 function favoriteButton(id:string,title:string,canAdd=true){return <button className={styles.fav} type="button" aria-pressed={favorites.has(id)} disabled={!favoritesReady||pendingFavorites.has(id)||(!canAdd&&!favorites.has(id))} aria-label={`${favorites.has(id)?'Retirer':'Ajouter'} ${title} ${favorites.has(id)?'des':'aux'} favoris`} onClick={()=>void toggleFavorite(id)}>{favorites.has(id)?'♥ Favori':'♡ Favori'}</button>;}
 async function openDetail(id:string){
  returnId.current=id;setSelectedId(id);setView('detail');setDetail(null);setDetailError('');setDetailLoading(true);const current=++detailSeq.current;
  try{const lookup=await service.getById(id);if(current===detailSeq.current)setDetail(lookup);}
  catch(e){if(current===detailSeq.current)setDetailError(message(e));}
  finally{if(current===detailSeq.current)setDetailLoading(false);}
 }
 function goCatalog(){detailSeq.current++;setView('catalog');setSelectedId(null);setDetail(null);setDetailLoading(false);}
 const offer=detail&&(detail.status==='active'||detail.status==='expired')?detail.offer:null;
 const title=view==='detail'&&offer?offer.title:'Emploi & Castings';
 const mayApply=detail?.status==='active'&&context.mode==='connected'&&offer?.source.type!=='demo';
 return <section className={styles.root} aria-label="Emploi et castings Intermittent+">
  <header><h1 ref={heading} tabIndex={-1}>{title}</h1><p className={styles.muted}>Catalogue d’offres et castings. Aucune candidature automatique.</p>{context.mode==='demo'&&<p className={styles.muted}>Offres fictives — aucun envoi de candidature. Favoris et essais disparaissent au rechargement.</p>}</header>
  {favoriteError&&<div role="alert" className={styles.alert}>Favoris : {favoriteError} {!favoritesReady?<button type="button" onClick={()=>void loadFavorites()}>Recharger les favoris</button>:<span>Réessayez avec le bouton Favori de l’offre.</span>}</div>}
  {view==='catalog'&&<>
   <div role="search" className={styles.toolbar}>
    <label className={styles.field}>Recherche<input type="search" aria-label="Recherche d’offres" value={filters.text} onChange={e=>setFilters({...filters,text:e.target.value})}/></label>
    <label className={styles.field}>Type<select aria-label="Filtrer par type" value={filters.kind} onChange={e=>setFilters({...filters,kind:e.target.value as JobKind|''})}>{KIND_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
    <label className={styles.field}>Métier<input aria-label="Filtrer par métier" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}/></label>
    <label className={styles.field}>Ville<input aria-label="Filtrer par ville" value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})}/></label>
   </div>
   <div className={styles.row}><button type="button" aria-expanded={advanced} onClick={()=>setAdvanced(!advanced)}>{advanced?'Masquer les filtres avancés':'Filtres avancés'}</button></div>
   {advanced&&<><div className={styles.advanced}>
    <label className={styles.field}>Début à partir du<input type="date" value={filters.startsOnOrAfter} onChange={e=>setFilters({...filters,startsOnOrAfter:e.target.value})}/></label>
    <label className={styles.field}>Fin jusqu’au<input type="date" value={filters.endsOnOrBefore} onChange={e=>setFilters({...filters,endsOnOrBefore:e.target.value})}/></label>
    <label className={styles.field}>Rémunération<select value={filters.remunerationStatus} onChange={e=>setFilters({...filters,remunerationStatus:e.target.value as Remuneration['status']|''})}><option value="">Toutes</option><option value="known">Indiquée</option><option value="unknown">Non indiquée</option><option value="not_applicable">Bénévolat</option></select></label>
    <label className={styles.field}>Minimum en euros<input inputMode="decimal" value={filters.minimum} onChange={e=>setFilters({...filters,minimum:e.target.value})}/></label>
    <label className={styles.field}>Unité<select value={filters.unit} onChange={e=>setFilters({...filters,unit:e.target.value as PayUnit})}>{Object.entries(unitLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label className={styles.field}>Base<select value={filters.basis} onChange={e=>setFilters({...filters,basis:e.target.value as NonNullable<JobSearchQuery['pay']>['basis']})}>{Object.entries(basisLabels).filter(([key])=>key!=='unspecified').map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   </div><p className={styles.muted}>Dates : les bornes non renseignées sont exclues du filtre correspondant. Le minimum compare uniquement la même unité et la même base.</p></>}
   <div className={styles.row}><span role="status">{loading?'Chargement…':`${items.length} offre(s) affichée(s)`}</span>{favoritesReady&&<span>Favoris : {favorites.size}</span>}</div>
   {error&&<div role="alert" className={styles.alert}>{error}<button type="button" onClick={()=>void search(retryCursor,!!retryCursor)}>Réessayer la recherche</button></div>}
   {!loading&&!error&&!items.length&&<p className={styles.state}>Aucune offre ne correspond à votre recherche.</p>}
   <ul className={styles.grid} aria-label="Résultats">{items.map(item=><li key={item.id}><article className={styles.card}><h3>{item.title}</h3><p className={styles.meta}><span className={styles.badge}>{KIND_LABEL[item.kind]}</span>{item.category} · {locationLabel(item)}</p><p className={styles.pay}>{formatRemuneration(item)}</p><div className={styles.row}>{favoriteButton(item.id,item.title)}<button type="button" ref={node=>{if(node)detailButtons.current.set(item.id,node);else detailButtons.current.delete(item.id);}} aria-label={`Voir ${item.title}`} onClick={()=>void openDetail(item.id)}>Voir la fiche</button></div></article></li>)}</ul>
   {cursor&&!error&&<button type="button" disabled={loading} onClick={()=>void search(cursor,true)}>Charger plus</button>}
  </>}
  {view==='detail'&&<>
   <div className={styles.row}><button type="button" onClick={goCatalog}>← Retour au catalogue</button>{offer&&favoriteButton(offer.id,offer.title,detail?.status==='active')}{!offer&&selectedId&&favorites.has(selectedId)&&favoriteButton(selectedId,'offre indisponible',false)}</div>
   {detailLoading&&<p className={styles.state}>Chargement de la fiche…</p>}
   {detailError&&<div role="alert" className={styles.alert}>{detailError}<button type="button" onClick={()=>selectedId&&void openDetail(selectedId)}>Réessayer</button></div>}
   {!detailLoading&&detail?.status==='withdrawn'&&<p className={styles.state}>Offre retirée. Le contenu n’est plus disponible.</p>}
   {!detailLoading&&detail?.status==='not_found'&&<p className={styles.state}>Offre introuvable.</p>}
   {!detailLoading&&offer&&<>
    {detail?.status==='expired'&&<p role="status" className={styles.alert}>Cette offre est expirée. La candidature n’est plus proposée.</p>}
    <div className={styles.section} aria-label="Informations de l’offre"><p className={styles.meta}><span className={styles.badge}>{KIND_LABEL[offer.kind]}</span>{offer.category} · {locationLabel(offer)}</p><p className={styles.pay}>{formatRemuneration(offer)}</p><p>Émetteur : {offer.publisher.displayName}</p>{offer.dates&&<p className={styles.meta}>Période : {offer.dates.start??'—'} → {offer.dates.end??'—'}{offer.dates.flexible?' (flexible)':''}</p>}
     {mayApply&&offer.application.mode==='external'&&safeUrl(offer.application.url)&&<a className={styles.primary} href={offer.application.url} target="_blank" rel="noopener noreferrer">Voir l’annonce officielle</a>}
     {mayApply&&offer.application.mode==='internal'&&offer.application.publisherId===offer.publisher.id&&onContactPublisher&&<button type="button" className={styles.primary} onClick={()=>onContactPublisher(offer.publisher.id,offer.id)}>Contacter</button>}
     {(context.mode==='demo'||offer.source.type==='demo')&&<p className={styles.muted}>Démonstration : aucune candidature n’est envoyée.</p>}
    </div><div className={styles.section}><h2>Description</h2><p className={styles.description}>{offer.description}</p></div>
   </>}
  </>}
 </section>;
}
export default JobsModule;

````

## components/jobs/index.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/components/jobs/index.ts

````ts
export { JobsModule } from './JobsModule';

````

## lib/contracts/modules.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/lib/contracts/modules.ts

````ts
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

````

## lib/jobs/demoService.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/lib/jobs/demoService.ts

````ts
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

````

## lib/jobs/types.ts

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/lib/jobs/types.ts

````ts
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

````

## tests/jobs.test.mjs

Source : https://github.com/Masterofhypnose/intermittenz/blob/0ce33c87f269d2a71f860aaac3d921c49b4eef92/tests/jobs.test.mjs

````js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url);
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,path)=>mod._compile(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,path);
require.extensions['.css']=mod=>{mod.exports={};};
const {createDemoJobsService}=require('../lib/jobs/demoService.ts');
const NOW='2026-09-27T12:00:00.000Z';
const opts={now:()=>new Date(NOW),pageSize:30};
const ids=page=>page.items.map(o=>o.id);
const fixture=(overrides={})=>({id:'edge',source:{type:'demo',name:'Test',collectedAt:NOW},status:'active',title:'Offre test',description:'Description',kind:'salaried',category:'Test',location:{country:'FR'},remuneration:{status:'unknown'},publisher:{id:'p',displayName:'Test'},application:{mode:'none'},createdAt:NOW,...overrides});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};

test('jobs adapter: exact filters, partial/flexible dates, pay and input validation',async()=>{
 const s=createDemoJobsService(opts);
 assert.deepEqual(ids(await s.search({})),['job-1','job-2','job-3','job-4','job-5','job-8']);
 assert.deepEqual(ids(await s.search({text:' RÉGISSEUR ',category:'lumi',city:'PAR'})),['job-1']);
 assert.deepEqual(ids(await s.search({kind:'casting'})),['job-2']);
 assert.deepEqual(ids(await s.search({startsOnOrAfter:'2026-10-11'})),['job-1','job-2','job-8']);
 assert.deepEqual(ids(await s.search({endsOnOrBefore:'2026-10-09'})),['job-3','job-5']);
 assert.deepEqual(ids(await s.search({startsOnOrAfter:'2026-10-01',endsOnOrBefore:'2026-11-30'})),['job-1','job-3','job-5']);
 assert.deepEqual(ids(await s.search({startsOnOrAfter:'2026-12-01'})),[]);
 assert.deepEqual(ids(await s.search({pay:{minimumCents:28000,unit:'day',basis:'gross'}})),['job-1']);
 assert.deepEqual(ids(await s.search({pay:{minimumCents:28001,unit:'day',basis:'gross'}})),[]);
 assert.deepEqual(ids(await s.search({pay:{minimumCents:0,unit:'cachet',basis:'net'}})),['job-5']);
 assert.deepEqual(ids(await s.search({pay:{minimumCents:0,unit:'day',basis:'invoice_excl_tax'}})),['job-3']);
 assert.deepEqual(ids(await s.search({remunerationStatus:'unknown'})),['job-2']);
 assert.deepEqual(ids(await s.search({remunerationStatus:'not_applicable'})),['job-4']);
 for(const service of [s,createDemoJobsService({...opts,seed:[]})])for(const query of [{startsOnOrAfter:'bad'},{startsOnOrAfter:'2026-02-30'},{startsOnOrAfter:'2026-12-01',endsOnOrBefore:'2026-01-01'},{pay:{minimumCents:-1,unit:'day',basis:'gross'}},{pay:{minimumCents:1.5,unit:'day',basis:'net'}}])await assert.rejects(()=>service.search(query));
});

test('jobs adapter: expiry priority, one clock per request, favorites and defensive copies',async()=>{
 let time=Date.parse(NOW)-1;
 const seed=[fixture({expiresAt:NOW}),fixture({id:'withdrawn',status:'withdrawn',expiresAt:NOW}),fixture({id:'expired',status:'expired',expiresAt:'2027-01-01T00:00:00Z'})];
 const s=createDemoJobsService({now:()=>new Date(time),seed});
 assert.equal((await s.getById('edge')).status,'active');
 await s.setFavorite('edge',true);await s.setFavorite('edge',true);
 assert.deepEqual(await s.listFavoriteIds(),['edge']);
 time=Date.parse(NOW);
 const edge=await s.getById('edge');assert.equal(edge.status,'expired');assert.equal(edge.offer.status,'expired');
 assert.deepEqual(await s.getById('withdrawn'),{status:'withdrawn'});assert.equal((await s.getById('expired')).status,'expired');assert.deepEqual(await s.getById('missing'),{status:'not_found'});
 assert.deepEqual(ids(await s.search({})),[]);
 for(const id of ['edge','withdrawn','expired','missing'])await assert.rejects(()=>s.setFavorite(id,true));
 assert.deepEqual(await s.listFavoriteIds(),['edge']);await s.setFavorite('edge',false);await s.setFavorite('edge',false);await s.setFavorite('missing',false);assert.deepEqual(await s.listFavoriteIds(),[]);
 time++;assert.equal((await s.getById('edge')).status,'expired');
 const other=createDemoJobsService(opts);const first=await other.getById('job-1');first.offer.publisher.displayName='tamper';first.offer.location.city='tamper';assert.equal((await other.getById('job-1')).offer.location.city,'Paris');
 seed[0].title='tamper';assert.notEqual((await s.getById('edge')).offer.title,'tamper');
 assert.deepEqual(await other.listFavoriteIds(),[]);other.__setFailNext({search:true});await assert.rejects(()=>other.search({}));assert.ok((await other.search({})).items.length);
 let calls=0;const clock=createDemoJobsService({seed:[fixture({id:'a',expiresAt:NOW}),fixture({id:'b',expiresAt:NOW})],now:()=>new Date(Date.parse(NOW)-1+calls++)});calls=0;
 assert.deepEqual(new Set(ids(await clock.search({}))),new Set(['a','b']));assert.equal(calls,1);
});

test('jobs adapter: chronological keyset ordering survives missing/expired anchors and insertion',async()=>{
 let time=Date.parse(NOW);
 const s=createDemoJobsService({now:()=>new Date(time),pageSize:2,seed:[fixture({id:'z',createdAt:'2026-09-27T13:00:00+02:00'}),fixture({id:'b',createdAt:NOW,expiresAt:'2026-09-27T12:00:01Z'}),fixture({id:'a',createdAt:NOW}),fixture({id:'old',createdAt:'2026-09-26T12:00:00Z'})]});
 const first=await s.search({});assert.deepEqual(ids(first),['b','a']);assert.ok(first.nextCursor);
 s.__removeForTest('a');s.__insertForTest(fixture({id:'new',createdAt:'2026-09-28T12:00:00Z'}));
 assert.deepEqual(ids(await s.search({cursor:first.nextCursor})),['z','old']);
 const expiredAnchor=createDemoJobsService({now:()=>new Date(time),pageSize:1,seed:[fixture({id:'b',expiresAt:'2026-09-27T12:00:01Z'}),fixture({id:'a'})]});
 const page=await expiredAnchor.search({});time+=1000;assert.deepEqual(ids(await expiredAnchor.search({cursor:page.nextCursor})),['a']);
 await assert.rejects(()=>s.search({cursor:'not-a-cursor'}));await assert.rejects(()=>s.search({text:'changed',cursor:first.nextCursor}));
});

async function harness(service,mode='demo'){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
 const React=require('react');const {createRoot}=require('react-dom/client');const {JobsModule}=require('../components/jobs');const root=createRoot(document.getElementById('root'));const contacts=[];
 const props={context:{viewer:{id:'demo',displayName:'Démo'},mode},service,onContactPublisher:(...args)=>contacts.push(args)};
 const render=async(extra={})=>React.act(async()=>root.render(React.createElement(JobsModule,{...props,...extra})));
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===text);
 const click=async el=>{assert.ok(el,'button exists');await React.act(async()=>el.click());};
 const change=async(label,value)=>React.act(async()=>{const el=document.querySelector(`[aria-label="${label}"]`)??[...document.querySelectorAll("label")].find(node=>node.firstChild?.textContent.trim()===label)?.querySelector("input,select");assert.ok(el,`input ${label}`);const proto=el.tagName==='SELECT'?dom.window.HTMLSelectElement.prototype:dom.window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new dom.window.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));});
 const close=async()=>{await React.act(async()=>root.unmount());dom.window.close();};
 await render();return {React,dom,render,button,click,change,close,contacts};
}

test('jobs React: navigation retains pages/focus, errors retry, filters and literal descriptions',async()=>{
 const adapter=createDemoJobsService({...opts,pageSize:3});adapter.__setFailNext({listFavoriteIds:true});const h=await harness(adapter);
 try{
  assert.match(document.querySelector('[role="alert"]').textContent,/Favoris/);await h.click(h.button('Recharger les favoris'));
  adapter.__setFailNext({setFavorite:true});await h.click(document.querySelector('[aria-pressed]'));assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'false');assert.match(document.body.textContent,/Favoris/);
  await h.click(document.querySelector('[aria-pressed]'));assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'true');
  await h.click(h.button('Charger plus'));assert.equal(document.querySelectorAll('article').length,6);
  const opener=document.querySelector('[aria-label^="Voir "]');const label=opener.getAttribute('aria-label');opener.focus();await h.click(opener);assert.equal(document.activeElement.tagName,'H1');assert.match(document.body.textContent,/Description/);
  await h.click(h.button('← Retour au catalogue'));assert.equal(document.querySelectorAll('article').length,6);assert.equal(document.activeElement.getAttribute('aria-label'),label);
  await h.click(h.button('Filtres avancés'));assert.equal(document.querySelectorAll('article').length,6);
  await h.change('Rémunération','known');await h.change('Minimum en euros','280');await h.change('Unité','day');await h.change('Base','gross');assert.equal(document.querySelectorAll('article').length,1);assert.match(document.querySelector('article').textContent,/Régisseur/);
  await h.change('Minimum en euros','');await h.change('Rémunération','');
  await h.change('Recherche d’offres','no-results');assert.match(document.body.textContent,/Aucune offre/);
  adapter.__setFailNext({search:true});await h.change('Recherche d’offres','régisseur');assert.ok(document.querySelector('[role="alert"]'));await h.click(h.button('Réessayer la recherche'));assert.equal(document.querySelectorAll('article').length,1);
  adapter.__setFailNext({getById:true});await h.click(document.querySelector('[aria-label^="Voir "]'));assert.ok(h.button('Réessayer'));await h.click(h.button('Réessayer'));assert.match(document.body.textContent,/Description/);
  await h.click(h.button('← Retour au catalogue'));await h.change('Recherche d’offres','');
  const unsafe=createDemoJobsService({...opts,seed:[fixture({description:'<img src=x onerror=alert(1)>'})]});await h.render({service:unsafe});await h.click(document.querySelector('[aria-label^="Voir "]'));assert.match(document.body.textContent,/<img src=x onerror=alert\(1\)>/);assert.equal(document.querySelector('img[src="x"]'),null);
 }finally{await h.close();}
});

test('jobs React: stale searches/details and old favorite completion cannot override replacement service',async()=>{
 const base=createDemoJobsService(opts);const oldSearch=deferred(),newSearch=deferred();const oldFavorite=deferred(),newFavorite=deferred();let newCalls=0;
 const a={...base,search:q=>q.text==='old'?oldSearch.promise:q.text==='new'?newSearch.promise:base.search(q),setFavorite:()=>oldFavorite.promise};
 const h=await harness(a);
 try{
  await h.change('Recherche d’offres','old');await h.change('Recherche d’offres','new');
  await h.React.act(async()=>newSearch.resolve({items:[fixture({title:'Newest'})]}));await h.React.act(async()=>oldSearch.resolve({items:[fixture({title:'Obsolete'})]}));assert.match(document.querySelector('[aria-label="Résultats"]').textContent,/Newest/);assert.doesNotMatch(document.querySelector('[aria-label="Résultats"]').textContent,/Obsolete/);
  await h.change('Recherche d’offres','');await h.click(document.querySelector('[aria-pressed]'));
  const b={...base,setFavorite:()=>{newCalls++;return newFavorite.promise;}};await h.render({service:b});const fav=document.querySelector('[aria-pressed]');assert.equal(fav.disabled,false);await h.click(fav);assert.equal(newCalls,1);assert.equal(document.querySelector('[aria-pressed]').disabled,true);
  await h.React.act(async()=>oldFavorite.reject(new Error('old failure')));assert.equal(document.querySelector('[aria-pressed]').disabled,true);assert.doesNotMatch(document.body.textContent,/old failure/);
  await h.React.act(async()=>newFavorite.resolve());assert.equal(document.querySelector('[aria-pressed]').disabled,false);assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'true');
  const delayed=deferred();await h.render({service:{...base,getById:()=>delayed.promise}});await h.click(document.querySelector('[aria-label^="Voir "]'));await h.click(h.button('← Retour au catalogue'));await h.React.act(async()=>delayed.resolve({status:'active',offer:fixture({title:'Late detail'})}));assert.equal(document.querySelector('h1').textContent,'Emploi & Castings');assert.ok(document.querySelector('[type="search"]'));
 }finally{await h.close();}
});

test('jobs React: demo blocks injected actions and connected links reject unsafe schemes',async()=>{
 const external=fixture({source:{type:'external',name:'Test',collectedAt:NOW,canonicalUrl:'https://example.com/job'},application:{mode:'external',url:'https://example.com/job'}});const internal=fixture({application:{mode:'internal',publisherId:'p'}});
 const adapter=offer=>({search:async()=>({items:[offer]}),getById:async()=>({status:'active',offer}),listFavoriteIds:async()=>[],setFavorite:async()=>{}});
 const h=await harness(adapter(external));
 try{
  await h.click(document.querySelector('[aria-label^="Voir "]'));assert.equal(document.querySelector('a'),null);
  await h.render({service:adapter(internal)});await h.click(document.querySelector('[aria-label^="Voir "]'));assert.equal(h.button('Contacter'),undefined);assert.deepEqual(h.contacts,[]);
  for(const url of ['javascript:alert(1)','http://example.com','https://user:password@example.com']){await h.render({context:{viewer:{id:'viewer',displayName:'Viewer'},mode:'connected'},service:adapter({...external,application:{mode:'external',url}})});await h.click(document.querySelector('[aria-label^="Voir "]'));assert.equal(document.querySelector('a'),null);}
  await h.render({context:{viewer:{id:'viewer',displayName:'Viewer'},mode:'connected'},service:adapter(external)});await h.click(document.querySelector('[aria-label^="Voir "]'));assert.equal(document.querySelector('a').getAttribute('href'),'https://example.com/job');
 }finally{await h.close();}
});

````

# Fin du dossier
32 fichiers sources inclus. Rendre le rapport complet dans un fichier joint ou un bloc Markdown, sans proposer de nouvelle mission. Exécution des tests et rendu visuel : non réalisés par DeepSeek.

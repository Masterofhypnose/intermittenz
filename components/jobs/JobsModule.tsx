'use client';
import {useState,useEffect,useRef,useCallback,useId} from 'react';
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
 const advancedId=useId(),minimumErrorId=useId();
 const [filters,setFilters]=useState({text:'',category:'',city:'',kind:'' as JobKind|'',startsOnOrAfter:'',endsOnOrBefore:'',remunerationStatus:'' as Remuneration['status']|'',minimum:'',unit:'day' as PayUnit,basis:'gross' as NonNullable<JobSearchQuery['pay']>['basis']});
 let minimumError='';
 if(filters.minimum.trim()){try{cents(filters.minimum);}catch(e){minimumError=message(e);}}
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
   <div className={styles.row}><button type="button" aria-expanded={advanced} aria-controls={advancedId} onClick={()=>setAdvanced(!advanced)}>{advanced?'Masquer les filtres avancés':'Filtres avancés'}</button></div>
   <div id={advancedId} hidden={!advanced}><div className={styles.advanced}>
    <label className={styles.field}>Début à partir du<input type="date" value={filters.startsOnOrAfter} onChange={e=>setFilters({...filters,startsOnOrAfter:e.target.value})}/></label>
    <label className={styles.field}>Fin jusqu’au<input type="date" value={filters.endsOnOrBefore} onChange={e=>setFilters({...filters,endsOnOrBefore:e.target.value})}/></label>
    <label className={styles.field}>Rémunération<select value={filters.remunerationStatus} onChange={e=>setFilters({...filters,remunerationStatus:e.target.value as Remuneration['status']|''})}><option value="">Toutes</option><option value="known">Indiquée</option><option value="unknown">Non indiquée</option><option value="not_applicable">Bénévolat</option></select></label>
    <label className={styles.field}>Minimum en euros<input aria-invalid={!!minimumError} aria-describedby={minimumError?minimumErrorId:undefined} inputMode="decimal" value={filters.minimum} onChange={e=>setFilters({...filters,minimum:e.target.value})}/>{minimumError&&<span id={minimumErrorId}>{minimumError}</span>}</label>
    <label className={styles.field}>Unité<select value={filters.unit} onChange={e=>setFilters({...filters,unit:e.target.value as PayUnit})}>{Object.entries(unitLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label className={styles.field}>Base<select value={filters.basis} onChange={e=>setFilters({...filters,basis:e.target.value as NonNullable<JobSearchQuery['pay']>['basis']})}>{Object.entries(basisLabels).filter(([key])=>key!=='unspecified').map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   </div><p className={styles.muted}>Dates : les bornes non renseignées sont exclues du filtre correspondant. Le minimum compare uniquement la même unité et la même base.</p></div>
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

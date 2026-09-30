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

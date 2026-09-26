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

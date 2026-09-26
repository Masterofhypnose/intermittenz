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

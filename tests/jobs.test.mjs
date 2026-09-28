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

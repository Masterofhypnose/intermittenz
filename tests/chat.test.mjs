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

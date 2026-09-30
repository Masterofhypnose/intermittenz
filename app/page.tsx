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

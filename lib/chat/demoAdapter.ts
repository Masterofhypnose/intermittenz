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

'use client';
import type {ChatModuleProps} from '../../lib/contracts/modules';
/** Integration slot, not a completed chat implementation. Replace in CHAT-01. */
export function ChatModule({context}:ChatModuleProps){return <section className="placeholder"><h1>Messagerie — mission CHAT-01</h1><p>Bonjour {context.viewer.displayName}. Ce point de montage attend le module chat.</p><p>Aucun message envoyé. Remplacer ce composant en respectant ChatModuleProps.</p></section>;}

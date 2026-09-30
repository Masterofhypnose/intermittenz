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

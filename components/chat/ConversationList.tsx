'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { ChatService, Conversation, ModuleContext } from '../../lib/contracts/modules';
import styles from './ConversationList.module.css';

interface Props {
  context: ModuleContext;
  service: ChatService;
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
}

type ListState = {
  items: Conversation[];
  nextCursor: string | undefined;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

function getDisplayTitle(conv: Conversation, viewerId: string): string {
  if (conv.title) return conv.title;
  return conv.members
    .filter(m => m.id !== viewerId)
    .map(m => m.displayName)
    .join(', ') || 'Conversation';
}

function getSubtitle(conv: Conversation, viewerId: string): string {
  return conv.members
    .filter(m => m.id !== viewerId)
    .map(m => m.displayName)
    .join(', ');
}

export function ConversationList({ context, service, activeId, onSelect }: Props) {
  const [state, setState] = useState<ListState>({
    items: [],
    nextCursor: undefined,
    loading: true,
    loadingMore: false,
    error: null,
  });

  const seq=useRef(0);
  const busy=useRef(false);
  const load = useCallback(async (cursor?: string) => {
    if(busy.current)return;
    busy.current=true;const current=++seq.current;
    setState(s =>
      cursor
        ? { ...s, loadingMore: true, error: null }
        : { ...s, loading: true, error: null },
    );
    try {
      const page = await service.listConversations(cursor);
      if(current!==seq.current)return;
      setState(s => ({
        items: cursor ? [...new Map([...s.items, ...page.items].map(c=>[c.id,c])).values()] : page.items,
        nextCursor: page.nextCursor,
        loading: false,
        loadingMore: false,
        error: null,
      }));
    } catch (err) {
      if(current!==seq.current)return;
      setState(s => ({
        ...s,
        loading: false,
        loadingMore: false,
        error: err instanceof Error ? err.message : 'Erreur de chargement.',
      }));
    } finally {if(current===seq.current)busy.current=false;}
  }, [service]);

  const invalidate=useCallback(()=>{seq.current++;busy.current=false;},[]);
  useEffect(() => {let cancelled=false;void Promise.resolve().then(()=>{if(!cancelled)void load();});return ()=>{cancelled=true;invalidate();};}, [load,invalidate]);

  if (state.loading) {
    return (
      <div className={styles.center} aria-busy="true" aria-label="Chargement">
        <div className={styles.spinner} />
        <span className={styles.hint}>Chargement…</span>
      </div>
    );
  }

  if (state.error && state.items.length === 0) {
    return (
      <div className={styles.center} role="alert">
        <span className={styles.stateIcon}>⚠️</span>
        <p className={styles.hint}>{state.error}</p>
        <button className={styles.retryBtn} onClick={() => load()}>Réessayer</button>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className={styles.center} aria-label="Aucune conversation">
        <span className={styles.stateIcon}>💬</span>
        <p className={styles.hint}>Aucune conversation pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className={styles.list} aria-label="Conversations">
      {state.items.map(conv => {
        const title    = getDisplayTitle(conv, context.viewer.id);
        const subtitle = getSubtitle(conv, context.viewer.id);
        const isActive = conv.id === activeId;
        return (
          <button
            key={conv.id}
            id={"chat-conv-"+conv.id}
            className={`${styles.item}${isActive ? ` ${styles.itemActive}` : ''}`}
            onClick={() => onSelect(conv)}
            aria-pressed={isActive}
            aria-label={`${title}${conv.unreadCount > 0 ? `, ${conv.unreadCount} non lu${conv.unreadCount > 1 ? 's' : ''}` : ''}`}
          >
            <div className={styles.avatar} aria-hidden="true">
              {title.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <span className={styles.title}>{title}</span>
              {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>
            {conv.unreadCount > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </span>
            )}
          </button>
        );
      })}

      {state.error && (
        <div className={styles.inlineError} role="alert">
          <span>{state.error}</span>
          <button className={styles.retryBtn} onClick={() => load(state.nextCursor)}>Réessayer</button>
        </div>
      )}

      {state.nextCursor && !state.loadingMore && (
        <button
          className={styles.loadMore}
          onClick={() => load(state.nextCursor)}
        >
          Charger plus
        </button>
      )}
      {state.loadingMore && (
        <div className={styles.loadingMore} aria-busy="true">
          <div className={styles.spinnerSm} />
        </div>
      )}
    </div>
  );
}

export default ConversationList;

'use client';
import {
  useReducer, useEffect, useRef, useCallback, useId,
} from 'react';
import type {
  ChatService, Conversation, Message, ModuleContext,
} from '../../lib/contracts/modules';
import styles from './MessageThread.module.css';

interface Props {
  context:      ModuleContext;
  service:      ChatService;
  conversation: Conversation;
  onBack:       () => void;
  active: boolean;
}

/* ── State machine ──────────────────────────────────────────── */
type State = {
  messages:       Message[];
  loadingMsgs:    boolean;
  loadError:      string | null;
  draft:          string;
  sending:        boolean;
  sendError:      string | null;
  /** clientRequestId held across retries to guarantee idempotency */
  pendingId:      string | null;
  cursor?: string;
};

type Action =
  | { type: 'RESET' }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_OK';   messages: Message[]; cursor?:string; older:boolean }
  | { type: 'LOAD_ERR';  error: string }
  | { type: 'SET_DRAFT'; draft: string }
  | { type: 'SEND_START'; pendingId: string }
  | { type: 'SEND_OK';   message: Message }
  | { type: 'SEND_ERR';  error: string }
  | { type: 'SEND_RETRY' };

const INIT: State = {
  messages: [], loadingMsgs: true, loadError: null,
  draft: '', sending: false, sendError: null, pendingId: null,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'RESET':      return { ...INIT };
    case 'LOAD_START': return { ...s, loadingMsgs: true, loadError: null };
    case 'LOAD_OK':    return { ...s, loadingMsgs: false, loadError:null, cursor:a.cursor, messages:[...new Map((a.older?[...a.messages,...s.messages]:[...s.messages,...a.messages]).map(m=>[m.id,m])).values()] }; 
    case 'LOAD_ERR':   return { ...s, loadingMsgs: false, loadError: a.error };
    case 'SET_DRAFT':  return { ...s, draft: a.draft, sendError: null };
    case 'SEND_START': return { ...s, sending: true,  sendError: null, pendingId: a.pendingId };
    case 'SEND_OK':    return { ...s, sending: false, sendError: null, pendingId: null, draft: '', messages: [...new Map([...s.messages, a.message].map(m=>[m.id,m])).values()] };
    case 'SEND_ERR':   return { ...s, sending: false, sendError: a.error };
    case 'SEND_RETRY': return { ...s, sendError: null };
    default:           return s;
  }
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
    }).format(new Date(iso));
  } catch { return iso; }
}

function senderLabel(senderId: string, conv: Conversation, viewerId: string): string {
  if (senderId === viewerId) return 'Vous';
  return conv.members.find(m => m.id === senderId)?.displayName ?? senderId;
}

/* ── Component ──────────────────────────────────────────────── */
export function MessageThread({ context, service, conversation, onBack, active }: Props) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const inputId   = useId();

  const generation=useRef(0);
  const loadSeq=useRef(0);
  const loadingLock=useRef(false);
  const sendLock=useRef(false);
  const pending=useRef<{id:string;text:string}|null>(null);
  const scrollNext=useRef(true);
  const headerRef=useRef<HTMLHeadingElement>(null);
  const loadMessages=useCallback(async(cursor?:string)=>{
    if(loadingLock.current)return;
    loadingLock.current=true;const seq=++loadSeq.current;const current=generation.current;
    scrollNext.current=!cursor;dispatch({type:'LOAD_START'});
    try{
      const page=await service.listMessages(conversation.id,cursor);
      if(current!==generation.current||seq!==loadSeq.current)return;
      dispatch({type:'LOAD_OK',messages:page.items,cursor:page.nextCursor,older:!!cursor});
    }catch(err){if(current===generation.current&&seq===loadSeq.current)dispatch({type:'LOAD_ERR',error:err instanceof Error?err.message:'Erreur de chargement.'});}
    finally{if(current===generation.current&&seq===loadSeq.current)loadingLock.current=false;}
  },[service,conversation.id]);
  const invalidate=useCallback(()=>{generation.current++;loadSeq.current++;loadingLock.current=false;},[]);
  useEffect(()=>{
    generation.current++;let cancelled=false;
    void Promise.resolve().then(()=>{if(!cancelled)void loadMessages();});
    return ()=>{cancelled=true;invalidate();};
  },[loadMessages,invalidate]);
  useEffect(()=>{if(active)headerRef.current?.focus();},[active]);
  useEffect(()=>{if(active&&scrollNext.current)bottomRef.current?.scrollIntoView?.({behavior:'smooth'});},[active,state.messages.length]);

  const doSend=useCallback(async()=>{
    const text=state.draft.trim();if(!text||sendLock.current)return;
    if(!pending.current||pending.current.text!==text)pending.current={id:crypto.randomUUID(),text};
    const current=generation.current;sendLock.current=true;
    dispatch({type:'SEND_START',pendingId:pending.current.id});
    try{
      const msg=await service.sendMessage(conversation.id,text,pending.current.id);
      if(current!==generation.current)return;
      pending.current=null;scrollNext.current=true;dispatch({type:'SEND_OK',message:msg});
    }catch(err){if(current===generation.current)dispatch({type:'SEND_ERR',error:err instanceof Error?err.message:"Erreur d'envoi."});}
    finally{if(current===generation.current)sendLock.current=false;}
  },[state.draft,service,conversation.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      doSend();
    }
  }, [doSend]);


  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Retour à la liste des conversations"
        >
          ←
        </button>
        <div className={styles.headerInfo}>
          <h2 ref={headerRef} tabIndex={-1} className={styles.headerTitle}>{conversation.title}</h2>
          <span className={styles.headerSub}>
            {conversation.members
              .filter(m => m.id !== context.viewer.id)
              .map(m => m.displayName)
              .join(', ')}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className={styles.messages}
        role="log"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {state.loadingMsgs && (
          <div className={styles.center} aria-busy="true">
            <div className={styles.spinner} />
          </div>
        )}

        {state.loadError && (
          <div className={styles.center} role="alert">
            <p className={styles.errText}>{state.loadError}</p><button className={styles.retryBtn} onClick={()=>void loadMessages(state.cursor)}>Réessayer messages</button>
          </div>
        )}

        {!state.loadingMsgs && !state.loadError && state.messages.length === 0 && (
          <div className={styles.center}>
            <p className={styles.emptyText}>Aucun message. Lancez la conversation !</p>
          </div>
        )}

        {state.cursor&&!state.loadError&&<button disabled={state.loadingMsgs} className={styles.retryBtn} onClick={()=>void loadMessages(state.cursor)}>Messages plus anciens</button>}
        {state.messages.map(msg => {
          const own = msg.senderId === context.viewer.id;
          return (
            <div key={msg.id} className={`${styles.row}${own ? ` ${styles.rowOwn}` : ''}`}>
              {!own && (
                <div className={styles.avatar} aria-hidden="true">
                  {senderLabel(msg.senderId, conversation, context.viewer.id).charAt(0)}
                </div>
              )}
              <div className={`${styles.bubble}${own ? ` ${styles.bubbleOwn}` : ''}`}>
                {!own && (
                  <span className={styles.sender}>
                    {senderLabel(msg.senderId, conversation, context.viewer.id)}
                  </span>
                )}
                {/* Text node only — never dangerouslySetInnerHTML */}
                <p className={styles.text}>{msg.text}</p>
                <time className={styles.time} dateTime={msg.sentAt}>
                  {fmt(msg.sentAt)}
                </time>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* ── Input ── */}
      <div className={styles.inputArea}>
        {state.sendError && (
          <div className={styles.sendError} role="alert">
            <span>{state.sendError}</span>
            <button className={styles.retryBtn} onClick={()=>void doSend()}>
              Réessayer envoi
            </button>
          </div>
        )}
        <div className={styles.inputRow}>
          <label htmlFor={inputId} className={styles.srOnly}>
            Écrire un message
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            className={styles.textarea}
            value={state.draft}
            onChange={e => dispatch({ type: 'SET_DRAFT', draft: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message… (Entrée pour envoyer)"
            disabled={state.sending}
            rows={1}
            aria-disabled={state.sending}
          />
          <button
            className={styles.sendBtn}
            onClick={() => doSend()}
            disabled={!state.draft.trim() || state.sending}
            aria-label="Envoyer"
          >
            {state.sending
              ? <span className={styles.spinnerSm} aria-hidden="true" />
              : <span aria-hidden="true">↑</span>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageThread;

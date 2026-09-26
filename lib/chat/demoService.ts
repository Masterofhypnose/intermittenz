import type {ChatService} from '../contracts/modules';
/** Integration slot. Implement conversations, messages, failures and idempotency in CHAT-01. */
export function createDemoChatService():ChatService{return {async listConversations(){return {items:[]};},async listMessages(){return {items:[]};},async sendMessage(){throw new Error('Adaptateur chat à implémenter — aucun message envoyé.');}};}

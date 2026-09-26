/** Contracts for isolated contributions. Not an authentication or authorization layer. */
export type PublicProfile = { id: string; displayName: string; avatarUrl?: string };
export type Page<T> = { items: T[]; nextCursor?: string };
export type ModuleContext = { viewer: PublicProfile; organizationId?: string; mode: 'demo' | 'connected' };
export type Conversation = { id: string; members: PublicProfile[]; title: string; unreadCount: number };
export type Message = { id: string; conversationId: string; senderId: string; text: string; sentAt: string };
/** Connected adapters must authorize membership on the server for every operation. */
export interface ChatService {
  listConversations(cursor?: string): Promise<Page<Conversation>>;
  listMessages(conversationId: string, cursor?: string): Promise<Page<Message>>;
  sendMessage(conversationId: string, text: string, clientRequestId: string): Promise<Message>;
}
export type ChatModuleProps = { context: ModuleContext; service: ChatService };
export type Listing = { id: string; seller: PublicProfile; title: string; description: string; category: string; kind: 'sale' | 'rental' | 'service'; priceCents: number; currency: 'EUR'; city: string; imageUrls: string[]; createdAt: string };
export type ListingDraft = Omit<Listing, 'id' | 'seller' | 'createdAt' | 'currency'>;
export interface MarketplaceService {
  search(query: { text: string; category?: string; city?: string; cursor?: string }): Promise<Page<Listing>>;
  create(draft: ListingDraft, clientRequestId: string): Promise<Listing>;
  listFavoriteIds(): Promise<string[]>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
}
export type MarketplaceModuleProps = { context: ModuleContext; service: MarketplaceService; onContactSeller: (sellerId: string, listingId: string) => void };

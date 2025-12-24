import type { Message, Conversation } from '@/src/types/message';

export function normalizeMessage(row: any): Message {
  return {
    id: row.id || '',
    conversationId: row.conversation_id || '',
    senderId: row.sender_id || '',
    receiverId: row.receiver_id || '',
    content: row.content || '',
    read: row.read || false,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function normalizeMessages(rows: any[]): Message[] {
  return rows.map(normalizeMessage);
}

export function normalizeConversation(row: any): Conversation {
  return {
    id: row.id || '',
    propertyId: row.property_id || '',
    propertyAddress: row.property_address || '',
    propertyImage: row.property_image || '',
    propertyPrice: row.property_price || 0,
    
    tenantId: row.tenant_id || '',
    tenantName: row.tenant_name || '',
    tenantPhoto: row.tenant_photo || undefined,
    
    landlordId: row.landlord_id || '',
    landlordName: row.landlord_name || '',
    landlordPhoto: row.landlord_photo || undefined,
    
    lastMessage: row.last_message || '',
    lastMessageTime: row.last_message_time || new Date().toISOString(),
    unreadCount: row.unread_count || 0,
    
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function normalizeConversations(rows: any[]): Conversation[] {
  return rows.map(normalizeConversation);
}

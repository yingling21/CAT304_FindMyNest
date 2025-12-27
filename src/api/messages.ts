import { supabase } from '@/lib/supabase';
import type { Message, Conversation } from '@/src/types/message';
import { normalizeMessage, normalizeMessages, normalizeConversations } from '@/src/utils/normalizeMessage';
import { maskSensitiveData } from '@/utils/sensitiveDataMask';

// Fetch conversations by user
// Retrieves all conversations where the user is either a tenant or landlord
export async function getConversationsByUser(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
    // Sort conversations by most recent activity
    .order('last_message_time', { ascending: false });

  if (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }

  return normalizeConversations(data || []);
}

// Fetch messages for a single conversation
export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });    // Messages should be shown oldest → newest

  if (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }

  return normalizeMessages(data || []);
}

export async function getMessagesByConversations(conversationIds: string[]): Promise<Record<string, Message[]>> {
  if (conversationIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }

  const messagesByConversation: Record<string, Message[]> = {};
  const messages = normalizeMessages(data || []);
  
  messages.forEach((message) => {
    if (!messagesByConversation[message.conversationId]) {
      messagesByConversation[message.conversationId] = [];
    }
    messagesByConversation[message.conversationId].push(message);
  });

  return messagesByConversation;
}

// Create or get an existing conversation
// Ensures only ONE conversation exists per property + tenant
export async function createOrGetConversation(params: {
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  propertyPrice: number;
  tenantId: string;
  tenantName: string;
  tenantPhoto?: string;
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
}): Promise<string> {

  // Check if conversation already exists
  const { data: existingConv, error: searchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('property_id', params.propertyId)
    .eq('tenant_id', params.tenantId)
    .single();

  // If found, reuse existing conversation
  if (!searchError && existingConv) {
    return existingConv.id;
  }

  // Otherwise, create a new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      property_id: params.propertyId,
      property_address: params.propertyAddress,
      property_image: params.propertyImage,
      property_price: params.propertyPrice,
      tenant_id: params.tenantId,
      tenant_name: params.tenantName,
      tenant_photo: params.tenantPhoto,
      landlord_id: params.landlordId,
      landlord_name: params.landlordName,
      landlord_photo: params.landlordPhoto,
      last_message: '',
      unread_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }

  return data.id;
}

// Send a message
export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
}): Promise<Message> {
  const maskedContent = maskSensitiveData(params.content);

  // Update conversation preview with latest message
  const { data: messageData, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      content: maskedContent,
      read: false,
    })
    .select()
    .single();

  if (msgError) {
    console.error('Failed to send message:', msgError);
    throw msgError;
  }

  const { error: convError } = await supabase
    .from('conversations')
    .update({
      last_message: maskedContent,
      last_message_time: new Date().toISOString(),
    })
    .eq('id', params.conversationId);

  if (convError) {
    console.error('Failed to update conversation:', convError);
  }

  return normalizeMessage(messageData);
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const { error: msgError } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (msgError) {
    console.error('Failed to mark messages as read:', msgError);
    throw msgError;
  }

  // Reset unread count in conversation table
  const { error: convError } = await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);

  if (convError) {
    console.error('Failed to update conversation:', convError);
    throw convError;
  }
}

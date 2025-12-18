import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthContext";
import type { Conversation, Message } from "@/types";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { maskSensitiveData } from "@/utils/sensitiveDataMask";

export const [MessagesProvider, useMessages] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      if (!user) {
        setConversations([]);
        setMessages({});
        setIsLoading(false);
        return;
      }

      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
        .order('last_message_time', { ascending: false });
      
      if (convError) throw convError;
      
      if (conversationsData) {
        const formattedConversations: Conversation[] = conversationsData.map((conv: any) => ({
          id: conv.id,
          propertyId: conv.property_id,
          propertyTitle: conv.property_title,
          propertyImage: conv.property_image,
          propertyPrice: conv.property_price,
          tenantId: conv.tenant_id,
          tenantName: conv.tenant_name,
          tenantPhoto: conv.tenant_photo,
          landlordId: conv.landlord_id,
          landlordName: conv.landlord_name,
          landlordPhoto: conv.landlord_photo,
          lastMessage: conv.last_message,
          lastMessageTime: conv.last_message_time,
          unreadCount: conv.unread_count,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
        }));
        setConversations(formattedConversations);

        const conversationIds = formattedConversations.map(c => c.id);
        if (conversationIds.length > 0) {
          const { data: messagesData, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: true });
          
          if (msgError) throw msgError;
          
          const messagesByConversation: Record<string, Message[]> = {};
          messagesData?.forEach((msg: any) => {
            const message: Message = {
              id: msg.id,
              conversationId: msg.conversation_id,
              senderId: msg.sender_id,
              receiverId: msg.receiver_id,
              content: msg.content,
              read: msg.read,
              createdAt: msg.created_at,
            };
            if (!messagesByConversation[msg.conversation_id]) {
              messagesByConversation[msg.conversation_id] = [];
            }
            messagesByConversation[msg.conversation_id].push(message);
          });
          setMessages(messagesByConversation);
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createOrGetConversation = async (
    propertyId: string,
    propertyTitle: string,
    propertyImage: string,
    propertyPrice: number,
    landlordId: string,
    landlordName: string,
    landlordPhoto?: string
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const { data: existingConv, error: searchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', user.id)
      .single();
    
    if (!searchError && existingConv) {
      return existingConv.id;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        property_id: propertyId,
        property_title: propertyTitle,
        property_image: propertyImage,
        property_price: propertyPrice,
        tenant_id: user.id,
        tenant_name: user.fullName,
        tenant_photo: user.profilePicture,
        landlord_id: landlordId,
        landlord_name: landlordName,
        landlord_photo: landlordPhoto,
        last_message: '',
        unread_count: 0,
      })
      .select()
      .single();
    
    if (error) throw error;

    const newConversation: Conversation = {
      id: data.id,
      propertyId: data.property_id,
      propertyTitle: data.property_title,
      propertyImage: data.property_image,
      propertyPrice: data.property_price,
      tenantId: data.tenant_id,
      tenantName: data.tenant_name,
      tenantPhoto: data.tenant_photo,
      landlordId: data.landlord_id,
      landlordName: data.landlord_name,
      landlordPhoto: data.landlord_photo,
      lastMessage: data.last_message,
      lastMessageTime: data.last_message_time,
      unreadCount: data.unread_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    setConversations(prev => [newConversation, ...prev]);

    return newConversation.id;
  };

  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const receiverId = user.role === "tenant" ? conversation.landlordId : conversation.tenantId;

    const maskedContent = maskSensitiveData(content);

    const { data: messageData, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: maskedContent,
        read: false,
      })
      .select()
      .single();
    
    if (msgError) throw msgError;

    const { error: convError } = await supabase
      .from('conversations')
      .update({
        last_message: maskedContent,
        last_message_time: new Date().toISOString(),
      })
      .eq('id', conversationId);
    
    if (convError) throw convError;

    const newMessage: Message = {
      id: messageData.id,
      conversationId: messageData.conversation_id,
      senderId: messageData.sender_id,
      receiverId: messageData.receiver_id,
      content: messageData.content,
      read: messageData.read,
      createdAt: messageData.created_at,
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    setConversations(prev => prev.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: maskedContent,
            lastMessageTime: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : c
    ));
  };

  const markAsRead = async (conversationId: string): Promise<void> => {
    if (!user) return;

    const { error: msgError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', user.id)
      .eq('read', false);
    
    if (msgError) {
      console.error('Failed to mark messages as read:', msgError);
      return;
    }

    const { error: convError } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
    
    if (convError) {
      console.error('Failed to update conversation:', convError);
      return;
    }

    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((msg) =>
        msg.receiverId === user.id && !msg.read ? { ...msg, read: true } : msg
      ),
    }));

    setConversations(prev => prev.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const userConversations = useMemo(() => {
    if (!user) return [];

    return conversations
      .filter((conv) => {
        if (user.role === "tenant") return conv.tenantId === user.id;
        if (user.role === "landlord") return conv.landlordId === user.id;
        return false;
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
      );
  }, [user, conversations]);

  const totalUnreadCount = useMemo(() => {
    if (!user) return 0;

    return userConversations.reduce((total, conv) => {
      const unread = (messages[conv.id] || []).filter(
        (msg) => msg.receiverId === user.id && !msg.read
      ).length;
      return total + unread;
    }, 0);
  }, [user, userConversations, messages]);

  const getConversationMessages = (conversationId: string): Message[] => {
    return messages[conversationId] || [];
  };

  return {
    conversations: userConversations,
    isLoading,
    createOrGetConversation,
    sendMessage,
    markAsRead,
    totalUnreadCount,
    getConversationMessages,
  };
});

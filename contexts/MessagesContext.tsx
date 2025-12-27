import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthContext";
import type { Conversation, Message } from "@/src/types";
import { useEffect, useState, useMemo, useCallback } from "react";
import { 
  getConversationsByUser, 
  getMessagesByConversations, 
  createOrGetConversation as createOrGetConversationAPI,
  sendMessage as sendMessageAPI,
  markMessagesAsRead as markMessagesAsReadAPI 
} from "@/src/api/messages";

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

      // Fetch all conversations for the user
      const conversationsData = await getConversationsByUser(user.id);
      setConversations(conversationsData);

      // Fetch messages for each conversation
      const conversationIds = conversationsData.map(c => c.id);
      if (conversationIds.length > 0) {
        const messagesByConversation = await getMessagesByConversations(conversationIds);
        setMessages(messagesByConversation);
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
  
  // Create or get conversation
  // Ensures only one conversation exists per property + tenant + landlord
  const createOrGetConversation = async (
    propertyId: string,
    propertyAddress: string,
    propertyImage: string,
    propertyPrice: number,
    landlordId: string,
    landlordName: string,
    landlordPhoto?: string
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    // Call backend to create or retrieve conversation
    const conversationId = await createOrGetConversationAPI({
      propertyId,
      propertyAddress,
      propertyImage,
      propertyPrice,
      tenantId: user.id,
      tenantName: user.fullName,
      tenantPhoto: user.avatarUrl,
      landlordId,
      landlordName,
      landlordPhoto,
    });

    await loadData();

    return conversationId;
  };

  // Send a message
  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Determine receiver based on user role
    const receiverId = user.role === "tenant" ? conversation.landlordId : conversation.tenantId;

    const newMessage = await sendMessageAPI({
      conversationId,
      senderId: user.id,
      receiverId,
      content,
    });

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update conversation preview (last message & time)
    setConversations(prev => prev.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: newMessage.content,
            lastMessageTime: newMessage.createdAt,
            updatedAt: newMessage.createdAt,
          }
        : c
    ));
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string): Promise<void> => {
    if (!user) return;

    try {
      // Update read status
      await markMessagesAsReadAPI(conversationId, user.id);

      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((msg) =>
          msg.receiverId === user.id && !msg.read ? { ...msg, read: true } : msg
        ),
      }));

      setConversations(prev => prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Derived: conversations for current user
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

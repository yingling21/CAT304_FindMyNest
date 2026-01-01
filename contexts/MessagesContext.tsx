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
import { getUserPushToken, sendPushNotification } from "@/src/api/notifications";

export const [MessagesProvider, useMessages] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

   // Load conversations and messages when user logs in
  const loadData = useCallback(async () => {
    try {
      if (!user) {
        setConversations([]);
        setMessages({});
        setIsLoading(false);
        return;
      }

      // 1. Fetch all conversations for the user
      const conversationsData = await getConversationsByUser(user.id);
      setConversations(conversationsData);

      // 2. Fetch messages for all conversations
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

  // This function checks if a conversation already exists between the tenant and landlord
  // for a specific property. If it exists, return the ID. Otherwise, create a new one.
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

    // Call API to create or get existing conversation
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

    // Reload data to include the new/existing conversation
    return conversationId;
  };

  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    // Find the conversation
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Determine who receives the message (opposite of sender's role)
    const receiverId = user.role === "tenant" ? conversation.landlordId : conversation.tenantId;

    // Send message via API (includes sensitive data masking)
    const newMessage = await sendMessageAPI({
      conversationId,
      senderId: user.id,
      receiverId,
      content,
    });

    // Update local state immediately
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update conversation's last message info
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

    // Send push notification to receiver
    const receiverPushToken = await getUserPushToken(receiverId);
    if (receiverPushToken) {
      await sendPushNotification({
        pushToken: receiverPushToken,
        title: `New message from ${user.fullName}`,
        body: content,
        data: {
          conversationId,
          type: 'message',
        },
      });
    }
  };

  const markAsRead = async (conversationId: string): Promise<void> => {
    if (!user) return;

    // Update messages as read in database
    try {
      await markMessagesAsReadAPI(conversationId, user.id);

      // Update local state to reflect read status
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((msg) =>
          msg.receiverId === user.id && !msg.read ? { ...msg, read: true } : msg
        ),
      }));

      // Reset unread count for the conversation
      setConversations(prev => prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
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
    conversations: userConversations,     // Filtered list for current user
    isLoading,                            // Loading state
    createOrGetConversation,              // Start a new conversation
    sendMessage,                          // Send a message
    markAsRead,                           // Mark messages as read
    totalUnreadCount,                     // Badge count for notifications
    getConversationMessages,              // Get messages for a conversation
  };
});

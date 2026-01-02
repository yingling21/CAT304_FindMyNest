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

interface NewMessageNotification {
  conversationId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
}

export const [MessagesProvider, useMessages] = createContextHook(() => {
  const auth = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newMessageNotification, setNewMessageNotification] = useState<NewMessageNotification | null>(null);
  const [, setLastMessageCount] = useState<Record<string, number>>({});

  const loadData = useCallback(async (checkForNew = false) => {
    try {
      if (!auth?.user) {
        setConversations([]);
        setMessages({});
        setIsLoading(false);
        return;
      }

      const conversationsData = await getConversationsByUser(auth.user.id);
      setConversations(conversationsData);

      const conversationIds = conversationsData.map(c => c.id);
      if (conversationIds.length > 0) {
        const messagesByConversation = await getMessagesByConversations(conversationIds);
        
        if (checkForNew) {
          setLastMessageCount((prevCounts) => {
            for (const [convId, newMessages] of Object.entries(messagesByConversation)) {
              const oldCount = prevCounts[convId] || 0;
              const newCount = newMessages.length;
              
              if (newCount > oldCount) {
                const latestMessage = newMessages[newMessages.length - 1];
                if (latestMessage && latestMessage.receiverId === auth.user!.id && !latestMessage.read) {
                  const conversation = conversationsData.find(c => c.id === convId);
                  if (conversation) {
                    const senderName = auth.user!.role === 'tenant' 
                      ? conversation.landlordName 
                      : conversation.tenantName;
                    const senderPhoto = auth.user!.role === 'tenant'
                      ? conversation.landlordPhoto
                      : conversation.tenantPhoto;
                    
                    setNewMessageNotification({
                      conversationId: convId,
                      senderName,
                      senderPhoto,
                      message: latestMessage.content,
                    });
                  }
                }
              }
            }
            
            const newCounts: Record<string, number> = {};
            for (const [convId, msgs] of Object.entries(messagesByConversation)) {
              newCounts[convId] = msgs.length;
            }
            return newCounts;
          });
        } else {
          const initialCounts: Record<string, number> = {};
          for (const [convId, msgs] of Object.entries(messagesByConversation)) {
            initialCounts[convId] = msgs.length;
          }
          setLastMessageCount(initialCounts);
        }
        
        setMessages(messagesByConversation);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.user]);

  useEffect(() => {
    loadData(false);

    const interval = setInterval(() => {
      loadData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadData]);

  const createOrGetConversation = async (
    propertyId: string,
    propertyAddress: string,
    propertyImage: string,
    propertyPrice: number,
    landlordId: string,
    landlordName: string,
    landlordPhoto?: string
  ): Promise<string> => {
    if (!auth?.user) throw new Error("User not authenticated");

    const conversationId = await createOrGetConversationAPI({
      propertyId,
      propertyAddress,
      propertyImage,
      propertyPrice,
      tenantId: auth.user.id,
      tenantName: auth.user.fullName,
      tenantPhoto: auth.user.avatarUrl,
      landlordId,
      landlordName,
      landlordPhoto,
    });

    await loadData();

    return conversationId;
  };

  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<void> => {
    if (!auth?.user) throw new Error("User not authenticated");

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const receiverId = auth.user.role === "tenant" ? conversation.landlordId : conversation.tenantId;

    const newMessage = await sendMessageAPI({
      conversationId,
      senderId: auth.user.id,
      receiverId,
      content,
    });

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

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

    const receiverPushToken = await getUserPushToken(receiverId);
    if (receiverPushToken) {
      await sendPushNotification({
        pushToken: receiverPushToken,
        title: `New message from ${auth.user.fullName}`,
        body: content,
        data: {
          conversationId,
          type: 'message',
        },
      });
    }
  };

  const markAsRead = async (conversationId: string): Promise<void> => {
    if (!auth?.user) return;

    try {
      await markMessagesAsReadAPI(conversationId, auth.user.id);

      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((msg) =>
          msg.receiverId === auth.user!.id && !msg.read ? { ...msg, read: true } : msg
        ),
      }));

      setConversations(prev => prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const userConversations = useMemo(() => {
    if (!auth?.user) return [];

    return conversations
      .filter((conv) => {
        if (auth.user!.role === "tenant") return conv.tenantId === auth.user!.id;
        if (auth.user!.role === "landlord") return conv.landlordId === auth.user!.id;
        return false;
      })
      .map((conv) => {
        const unreadCount = (messages[conv.id] || []).filter(
          (msg) => msg.receiverId === auth.user!.id && !msg.read
        ).length;
        return { ...conv, unreadCount };
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
      );
  }, [auth?.user, conversations, messages]);

  const totalUnreadCount = useMemo(() => {
    if (!auth?.user) return 0;

    return userConversations.reduce((total, conv) => {
      const unread = (messages[conv.id] || []).filter(
        (msg) => msg.receiverId === auth.user!.id && !msg.read
      ).length;
      return total + unread;
    }, 0);
  }, [auth?.user, userConversations, messages]);

  const getConversationMessages = (conversationId: string): Message[] => {
    return messages[conversationId] || [];
  };

  const dismissNotification = () => {
    setNewMessageNotification(null);
  };

  return {
    conversations: userConversations,
    isLoading,
    createOrGetConversation,
    sendMessage,
    markAsRead,
    totalUnreadCount,
    getConversationMessages,
    newMessageNotification,
    dismissNotification,
  };
});

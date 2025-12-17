import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthContext";
import type { Conversation, Message } from "@/types";
import { useEffect, useState, useMemo } from "react";

export const [MessagesProvider, useMessages] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedConversations, storedMessages] = await Promise.all([
        AsyncStorage.getItem("conversations"),
        AsyncStorage.getItem("messages"),
      ]);

      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

    const existingConversation = conversations.find(
      (conv) => conv.propertyId === propertyId && conv.tenantId === user.id
    );

    if (existingConversation) {
      return existingConversation.id;
    }

    const newConversation: Conversation = {
      id: Date.now().toString(),
      propertyId,
      propertyTitle,
      propertyImage,
      propertyPrice,
      tenantId: user.id,
      tenantName: user.fullName,
      tenantPhoto: user.profilePicture,
      landlordId,
      landlordName,
      landlordPhoto,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = [...conversations, newConversation];
    
    await AsyncStorage.setItem(
      "conversations",
      JSON.stringify(updatedConversations)
    );
    
    setConversations(updatedConversations);

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

    const updatedConversation = {
      ...conversation,
      lastMessage: content,
      lastMessageTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = conversations.map((c) =>
      c.id === conversationId ? updatedConversation : c
    );

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: user.id,
      receiverId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const conversationMessages = messages[conversationId] || [];
    const updatedMessages = {
      ...messages,
      [conversationId]: [...conversationMessages, newMessage],
    };

    await Promise.all([
      AsyncStorage.setItem("conversations", JSON.stringify(updatedConversations)),
      AsyncStorage.setItem("messages", JSON.stringify(updatedMessages)),
    ]);

    setConversations(updatedConversations);
    setMessages(updatedMessages);
  };

  const markAsRead = async (conversationId: string): Promise<void> => {
    if (!user) return;

    const conversationMessages = messages[conversationId] || [];
    const updatedConversationMessages = conversationMessages.map((msg) =>
      msg.receiverId === user.id && !msg.read ? { ...msg, read: true } : msg
    );

    const updatedMessages = {
      ...messages,
      [conversationId]: updatedConversationMessages,
    };

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const updatedConversation = {
      ...conversation,
      unreadCount: 0,
    };

    const updatedConversations = conversations.map((c) =>
      c.id === conversationId ? updatedConversation : c
    );

    await Promise.all([
      AsyncStorage.setItem("messages", JSON.stringify(updatedMessages)),
      AsyncStorage.setItem("conversations", JSON.stringify(updatedConversations)),
    ]);

    setMessages(updatedMessages);
    setConversations(updatedConversations);
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

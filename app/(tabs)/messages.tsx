import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MessageCircle, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { messagesStyles as styles } from "@/styles/tabs";

export default function MessagesScreen() {
  const { user } = useAuth();
  const { conversations, isLoading } = useMessages();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes < 1) return "Now";
      return `${minutes}m`;
    }
    if (hours < 24) return `${hours}h`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    const otherPersonName = user?.role === "tenant" ? conversation.landlordName : conversation.tenantName;
    return otherPersonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conversation.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <MessageCircle size={64} color="#6366F1" />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? "No results found" : "No Messages Yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? "Try searching with different keywords"
              : "Start a conversation by contacting a landlord from a property listing"}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {filteredConversations.map((conversation) => {
            const otherPersonName =
              user?.role === "tenant"
                ? conversation.landlordName
                : conversation.tenantName;
            const otherPersonPhoto =
              user?.role === "tenant"
                ? conversation.landlordPhoto
                : conversation.tenantPhoto;
            const unreadCount = conversation.unreadCount || 0;

            return (
              <Pressable
                key={conversation.id}
                style={styles.conversationItem}
                onPress={() => router.push(`/chat/${conversation.id}` as any)}
              >
                {otherPersonPhoto ? (
                  <Image
                    source={{ uri: otherPersonPhoto }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {otherPersonName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.conversationContent}>
                  <View style={styles.topRow}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {otherPersonName}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>
                  
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {conversation.propertyTitle}
                  </Text>

                  <View style={styles.bottomRow}>
                    {conversation.lastMessage ? (
                      <Text
                        style={[
                          styles.lastMessage,
                          unreadCount > 0 && styles.lastMessageUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                    ) : (
                      <Text style={styles.noMessages}>No messages yet</Text>
                    )}
                    {unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {unreadCount > 99 ? "99" : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

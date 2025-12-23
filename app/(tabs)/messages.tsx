import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MessageCircle, Search } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    flex: 1,
  },
  propertyTitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
  },
  lastMessageUnread: {
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  noMessages: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  unreadBadge: {
    backgroundColor: "#6366F1",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});

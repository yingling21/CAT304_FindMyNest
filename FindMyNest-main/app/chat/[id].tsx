import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { conversations, getConversationMessages, sendMessage, markAsRead } =
    useMessages();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messageText, setMessageText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const conversation = conversations.find((c) => c.id === id);
  const messages = getConversationMessages(id || "");

  useEffect(() => {
    if (id) {
      markAsRead(id);
    }
  }, [id, markAsRead]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !id) return;

    const messageToSend = messageText.trim();
    setMessageText("");

    try {
      await sendMessage(id, messageToSend);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!conversation || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherPersonName =
    user.role === "tenant"
      ? conversation.landlordName
      : conversation.tenantName;
  const otherPersonPhoto =
    user.role === "tenant" ? conversation.landlordPhoto : conversation.tenantPhoto;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>

        <View style={styles.headerContent}>
          {otherPersonPhoto ? (
            <Image
              source={{ uri: otherPersonPhoto }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>
                {otherPersonName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherPersonName}
            </Text>
            <Text style={styles.headerSubtitle}>
              Inquiring about property
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.propertyBanner}
        onPress={() => router.push(`/property/${conversation.propertyId}` as any)}
      >
        <Image
          source={{ uri: conversation.propertyImage }}
          style={styles.propertyBannerImage}
          contentFit="cover"
        />
        <View style={styles.propertyBannerContent}>
          <Text style={styles.propertyBannerTitle} numberOfLines={1}>
            {conversation.propertyTitle}
          </Text>
          <Text style={styles.propertyBannerPrice}>
            RM {conversation.propertyPrice}/mo
          </Text>
        </View>
      </Pressable>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyMessages}>
              <View style={styles.emptyIconContainer}>
                <Send size={48} color="#6366F1" />
              </View>
              <Text style={styles.emptyMessagesTitle}>
                Start a conversation with this {user.role === "tenant" ? "landlord" : "tenant"}
              </Text>
              <Text style={styles.emptyMessagesText}>
                Answer their questions and schedule viewings.
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === user.id;
              const showDateSeparator =
                index === 0 ||
                new Date(message.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              const messageDate = new Date(message.createdAt);
              const dateSeparatorLabel = (() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (messageDate.toDateString() === today.toDateString()) {
                  return "Today";
                } else if (messageDate.toDateString() === yesterday.toDateString()) {
                  return "Yesterday";
                } else {
                  return messageDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                }
              })();

              return (
                <View key={message.id}>
                  {showDateSeparator && (
                    <View style={styles.dateSeparatorContainer}>
                      <Text style={styles.dateSeparatorText}>
                        {dateSeparatorLabel}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubbleContainer,
                      isCurrentUser
                        ? styles.messageBubbleContainerRight
                        : styles.messageBubbleContainerLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isCurrentUser
                          ? styles.messageBubbleCurrentUser
                          : styles.messageBubbleOther,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isCurrentUser
                            ? styles.messageTextCurrentUser
                            : styles.messageTextOther,
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isCurrentUser
                            ? styles.messageTimeCurrentUser
                            : styles.messageTimeOther,
                        ]}
                      >
                        {messageDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            onSubmitEditing={() => {
              if (messageText.trim()) {
                handleSend();
              }
            }}
            blurOnSubmit={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Send
              size={20}
              color={messageText.trim() ? "#FFFFFF" : "#9CA3AF"}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  propertyBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  propertyBannerImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  propertyBannerContent: {
    flex: 1,
  },
  propertyBannerTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  propertyBannerPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyMessagesTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  dateSeparatorContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 13,
    color: "#9CA3AF",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  messageBubbleContainer: {
    marginBottom: 8,
  },
  messageBubbleContainerLeft: {
    alignItems: "flex-start",
  },
  messageBubbleContainerRight: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 16,
  },
  messageBubbleCurrentUser: {
    backgroundColor: "#6366F1",
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextCurrentUser: {
    color: "#FFFFFF",
  },
  messageTextOther: {
    color: "#1F2937",
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  messageTimeCurrentUser: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  messageTimeOther: {
    color: "#9CA3AF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
});

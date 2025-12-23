import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, Send, AlertCircle } from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { maskSensitiveData, containsSensitiveData } from "@/utils/sensitiveDataMask";
import { styles } from "@/styles/chat";

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
    
    if (containsSensitiveData(messageToSend)) {
      Alert.alert(
        "Sensitive Information Detected",
        "Your message contains phone numbers, account numbers, or email addresses. For your safety, this information will be masked (****) when displayed to protect your privacy.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Send Anyway",
            onPress: async () => {
              setMessageText("");
              try {
                await sendMessage(id, messageToSend);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              } catch (error) {
                console.error("Failed to send message:", error);
              }
            },
          },
        ]
      );
      return;
    }

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
                        {maskSensitiveData(message.content)}
                      </Text>
                      {containsSensitiveData(message.content) && (
                        <View style={styles.sensitiveWarning}>
                          <AlertCircle size={12} color={isCurrentUser ? "rgba(255, 255, 255, 0.7)" : "#9CA3AF"} />
                          <Text style={[
                            styles.sensitiveWarningText,
                            isCurrentUser ? styles.sensitiveWarningTextCurrentUser : styles.sensitiveWarningTextOther
                          ]}>
                            Sensitive info masked
                          </Text>
                        </View>
                      )}
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

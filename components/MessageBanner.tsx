import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MessageCircle, X, Home, CheckCircle, XCircle } from "lucide-react-native";
import { Image } from "expo-image";

interface MessageBannerProps {
  conversationId?: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  onDismiss: () => void;
  type?: 'message' | 'rental_request' | 'rental_approved' | 'rental_cancelled';
  navigationPath?: string;
}

export default function MessageBanner({
  conversationId,
  senderName,
  senderPhoto,
  message,
  onDismiss,
  type = 'message',
  navigationPath,
}: MessageBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [slideAnim] = useState(new Animated.Value(-100));

  const handleDismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [slideAnim, onDismiss]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [slideAnim, handleDismiss]);

  const handlePress = () => {
    handleDismiss();
    setTimeout(() => {
      if (navigationPath) {
        router.push(navigationPath as any);
      } else if (conversationId) {
        router.push(`/chat/${conversationId}` as any);
      }
    }, 250);
  };

  const getIcon = () => {
    switch (type) {
      case 'rental_request':
        return <Home size={20} color="#6366F1" />;
      case 'rental_approved':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rental_cancelled':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <MessageCircle size={20} color="#6366F1" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'rental_approved':
        return '#F0FDF4';
      case 'rental_cancelled':
        return '#FEF2F2';
      default:
        return '#EEF2FF';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable
        style={styles.banner}
        onPress={handlePress}
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
      >
        <View style={styles.iconContainer}>
          {senderPhoto ? (
            <Image source={{ uri: senderPhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getBackgroundColor() }]}>
              {getIcon()}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.senderName} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <Pressable style={styles.closeButton} onPress={handleDismiss} hitSlop={8}>
          <X size={18} color="#6B7280" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        position: "fixed" as any,
      },
    }),
  },
  banner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  message: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
  sensitiveWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  sensitiveWarningText: {
    fontSize: 10,
  },
  sensitiveWarningTextCurrentUser: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  sensitiveWarningTextOther: {
    color: "#9CA3AF",
  },
});

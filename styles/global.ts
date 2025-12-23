import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
  },
  header: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#C7D2FE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  textPrimary: {
    color: "#1F2937",
  },
  textSecondary: {
    color: "#6B7280",
  },
  textMuted: {
    color: "#9CA3AF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
});

export const colors = {
  primary: "#6366F1",
  primaryLight: "#C7D2FE",
  background: "#F9FAFB",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

import { StyleSheet } from "react-native";

export const tenantHomeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchSection: {
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 20,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  sortButton: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
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
  propertiesContainer: {
    alignItems: "center",
  },
});

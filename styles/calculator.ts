import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: "#9CA3AF",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  breakdownSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownTotalLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  breakdownTotalValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  affordabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  affordabilityLow: {
    backgroundColor: "#FEF2F2",
  },
  affordabilityModerate: {
    backgroundColor: "#FFFBEB",
  },
  affordabilityGood: {
    backgroundColor: "#ECFDF5",
  },
  affordabilityText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  comfortableCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  recommendedCard: {
    backgroundColor: "#EEF2FF",
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  maximumCard: {
    backgroundColor: "#FEF3F2",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  recommendationAmount: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  recommendationNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
  },
  tipsSection: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

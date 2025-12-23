import { StyleSheet } from "react-native";

export const landlordHomeStyles = StyleSheet.create({
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
});

export const landlordRentalsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  rentalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  propertySection: {
    flexDirection: "row",
    marginBottom: 16,
  },
  propertyImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  rentalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  statusBadgeCompleted: {
    backgroundColor: "#6B7280",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextCompleted: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  propertyAddress: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    fontWeight: "600" as const,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  infoSubValue: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  paymentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusPaid: {
    backgroundColor: "#D1FAE5",
  },
  paymentStatusPending: {
    backgroundColor: "#FEF3C7",
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  paymentStatusTextPaid: {
    color: "#065F46",
  },
  paymentStatusTextPending: {
    color: "#92400E",
  },
});

export const allReviewsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  ratingCard: {
    backgroundColor: "#6366F1",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  ratingScore: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
  },
  distributionContainer: {
    width: "100%",
    gap: 8,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distributionLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600" as const,
    width: 12,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  distributionBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600" as const,
    width: 20,
    textAlign: "right",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#6366F1",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  filterContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemSelected: {
    backgroundColor: "#6366F1",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1F2937",
  },
  dropdownItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  reviewsList: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reviewerAvatarText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  propertyBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  propertyBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  propertyLocationText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

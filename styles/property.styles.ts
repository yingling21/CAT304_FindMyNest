import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
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
  headerFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  photoSection: {
    position: "relative",
  },
  mainPhoto: {
    width: width,
    height: 300,
  },
  photoIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  photoIndicatorActive: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },
  photoCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  availableBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availableBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  priceLabel: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 6,
  },
  utilitiesInfo: {
    fontSize: 14,
    color: "#F59E0B",
    marginTop: 4,
  },
  utilitiesIncludedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  utilitiesIncludedText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600" as const,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    width: (width - 56) / 2,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 14,
    color: "#1F2937",
  },
  termsContainer: {
    gap: 16,
  },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  termContent: {
    flex: 1,
  },
  termLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  termValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  utilitiesContainer: {
    gap: 12,
  },
  utilitiesIncludedBox: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  utilitiesIncludedTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  utilitiesIncludedSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  utilitiesNotIncludedBox: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  utilitiesNotIncludedTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#F59E0B",
  },
  utilitiesEstimate: {
    fontSize: 14,
    color: "#92400E",
  },
  utilitiesNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
    textAlign: "center",
  },
  rulesContainer: {
    gap: 16,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ruleText: {
    fontSize: 14,
    color: "#1F2937",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  locationContainer: {
    gap: 16,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  addressText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  landmarksContainer: {
    gap: 8,
  },
  landmarksTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  landmarkItem: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
  },
  transportBox: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
  },
  transportText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600" as const,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  reviewCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  reviewComment: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewRatings: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reviewRatingDetail: {
    alignItems: "center",
    gap: 4,
  },
  reviewRatingLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  reviewRatingStars: {
    flexDirection: "row",
    gap: 2,
  },
  landlordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  landlordPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  landlordInfo: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  landlordLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  rentButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  reviewAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewAuthorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewAuthorPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAuthorPhotoPlaceholderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewAuthorName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  reviewRatingBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reviewRatingBadgeText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  reviewRatingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  reviewRatingItem: {
    alignItems: "center",
    minWidth: 70,
  },
  reviewRatingValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 4,
  },
  reviewRentalPeriod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  reviewRentalPeriodText: {
    fontSize: 12,
    color: "#6B7280",
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  landlordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  landlordPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  landlordPhotoPlaceholderText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600" as const,
  },
  landlordInfoContainer: {
    flex: 1,
  },
  landlordStatus: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  detailsInfoRow: {
    gap: 12,
    marginTop: 16,
  },
  detailsInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  detailsInfoContent: {
    flex: 1,
  },
  detailsInfoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailsInfoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  utilitiesItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  utilitiesText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  depositsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  depositCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  depositLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  depositValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  houseRulesContainer: {
    gap: 12,
  },
  houseRuleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  houseRuleCardAllowed: {
    backgroundColor: "#ECFDF5",
  },
  houseRuleCardNotAllowed: {
    backgroundColor: "#FEF2F2",
  },
  houseRuleCardMultiline: {
    alignItems: "flex-start",
  },
  houseRuleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  houseRuleIconContainerAllowed: {
    backgroundColor: "#D1FAE5",
  },
  houseRuleIconContainerNotAllowed: {
    backgroundColor: "#FEE2E2",
  },
  houseRuleIconContainerMultiline: {
    marginTop: 0,
  },
  houseRuleContent: {
    flex: 1,
  },
  houseRuleLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  houseRuleValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  houseRuleValueAllowed: {
    color: "#10B981",
  },
  houseRuleValueNotAllowed: {
    color: "#EF4444",
  },
  contentSpacer: {
    height: 24,
  },
  mapView: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginTop: 16,
  },
  nearbyCountsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  nearbyCountCard: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  nearbyCountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: 6,
  },
  nearbyCountColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nearbyCountType: {
    fontSize: 10,
    color: "#6B7280",
  },
  nearbyCountValue: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  worthinessCard: {
    backgroundColor: "#EEF2FF",
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  worthinessTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  worthinessScore: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#6366F1",
    marginBottom: 16,
  },
  worthinessCategoryContainer: {
    gap: 12,
  },
  worthinessCategoryItem: {
    gap: 6,
  },
  worthinessCategoryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  worthinessProgressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  worthinessProgressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  reviewsSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewsSummaryRating: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  reviewsSummaryInfo: {
    flex: 1,
  },
  reviewsSummaryCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewsSummaryStars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  reviewsStarText: {
    fontSize: 16,
  },
});

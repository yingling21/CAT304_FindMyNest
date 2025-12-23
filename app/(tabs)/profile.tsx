import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { User, Mail, Phone, LogOut, Star, MessageCircle, Home, ChevronRight, Info } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { reviews } = useReviews();
  const router = useRouter();
  const isLandlord = user?.role === "landlord";

  const landlordReviews = useMemo(() => {
    if (!user || !isLandlord) return [];
    return reviews.slice().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews, user, isLandlord]);

  const latestReviews = useMemo(() => {
    return landlordReviews.slice(0, 3);
  }, [landlordReviews]);

  const averageRating = useMemo(() => {
    if (landlordReviews.length === 0) return 0;
    return landlordReviews.reduce((acc, review) => acc + review.rating, 0) / landlordReviews.length;
  }, [landlordReviews]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>{user?.fullName || "Guest User"}</Text>
          <Text style={styles.role}>
            {isLandlord ? "Landlord" : "Tenant"}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Mail size={20} color="#6366F1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || "No email"}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Phone size={20} color="#6366F1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>
                {user?.phoneNumber || "No phone number"}
              </Text>
            </View>
          </View>
        </View>

        {!isLandlord && (
          <View style={styles.menuSection}>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/my-rentals")}
            >
              <View style={styles.menuIconContainer}>
                <Home size={20} color="#6366F1" />
              </View>
              <Text style={styles.menuItemText}>My Rentals</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable 
              style={styles.menuItem} 
              onPress={() => router.push("/review-history" as any)}
            >
              <View style={styles.menuIconContainer}>
                <Star size={20} color="#6366F1" />
              </View>
              <Text style={styles.menuItemText}>Review History</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuIconContainer}>
                <Info size={20} color="#6366F1" />
              </View>
              <Text style={styles.menuItemText}>About</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        )}

        {isLandlord && (
          <View style={styles.reviewSection}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>Recent Reviews</Text>
              <View style={styles.reviewHeaderRight}>
                <View style={styles.ratingBadge}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {averageRating.toFixed(1)} ({landlordReviews.length})
                  </Text>
                </View>
              </View>
            </View>

            {latestReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <User size={20} color="#6366F1" />
                  </View>
                  <View style={styles.reviewerDetails}>
                    <Text style={styles.reviewerName}>{review.tenantName}</Text>
                    <View style={styles.reviewRatingRow}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < review.rating ? "#F59E0B" : "#D1D5DB"}
                          fill={i < review.rating ? "#F59E0B" : "transparent"}
                        />
                      ))}
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <View style={styles.reviewStats}>
                  <View style={styles.reviewStatItem}>
                    <Text style={styles.reviewStatLabel}>Location</Text>
                    <Text style={styles.reviewStatValue}>{review.locationRating}/5</Text>
                  </View>
                  <View style={styles.reviewStatItem}>
                    <Text style={styles.reviewStatLabel}>Condition</Text>
                    <Text style={styles.reviewStatValue}>{review.conditionRating}/5</Text>
                  </View>
                  <View style={styles.reviewStatItem}>
                    <Text style={styles.reviewStatLabel}>Value</Text>
                    <Text style={styles.reviewStatValue}>{review.valueRating}/5</Text>
                  </View>
                  <View style={styles.reviewStatItem}>
                    <Text style={styles.reviewStatLabel}>Landlord</Text>
                    <Text style={styles.reviewStatValue}>{review.landlordRating}/5</Text>
                  </View>
                </View>
              </View>
            ))}

            {latestReviews.length > 0 && landlordReviews.length > 3 && (
              <Pressable 
                style={styles.viewAllButton}
                onPress={() => router.push("/all-reviews" as any)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={18} color="#6366F1" />
              </Pressable>
            )}

            {landlordReviews.length === 0 && (
              <View style={styles.emptyReviews}>
                <MessageCircle size={48} color="#D1D5DB" />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtext}>
                  Reviews from tenants will appear here
                </Text>
              </View>
            )}
          </View>
        )}

        <Pressable style={styles.logoutButton} onPress={signOut}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  infoSection: {
    marginTop: 24,
    marginHorizontal: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  reviewSection: {
    marginTop: 24,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  reviewHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewerInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewStats: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  reviewStatItem: {
    flex: 1,
  },
  reviewStatLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  reviewStatValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  emptyReviews: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyReviewsText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyReviewsSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
});

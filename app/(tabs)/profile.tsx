import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { User, Mail, Phone, LogOut, Star, MessageCircle, Home, ChevronRight, Info } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileStyles as styles } from "@/styles/tabs";



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



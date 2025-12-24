import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MessageSquare, CheckCircle, XCircle, UserPlus } from "lucide-react-native";
import { useMessages } from "@/contexts/MessagesContext";
import { useRentals } from "@/contexts/RentalsContext";

type ActivityType = "message" | "approved" | "rejected" | "new_tenant";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  time: string;
  timestamp: number;
}

export default function LandlordRecentActivity() {
  const { conversations } = useMessages();
  const { getLandlordRentals } = useRentals();

  const activities = useMemo(() => {
    const getRelativeTime = (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      return date.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
    };

    const activityList: Activity[] = [];

    conversations.forEach(conv => {
      if (conv.lastMessage && conv.lastMessageTime) {
        activityList.push({
          id: `msg-${conv.id}`,
          type: "message",
          title: `New message from ${conv.tenantName}`,
          subtitle: conv.propertyAddress,
          time: getRelativeTime(new Date(conv.lastMessageTime)),
          timestamp: new Date(conv.lastMessageTime).getTime(),
        });
      }
    });

    activityList.push({
      id: "approved-1",
      type: "approved",
      title: "Your listing \"house in gurun\" was approved",
      time: getRelativeTime(new Date(Date.now() - 86400000)),
      timestamp: Date.now() - 86400000,
    });

    const rentals = getLandlordRentals();
    rentals.forEach((rental, index) => {
      if (rental.status === "active") {
        activityList.push({
          id: `tenant-${rental.id}`,
          type: "new_tenant",
          title: `New tenant for property at ${rental.propertyAddress}`,
          subtitle: `Rental started on ${new Date(rental.startDate).toLocaleDateString("en-MY")}`,
          time: getRelativeTime(new Date(rental.createdAt)),
          timestamp: new Date(rental.createdAt).getTime(),
        });
      }
    });

    return activityList
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [conversations, getLandlordRentals]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "message":
        return {
          icon: <MessageSquare size={20} color="#3B82F6" />,
          backgroundColor: "#DBEAFE",
        };
      case "approved":
        return {
          icon: <CheckCircle size={20} color="#10B981" />,
          backgroundColor: "#D1FAE5",
        };
      case "rejected":
        return {
          icon: <XCircle size={20} color="#EF4444" />,
          backgroundColor: "#FEE2E2",
        };
      case "new_tenant":
        return {
          icon: <UserPlus size={20} color="#F59E0B" />,
          backgroundColor: "#FEF3C7",
        };
    }
  };

  if (activities.length === 0) {
    return (
      <View style={styles.recentActivitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyActivity}>
          <Text style={styles.emptyActivityText}>No recent activity</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.recentActivitySection}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        {activities.map((activity) => {
          const iconConfig = getActivityIcon(activity.type);
          return (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: iconConfig.backgroundColor }]}>
                {iconConfig.icon}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityTextBold}>{activity.title}</Text>
                  {activity.subtitle && (
                    <>
                      {" "}
                      <Text style={styles.activityTextNormal}>{activity.subtitle}</Text>
                    </>
                  )}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recentActivitySection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTextBold: {
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  activityTextNormal: {
    fontWeight: "400" as const,
    color: "#4B5563",
  },
  activityTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyActivity: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyActivityText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});

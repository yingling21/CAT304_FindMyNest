import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";

type Props = {
  userName: string;
  searchQuery: string;
  onSearchChange: (text: string) => void;
};

export default function PropertySearchHeader({ userName, searchQuery, onSearchChange }: Props) {
  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location, property..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        <Pressable style={styles.searchButton}>
          <Search size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  searchButton: {
    backgroundColor: "#6366F1",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

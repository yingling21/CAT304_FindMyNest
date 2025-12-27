import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import { ListingProvider } from "@/contexts/ListingContext";
import { RentalsProvider } from "@/contexts/RentalsContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="identity-verification" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-listing" options={{ title: "Add Listing" }} />
      <Stack.Screen name="edit-listing/[id]" options={{ title: "Edit Listing" }} />
      <Stack.Screen name="property/[id]" options={{ title: "Property Details" }} />
      <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
      <Stack.Screen name="my-rentals" options={{ title: "My Rentals" }} />
      <Stack.Screen name="landlord-rentals" options={{ title: "Landlord Rentals" }} />
      <Stack.Screen name="rent-property/[id]" options={{ title: "Rent Property" }} />
      <Stack.Screen name="submit-review/[id]" options={{ title: "Submit Review" }} />
      <Stack.Screen name="review-history" options={{ title: "Review History" }} />
      <Stack.Screen name="all-reviews" options={{ title: "All Reviews" }} />
      <Stack.Screen name="affordability-calculator" options={{ title: "Affordability Calculator" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <MessagesProvider>
              <ListingProvider>
                <RentalsProvider>
                  <ReviewsProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </ReviewsProvider>
                </RentalsProvider>
              </ListingProvider>
            </MessagesProvider>
          </FavoritesProvider>
        </AuthProvider>
    </QueryClientProvider>
  );
}

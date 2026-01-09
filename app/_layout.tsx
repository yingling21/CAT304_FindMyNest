import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MessagesProvider, useMessages } from "@/contexts/MessagesContext";
import { ListingProvider } from "@/contexts/ListingContext";
import { RentalsProvider, useRentals } from "@/contexts/RentalsContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { PaymentsProvider } from "@/contexts/PaymentsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MessageBanner from "@/components/MessageBanner";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { newMessageNotification, dismissNotification } = useMessages();
  const { rentalNotification, dismissRentalNotification } = useRentals();

  return (
    <>
      {/* Expo Router auto-registers screens from the filesystem */}
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />

      {newMessageNotification && (
        <MessageBanner
          conversationId={newMessageNotification.conversationId}
          senderName={newMessageNotification.senderName}
          senderPhoto={newMessageNotification.senderPhoto}
          message={newMessageNotification.message}
          onDismiss={dismissNotification}
        />
      )}

      {rentalNotification && (
        <MessageBanner
          senderName={rentalNotification.senderName}
          senderPhoto={rentalNotification.senderPhoto}
          message={rentalNotification.message}
          type={rentalNotification.type}
          navigationPath={rentalNotification.navigationPath}
          onDismiss={dismissRentalNotification}
        />
      )}
    </>
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
                  <PaymentsProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </PaymentsProvider>
                </ReviewsProvider>
              </RentalsProvider>
            </ListingProvider>
          </MessagesProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

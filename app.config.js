import 'dotenv/config';

export default {
  expo: {
    name: "Find My Nest",
    slug: "find-my-nest",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rork-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.rork.house-rent-app-clone",
      usesIcloudStorage: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Allow location access for maps"
      },
      config: {
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "app.rork.house_rent_app_clone",
      permissions: [
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM"
      ]
    },

    web: {
      favicon: "./assets/images/favicon.png"
    },

    extra: {
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    },

    plugins: [
      [
        "expo-router",
        { origin: "https://findmynest.com/" }
      ],
      "expo-font",
      "expo-web-browser",
      [
        "expo-document-picker",
        { iCloudContainerEnvironment: "Production" }
      ],
      [
        "expo-notifications",
        {
          // icon: "./local/assets/notification_icon.png",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.findmynest",
          publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
        }
      ]
    ],

    experiments: {
      typedRoutes: true
    }
  }
};

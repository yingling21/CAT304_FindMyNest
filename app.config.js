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
        CFBundleAllowMixedLocalizations: true,
        CFBundleLocalizations: ["fr"]
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
    publishableKey:"pk_test_51Sk30xBKIiws3OMR6s9q42g9VVw8ASdekjA5QXpfq4mcOGK2sIzDa50eJwMF1IPYwQOdoN16N1c6z7iuGnUyCBLZ00jNTX2pAD"
  }
]
    ],

    experiments: {
      typedRoutes: true
    }
  }
};

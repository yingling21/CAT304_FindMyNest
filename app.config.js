import 'dotenv/config';

export default {
  expo: {
    name: "House Rent App",
    slug: "house-rent-app-qxhb4lq",
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
      bundleIdentifier: "app.rork.house-rent-app-qxhb4lq",
      usesIcloudStorage: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Allow location access for maps"
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "app.rork.house_rent_app_qxhb4lq",
      permissions: ["ACCESS_FINE_LOCATION"]
    },

    web: {
      favicon: "./assets/images/favicon.png"
    },

    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    },

    plugins: [
      [
        "expo-router",
        {
          origin: "https://rork.com/"
        }
      ],
      "expo-font",
      "expo-web-browser",
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production"
        }
      ]
    ],

    experiments: {
      typedRoutes: true
    }
  }
};

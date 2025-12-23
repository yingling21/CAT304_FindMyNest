import type { Property, Review } from "@/types";

export const mockProperties: Property[] = [
  {
    id: "1",
    landlordId: "landlord1",
    landlordName: "Ahmad bin Abdullah",
    landlordPhoto: "https://i.pravatar.cc/150?u=landlord1",
    landlordVerified: true,

    propertyType: "house",
    title: "house in Kuala Lumpur",
    description: "Cozy house located in the heart of Kuala Lumpur with easy access to public transportation and nearby amenities. Perfect for families or working professionals looking for a comfortable living space.",
    address: "2",
    nearbyLandmarks: ["LRT Station", "Shopping Mall", "Restaurants"],
    distanceToTransport: "5 min walk to LRT",

    size: 600,
    bedrooms: 2,
    bathrooms: 2,
    furnishingLevel: "unfurnished",

    monthlyRent: 560,
    securityDeposit: 120,
    utilitiesDeposit: 100,
    minimumRentalPeriod: 1,
    moveInDate: "2025-07-12",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 200,
    utilitiesIncluded: false,

    amenities: {
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: true,
      security: true,
      balcony: false,
    },

    houseRules: {
      cooking: "allowed",
      guestsAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },

    photos: [
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],

    averageRating: 5.0,
    totalReviews: 1,

    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    landlordId: "landlord2",
    landlordName: "Siti binti Hassan",
    landlordPhoto: "https://i.pravatar.cc/150?u=landlord2",
    landlordVerified: true,

    propertyType: "apartment",
    title: "Modern Apartment in KLCC",
    description: "Stunning modern apartment with city views, located in the prestigious KLCC area. Fully furnished with premium fixtures and fittings. Walking distance to shopping malls and restaurants.",
    address: "Jalan Ampang, KLCC, Kuala Lumpur",
    nearbyLandmarks: ["KLCC Park", "Suria KLCC", "Petronas Twin Towers"],
    distanceToTransport: "3 min walk to LRT KLCC",

    size: 850,
    bedrooms: 3,
    bathrooms: 2,
    floorLevel: 15,
    furnishingLevel: "fully_furnished",

    monthlyRent: 2800,
    securityDeposit: 5600,
    utilitiesDeposit: 500,
    minimumRentalPeriod: 12,
    moveInDate: "2025-02-01",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 350,
    utilitiesIncluded: false,

    amenities: {
      bedType: "Queen",
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: true,
      security: true,
      balcony: true,
    },

    houseRules: {
      cooking: "light_cooking",
      guestsAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
      quietHours: "10 PM - 8 AM",
    },

    photos: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],

    averageRating: 4.8,
    totalReviews: 5,

    createdAt: "2024-12-15T00:00:00.000Z",
    updatedAt: "2025-01-05T00:00:00.000Z",
  },
  {
    id: "3",
    landlordId: "landlord3",
    landlordName: "Chen Wei",
    landlordVerified: false,

    propertyType: "room",
    roomType: "single_room",
    title: "Cozy Room in Bangsar",
    description: "Single room in a shared apartment in Bangsar. Perfect for students or young professionals. Friendly housemates and convenient location near cafes and restaurants.",
    address: "Jalan Telawi, Bangsar, Kuala Lumpur",
    nearbyLandmarks: ["Bangsar Village", "Kedai Kopi", "Bangsar LRT"],
    distanceToTransport: "7 min walk to LRT",

    size: 120,
    bedrooms: 1,
    bathrooms: 1,
    floorLevel: 5,
    furnishingLevel: "partially_furnished",

    monthlyRent: 650,
    securityDeposit: 650,
    utilitiesDeposit: 100,
    minimumRentalPeriod: 3,
    moveInDate: "2025-01-20",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 80,
    utilitiesIncluded: true,

    amenities: {
      bedType: "Single",
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: false,
      security: false,
      balcony: false,
    },

    houseRules: {
      cooking: "light_cooking",
      guestsAllowed: false,
      smokingAllowed: false,
      petsAllowed: false,
      quietHours: "11 PM - 7 AM",
      cleaningRules: "Weekly rotation for shared areas",
    },

    photos: [
      "https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
    ],

    averageRating: 4.3,
    totalReviews: 8,

    createdAt: "2024-11-20T00:00:00.000Z",
    updatedAt: "2025-01-03T00:00:00.000Z",
  },
  {
    id: "4",
    landlordId: "landlord1",
    landlordName: "Ahmad bin Abdullah",
    landlordPhoto: "https://i.pravatar.cc/150?u=landlord1",
    landlordVerified: true,

    propertyType: "studio",
    title: "Compact Studio in Mont Kiara",
    description: "Well-designed studio apartment perfect for singles. Modern fixtures, great natural lighting, and premium location in Mont Kiara with easy access to international schools and shopping.",
    address: "Jalan Kiara, Mont Kiara, Kuala Lumpur",
    nearbyLandmarks: ["Mont Kiara Plaza", "International Schools", "Publika"],
    distanceToTransport: "15 min bus to MRT",

    size: 450,
    bedrooms: 1,
    bathrooms: 1,
    floorLevel: 8,
    furnishingLevel: "fully_furnished",

    monthlyRent: 1800,
    securityDeposit: 3600,
    utilitiesDeposit: 300,
    minimumRentalPeriod: 6,
    moveInDate: "2025-02-15",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 150,
    utilitiesIncluded: false,

    amenities: {
      bedType: "Queen",
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: true,
      security: true,
      balcony: false,
    },

    houseRules: {
      cooking: "allowed",
      guestsAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },

    photos: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=800&q=80",
    ],

    averageRating: 4.6,
    totalReviews: 3,

    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2025-01-08T00:00:00.000Z",
  },
  {
    id: "5",
    landlordId: "landlord4",
    landlordName: "Tan Ah Kow",
    landlordPhoto: "https://i.pravatar.cc/150?u=landlord4",
    landlordVerified: true,

    propertyType: "apartment",
    title: "Beachside Apartment in Bayan Lepas",
    description: "Beautiful apartment near the beach in Bayan Lepas, Penang. Close to Penang International Airport and major tech parks. Perfect for working professionals in the tech industry.",
    address: "Jalan Tun Dr Awang, Bayan Lepas, Penang",
    nearbyLandmarks: ["Penang International Airport", "Queensbay Mall", "Tech Parks"],
    distanceToTransport: "10 min drive to airport",

    size: 720,
    bedrooms: 2,
    bathrooms: 2,
    floorLevel: 10,
    furnishingLevel: "fully_furnished",

    monthlyRent: 1500,
    securityDeposit: 3000,
    utilitiesDeposit: 300,
    minimumRentalPeriod: 6,
    moveInDate: "2025-02-10",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 180,
    utilitiesIncluded: false,

    amenities: {
      bedType: "Queen",
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: true,
      security: true,
      balcony: true,
    },

    houseRules: {
      cooking: "allowed",
      guestsAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },

    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    ],

    averageRating: 4.7,
    totalReviews: 6,

    createdAt: "2024-12-10T00:00:00.000Z",
    updatedAt: "2025-01-05T00:00:00.000Z",
  },
  {
    id: "6",
    landlordId: "landlord5",
    landlordName: "Lim Siew Mei",
    landlordPhoto: "https://i.pravatar.cc/150?u=landlord5",
    landlordVerified: true,

    propertyType: "room",
    roomType: "master_room",
    title: "Master Room in Georgetown",
    description: "Spacious master room in Georgetown heritage area, Penang. Walking distance to street art, cafes, and local food. Shared house with other professionals.",
    address: "Lebuh Armenian, Georgetown, Penang",
    nearbyLandmarks: ["Street Art", "Clan Jetties", "Komtar"],
    distanceToTransport: "5 min walk to bus stop",

    size: 150,
    bedrooms: 1,
    bathrooms: 1,
    floorLevel: 2,
    furnishingLevel: "partially_furnished",

    monthlyRent: 800,
    securityDeposit: 800,
    utilitiesDeposit: 150,
    minimumRentalPeriod: 3,
    moveInDate: "2025-01-25",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 100,
    utilitiesIncluded: true,

    amenities: {
      bedType: "Queen",
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: false,
      security: false,
      balcony: false,
    },

    houseRules: {
      cooking: "light_cooking",
      guestsAllowed: false,
      smokingAllowed: false,
      petsAllowed: false,
      quietHours: "10 PM - 7 AM",
    },

    photos: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
    ],

    averageRating: 4.5,
    totalReviews: 4,

    createdAt: "2024-11-25T00:00:00.000Z",
    updatedAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "7",
    landlordId: "landlord6",
    landlordName: "Kumar Raj",
    landlordPhoto: "https://i.pravatar.cc/150?u=landlord6",
    landlordVerified: false,

    propertyType: "house",
    title: "Family House in Tanjung Bungah",
    description: "Spacious family house in Tanjung Bungah, Penang. Great for families with children. Close to beaches and international schools.",
    address: "Jalan Tanjung Bungah, Tanjung Bungah, Penang",
    nearbyLandmarks: ["Beach", "International Schools", "Shopping Centers"],
    distanceToTransport: "8 min drive to Gurney Drive",

    size: 1200,
    bedrooms: 4,
    bathrooms: 3,
    furnishingLevel: "partially_furnished",

    monthlyRent: 2200,
    securityDeposit: 4400,
    utilitiesDeposit: 400,
    minimumRentalPeriod: 12,
    moveInDate: "2025-03-01",
    rentalStatus: "available",

    estimatedMonthlyUtilities: 300,
    utilitiesIncluded: false,

    amenities: {
      deskAndChair: true,
      wardrobe: true,
      airConditioning: true,
      waterHeater: true,
      wifi: true,
      kitchenAccess: true,
      washingMachine: true,
      refrigerator: true,
      parking: true,
      security: true,
      balcony: true,
    },

    houseRules: {
      cooking: "allowed",
      guestsAllowed: true,
      smokingAllowed: false,
      petsAllowed: true,
    },

    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    ],

    averageRating: 4.4,
    totalReviews: 2,

    createdAt: "2024-12-05T00:00:00.000Z",
    updatedAt: "2025-01-07T00:00:00.000Z",
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    propertyId: "1",
    rentalId: "rental1",
    tenantId: "tenant1",
    tenantName: "Ng",
    tenantPhoto: "https://i.pravatar.cc/150?u=tenant1",
    tenantVerified: true,

    rating: 5.0,
    locationRating: 4.5,
    conditionRating: 5.0,
    valueRating: 2.5,
    landlordRating: 5.0,

    comment: "Great location and very responsive landlord. The house is exactly as described in the listing. Would highly recommend!",

    rentalStartDate: "2025-06-01T00:00:00.000Z",
    rentalEndDate: "2025-12-01T00:00:00.000Z",

    createdAt: "2025-12-01T00:00:00.000Z",
  },
  {
    id: "2",
    propertyId: "2",
    rentalId: "rental2",
    tenantId: "tenant2",
    tenantName: "Sarah Lee",
    tenantPhoto: "https://i.pravatar.cc/150?u=tenant2",
    tenantVerified: true,

    rating: 4.8,
    locationRating: 5.0,
    conditionRating: 4.5,
    valueRating: 4.5,
    landlordRating: 5.0,

    comment: "Amazing apartment with stunning views. The location is unbeatable and landlord is very professional. Slightly pricey but worth it.",

    rentalStartDate: "2025-05-20T00:00:00.000Z",
    rentalEndDate: "2025-11-20T00:00:00.000Z",

    createdAt: "2025-11-20T00:00:00.000Z",
  },
  {
    id: "3",
    propertyId: "3",
    rentalId: "rental3",
    tenantId: "tenant3",
    tenantName: "Kumar",
    tenantVerified: false,

    rating: 4.3,
    locationRating: 4.5,
    conditionRating: 4.0,
    valueRating: 4.5,
    landlordRating: 4.0,

    comment: "Good value for money. Housemates are friendly. Only issue is sometimes the WiFi can be slow.",

    rentalStartDate: "2025-05-10T00:00:00.000Z",
    rentalEndDate: "2025-11-10T00:00:00.000Z",

    createdAt: "2025-11-10T00:00:00.000Z",
  },
];

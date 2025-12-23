# Project File Structure

├── app/                              # App screens (Expo Router)
│   ├── (tabs)/                       # Tab navigation screens
│   │   ├── _layout.tsx              # Tab layout configuration
│   │   ├── home.tsx                 # Home tab (role-based redirect)
│   │   ├── search.tsx               # Property search & filtering
│   │   ├── favorites.tsx            # Saved properties
│   │   ├── messages.tsx             # Chat inbox
│   │   ├── profile.tsx              # User profile & settings
│   │   └── listing.tsx              # Landlord listings management
│   ├── property/
│   │   └── [id].tsx                 # Property detail page
│   ├── chat/
│   │   └── [id].tsx                 # Chat conversation
│   ├── rent-property/
│   │   └── [id].tsx                 # Property rental process
│   ├── submit-review/
│   │   └── [id].tsx                 # Submit rental review
│   ├── edit-listing/
│   │   └── [id].tsx                 # Edit property listing
│   ├── _layout.tsx                  # Root layout with navigation
│   ├── index.tsx                    # Entry point (auth redirect)
│   ├── onboarding.tsx               # First-time user onboarding
│   ├── login.tsx                    # User login
│   ├── signup.tsx                   # User registration
│   ├── role-selection.tsx           # Landlord/Tenant selection
│   ├── identity-verification.tsx    # ID verification
│   ├── landlord-home.tsx            # Landlord dashboard
│   ├── tenant-home.tsx              # Tenant dashboard
│   ├── add-listing.tsx              # Create property listing
│   ├── my-rentals.tsx               # Tenant rental history
│   ├── landlord-rentals.tsx         # Landlord rental management
│   ├── review-history.tsx           # User review history
│   ├── all-reviews.tsx              # All reviews display
│   ├── affordability-calculator.tsx # Rent affordability tool
│   └── +not-found.tsx               # 404 error screen
├── components/                      # Reusable UI components
│   ├── PropertyCard.tsx             # Property list item
│   ├── tenant/
│   │   ├── PropertySearchHeader.tsx
│   │   ├── PropertyFilterTools.tsx
│   │   └── PropertyFiltersModal.tsx
│   ├── landlord/
│   │   ├── LandlordDashboardHeader.tsx
│   │   ├── LandlordOverviewStats.tsx
│   │   ├── LandlordQuickActions.tsx
│   │   ├── LandlordRecentActivity.tsx
│   │   ├── ListingCard.tsx
│   │   └── ListingStatusFilter.tsx
│   └── listing/
│       └── BasicDetailsStep.tsx
├── contexts/                        # Global state management
│   ├── AuthContext.tsx              # Authentication & user state
│   ├── FavoritesContext.tsx         # Favorite properties
│   ├── MessagesContext.tsx          # Chat messages
│   ├── ListingContext.tsx           # Property listings
│   ├── RentalsContext.tsx           # Rental agreements
│   └── ReviewsContext.tsx           # Reviews & ratings
├── src/
│   ├── types/                       # TypeScript type definitions
│   │   ├── index.ts                 # Type exports
│   │   ├── property.ts
│   │   ├── message.ts
│   │   ├── user.ts
│   │   ├── review.ts
│   │   └── rental.ts
│   ├── api/                         # Supabase API functions
│   │   ├── properties.ts            # Property CRUD
│   │   ├── messages.ts              # Message operations
│   │   ├── users.ts                 # User operations
│   │   ├── reviews.ts               # Review operations
│   │   └── rentals.ts               # Rental operations
│   └── utils/                       # Data normalization
│       ├── normalizeProperty.ts
│       ├── normalizeMessage.ts
│       ├── normalizeUser.ts
│       ├── normalizeReview.ts
│       └── normalizeRental.ts
├── styles/                          # Centralized StyleSheets
│   ├── global.ts                    # Shared styles
│   ├── auth.ts                      # Auth screen styles
│   ├── property.ts
│   ├── chat.ts
│   ├── listing.ts
│   ├── rental.ts
│   ├── review.ts
│   ├── calculator.ts
│   ├── landlord.ts
│   ├── tenant.ts
│   └── tabs.ts
├── lib/                              # Third-party integrations
│   └── supabase.ts                  # Supabase client
├── utils/                            # General utilities
│   ├── sensitiveDataMask.ts
├── constants/                        # App constants
│   └── colors.ts                    # Color palette
├── assets/                           # Static assets
│   └── images/                      # Icons, splash screens
│       ├── icon.png
│       ├── adaptive-icon.png
│       ├── splash-icon.png
│       └── favicon.png
├── app.json                          # Expo configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── metro.config.js                   # Metro bundler config
├── eslint.config.js                  # ESLint rules
├── database-erd.md                   # Database ERD diagram
├── supabase-schema.sql               # Database schema
└── README.md                         # Project documentation
```


// environment.template.ts
// Copy this file to src/environments/environment.ts and fill in your Firebase config

export const environment = {
  production: false,
  
  // Firebase Configuration
  // Get these values from Firebase Console → Project Settings → General
  // Your apps → Web app → Firebase SDK snippet → Config
  firebase: {
    apiKey: "YOUR_API_KEY",                          // e.g., "AIzaSyC..."
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",   // e.g., "alpha-insights.firebaseapp.com"
    projectId: "YOUR_PROJECT_ID",                    // e.g., "alpha-insights"
    storageBucket: "YOUR_PROJECT_ID.appspot.com",    // e.g., "alpha-insights.appspot.com"
    messagingSenderId: "YOUR_SENDER_ID",             // e.g., "123456789012"
    appId: "YOUR_APP_ID",                            // e.g., "1:123456789012:web:abc123def456"
    measurementId: "YOUR_MEASUREMENT_ID"             // Optional, e.g., "G-XXXXXXXXXX"
  },
  
  // External API Keys (if needed)
  externalApis: {
    // Price data API (future feature)
    priceDataApiKey: "",
    priceDataBaseUrl: "https://api.example.com/v1"
  },
  
  // Feature Flags
  features: {
    enablePushNotifications: true,
    enablePriceAlerts: true,
    enablePerformanceTracking: true,
    enableDarkMode: true,
    enableOfflineMode: true
  },
  
  // App Configuration
  app: {
    name: "Alpha Insights",
    version: "1.0.0",
    defaultPageSize: 20,              // Number of posts per page
    cacheExpirationMinutes: 30,       // Cache duration for data
    maxImageSizeMB: 5,                // Max upload size for images
    supportEmail: "support@alphainsights.com"
  },
  
  // Analytics
  analytics: {
    enabled: true,
    debug: true  // Set to false in production
  }
};

// environment.template.ts
// Copy this file to src/environments/environment.ts and fill in your Firebase config

export const environment = {
  production: false,
  
  // Firebase Configuration
  // Get these values from Firebase Console → Project Settings → General
  // Your apps → Web app → Firebase SDK snippet → Config
  firebase: {
    apiKey: "AIzaSyBnVoxuXvF1qDac2J5_h6inG89Wvm3aCmQ",
  authDomain: "alpha-insights-84c51.firebaseapp.com",
  projectId: "alpha-insights-84c51",
  storageBucket: "alpha-insights-84c51.firebasestorage.app",
  messagingSenderId: "1051741188643",
  appId: "1:1051741188643:web:99d0e8a04315c34e7db796",
  measurementId: "G-3S36N19CKD"
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

# Firebase Setup Guide - Alpha Insights

**Quick reference for setting up Firebase backend**

---

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: **alpha-insights**
4. Enable Google Analytics: **Yes** (recommended)
5. Create project

---

## 📱 Step 2: Register App

### Web App
1. Click "Web" icon (</>)
2. App nickname: **Alpha Insights Web**
3. Enable Firebase Hosting: **Yes**
4. Register app
5. Copy Firebase config object

### Android (later)
1. Click "Android" icon
2. Package name: `com.alphainsights.app`
3. Download `google-services.json`
4. Place in `android/app/`

### iOS (later)
1. Click "iOS" icon
2. Bundle ID: `com.alphainsights.app`
3. Download `GoogleService-Info.plist`
4. Place in `ios/App/App/`

---

## 🔐 Step 3: Enable Authentication

1. Navigate to **Build → Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Save

**Optional (future):**
- Google Sign-In
- Apple Sign-In
- Phone Authentication

---

## 🗄️ Step 4: Create Firestore Database

1. Navigate to **Build → Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose location: **us-central1** (or closest to users)
5. Enable

### Create Collections

**Initial setup - create these collections manually:**

```
analysis-posts/       (leave empty, will populate via script)
users/                (auto-created on first user signup)
price-alerts/         (created when first alert is set)
performance-tracking/ (created by Cloud Functions)
```

### Deploy Security Rules

Create `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Analysis posts - public read, admin write
    match /analysis-posts/{postId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
      
      // Allow incrementing views counter
      allow update: if isAuthenticated() && 
                      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views']);
    }
    
    // Price alerts - user-specific
    match /price-alerts/{alertId} {
      allow read: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
      allow write: if isAuthenticated() && 
                     request.resource.data.userId == request.auth.uid;
    }
    
    // Performance tracking - public read, admin write
    match /performance-tracking/{recordId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Create Indexes

Navigate to **Firestore → Indexes** and create:

```
Collection: analysis-posts
Fields: assetType (Ascending), timestamp (Descending)
Query scope: Collection

Collection: analysis-posts
Fields: recommendation (Ascending), timestamp (Descending)
Query scope: Collection

Collection: analysis-posts
Fields: ticker (Ascending), timestamp (Descending)
Query scope: Collection

Collection: analysis-posts
Fields: confidenceLevel (Descending), timestamp (Descending)
Query scope: Collection

Collection: price-alerts
Fields: userId (Ascending), triggered (Ascending), createdAt (Descending)
Query scope: Collection
```

**Note:** Firestore will auto-suggest indexes when you run queries that need them.

---

## 🗂️ Step 5: Configure Storage

1. Navigate to **Build → Storage**
2. Click "Get started"
3. Start in **production mode**
4. Use default location
5. Enable

### Create Storage Structure

```
/analysis-images/
  /[auto-generated-id]/
    hero.jpg
    chart-1.png
    chart-2.png

/user-avatars/
  [userId].jpg
```

### Deploy Storage Rules

Create `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check auth
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check admin
    function isAdmin() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Analysis images - public read, admin write
    match /analysis-images/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User avatars - public read, owner write
    match /user-avatars/{userId} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == userId;
      
      // Validate file size < 5MB and type is image
      allow write: if request.resource.size < 5 * 1024 * 1024 &&
                     request.resource.contentType.matches('image/.*');
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only storage
```

---

## ☁️ Step 6: Set Up Cloud Functions

### Initialize Functions

```bash
cd alpha-insights
firebase init functions

# Choose:
# - Language: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### Create Admin User (for posting analysis)

Create a script to set admin role:

```typescript
// scripts/set-admin.ts
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

async function setAdmin(email: string) {
  const user = await getAuth().getUserByEmail(email);
  await getFirestore().collection('users').doc(user.uid).set({
    role: 'admin'
  }, { merge: true });
  
  console.log(`✅ ${email} is now an admin`);
}

// Usage: node set-admin.js alpha@alphainsights.com
setAdmin(process.argv[2]);
```

### Deploy Basic Functions

```typescript
// functions/src/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Trigger on new high-confidence post
export const onNewHighConfidencePost = functions.firestore
  .document('analysis-posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    
    if (post.confidenceLevel >= 8) {
      // Get users with highConfidence notifications enabled
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('notificationPreferences.highConfidence', '==', true)
        .get();
      
      const tokens: string[] = [];
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });
      
      if (tokens.length > 0) {
        const message = {
          notification: {
            title: `🔥 High Confidence Alert: ${post.ticker}`,
            body: `${post.title} - Confidence: ${post.confidenceLevel}/10`
          },
          data: {
            postId: context.params.postId,
            type: 'HIGH_CONFIDENCE'
          },
          tokens: tokens
        };
        
        await admin.messaging().sendMulticast(message);
        console.log(`Sent ${tokens.length} notifications`);
      }
    }
  });

// Trigger on new watchlist post
export const onNewWatchlistPost = functions.firestore
  .document('analysis-posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    
    // Get users with this ticker in watchlist
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('watchlist', 'array-contains', post.ticker)
      .where('notificationPreferences.watchlistUpdates', '==', true)
      .get();
    
    const tokens: string[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });
    
    if (tokens.length > 0) {
      const message = {
        notification: {
          title: `📊 New Analysis: ${post.ticker}`,
          body: post.title
        },
        data: {
          postId: context.params.postId,
          ticker: post.ticker,
          type: 'WATCHLIST_UPDATE'
        },
        tokens: tokens
      };
      
      await admin.messaging().sendMulticast(message);
      console.log(`Sent ${tokens.length} watchlist notifications`);
    }
  });
```

Deploy functions:
```bash
firebase deploy --only functions
```

---

## 🔔 Step 7: Enable Cloud Messaging (FCM)

1. Navigate to **Project Settings → Cloud Messaging**
2. Under **Cloud Messaging API (Legacy)**, click "Enable"
3. Copy **Server key** (for later use)

---

## 📊 Step 8: Enable Analytics (Optional)

1. Navigate to **Build → Analytics**
2. Enable Google Analytics
3. View user events, conversions, etc.

---

## 🌐 Step 9: Set Up Hosting (Optional)

```bash
firebase init hosting

# Public directory: www
# Single-page app: Yes
# Auto builds/deploys with GitHub: No (for now)

# Deploy
ionic build --prod
firebase deploy --only hosting
```

---

## 🧪 Step 10: Seed Sample Data

Create a script to populate analysis posts:

```typescript
// scripts/seed-data.ts

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

const samplePosts = [
  {
    title: "TSLA Breaking Out - Strong LONG Setup",
    heroImage: "https://via.placeholder.com/800x400/0cce6b/ffffff?text=TSLA+LONG",
    description: "Tesla showing bullish momentum with volume confirmation. Entry at $245, targeting $280.",
    timestamp: Timestamp.now(),
    assetType: "stock",
    ticker: "TSLA",
    content: {
      charts: ["chart1.png", "chart2.png"],
      technicalAnalysis: "20-day MA crossed above 50-day MA. RSI at 65, plenty of room. Volume increased 40% vs avg.",
      newsSummary: "Deliveries beat estimates. Cybertruck production ramping up.",
      detailedAnalysis: "Tesla is breaking out of a 3-month consolidation pattern..."
    },
    recommendation: "LONG",
    entry: 245,
    stop: 235,
    target: 280,
    riskRewardRatio: 3.5,
    confidenceLevel: 9,
    authorId: "alpha-user-id",
    views: 0,
    bookmarks: 0,
    searchTerms: ["tsla", "tesla", "stock", "long"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    title: "BTC Testing Key Resistance - NO TRADE",
    heroImage: "https://via.placeholder.com/800x400/ff9500/ffffff?text=BTC+NO+TRADE",
    description: "Bitcoin at critical level. Wait for confirmation before entering.",
    timestamp: Timestamp.now(),
    assetType: "crypto",
    ticker: "BTC",
    content: {
      charts: ["btc-chart.png"],
      technicalAnalysis: "Price at $43,000 resistance. Volume declining. Potential double top forming.",
      newsSummary: "ETF approval rumors circulating. Fed meeting next week.",
      detailedAnalysis: "Bitcoin is testing major resistance at $43k..."
    },
    recommendation: "NO_TRADE",
    entry: 0,
    stop: 0,
    target: 0,
    riskRewardRatio: 0,
    confidenceLevel: 6,
    authorId: "alpha-user-id",
    views: 0,
    bookmarks: 0,
    searchTerms: ["btc", "bitcoin", "crypto", "no trade"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function seedData() {
  for (const post of samplePosts) {
    await db.collection('analysis-posts').add(post);
    console.log(`✅ Added: ${post.title}`);
  }
  console.log('🎉 Sample data seeded!');
}

seedData();
```

Run:
```bash
npx ts-node scripts/seed-data.ts
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Firebase project created
- [ ] Web app registered, config copied
- [ ] Email/Password auth enabled
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Indexes created (or auto-suggested)
- [ ] Storage enabled
- [ ] Storage rules deployed
- [ ] Cloud Functions initialized
- [ ] Sample data seeded
- [ ] FCM enabled
- [ ] No console errors

---

## 🔑 Environment Configuration

Add to `environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIza...",
    authDomain: "alpha-insights.firebaseapp.com",
    projectId: "alpha-insights",
    storageBucket: "alpha-insights.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  }
};
```

Add to `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  firebase: {
    // Same config (Firebase handles prod/dev via different projects if needed)
  }
};
```

---

## 🐛 Common Issues

### "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify admin role for protected writes

### "Index not found"
- Firestore will provide a link to create the index
- Click the link, create index, wait 2-3 minutes

### "Storage CORS error"
- Add CORS config to Firebase Storage
```bash
gsutil cors set cors.json gs://alpha-insights.appspot.com
```

**cors.json:**
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 📚 Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [FCM Setup Guide](https://firebase.google.com/docs/cloud-messaging)

---

**Firebase setup complete! Ready to integrate with Angular app.** 🔥


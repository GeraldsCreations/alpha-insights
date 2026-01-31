# Alpha Insights - Architecture Plan

**Project:** Trading Analysis Mobile App  
**Stack:** Angular 18 + Ionic 8 + Firebase  
**Developer:** Dev  
**Date:** 2025-01-21  

---

## 🎯 Sprint 1 Goal

Get the basic app structure up with auth and the home feed working.

**Deliverables:**
1. ✅ Project scaffolding (Angular + Ionic setup)
2. ✅ Firebase configuration
3. ✅ Authentication flow
4. ✅ Database schema design
5. ✅ Core screens (Home, Detail, Profile, Settings)
6. ✅ API service architecture
7. ✅ Component library structure

---

## 📐 Architecture Overview

### High-Level Structure

```
alpha-insights/
├── src/
│   ├── app/
│   │   ├── core/                   # Singleton services, guards, interceptors
│   │   │   ├── auth/               # Authentication services & guards
│   │   │   ├── services/           # Firebase, API, state management
│   │   │   ├── guards/             # Route guards
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   └── models/             # TypeScript interfaces & types
│   │   │
│   │   ├── shared/                 # Reusable components, directives, pipes
│   │   │   ├── components/         # UI components (cards, buttons, etc.)
│   │   │   ├── directives/         # Custom directives
│   │   │   ├── pipes/              # Custom pipes
│   │   │   └── utils/              # Helper functions
│   │   │
│   │   ├── features/               # Feature modules (lazy-loaded)
│   │   │   ├── home/               # Home feed
│   │   │   ├── analysis-detail/    # Post detail view
│   │   │   ├── profile/            # User profile & watchlist
│   │   │   ├── settings/           # App settings
│   │   │   ├── auth/               # Login/Register pages
│   │   │   └── search/             # Search functionality
│   │   │
│   │   └── app-routing.module.ts  # Main routing
│   │
│   ├── assets/                     # Images, icons, fonts
│   ├── theme/                      # Ionic theme (dark mode support)
│   └── environments/               # Environment configs
```

---

## 🔥 Firebase Architecture

### Firestore Database Schema

```typescript
// Collections Structure

/users/{userId}
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  watchlist: string[];              // Array of ticker symbols
  notificationPreferences: {
    watchlistUpdates: boolean;
    highConfidence: boolean;        // 8+ confidence alerts
    priceAlerts: boolean;
  };
  fcmToken?: string;                // For push notifications
}

/analysis-posts/{postId}
{
  id: string;
  title: string;
  heroImage: string;                // Firebase Storage URL
  description: string;
  timestamp: Timestamp;
  assetType: 'crypto' | 'stock';
  ticker: string;
  
  // Full analysis content
  content: {
    charts: string[];               // Array of chart image URLs
    technicalAnalysis: string;      // Rich text (HTML/Markdown)
    newsSummary: string;
    detailedAnalysis: string;
  };
  
  // Trading recommendation
  recommendation: 'LONG' | 'SHORT' | 'NO_TRADE';
  entry: number;
  stop: number;
  target: number;
  riskRewardRatio: number;
  confidenceLevel: number;          // 1-10
  
  // Metadata
  authorId: string;                 // Alpha's user ID
  views: number;
  bookmarks: number;
  
  // Indexing fields
  searchTerms: string[];            // Lowercase ticker + keywords
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/price-alerts/{alertId}
{
  userId: string;
  ticker: string;
  alertType: 'ENTRY' | 'STOP' | 'TARGET';
  targetPrice: number;
  currentPrice: number;
  postId: string;                   // Reference to analysis post
  triggered: boolean;
  createdAt: Timestamp;
}

/performance-tracking/{recordId}
{
  postId: string;
  ticker: string;
  recommendation: 'LONG' | 'SHORT';
  entry: number;
  stop: number;
  target: number;
  
  // Outcome tracking
  status: 'OPEN' | 'HIT_TARGET' | 'HIT_STOP' | 'EXPIRED';
  actualReturn?: number;
  closedAt?: Timestamp;
  
  createdAt: Timestamp;
}
```

### Firestore Indexes

```javascript
// Required composite indexes
- analysis-posts: (assetType ASC, timestamp DESC)
- analysis-posts: (recommendation ASC, timestamp DESC)
- analysis-posts: (ticker ASC, timestamp DESC)
- analysis-posts: (confidenceLevel DESC, timestamp DESC)
- price-alerts: (userId ASC, triggered ASC, createdAt DESC)
```

### Firebase Storage Structure

```
/analysis-images/
  /{postId}/
    /hero.jpg
    /chart-1.png
    /chart-2.png

/user-avatars/
  /{userId}.jpg
```

### Cloud Functions

```typescript
// functions/src/index.ts

// 1. Trigger push notifications on new high-confidence posts
export const onNewHighConfidencePost = functions.firestore
  .document('analysis-posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    if (post.confidenceLevel >= 8) {
      // Send FCM to all users with highConfidence enabled
    }
  });

// 2. Notify watchlist followers
export const onNewWatchlistPost = functions.firestore
  .document('analysis-posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    // Query users with this ticker in watchlist
    // Send FCM notifications
  });

// 3. Check price alerts (scheduled function - every 5 minutes)
export const checkPriceAlerts = functions.pubsub
  .schedule('*/5 * * * *')
  .onRun(async (context) => {
    // Fetch active alerts
    // Check current prices via external API
    // Trigger notifications for alerts that hit
  });

// 4. Calculate performance metrics (scheduled - daily)
export const updatePerformanceMetrics = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    // Calculate win rate, avg R:R, total returns
    // Update aggregated performance collection
  });
```

---

## 🏗️ Core Services Architecture

### 1. Authentication Service

```typescript
// core/auth/auth.service.ts

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = new BehaviorSubject<User | null>(null);
  
  async signIn(email: string, password: string): Promise<void>
  async signUp(email: string, password: string, displayName: string): Promise<void>
  async signOut(): Promise<void>
  async resetPassword(email: string): Promise<void>
  
  get isAuthenticated(): boolean
  getCurrentUser(): User | null
}
```

### 2. Firestore Service (Generic)

```typescript
// core/services/firestore.service.ts

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  // Generic CRUD operations
  getDocument<T>(path: string): Observable<T>
  getCollection<T>(path: string, queryFn?: QueryFn): Observable<T[]>
  addDocument<T>(path: string, data: T): Promise<string>
  updateDocument<T>(path: string, data: Partial<T>): Promise<void>
  deleteDocument(path: string): Promise<void>
  
  // Pagination support
  getCollectionPaginated<T>(path: string, limit: number, startAfter?: any): Observable<T[]>
}
```

### 3. Analysis Service

```typescript
// core/services/analysis.service.ts

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  // Fetch posts
  getAnalysisFeed(filters?: FeedFilters): Observable<AnalysisPost[]>
  getAnalysisById(id: string): Observable<AnalysisPost>
  searchAnalysis(query: string): Observable<AnalysisPost[]>
  
  // Filtering
  filterByAssetType(type: 'crypto' | 'stock'): Observable<AnalysisPost[]>
  filterByRecommendation(type: 'LONG' | 'SHORT' | 'NO_TRADE'): Observable<AnalysisPost[]>
  filterByTicker(ticker: string): Observable<AnalysisPost[]>
  
  // User interactions
  bookmarkPost(postId: string): Promise<void>
  incrementViews(postId: string): Promise<void>
}
```

### 4. Watchlist Service

```typescript
// core/services/watchlist.service.ts

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  getWatchlist(): Observable<string[]>
  addToWatchlist(ticker: string): Promise<void>
  removeFromWatchlist(ticker: string): Promise<void>
  isInWatchlist(ticker: string): Observable<boolean>
  
  // Get posts for watchlist tickers
  getWatchlistPosts(): Observable<AnalysisPost[]>
}
```

### 5. Price Alert Service

```typescript
// core/services/price-alert.service.ts

@Injectable({ providedIn: 'root' })
export class PriceAlertService {
  getUserAlerts(): Observable<PriceAlert[]>
  createAlert(alert: PriceAlertInput): Promise<void>
  deleteAlert(alertId: string): Promise<void>
  
  // Quick-create alerts from analysis post
  createAlertsForPost(post: AnalysisPost): Promise<void>
}
```

### 6. Performance Service

```typescript
// core/services/performance.service.ts

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  getPerformanceStats(): Observable<PerformanceStats>
  getTradeHistory(): Observable<PerformanceRecord[]>
  
  // Analytics
  getWinRate(): Observable<number>
  getAverageRR(): Observable<number>
  getTotalReturns(): Observable<number>
}
```

### 7. Notification Service

```typescript
// core/services/notification.service.ts

@Injectable({ providedIn: 'root' })
export class NotificationService {
  requestPermission(): Promise<void>
  saveFCMToken(token: string): Promise<void>
  updateNotificationPreferences(prefs: NotificationPreferences): Promise<void>
  
  // Local notifications (Capacitor)
  scheduleLocalNotification(title: string, body: string, time: Date): Promise<void>
}
```

---

## 📱 Feature Modules

### 1. Home Feed (features/home)

**Components:**
- `HomePage` - Main feed container
- `AnalysisCardComponent` - Post preview card
- `FeedFiltersComponent` - Filter chips (Asset type, Signal type)
- `LiveTickerComponent` - Scrolling price ticker
- `SearchBarComponent` - Search input

**Features:**
- Infinite scroll pagination
- Pull-to-refresh
- Filter by asset type / recommendation
- Live price updates (WebSocket or polling)
- Click card → navigate to detail

---

### 2. Analysis Detail (features/analysis-detail)

**Components:**
- `AnalysisDetailPage` - Full post view
- `HeroImageComponent` - Top banner image
- `ChartGalleryComponent` - Swipeable chart carousel
- `RecommendationCardComponent` - Entry/Stop/Target display
- `RiskRewardComponent` - Visual R:R ratio
- `ConfidenceMeterComponent` - 1-10 confidence gauge
- `ActionButtonsComponent` - Watchlist, Share, Alert buttons

**Features:**
- Rich text rendering (Markdown/HTML)
- Image zoom/carousel
- Add to watchlist
- Set price alerts (Entry/Stop/Target)
- Share analysis (PDF export, share link)

---

### 3. Profile (features/profile)

**Components:**
- `ProfilePage` - User profile container
- `WatchlistComponent` - List of followed tickers
- `UserStatsComponent` - User activity stats
- `PerformanceChartComponent` - Alpha's track record

**Features:**
- View watchlist
- Remove from watchlist
- View bookmarked posts
- View notification settings
- See performance metrics (win rate, R:R, returns)

---

### 4. Settings (features/settings)

**Components:**
- `SettingsPage` - Settings container
- `NotificationSettingsComponent` - Toggle notification types
- `ThemeToggleComponent` - Light/Dark mode
- `AccountSettingsComponent` - Email, password, logout

**Features:**
- Dark mode toggle (persisted)
- Notification preferences
- Account management
- About/Version info

---

### 5. Auth (features/auth)

**Components:**
- `LoginPage` - Email/password login
- `RegisterPage` - Sign up form
- `ForgotPasswordPage` - Password reset

**Features:**
- Firebase Auth integration
- Form validation
- Error handling
- Auto-navigate on success

---

## 🎨 Shared Components Library

```typescript
// shared/components/

- LoadingSpinnerComponent
- ErrorMessageComponent
- EmptyStateComponent
- ConfirmDialogComponent
- ToastService (Injectable)
- ModalService (Injectable)

// Trading-specific components
- TickerChipComponent (displays ticker with color-coded asset type)
- RecommendationBadgeComponent (LONG/SHORT/NO_TRADE badge)
- PriceDisplayComponent (formatted price with +/- indicator)
- ConfidenceLevelComponent (1-10 visual indicator)
- RiskRewardRatioComponent (visual R:R display)
```

---

## 🎨 Theme & Design System

### Ionic Theme (theme/variables.scss)

```scss
// Dark Mode Support
:root {
  // Light mode colors
  --app-primary: #1a73e8;
  --app-success: #0cce6b;  // LONG signal
  --app-danger: #ff3b30;   // SHORT signal
  --app-warning: #ff9500;  // NO_TRADE signal
  --app-background: #ffffff;
  --app-surface: #f5f5f5;
  --app-text-primary: #1d1d1f;
  --app-text-secondary: #86868b;
}

[data-theme="dark"] {
  // Dark mode colors (professional trading aesthetic)
  --app-primary: #0a84ff;
  --app-success: #30d158;
  --app-danger: #ff453a;
  --app-warning: #ffd60a;
  --app-background: #000000;
  --app-surface: #1c1c1e;
  --app-text-primary: #ffffff;
  --app-text-secondary: #98989d;
}
```

### Typography

- **Headers:** SF Pro Display (fallback: system-ui)
- **Body:** SF Pro Text (fallback: system-ui)
- **Monospace (prices):** SF Mono (fallback: monospace)

---

## 🚀 Performance Optimizations

### 1. Lazy Loading
- All feature modules lazy-loaded via routing
- Images lazy-loaded with Intersection Observer
- Chart images loaded on-demand

### 2. Virtual Scrolling
- Home feed uses Ionic virtual scroll for large lists
- Reduces DOM nodes, improves scroll performance

### 3. Caching Strategy
- Firestore offline persistence enabled
- Service Worker for PWA support
- Image caching via Capacitor

### 4. Bundle Size
- Tree-shaking enabled
- Code splitting by route
- Optimize images (WebP where supported)

---

## 📡 Real-Time Features

### Live Price Tickers

**Option 1:** WebSocket (via Firebase Realtime Database or external API)
```typescript
// Connect to WebSocket price feed
// Update ticker prices in real-time
```

**Option 2:** Polling (simpler for MVP)
```typescript
// Fetch prices every 30 seconds
// Update UI with RxJS interval
```

### Push Notifications

**FCM Integration:**
1. User grants permission
2. FCM token saved to Firestore
3. Cloud Functions send targeted notifications
4. Capacitor handles local notifications

---

## 🔐 Security

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own user doc
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Analysis posts are public read, admin write
    match /analysis-posts/{postId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Price alerts - user-specific
    match /price-alerts/{alertId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Performance tracking - public read
    match /performance-tracking/{recordId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Analysis images - public read, admin write
    match /analysis-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // User avatars - authenticated users only
    match /user-avatars/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Jasmine + Karma)
- Services: 80%+ coverage
- Components: Critical paths covered
- Pipes/Utils: 100% coverage

### E2E Tests (Cypress)
- Auth flow (login, register, logout)
- Home feed (load, filter, pagination)
- Analysis detail (view, bookmark, share)
- Watchlist (add, remove)

### Manual Testing Checklist
- [ ] iOS build & test (Xcode)
- [ ] Android build & test (Android Studio)
- [ ] Dark mode toggle
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Price alerts triggering

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@angular/core": "^18.0.0",
    "@ionic/angular": "^8.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/push-notifications": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@angular/fire": "^18.0.0",
    "firebase": "^11.0.0",
    "rxjs": "^7.8.0",
    "chart.js": "^4.0.0",
    "marked": "^12.0.0",
    "jspdf": "^2.5.0"
  }
}
```

---

## 🗓️ Development Roadmap

### Phase 1: Foundation (Week 1)
- [x] Architecture planning
- [ ] Project scaffolding
- [ ] Firebase setup
- [ ] Authentication flow
- [ ] Basic routing

### Phase 2: Core Features (Week 2)
- [ ] Home feed with pagination
- [ ] Analysis detail view
- [ ] Firestore integration
- [ ] Search functionality

### Phase 3: User Features (Week 3)
- [ ] Watchlist
- [ ] Profile page
- [ ] Settings
- [ ] Notifications setup

### Phase 4: Advanced Features (Week 4)
- [ ] Price alerts
- [ ] Performance tracking
- [ ] PDF export/share
- [ ] Dark mode polish

### Phase 5: Polish & Deploy (Week 5)
- [ ] E2E testing
- [ ] Performance optimization
- [ ] iOS build
- [ ] Android build
- [ ] App Store submission prep

---

## 🎯 Success Metrics

**Technical:**
- App load time < 2s
- Time to Interactive < 3s
- Lighthouse score > 90
- Crash-free rate > 99.5%

**User Experience:**
- Smooth 60fps scrolling
- Offline-first functionality
- Instant feedback on interactions
- Professional trading app feel

---

## 📝 Next Steps

1. **Create project scaffold** - `ionic start alpha-insights blank --type=angular`
2. **Initialize Firebase** - Set up Firebase project + install SDK
3. **Set up folder structure** - Create core/shared/features directories
4. **Build authentication** - Login/register/forgot password
5. **Create database schema** - Initialize Firestore collections
6. **Build home feed** - Basic list of analysis posts
7. **Test auth flow** - End-to-end auth testing

---

**Ready to build! 🚀**

*Dev - Senior Mobile Developer*

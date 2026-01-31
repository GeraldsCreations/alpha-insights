# Alpha Insights - Setup Checklist

**Complete this checklist before starting development**

---

## ✅ Pre-Development Checklist

### 1. Development Environment

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **npm** or **yarn** installed (`npm --version`)
- [ ] **Git** installed (`git --version`)
- [ ] **Ionic CLI** installed globally (`npm install -g @ionic/cli`)
- [ ] **Firebase CLI** installed globally (`npm install -g firebase-tools`)
- [ ] **Code editor** set up (VS Code recommended)

### 2. Mobile Development Tools (Optional for Sprint 1)

- [ ] **Xcode** installed (Mac only, for iOS builds)
- [ ] **Android Studio** installed (for Android builds)
- [ ] **iOS Simulator** configured
- [ ] **Android Emulator** configured

### 3. Firebase Account Setup

- [ ] **Firebase account** created (free tier OK)
- [ ] **Firebase project** created (name: `alpha-insights`)
- [ ] **Billing enabled** on Firebase (required for Cloud Functions, free tier available)
- [ ] **Firebase CLI** logged in (`firebase login`)

### 4. Firebase Services Enabled

- [ ] **Authentication** enabled (Email/Password provider)
- [ ] **Firestore Database** created (production mode)
- [ ] **Firebase Storage** enabled
- [ ] **Cloud Functions** initialized (Node.js 18+)
- [ ] **Cloud Messaging (FCM)** enabled
- [ ] **Firebase Hosting** enabled (optional)

### 5. Firebase Configuration

- [ ] **Web app** registered in Firebase Console
- [ ] **Firebase config** copied (API keys, project ID, etc.)
- [ ] **google-services.json** downloaded (for Android)
- [ ] **GoogleService-Info.plist** downloaded (for iOS)
- [ ] **Service account key** downloaded (for admin tasks)

### 6. Project Setup

- [ ] **Git repository** initialized (`git init`)
- [ ] **README.md** created
- [ ] **.gitignore** created (use `.gitignore.template`)
- [ ] **environment.ts** created (use `environment.template.ts`)
- [ ] **Firebase config** added to `environment.ts`
- [ ] **Initial commit** made

---

## 🔥 Firebase Checklist

### Authentication

- [ ] Email/Password provider enabled
- [ ] Test user created (for development)
- [ ] Auth domain added to authorized domains

### Firestore Database

- [ ] Database created in `us-central1` (or preferred region)
- [ ] Security rules deployed (`firestore.rules`)
- [ ] Composite indexes created (or auto-created on first query)
- [ ] Test collection created (`analysis-posts`)
- [ ] Sample data seeded

**Required Indexes:**
- [ ] `analysis-posts`: (assetType ASC, timestamp DESC)
- [ ] `analysis-posts`: (recommendation ASC, timestamp DESC)
- [ ] `analysis-posts`: (ticker ASC, timestamp DESC)
- [ ] `analysis-posts`: (confidenceLevel DESC, timestamp DESC)

### Firebase Storage

- [ ] Storage enabled
- [ ] Security rules deployed (`storage.rules`)
- [ ] Folder structure created:
  - [ ] `/analysis-images/`
  - [ ] `/user-avatars/`
- [ ] CORS configured (if needed)

### Cloud Functions

- [ ] Functions initialized (`firebase init functions`)
- [ ] TypeScript selected as language
- [ ] Dependencies installed (`npm install` in `functions/`)
- [ ] Test function deployed
- [ ] Functions region set (default: `us-central1`)

**Functions to Deploy:**
- [ ] `onNewHighConfidencePost` (notification trigger)
- [ ] `onNewWatchlistPost` (watchlist notification)
- [ ] `checkPriceAlerts` (scheduled function - future)

### Cloud Messaging (FCM)

- [ ] FCM enabled in Firebase Console
- [ ] Cloud Messaging API (Legacy) enabled
- [ ] Server key copied (for future use)

---

## 📦 Project Checklist

### Folder Structure

- [ ] `src/app/core/auth/` created
- [ ] `src/app/core/services/` created
- [ ] `src/app/core/guards/` created
- [ ] `src/app/core/models/` created
- [ ] `src/app/shared/components/` created
- [ ] `src/app/shared/directives/` created
- [ ] `src/app/shared/pipes/` created
- [ ] `src/app/features/auth/` created
- [ ] `src/app/features/home/` created
- [ ] `src/app/features/analysis-detail/` created
- [ ] `src/app/features/profile/` created
- [ ] `src/app/features/settings/` created

### Core Files

- [ ] `DATA_MODELS.ts` copied to `core/models/index.ts`
- [ ] `AuthService` created
- [ ] `FirestoreService` created
- [ ] `AnalysisService` created
- [ ] `AuthGuard` created

### Pages Created

- [ ] Login page (`features/auth/login`)
- [ ] Register page (`features/auth/register`)
- [ ] Forgot Password page (`features/auth/forgot-password`)
- [ ] Home page (`features/home`)
- [ ] Analysis Detail page (`features/analysis-detail`)
- [ ] Profile page (`features/profile`)
- [ ] Settings page (`features/settings`)

### Components Created

- [ ] `AnalysisCardComponent` (home feed card)
- [ ] `FeedFiltersComponent` (filter chips)
- [ ] `LoadingSpinnerComponent` (shared)
- [ ] `ErrorMessageComponent` (shared)

---

## 🎨 Styling Checklist

- [ ] Theme colors configured (`theme/variables.scss`)
- [ ] Dark mode colors added
- [ ] LONG/SHORT/NO_TRADE colors set (green/red/orange)
- [ ] Typography configured
- [ ] Custom CSS for cards added

---

## 🔐 Security Checklist

### Firestore Security Rules

- [ ] Users collection: User-only read/write
- [ ] Analysis posts: Public read, admin write
- [ ] Price alerts: User-specific read/write
- [ ] Performance tracking: Public read, admin write

### Firebase Storage Rules

- [ ] Analysis images: Public read, admin write
- [ ] User avatars: Public read, user write
- [ ] File size limits enforced (< 5MB)
- [ ] File type validation (images only)

### Environment Security

- [ ] `environment.ts` added to `.gitignore`
- [ ] Firebase config NOT committed to Git
- [ ] Service account keys NOT committed to Git
- [ ] API keys stored securely

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] User can register new account
- [ ] User can login with email/password
- [ ] User can logout
- [ ] User can reset password
- [ ] Home feed loads analysis posts
- [ ] Posts display correctly (image, title, data)
- [ ] Pull-to-refresh works
- [ ] Navigation works (tabs, routing)
- [ ] Auth guard blocks unauthenticated users
- [ ] Dark mode toggle works

### Data Testing

- [ ] Sample data seeded in Firestore
- [ ] Images display from Firebase Storage
- [ ] Firestore queries return correct data
- [ ] Filtering works (asset type, recommendation)
- [ ] Pagination works (if implemented)

### Device Testing

- [ ] App runs in browser (`ionic serve`)
- [ ] App runs on iOS simulator (if available)
- [ ] App runs on Android emulator (if available)
- [ ] No console errors
- [ ] Performance acceptable (< 3s load time)

---

## 📱 Mobile Build Checklist (Optional for Sprint 1)

### iOS

- [ ] Capacitor added (`ionic capacitor add ios`)
- [ ] `GoogleService-Info.plist` added to `ios/App/App/`
- [ ] Xcode project opens without errors
- [ ] App builds successfully
- [ ] App runs on simulator
- [ ] Push notification capability added (future)

### Android

- [ ] Capacitor added (`ionic capacitor add android`)
- [ ] `google-services.json` added to `android/app/`
- [ ] Android Studio project opens without errors
- [ ] Gradle sync successful
- [ ] App builds successfully
- [ ] App runs on emulator

---

## 🚀 Deployment Checklist (Future)

### Firebase Hosting

- [ ] Hosting initialized (`firebase init hosting`)
- [ ] Production build created (`ionic build --prod`)
- [ ] Deployed to Firebase (`firebase deploy --only hosting`)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

### App Stores

- [ ] Apple Developer account ($99/year)
- [ ] Google Play Developer account ($25 one-time)
- [ ] App icons created (all sizes)
- [ ] Screenshots prepared (iPhone, iPad, Android)
- [ ] App description written
- [ ] Privacy policy created
- [ ] Terms of service created

---

## ✅ Final Pre-Launch Checklist

Before going live, verify:

- [ ] No hardcoded credentials in code
- [ ] Environment variables configured correctly
- [ ] Firebase security rules deployed
- [ ] Error handling implemented
- [ ] Analytics tracking configured
- [ ] Push notifications tested
- [ ] App performance optimized (Lighthouse score > 90)
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete (iOS + Android)
- [ ] Privacy policy linked in app
- [ ] Terms of service linked in app

---

## 🐛 Troubleshooting Checklist

If something doesn't work, check:

- [ ] Node modules installed (`npm install`)
- [ ] Firebase config correct in `environment.ts`
- [ ] Firebase services enabled in console
- [ ] Security rules deployed (`firebase deploy --only firestore:rules,storage`)
- [ ] Internet connection active
- [ ] Firebase CLI logged in (`firebase login`)
- [ ] Ionic version compatible (`ionic --version`)
- [ ] Browser cache cleared
- [ ] Firestore indexes created
- [ ] Console shows no errors (browser DevTools)

---

## 📚 Documentation Checklist

- [ ] Architecture document read (`ARCHITECTURE.md`)
- [ ] Implementation plan reviewed (`IMPLEMENTATION_PLAN.md`)
- [ ] Firebase setup guide followed (`FIREBASE_SETUP.md`)
- [ ] Quick start guide reviewed (`QUICKSTART.md`)
- [ ] Data models understood (`DATA_MODELS.ts`)
- [ ] README read (`README.md`)

---

## 🎯 Sprint 1 Goal

**By end of Sprint 1, you should have:**

✅ Working authentication (login, register, logout)  
✅ Home feed displaying analysis posts  
✅ Firebase integrated (Auth, Firestore)  
✅ Routes protected with AuthGuard  
✅ Sample data visible in app  
✅ App running on browser + simulator  
✅ No critical errors  

**If all checkboxes above are ✅, you're ready to start Sprint 2!** 🚀

---

## 📞 Need Help?

- Read docs: `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`
- Check Firebase Console for service status
- Run `ionic doctor` to check for issues
- Check browser console for errors
- Review Firebase logs: `firebase functions:log`

---

**Setup complete when all checklist items are ✅**

**Good luck building Alpha Insights! 🍆📈**


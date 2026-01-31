# Alpha Insights

**A mobile app for trading analysis & recommendations**

![Alpha Insights](https://via.placeholder.com/1200x400/1a73e8/ffffff?text=Alpha+Insights+-+Trade+Smarter)

---

## 📱 Overview

Alpha Insights is a professional mobile trading app that delivers curated stock and crypto analysis with clear entry/exit recommendations. Built for traders who want actionable insights backed by technical analysis.

**Key Features:**
- 📊 Real-time trading analysis feed (stocks & crypto)
- 🎯 Clear LONG/SHORT/NO_TRADE signals
- 📈 Entry, stop-loss, and target prices
- ⭐ Watchlist for tracking favorite tickers
- 🔔 Push notifications for high-confidence setups
- 📉 Performance tracking (Alpha's win rate, R:R, returns)
- 🌙 Dark mode for late-night trading

---

## 🛠️ Tech Stack

**Frontend:**
- **Angular 18** - Modern web framework
- **Ionic 8** - Cross-platform mobile UI
- **Capacitor 6** - Native mobile integration
- **RxJS** - Reactive state management
- **TypeScript** - Type-safe development

**Backend:**
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - Image/chart hosting
- **Cloud Functions** - Serverless backend logic
- **FCM** - Push notifications

**Mobile:**
- iOS (via Capacitor)
- Android (via Capacitor)
- PWA (Progressive Web App)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Ionic CLI: `npm install -g @ionic/cli`
- Firebase account (free tier works)
- Xcode (for iOS builds)
- Android Studio (for Android builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/alpha-insights.git
cd alpha-insights

# Install dependencies
npm install

# Set up environment variables
cp src/environments/environment.example.ts src/environments/environment.ts
# Edit environment.ts with your Firebase config

# Run development server
ionic serve
```

App will open at `http://localhost:8100`

### Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.

**Quick setup:**
1. Create Firebase project
2. Enable Auth (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Copy Firebase config to `environment.ts`
6. Deploy security rules
7. Seed sample data

---

## 📂 Project Structure

```
alpha-insights/
├── src/
│   ├── app/
│   │   ├── core/                 # Singleton services, guards
│   │   │   ├── auth/             # Authentication
│   │   │   ├── services/         # Business logic
│   │   │   ├── guards/           # Route guards
│   │   │   └── models/           # TypeScript interfaces
│   │   │
│   │   ├── shared/               # Reusable components
│   │   │   ├── components/       # UI components
│   │   │   ├── directives/       # Custom directives
│   │   │   └── pipes/            # Custom pipes
│   │   │
│   │   └── features/             # Feature modules (lazy-loaded)
│   │       ├── auth/             # Login, Register
│   │       ├── home/             # Analysis feed
│   │       ├── analysis-detail/  # Post detail
│   │       ├── profile/          # User profile & watchlist
│   │       └── settings/         # App settings
│   │
│   ├── assets/                   # Images, icons
│   ├── theme/                    # Ionic theme
│   └── environments/             # Environment configs
│
├── functions/                    # Cloud Functions
├── scripts/                      # Utility scripts
├── docs/                         # Documentation
├── ARCHITECTURE.md               # Architecture overview
├── IMPLEMENTATION_PLAN.md        # Development roadmap
└── FIREBASE_SETUP.md             # Firebase setup guide
```

---

## 🏗️ Architecture

### Service Layer

**Authentication:**
- `AuthService` - User login, register, logout
- `AuthGuard` - Route protection

**Data:**
- `FirestoreService` - Generic Firestore CRUD
- `AnalysisService` - Trading posts
- `WatchlistService` - User watchlist
- `PriceAlertService` - Price notifications
- `PerformanceService` - Track record analytics

**UI:**
- `NotificationService` - Push notifications
- `ThemeService` - Dark/light mode
- `ToastService` - User feedback

### Data Models

See [DATA_MODELS.ts](./DATA_MODELS.ts) for TypeScript interfaces.

**Key models:**
- `User` - User profile & preferences
- `AnalysisPost` - Trading analysis
- `PriceAlert` - Price notifications
- `PerformanceRecord` - Trade outcomes

---

## 🎨 Design System

### Colors

**Light Mode:**
- Primary: `#1a73e8` (Blue)
- Success: `#0cce6b` (Green - LONG signals)
- Danger: `#ff3b30` (Red - SHORT signals)
- Warning: `#ff9500` (Orange - NO_TRADE)

**Dark Mode:**
- Primary: `#0a84ff`
- Success: `#30d158`
- Danger: `#ff453a`
- Warning: `#ffd60a`
- Background: `#000000`
- Surface: `#1c1c1e`

### Typography

- Headers: SF Pro Display
- Body: SF Pro Text
- Monospace (prices): SF Mono

---

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm test

# With coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests (Cypress)
npm run e2e
```

### Manual Testing

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for testing checklist.

---

## 📱 Building for Mobile

### iOS

```bash
# Add iOS platform
ionic capacitor add ios

# Build web assets
ionic build --prod

# Copy to native project
npx cap copy ios

# Open in Xcode
npx cap open ios
```

Build in Xcode:
1. Select target device/simulator
2. Product → Build
3. Product → Run

### Android

```bash
# Add Android platform
ionic capacitor add android

# Build web assets
ionic build --prod

# Copy to native project
npx cap copy android

# Open in Android Studio
npx cap open android
```

Build in Android Studio:
1. Select target device/emulator
2. Build → Make Project
3. Run → Run 'app'

---

## 🚢 Deployment

### Web (Firebase Hosting)

```bash
# Build production
ionic build --prod

# Deploy to Firebase
firebase deploy --only hosting
```

### iOS (App Store)

1. Open Xcode
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload to TestFlight
5. Submit for review

### Android (Play Store)

1. Open Android Studio
2. Build → Generate Signed Bundle/APK
3. Upload to Google Play Console
4. Submit for review

---

## 🔐 Security

### Firestore Security Rules

```javascript
// Users can only modify their own data
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// Analysis posts are public read, admin write
match /analysis-posts/{postId} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete security rules.

### Environment Variables

**Never commit:**
- Firebase API keys (use `.gitignore`)
- Service account keys
- Sensitive credentials

**Use:**
- Environment files for config
- Firebase App Check for API protection
- CORS rules for Storage

---

## 📊 Performance

**Optimization strategies:**
- Lazy loading feature modules
- Virtual scrolling for long lists
- Image lazy loading
- Firestore offline persistence
- Service Worker caching (PWA)

**Target metrics:**
- App load time: < 2s
- Time to Interactive: < 3s
- Lighthouse score: > 90
- Crash-free rate: > 99.5%

---

## 🐛 Troubleshooting

### Firebase Connection Issues

```bash
# Verify Firebase config
cat src/environments/environment.ts

# Check Firebase project
firebase projects:list

# Re-deploy rules
firebase deploy --only firestore:rules,storage
```

### Build Errors

```bash
# Clear Ionic cache
ionic build --clean

# Reset node modules
rm -rf node_modules package-lock.json
npm install

# Clear Capacitor
rm -rf ios android
ionic capacitor add ios
ionic capacitor add android
```

### Auth State Not Persisting

Enable Firestore offline persistence in `app.component.ts`:

```typescript
import { enableIndexedDbPersistence } from '@angular/fire/firestore';

enableIndexedDbPersistence(firestore).catch((err) => {
  console.log('Persistence error:', err.code);
});
```

---

## 🗺️ Roadmap

### Sprint 1 ✅ (Current)
- [x] Project setup
- [x] Firebase integration
- [x] Authentication flow
- [x] Home feed
- [x] Architecture design

### Sprint 2 🚧 (Next)
- [ ] Analysis detail page
- [ ] Watchlist functionality
- [ ] Bookmark posts
- [ ] Search by ticker

### Sprint 3 📅 (Future)
- [ ] Push notifications
- [ ] Price alerts
- [ ] Performance tracking
- [ ] PDF export

### Sprint 4 📅 (Future)
- [ ] Live price tickers
- [ ] Chart overlays
- [ ] Social features (comments, likes)
- [ ] Portfolio tracking

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Code style:**
- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Dev** - Senior Mobile Developer

**Alpha** - Quantitative Trader (Content Provider)

---

## 🙏 Acknowledgments

- Angular team for the framework
- Ionic team for mobile UI components
- Firebase for backend infrastructure
- Trading community for inspiration

---

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System design & structure
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Development roadmap
- [Firebase Setup](./FIREBASE_SETUP.md) - Backend configuration
- [Data Models](./DATA_MODELS.ts) - TypeScript interfaces

---

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/alpha-insights/issues)
- Email: support@alphainsights.com
- Discord: [Alpha Insights Community](https://discord.gg/alphainsights)

---

**Built with ❤️ by traders, for traders** 🍆📈


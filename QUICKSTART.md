# Alpha Insights - Quick Start Guide

**Get the app running in 10 minutes**

---

## ⚡ Super Fast Setup

```bash
# 1. Install Ionic CLI
npm install -g @ionic/cli

# 2. Create project
ionic start alpha-insights blank --type=angular --capacitor
cd alpha-insights

# 3. Install Firebase
npm install @angular/fire firebase

# 4. Install additional packages
npm install @capacitor/push-notifications @capacitor/local-notifications
npm install chart.js ng2-charts marked jspdf

# 5. Set up Firebase (see FIREBASE_SETUP.md for details)
# - Create Firebase project
# - Enable Auth, Firestore, Storage
# - Copy config to environment.ts

# 6. Run development server
ionic serve
```

Open browser at `http://localhost:8100` 🚀

---

## 🔥 Firebase Quick Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage

# Deploy security rules
firebase deploy --only firestore:rules,storage
```

**Get Firebase config:**
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" → Web app
3. Copy the `firebaseConfig` object
4. Paste into `src/environments/environment.ts`

---

## 📦 Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

---

## 🏗️ Project Scaffolding

```bash
# Create folder structure
mkdir -p src/app/core/{auth,services,guards,models}
mkdir -p src/app/shared/{components,directives,pipes}
mkdir -p src/app/features/{auth,home,analysis-detail,profile,settings}

# Generate core services
ionic generate service core/auth/auth --skip-tests
ionic generate service core/services/firestore --skip-tests
ionic generate service core/services/analysis --skip-tests

# Generate guards
ionic generate guard core/guards/auth --skip-tests

# Generate auth pages
ionic generate page features/auth/login
ionic generate page features/auth/register

# Generate home page
ionic generate page features/home
ionic generate component features/home/components/analysis-card
```

---

## 🎨 Quick Theme Setup

Edit `src/theme/variables.scss`:

```scss
:root {
  --ion-color-primary: #1a73e8;
  --ion-color-success: #0cce6b;  // LONG signals
  --ion-color-danger: #ff3b30;   // SHORT signals
  --ion-color-warning: #ff9500;  // NO_TRADE
}

[data-theme="dark"] {
  --ion-color-primary: #0a84ff;
  --ion-color-success: #30d158;
  --ion-color-danger: #ff453a;
  --ion-color-warning: #ffd60a;
  --ion-background-color: #000000;
  --ion-text-color: #ffffff;
}
```

---

## 🔑 Authentication Setup (5 minutes)

**1. AuthService** (`src/app/core/auth/auth.service.ts`):

```typescript
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, 
         createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = new BehaviorSubject<any>(null);

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged(user => this.user$.next(user));
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signOut() {
    return signOut(this.auth);
  }

  get isAuthenticated() {
    return this.user$.value !== null;
  }
}
```

**2. Login Page** (`features/auth/login/login.page.ts`):

```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
})
export class LoginPage {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.form.invalid) return;
    
    try {
      await this.auth.signIn(
        this.form.value.email!,
        this.form.value.password!
      );
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }
}
```

**3. Login Template** (`login.page.html`):

```html
<ion-content class="ion-padding">
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <ion-item>
      <ion-label position="floating">Email</ion-label>
      <ion-input type="email" formControlName="email"></ion-input>
    </ion-item>

    <ion-item>
      <ion-label position="floating">Password</ion-label>
      <ion-input type="password" formControlName="password"></ion-input>
    </ion-item>

    <ion-button expand="block" type="submit" [disabled]="form.invalid">
      Sign In
    </ion-button>
  </form>
</ion-content>
```

---

## 🏠 Home Feed Setup (5 minutes)

**1. AnalysisService** (`core/services/analysis.service.ts`):

```typescript
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, 
         query, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  constructor(private firestore: Firestore) {}

  getAnalysisFeed(): Observable<any[]> {
    const ref = collection(this.firestore, 'analysis-posts');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(20));
    return collectionData(q, { idField: 'id' });
  }
}
```

**2. Home Page** (`features/home/home.page.ts`):

```typescript
import { Component, OnInit } from '@angular/core';
import { AnalysisService } from '../../core/services/analysis.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  posts$: Observable<any[]>;

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.posts$ = this.analysisService.getAnalysisFeed();
  }
}
```

**3. Home Template** (`home.page.html`):

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Alpha Insights</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-card *ngFor="let post of posts$ | async">
    <img [src]="post.heroImage" />
    <ion-card-header>
      <ion-card-title>{{ post.title }}</ion-card-title>
      <ion-card-subtitle>
        {{ post.ticker }} • {{ post.recommendation }}
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <p>{{ post.description }}</p>
      <div>Entry: ${{ post.entry }} | Target: ${{ post.target }}</div>
    </ion-card-content>
  </ion-card>
</ion-content>
```

---

## 🗄️ Seed Sample Data

Create `scripts/seed-data.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const samplePost = {
  title: "TSLA Breaking Out - LONG Setup",
  heroImage: "https://via.placeholder.com/800x400",
  description: "Tesla showing bullish momentum",
  timestamp: admin.firestore.Timestamp.now(),
  assetType: "stock",
  ticker: "TSLA",
  recommendation: "LONG",
  entry: 245,
  stop: 235,
  target: 280,
  riskRewardRatio: 3.5,
  confidenceLevel: 9,
  views: 0,
  bookmarks: 0,
  content: {
    technicalAnalysis: "Strong breakout pattern...",
    newsSummary: "Deliveries beat estimates",
    detailedAnalysis: "Full analysis here..."
  }
};

db.collection('analysis-posts').add(samplePost)
  .then(() => console.log('✅ Sample data added'))
  .catch(err => console.error('Error:', err));
```

Run:
```bash
node scripts/seed-data.js
```

---

## 🧪 Test the App

```bash
# 1. Start dev server
ionic serve

# 2. Test auth flow
# - Navigate to /auth/login
# - Create account at /auth/register
# - Login with credentials

# 3. Test home feed
# - Should see sample analysis post
# - Verify data displays correctly

# 4. Check Firebase Console
# - Firestore: Should see user doc created
# - Auth: Should see user in Authentication tab
```

---

## 📱 Build for Mobile

### iOS

```bash
ionic build
ionic capacitor add ios
ionic capacitor copy ios
ionic capacitor open ios
```

### Android

```bash
ionic build
ionic capacitor add android
ionic capacitor copy android
ionic capacitor open android
```

---

## 🐛 Quick Fixes

### "Firebase not initialized"
```typescript
// app.module.ts - Add Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

// In @NgModule imports:
provideFirebaseApp(() => initializeApp(environment.firebase)),
provideAuth(() => getAuth()),
provideFirestore(() => getFirestore()),
```

### "CORS error loading images"
```bash
# Create cors.json
echo '[{"origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600}]' > cors.json

# Apply to Firebase Storage
gsutil cors set cors.json gs://YOUR-PROJECT-ID.appspot.com
```

### "Auth state not persisting"
```typescript
// Enable Firestore offline persistence
import { enableIndexedDbPersistence } from '@angular/fire/firestore';

const firestore = getFirestore();
enableIndexedDbPersistence(firestore);
```

---

## ✅ Checklist

- [ ] Ionic CLI installed
- [ ] Project created
- [ ] Firebase configured
- [ ] Environment file set up
- [ ] Folder structure created
- [ ] Auth service implemented
- [ ] Login page working
- [ ] Home feed displaying posts
- [ ] Sample data seeded
- [ ] App running on `http://localhost:8100`

---

## 📚 Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Follow [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for Sprint 1
3. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for backend details
4. Start building! 🚀

---

**You're ready to build Alpha Insights!** 🍆📈


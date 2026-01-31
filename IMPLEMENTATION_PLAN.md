# Alpha Insights - Implementation Plan (Sprint 1)

**Developer:** Dev  
**Goal:** Get basic app structure up with auth and home feed working  
**Timeline:** 5-7 days  
**Date:** 2025-01-21  

---

## 📋 Sprint 1 Checklist

### Day 1: Project Setup & Foundation

**1.1 Project Scaffolding**
```bash
# Install Ionic CLI globally
npm install -g @ionic/cli

# Create new Ionic Angular project
ionic start alpha-insights blank --type=angular --capacitor

# Navigate to project
cd alpha-insights

# Install dependencies
npm install @angular/fire firebase
npm install @capacitor/push-notifications @capacitor/local-notifications
npm install chart.js ng2-charts
npm install marked
npm install jspdf
npm install -D @types/marked

# Set up Git
git init
git add .
git commit -m "Initial project setup"
```

**1.2 Firebase Configuration**
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Firestore Database
- [ ] Enable Firebase Authentication (Email/Password)
- [ ] Enable Firebase Storage
- [ ] Enable Cloud Functions (Node.js)
- [ ] Enable Firebase Cloud Messaging (FCM)
- [ ] Download `google-services.json` (Android)
- [ ] Download `GoogleService-Info.plist` (iOS)

**1.3 Add Firebase to Angular**
```bash
# Generate environment files
ng generate environments

# Add Firebase config to environment.ts
```

**environment.ts:**
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

**1.4 Folder Structure Setup**
```bash
# Create core structure
mkdir -p src/app/core/auth
mkdir -p src/app/core/services
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/models

# Create shared structure
mkdir -p src/app/shared/components
mkdir -p src/app/shared/directives
mkdir -p src/app/shared/pipes
mkdir -p src/app/shared/utils

# Create feature modules
mkdir -p src/app/features/auth
mkdir -p src/app/features/home
mkdir -p src/app/features/analysis-detail
mkdir -p src/app/features/profile
mkdir -p src/app/features/settings
mkdir -p src/app/features/search
```

**1.5 Configure app.module.ts**
```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  // ...
})
```

---

### Day 2: Core Services & Models

**2.1 Create Data Models**
```bash
# Copy DATA_MODELS.ts to project
cp DATA_MODELS.ts src/app/core/models/index.ts
```

**2.2 Build Authentication Service**
```bash
ng generate service core/auth/auth --skip-tests
```

**Implementation:**
```typescript
// src/app/core/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
         signOut, sendPasswordResetEmail, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private auth: Auth) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  get isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
```

**2.3 Create Auth Guard**
```bash
ng generate guard core/guards/auth --skip-tests
```

```typescript
// src/app/core/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
```

**2.4 Build Firestore Service**
```bash
ng generate service core/services/firestore --skip-tests
```

```typescript
// src/app/core/services/firestore.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, 
         addDoc, updateDoc, deleteDoc, query, QueryConstraint } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  getDocument<T>(path: string): Observable<T | undefined> {
    const docRef = doc(this.firestore, path);
    return docData(docRef, { idField: 'id' }) as Observable<T | undefined>;
  }

  getCollection<T>(path: string, ...queryConstraints: QueryConstraint[]): Observable<T[]> {
    const collectionRef = collection(this.firestore, path);
    const q = query(collectionRef, ...queryConstraints);
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  async addDocument<T>(path: string, data: T): Promise<string> {
    const collectionRef = collection(this.firestore, path);
    const docRef = await addDoc(collectionRef, data as any);
    return docRef.id;
  }

  async updateDocument<T>(path: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.firestore, path);
    await updateDoc(docRef, data as any);
  }

  async deleteDocument(path: string): Promise<void> {
    const docRef = doc(this.firestore, path);
    await deleteDoc(docRef);
  }
}
```

**2.5 Build Analysis Service**
```bash
ng generate service core/services/analysis --skip-tests
```

```typescript
// src/app/core/services/analysis.service.ts

import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { AnalysisPost, FeedFilters } from '../models';
import { Observable } from 'rxjs';
import { where, orderBy, limit } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private collectionPath = 'analysis-posts';

  constructor(private firestoreService: FirestoreService) {}

  getAnalysisFeed(filters?: FeedFilters): Observable<AnalysisPost[]> {
    const constraints = [
      orderBy('timestamp', 'desc'),
      limit(filters?.limit || 20)
    ];

    if (filters?.assetType) {
      constraints.unshift(where('assetType', '==', filters.assetType));
    }

    if (filters?.recommendation) {
      constraints.unshift(where('recommendation', '==', filters.recommendation));
    }

    if (filters?.ticker) {
      constraints.unshift(where('ticker', '==', filters.ticker.toUpperCase()));
    }

    if (filters?.minConfidence) {
      constraints.unshift(where('confidenceLevel', '>=', filters.minConfidence));
    }

    return this.firestoreService.getCollection<AnalysisPost>(
      this.collectionPath,
      ...constraints
    );
  }

  getAnalysisById(id: string): Observable<AnalysisPost | undefined> {
    return this.firestoreService.getDocument<AnalysisPost>(
      `${this.collectionPath}/${id}`
    );
  }

  async incrementViews(postId: string): Promise<void> {
    // Increment views atomically
    const post = await this.firestoreService.getDocument<AnalysisPost>(
      `${this.collectionPath}/${postId}`
    ).toPromise();
    
    if (post) {
      await this.firestoreService.updateDocument(
        `${this.collectionPath}/${postId}`,
        { views: (post.views || 0) + 1 }
      );
    }
  }
}
```

---

### Day 3: Authentication UI

**3.1 Generate Auth Feature Module**
```bash
ionic generate page features/auth/login
ionic generate page features/auth/register
ionic generate page features/auth/forgot-password
```

**3.2 Build Login Page**
```typescript
// src/app/features/auth/login/login.page.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    const loading = await this.loadingController.create({
      message: 'Signing in...'
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
      await loading.dismiss();
      this.router.navigate(['/home']);
    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: error.message || 'Login failed',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}
```

**3.3 Login Template**
```html
<!-- src/app/features/auth/login/login.page.html -->

<ion-header>
  <ion-toolbar>
    <ion-title>Alpha Insights</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <div class="login-container">
    <h1>Welcome Back</h1>
    <p class="subtitle">Sign in to view trading analysis</p>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <ion-item>
        <ion-label position="floating">Email</ion-label>
        <ion-input type="email" formControlName="email"></ion-input>
      </ion-item>
      <ion-text color="danger" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
        <p class="error-text">Please enter a valid email</p>
      </ion-text>

      <ion-item>
        <ion-label position="floating">Password</ion-label>
        <ion-input type="password" formControlName="password"></ion-input>
      </ion-item>
      <ion-text color="danger" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
        <p class="error-text">Password must be at least 6 characters</p>
      </ion-text>

      <ion-button expand="block" type="submit" [disabled]="loginForm.invalid" class="ion-margin-top">
        Sign In
      </ion-button>
    </form>

    <div class="links">
      <ion-button fill="clear" (click)="navigateToForgotPassword()">
        Forgot Password?
      </ion-button>
      <ion-button fill="clear" (click)="navigateToRegister()">
        Create Account
      </ion-button>
    </div>
  </div>
</ion-content>
```

**3.4 Repeat for Register & Forgot Password pages**

---

### Day 4: Home Feed

**4.1 Generate Home Page**
```bash
ionic generate page features/home
ionic generate component features/home/components/analysis-card
ionic generate component features/home/components/feed-filters
```

**4.2 Build Home Page**
```typescript
// src/app/features/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { AnalysisService } from '../../core/services/analysis.service';
import { AnalysisPost, FeedFilters, AssetType, RecommendationType } from '../../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  posts$: Observable<AnalysisPost[]>;
  filters: FeedFilters = {};

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.posts$ = this.analysisService.getAnalysisFeed(this.filters);
  }

  onFilterChange(filters: FeedFilters) {
    this.filters = filters;
    this.loadPosts();
  }

  onRefresh(event: any) {
    this.loadPosts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  navigateToDetail(postId: string) {
    // Navigate to detail page
  }
}
```

**4.3 Build Analysis Card Component**
```typescript
// src/app/features/home/components/analysis-card/analysis-card.component.ts

import { Component, Input } from '@angular/core';
import { AnalysisPost } from '../../../../core/models';

@Component({
  selector: 'app-analysis-card',
  templateUrl: './analysis-card.component.html',
  styleUrls: ['./analysis-card.component.scss'],
})
export class AnalysisCardComponent {
  @Input() post: AnalysisPost;

  getRecommendationColor(): string {
    switch (this.post.recommendation) {
      case 'LONG': return 'success';
      case 'SHORT': return 'danger';
      case 'NO_TRADE': return 'warning';
      default: return 'medium';
    }
  }

  getAssetTypeIcon(): string {
    return this.post.assetType === 'crypto' ? 'logo-bitcoin' : 'trending-up';
  }
}
```

**4.4 Analysis Card Template**
```html
<!-- analysis-card.component.html -->

<ion-card>
  <img [src]="post.heroImage" [alt]="post.title" />
  
  <ion-card-header>
    <div class="card-meta">
      <ion-chip [color]="getRecommendationColor()">
        <ion-label>{{ post.recommendation }}</ion-label>
      </ion-chip>
      <ion-chip>
        <ion-icon [name]="getAssetTypeIcon()"></ion-icon>
        <ion-label>{{ post.ticker }}</ion-label>
      </ion-chip>
    </div>
    <ion-card-title>{{ post.title }}</ion-card-title>
    <ion-card-subtitle>
      {{ post.timestamp | date:'short' }} • Confidence: {{ post.confidenceLevel }}/10
    </ion-card-subtitle>
  </ion-card-header>

  <ion-card-content>
    <p>{{ post.description }}</p>
    
    <div class="metrics">
      <div class="metric">
        <span class="label">Entry</span>
        <span class="value">${{ post.entry }}</span>
      </div>
      <div class="metric">
        <span class="label">Target</span>
        <span class="value">${{ post.target }}</span>
      </div>
      <div class="metric">
        <span class="label">R:R</span>
        <span class="value">{{ post.riskRewardRatio }}</span>
      </div>
    </div>
  </ion-card-content>
</ion-card>
```

---

### Day 5: Routing & Navigation

**5.1 Configure App Routing**
```typescript
// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadChildren: () => import('./features/auth/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('./features/auth/register/register.module').then(m => m.RegisterPageModule)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./features/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
      }
    ]
  },
  {
    path: 'analysis/:id',
    loadChildren: () => import('./features/analysis-detail/analysis-detail.module').then(m => m.AnalysisDetailPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**5.2 Add Tab Navigation**
```bash
ionic generate page tabs
```

**tabs.page.html:**
```html
<ion-tabs>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="home">
      <ion-icon name="home"></ion-icon>
      <ion-label>Feed</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="search">
      <ion-icon name="search"></ion-icon>
      <ion-label>Search</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="profile">
      <ion-icon name="person"></ion-icon>
      <ion-label>Profile</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="settings">
      <ion-icon name="settings"></ion-icon>
      <ion-label>Settings</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
```

---

### Day 6-7: Polish & Testing

**6.1 Theme Configuration**
```scss
// src/theme/variables.scss

:root {
  --ion-color-primary: #1a73e8;
  --ion-color-success: #0cce6b;
  --ion-color-danger: #ff3b30;
  --ion-color-warning: #ff9500;
}

[data-theme="dark"] {
  --ion-color-primary: #0a84ff;
  --ion-color-success: #30d158;
  --ion-color-danger: #ff453a;
  --ion-color-warning: #ffd60a;
  --ion-background-color: #000000;
  --ion-background-color-rgb: 0,0,0;
  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255,255,255;
}
```

**6.2 Create Sample Data Script**
```bash
# Create a script to populate Firestore with sample analysis posts
node scripts/seed-data.js
```

**6.3 Manual Testing Checklist**
- [ ] User can register new account
- [ ] User can login with email/password
- [ ] User can logout
- [ ] Home feed loads analysis posts
- [ ] Posts display correctly (image, title, data)
- [ ] Pull-to-refresh works
- [ ] Navigation between pages works
- [ ] Auth guard blocks unauthenticated users
- [ ] Dark mode toggle works (if implemented)

**6.4 Firebase Security Rules**
```javascript
// Deploy Firestore security rules
firebase deploy --only firestore:rules

// Deploy Storage security rules
firebase deploy --only storage
```

---

## 🎯 Definition of Done

Sprint 1 is complete when:

✅ **Infrastructure:**
- [ ] Ionic + Angular project created
- [ ] Firebase integrated (Auth, Firestore, Storage)
- [ ] Folder structure follows architecture plan
- [ ] Environment configuration set up

✅ **Authentication:**
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] User can reset password
- [ ] Auth guard protects routes
- [ ] Auth state persists across sessions

✅ **Home Feed:**
- [ ] Displays list of analysis posts
- [ ] Shows hero image, title, ticker, recommendation
- [ ] Pull-to-refresh implemented
- [ ] Filter by asset type works
- [ ] Posts are clickable (navigate to detail - placeholder OK)

✅ **Code Quality:**
- [ ] TypeScript strict mode enabled
- [ ] No console errors
- [ ] Code follows Angular style guide
- [ ] Services use dependency injection
- [ ] Components are modular and reusable

✅ **Documentation:**
- [ ] README.md with setup instructions
- [ ] ARCHITECTURE.md reviewed and updated
- [ ] Code comments for complex logic
- [ ] Git commits are meaningful

---

## 🚧 Known Limitations (Sprint 1)

These are intentionally deferred to later sprints:

- ❌ Analysis detail page (placeholder only)
- ❌ Watchlist functionality
- ❌ Push notifications
- ❌ Price alerts
- ❌ Performance tracking
- ❌ PDF export
- ❌ Live price tickers
- ❌ Search functionality (advanced)
- ❌ Pagination (infinite scroll)

---

## 📝 Next Sprint Preview (Sprint 2)

**Focus:** Analysis Detail & Watchlist

**Goals:**
1. Build full analysis detail page
2. Implement watchlist (add/remove tickers)
3. Add bookmark functionality
4. Build profile page with watchlist view
5. Implement search by ticker

---

## 🐛 Troubleshooting Common Issues

### Firebase Connection Issues
```bash
# Check Firebase config
npm run build
# Verify console for errors
```

### Ionic Build Errors
```bash
# Clear cache
ionic build --clean
rm -rf node_modules package-lock.json
npm install
```

### Auth State Not Persisting
```typescript
// Enable Firestore offline persistence
import { enableIndexedDbPersistence } from '@angular/fire/firestore';

enableIndexedDbPersistence(firestore).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.log('Browser not supported');
  }
});
```

---

## ✅ Ready to Build!

**Current Status:** Architecture designed, plan documented

**Next Command:**
```bash
ionic start alpha-insights blank --type=angular --capacitor
```

**Developer:** Dev  
**Confidence:** 10/10 🚀  
**Let's ship it!** 🍆


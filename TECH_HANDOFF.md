# AfixZ Technical Handoff

> Reference document for building a **products e-commerce app** that shares Firebase project, auth, and infrastructure with the existing AfixZ services app.

---

## 1. Firebase Project Configuration

### 1.1 Project Details

| Key | Value |
|-----|-------|
| Database | Firestore (default) |
| Region | `asia-south2` (Delhi) |
| Auth providers | Google OAuth, Email Magic Link, Phone (Firebase reCAPTCHA) |
| Hosting | Vercel (static + serverless) |
| Image CDN | Cloudinary (unsigned upload preset) |
| Email | Resend API (transactional emails) |

### 1.2 Environment Variables

**Client-side (Vite `VITE_` prefix, exposed to browser):**

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

VITE_SITE_URL=https://yourapp.com
VITE_API_BASE=https://yourapp.vercel.app

VITE_PHONE_AUTH_PROVIDER=firebase    # "firebase" | "external" | "disabled"
```

**Server-side (Vercel dashboard only, never in client bundle):**

```env
FIREBASE_SERVICE_ACCOUNT_KEY=<full JSON string of Firebase Admin SDK service account>
NOTIFY_API_SECRET=<random string for cron/manual API auth>
RESEND_API_KEY=<from resend.com>
RESEND_FROM_EMAIL=YourBrand <orders@yourdomain.com>
ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com
```

### 1.3 Firebase Init (Client)

File: `src/lib/firebase.ts`

```ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

**CRITICAL for shared Firebase project:** Both apps use identical `VITE_FIREBASE_*` env vars pointing to same Firebase project. Same users collection, same auth — user signs in once, both apps recognize them.

### 1.4 Firebase Admin Init (Serverless Functions)

Pattern used in every `api/*.ts` file:

```ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );
  initializeApp({ credential: cert(serviceAccount) });
}
```

Singleton pattern — `getApps().length === 0` prevents re-init across warm Vercel function invocations.

---

## 2. Authentication System

### 2.1 Auth Methods

| Method | Implementation | File |
|--------|---------------|------|
| **Google OAuth** | `signInWithPopup(auth, googleProvider)` | `src/components/auth/AuthLogin.tsx` |
| **Email Magic Link** | `sendSignInLinkToEmail` + `signInWithEmailLink` | `src/components/auth/AuthLogin.tsx` |
| **Phone OTP** | `signInWithPhoneNumber` + reCAPTCHA | `src/auth/phone/providers.ts` |

### 2.2 Auth Flow

1. User clicks Google / enters email / enters phone
2. Firebase Auth creates/finds user
3. `onAuthStateChanged` fires in `AuthContext`
4. Context checks custom claims via `getIdTokenResult(true)`:
   - `token.claims.admin === true` → admin role
   - `token.claims.provider === true` → provider role
   - neither → user role
5. Context ensures Firestore profile exists at `users/{uid}`
6. If profile exists, syncs provider/role/email/displayName if changed
7. If profile missing, creates it with `serverTimestamp()`

### 2.3 AuthContext API

File: `src/context/AuthContext.tsx`

```ts
interface AuthContextType {
  user: User | null;           // Firebase Auth user object
  profile: UserProfile | null; // Firestore profile document
  loading: boolean;            // true during initial auth check
  isAdmin: boolean;            // from custom claim
  isProvider: boolean;         // from custom claim
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### 2.4 UserProfile Schema

Collection: `users/{uid}`

```ts
interface UserProfile {
  uid: string;                           // matches doc ID
  phone: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: "phone" | "email" | "google.com" | null;
  role: "user" | "admin" | "provider";
  selectedLocation?: LocationId | null;  // "delhi" | "noida" | "gurgaon"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.5 Custom Claims (Role Assignment)

Roles assigned via serverless function `api/set-role.ts`:

```
POST /api/set-role
Authorization: Bearer <admin-firebase-token> OR Bearer <NOTIFY_API_SECRET>

Body: {
  uid?: string,
  email?: string,    // resolved to UID if uid not provided
  role: "admin" | "provider",
  action?: "grant" | "revoke"   // default: "grant"
}
```

This function:
1. Validates caller is admin (custom claim check) or has API secret
2. Sets Firebase custom claim: `{ admin: true }` or `{ provider: true }`
3. Syncs `users/{uid}.role` in Firestore to match

### 2.6 Email Magic Link Details

- Callback URL: `VITE_SITE_URL` env var (production) or `window.location.origin` (dev)
- Email stored in `localStorage` key: `afixz_email_for_signin`
- On app load, `completeEmailLinkSignIn()` checks if current URL is a sign-in link
- Detection: URL contains `mode=signIn` and `oobCode=`
- After sign-in, redirects to `/` and clears URL params

### 2.7 Phone Auth Architecture

File: `src/auth/phone/config.ts` — config toggle
File: `src/auth/phone/providers.ts` — provider factory

Three modes controlled by `VITE_PHONE_AUTH_PROVIDER`:
- `"firebase"` — Firebase reCAPTCHA + `signInWithPhoneNumber`
- `"external"` — placeholder for third-party OTP (not implemented)
- `"disabled"` — phone auth off (production default)

Provider factory pattern:
```ts
const provider = createPhoneAuthProvider("recaptcha-container-id");
await provider.init();
const session = await provider.sendOtp("+91XXXXXXXXXX");
await provider.verifyOtp("123456", session);
provider.cleanup();
```

### 2.8 Protected Routes

| Guard | Logic | Redirect |
|-------|-------|----------|
| `ProtectedRoute` | `isAdmin === true` | `/admin/login` |
| `ProviderProtectedRoute` | `isProvider \|\| isAdmin` | `/provider/login` |
| `UserProtectedRoute` | `user !== null` | Shows login modal |

**For products app:** Reuse `AuthContext` and `UserProtectedRoute`. Admin/Provider guards only needed if building admin panel.

---

## 3. Firestore Data Model

### 3.1 Collections Overview

| Collection | Purpose | Read | Write |
|------------|---------|------|-------|
| `users/{uid}` | User profiles | Owner, Admin, Provider | Owner (create/update), Admin |
| `users/{uid}/cart/{serviceId}` | Cart items | Owner | Owner |
| `users/{uid}/addresses/{id}` | Saved addresses | Owner, Admin | Owner, Admin |
| `services/{id}` | Service catalog | Public | Admin |
| `categories/{id}` | Service categories | Public | Admin |
| `blogs/{id}` | Blog posts | Public | Admin |
| `bookings/{id}` | Orders/bookings | Owner, Admin, Provider | Owner (create), Admin, Provider (update status) |
| `subscriptions/{id}` | Recurring plans | Owner, Admin | Owner (create/update status), Admin |
| `subscriptionPlans/{id}` | Plan definitions | Public | Admin |
| `siteContent/{id}` | CMS content | Public | Admin |

### 3.2 Service Document Schema

```ts
// Collection: services/{id}
{
  title: string;
  slug: string;                    // URL-friendly ID
  price: number;                   // base price in INR
  duration: string;                // e.g. "2-3 hours"
  warranty: string;
  professionals: string | number;
  overview: string;                // full description
  shortDescription: string;        // card excerpt
  included: string[];              // what's included list
  images: string[];                // Cloudinary URLs
  categoryId: string;              // FK to categories
  categorySlug: string;
  rating: number;
  reviewCount: number;
  searchKeywords: string[];        // prefix search array
  isRecommended: boolean;
  availableLocations: LocationId[];          // empty = all locations
  contentByLocation: Record<LocationId, Partial<ServiceEntry>>; // location overrides
  priceByLocation: Record<LocationId, number>;   // location-specific pricing
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**For products app:** Create a `products/{id}` collection with similar structure. Replace duration/warranty/professionals with product-specific fields (stock, weight, variants, etc.). Keep `availableLocations`, `priceByLocation`, `contentByLocation` pattern if needed.

### 3.3 Booking Document Schema

```ts
// Collection: bookings/{id}
{
  userId: string;                  // FK to users
  serviceId: string;               // FK to services
  serviceSlug: string;
  serviceTitle: string;
  price: number;
  totalPrice: number;              // must equal price (validated in rules)
  locationId: string;              // "delhi" | "noida" | "gurgaon"
  address: {                       // inline or map
    name: string;
    phone: string;
    houseNo: string;
    area: string;
    landmark?: string;
    city: string;
    pincode: string;
    fullAddress: string;
  };
  scheduledDate: string;           // "YYYY-MM-DD"
  scheduledTime: string;           // "10:00 AM"
  paymentMode: "cod";              // only COD currently
  status: "pending" | "confirmed" | "completed" | "cancelled" | "on-hold";
  source?: "booking" | "subscription";
  subscriptionId?: string;
  visitNumber?: number;            // for subscription visits
  totalVisits?: number;
  customerName: string;
  customerPhone: string;
  completedBy?: string;            // provider name
  completedAt?: Timestamp;
  claimedBy?: string;              // provider name
  createdAt: Timestamp;
}
```

**For products app:** Create `orders/{id}` collection. Replace service fields with product array, add quantity, shipping status, payment status. Keep `userId`, `address`, `locationId` pattern.

### 3.4 Cart Subcollection

```ts
// Collection: users/{uid}/cart/{serviceId}
{
  serviceId: string;     // doc ID matches this
  title: string;
  price: number;
  slug: string;
  locationId: string;
  addedAt: Timestamp;
}
```

**Firestore rules validate:** serviceId matches doc ID, service exists in catalog, price matches catalog price (prevents client tampering), location is valid, service supports that location.

**For products app:** Same pattern at `users/{uid}/cart/{productId}`. Add `quantity` field. Update rules to validate against `products` collection instead of `services`.

### 3.5 Subscription System

```ts
// Collection: subscriptions/{id}
{
  userId: string;
  planId: string;           // "garden-care-monthly"
  planName: string;
  billingCycle: "monthly" | "6months" | "yearly";
  price: number;            // total for billing cycle
  pricePerMonth: number;
  durationMonths: number;
  visitsPerMonth: number;
  plantCoverage: number;
  locationId: string;
  address: SubscriptionAddress;
  preferredTime: string;
  status: "active" | "paused" | "cancelled" | "expired";
  startDate: string;        // YYYY-MM-DD
  endDate: string;
  nextVisitDate: string;
  totalVisits: number;
  completedVisits: number;
  customerName: string;
  customerPhone: string;
  createdAt: Timestamp;
}
```

Subscription creation is **atomic** — one Firestore batch creates the subscription doc + all visit bookings upfront. Status changes cascade to visit bookings (pause → on-hold, cancel → cancelled, resume → pending).

### 3.6 Firestore Indexes

Deployed via `firestore.indexes.json`:

| Collection | Fields | Purpose |
|------------|--------|---------|
| `bookings` | userId ASC, createdAt DESC | User's order history |
| `bookings` | status ASC, scheduledDate ASC | Provider dashboard queries |
| `blogs` | published ASC, publishedAt DESC | Published blogs listing |
| `services` | categorySlug ASC, createdAt DESC | Category filtering |
| `services` | categorySlug ASC, price ASC | Category + price sort |
| `services` | searchKeywords CONTAINS, createdAt DESC | Prefix search |
| `users` | role ASC, createdAt DESC | Admin user management |

**For products app:** Add indexes for `products` and `orders` collections with similar patterns.

---

## 4. Firestore Security Rules

File: `firestore.rules`

### 4.1 Helper Functions

```
isSignedIn()     → request.auth != null
isAdmin()        → signed in + admin custom claim
isProvider()     → signed in + provider custom claim
isOwner(userId)  → signed in + uid matches
isValidLocation(id) → one of "delhi", "noida", "gurgaon"
```

### 4.2 Validation Pattern

Every write operation validates the full document shape:
1. `hasOnlyKeys()` — no extra fields allowed
2. `hasRequiredKeys()` — all mandatory fields present
3. Type checks on every field
4. Cross-document validation (e.g., cart items validate price against service catalog)

### 4.3 Key Security Features

- **Cart price validation:** `servicePriceMatches()` reads the service doc to verify client-submitted price matches catalog. Prevents price tampering.
- **Location validation:** Cart items and bookings validate that the service supports the submitted location via `serviceSupportsLocation()`.
- **Role immutability:** Users cannot change their own `role` field except to sync with custom claims.
- **Booking integrity:** `userId` must match authenticated user. Status must be "pending" on creation.
- **Provider restrictions:** Can only update tracking fields (status, claimedBy, completedBy). Cannot change userId, serviceId, price, createdAt.

**For products app:** Copy rule structure. Replace `services` references with `products`. Add `validProduct()` and `validOrder()` validators. Keep user/cart/address rules as-is.

---

## 5. Serverless Functions (Vercel API Routes)

### 5.1 `api/notify-order.ts` — Order Email Notifications

**Trigger:** POST from client after booking creation
**Auth:** Firebase ID token (Bearer) OR static `NOTIFY_API_SECRET`
**Email provider:** Resend API (`https://api.resend.com/emails`)

Flow:
1. Validate auth (token or secret)
2. Validate payload (name, email, service required)
3. Sanitize all strings (HTML escape, 500 char limit)
4. Send customer confirmation email (HTML template)
5. Send admin notification email (HTML template)
6. Return `{ success: true, results: { customer: bool, admin: bool } }`

Non-blocking from client side — `sendOrderNotification()` in `src/lib/notifications.ts` fires and forgets:

```ts
export async function sendOrderNotification(payload) {
  const idToken = currentUser ? await currentUser.getIdToken() : null;
  await fetch("/api/notify-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}
```

### 5.2 `api/set-role.ts` — Role Management

**Trigger:** POST from admin dashboard
**Auth:** Firebase ID token with `admin` claim OR static API secret
**Actions:** Grant/revoke `admin` or `provider` custom claims

Syncs both Firebase Auth custom claims AND Firestore `users/{uid}.role`.

### 5.3 `api/generate-visits.ts` — Subscription Visit Cron

**Trigger:** Vercel Cron (daily at 00:30 UTC) or manual POST
**Auth:** `x-vercel-cron` header (auto) or Bearer API secret

Only processes **legacy** subscriptions (totalVisits == 0). New subscriptions have all visits pre-created atomically at subscribe time — this cron exists for backward compat only.

Configured in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/generate-visits", "schedule": "30 0 * * *" }]
}
```

---

## 6. Location System

### 6.1 Location IDs

```ts
type LocationId = "delhi" | "noida" | "gurgaon";
```

File: `src/lib/locations.ts`

### 6.2 LocationContext

File: `src/context/LocationContext.tsx`

Hydration order:
1. `localStorage` key `afixz:selected-location`
2. Firestore `users/{uid}.selectedLocation`
3. Default: `"noida"`

When user changes location:
- State updates immediately
- `localStorage` updated
- If logged in, syncs to Firestore `users/{uid}.selectedLocation` (merge)

### 6.3 Location-Aware Content

Pattern used across services, blogs, homepage content:

```ts
// Base document has location overrides
{
  price: 500,
  title: "Garden Care",
  priceByLocation: { delhi: 600, gurgaon: 550 },
  contentByLocation: {
    delhi: { title: "Garden Care Delhi" }
  },
  availableLocations: ["delhi", "noida"]  // empty = available everywhere
}
```

Resolution: `mergeBaseWithLocationOverride(baseDoc, selectedLocation, overrides)` deep-merges location-specific fields over base. Price resolved separately from `priceByLocation`.

File: `src/lib/locationContent.ts` — generic deep merge utility
File: `src/lib/services.ts` — `resolveServiceForLocation()`
File: `src/lib/blogs.ts` — `resolveBlogForLocation()`

**For products app:** Reuse `LocationContext` as-is. Copy location content merge pattern for product pricing/availability per city.

---

## 7. Service Cache

File: `src/lib/serviceCache.ts`

In-memory cache with 5-minute TTL and request deduplication:

```ts
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Singleton cache entries
let servicesCache: CacheEntry<ServiceEntry[]> | null = null;
let servicesFetchPromise: Promise<ServiceEntry[]> | null = null;

export async function getAllServices(): Promise<ServiceEntry[]> {
  if (isFresh(servicesCache)) return servicesCache.data;     // cache hit
  if (servicesFetchPromise) return servicesFetchPromise;     // dedup concurrent calls
  
  servicesFetchPromise = (async () => {
    const snap = await getDocs(query(collection(db, "services"), orderBy("createdAt", "desc")));
    const services = snap.docs.map(doc => normalizeService(doc.id, doc.data()));
    servicesCache = { data: services, timestamp: Date.now() };
    return services;
  })();
  
  return servicesFetchPromise;
}

export function invalidateServicesCache() { servicesCache = null; }
```

Key design decisions:
- **Fetch all, filter client-side** — single Firestore read, all filtering/sorting in JS
- **Request deduplication** — if 3 components call `getAllServices()` simultaneously, only 1 Firestore read happens
- **Manual invalidation** — admin panel calls `invalidateServicesCache()` after edits

**For products app:** Copy this pattern exactly for `productCache.ts`. Same TTL, same dedup, same invalidation strategy.

---

## 8. Search System

### 8.1 Prefix Search Keywords

Services/blogs store `searchKeywords: string[]` — a prefix array built from title + category + tags.

Generation (file: `src/lib/blogs.ts`):
```ts
function generateSearchKeywords(values: string[]) {
  const keywords = new Set<string>();
  values.forEach(value => {
    value.toLowerCase().split(/[\s,]+/).forEach(word => {
      let current = "";
      for (const char of word) {
        current += char;
        keywords.add(current);    // "garden" → ["g", "ga", "gar", "gard", "garde", "garden"]
      }
    });
  });
  return Array.from(keywords);
}
```

### 8.2 Firestore Query

Navbar search uses `array-contains` on the prefix array:
```ts
query(
  collection(db, "services"),
  where("searchKeywords", "array-contains", term.toLowerCase()),
  limit(6)
)
```

This enables type-ahead: typing "gar" matches any service with "garden" in keywords.

### 8.3 Client-Side Filtering

ServicesPage does a secondary local filter after cache load:
```ts
filtered.filter(s =>
  s.title.toLowerCase().includes(query) ||
  s.slug.toLowerCase().includes(query) ||
  s.categorySlug.toLowerCase().includes(query) ||
  s.searchKeywords.some(k => k.includes(query))
);
```

**For products app:** Same approach. Generate `searchKeywords` on product create/update. Use `array-contains` for navbar search, local filter for catalog page.

---

## 9. Cart & Checkout Flow

### 9.1 Cart (Firestore-backed, Optimistic UI)

File: `src/context/CartContext.tsx`

```
Storage: users/{uid}/cart/{serviceId}  (subcollection)
```

Operations:
- **addToCart:** Optimistic state update → Firestore `setDoc` → rollback on error
- **removeFromCart:** Optimistic remove → Firestore `deleteDoc` → rollback on error
- **clearCart:** Optimistic clear → batch `deleteDoc` all items → rollback on error
- **Cart loads** on `user` change via `useEffect`

Cart item shape:
```ts
{ serviceId, title, price, slug, locationId, addedAt }
```

**No quantity field** — services are unique (you don't book "2x plumbing"). Products app needs `quantity`.

### 9.2 Checkout Flow

File: `src/pages/Checkout.tsx`

1. User fills form: name, phone, address (house/area/landmark/city/pincode/full), date, time
2. **Validation:** All required fields, location selected, no location mismatch in cart
3. **Server-side price verification:** For each cart item, re-reads service doc from Firestore and resolves location-specific price. Prevents stale-price orders.
4. **Atomic batch write:** All bookings created in single `writeBatch` — all succeed or none
5. **Clear cart** after successful batch commit
6. **Email notification** (non-blocking) — fires `sendOrderNotification()` per booking
7. Navigate to `/booking-success/{bookingId}`

**Payment:** Cash on Delivery only. No payment gateway integration yet.

**For products app:** Same flow structure. Add quantity handling, inventory check, and eventually payment gateway (Razorpay/Stripe). The batch write pattern and server-side price verification are reusable.

---

## 10. Image Upload (Cloudinary)

File: `src/lib/cloudinary.ts`

**Unsigned upload** via upload preset (no server needed):

```ts
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageWithProgress = (file, onProgress?) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  xhr.send(formData);
  
  // Returns: { secure_url, public_id, width, height, bytes, format }
};
```

Used by admin panel's `ImageUploader` component for service/blog images.

**For products app:** Same Cloudinary setup. Same upload preset. Images go to same Cloudinary account.

---

## 11. Notification System

### 11.1 Real-time Order Notifications (Admin)

File: `src/hooks/useOrderNotifications.ts`

Uses Firestore `onSnapshot` listener on recent bookings:
```ts
query(
  collection(db, "bookings"),
  where("createdAt", ">=", fiveMinutesAgo),
  orderBy("createdAt", "desc")
)
```

- Plays audio chime via Web Audio API on new booking (no sound file needed)
- Tracks seen/unseen state locally
- Only shows notifications from last 5 minutes
- Used in admin header bell icon

### 11.2 Email Notifications

See section 5.1 — Resend API via serverless function.

---

## 12. Category System

File: `src/lib/categories.ts`

Categories are flexible with alias matching:
```ts
const SECTION_ALIASES = {
  cleaning: ["cleaning", "home-cleaning", "deep-cleaning"],
  gardening: ["gardening", "garden", "plant", "landscaping", "flying-mali"],
  mechanic: ["mechanic", "bike-service", "vehicle-service"],
  // ...
};
```

Functions:
- `normalizeCategory(id, raw)` — safe parse from Firestore
- `matchesCategory(category, ...slugs)` — fuzzy match via aliases
- `inferCategorySectionKey(slug, name)` — map to icon/section
- `expandCategoryAliases(value)` — get all aliases for a slug

**For products app:** Build a `productCategories.ts` with your own category taxonomy. The alias pattern is reusable if you need fuzzy slug matching.

---

## 13. Data Normalization Pattern

Every Firestore collection has a `normalize*` function that safely parses raw Firestore data:

```ts
// Pattern used everywhere
function normalizeService(id: string, raw: Record<string, any>): ServiceEntry {
  return {
    id,
    title: String(raw.title || "Untitled").trim(),
    price: typeof raw.price === "number" ? raw.price : Number(raw.price) || 0,
    images: Array.isArray(raw.images) ? raw.images.filter(Boolean) : [],
    // ... every field gets type-safe default
  };
}
```

Why: Firestore is schemaless. Admin can write bad data, old documents may lack new fields. Normalizers guarantee TypeScript types match runtime values.

Files:
- `src/lib/services.ts` — `normalizeService()`
- `src/lib/categories.ts` — `normalizeCategory()`
- `src/lib/blogs.ts` — `normalizeBlog()`

**For products app:** Build `normalizeProduct()` with same defensive pattern. Never trust raw Firestore data.

---

## 14. SEO & Prerendering

### 14.1 useSeo Hook

File: `src/hooks/useSeo.ts`

Sets document title, meta description, canonical URL, OG tags dynamically per page.

### 14.2 Prerender Script

File: `scripts/prerender.mjs`

Generates static HTML for key routes at build time (Home, Services, About, etc.) for SEO crawlers.

---

## 15. Shared Infrastructure Checklist

When building products app on same Firebase project:

### Must Share (Same Config)
- [ ] Firebase project (same `VITE_FIREBASE_*` env vars)
- [ ] Firebase Auth (same users, same custom claims)
- [ ] `users/{uid}` collection (same profiles)
- [ ] `users/{uid}/addresses/{id}` subcollection
- [ ] Cloudinary account (same `VITE_CLOUDINARY_*`)
- [ ] Resend API (same email sending, different templates)
- [ ] `api/set-role.ts` (role management — copy or share)

### Must Create New
- [ ] `products/{id}` collection + Firestore rules
- [ ] `orders/{id}` collection + Firestore rules (replaces `bookings`)
- [ ] `users/{uid}/cart/{productId}` — add `quantity` field, update rules
- [ ] `productCategories/{id}` collection (or reuse `categories` with a `type` field)
- [ ] `api/notify-order.ts` clone with product-specific email templates
- [ ] Product cache (`productCache.ts` — same pattern as `serviceCache.ts`)
- [ ] Product normalizer (`normalizeProduct()`)
- [ ] Firestore indexes for new collections
- [ ] Firestore rules for new collections

### Can Copy & Adapt
- [ ] `src/lib/firebase.ts` — identical
- [ ] `src/context/AuthContext.tsx` — identical
- [ ] `src/context/LocationContext.tsx` — identical (if location-aware)
- [ ] `src/context/CartContext.tsx` — add quantity, change serviceId→productId
- [ ] `src/lib/locationContent.ts` — generic, reusable as-is
- [ ] `src/lib/locations.ts` — identical
- [ ] `src/lib/cloudinary.ts` — identical
- [ ] `src/lib/notifications.ts` — adapt payload for products
- [ ] `src/auth/*` — identical phone auth system
- [ ] `src/components/auth/AuthLogin.tsx` — identical (change branding)
- [ ] Firestore rules helper functions — copy `isSignedIn()`, `isAdmin()`, etc.

### Architecture Decisions

| Decision | AfixZ Choice | Reasoning |
|----------|-------------|-----------|
| State management | React Context (no Redux) | Simple enough for auth + cart + location |
| Data fetching | Direct Firestore SDK (no React Query) | Works with optimistic UI pattern |
| Caching | Custom in-memory with TTL | Avoids library overhead, 5-min TTL sufficient |
| Image storage | Cloudinary unsigned upload | No server needed, CDN transforms built-in |
| Email | Resend API via Vercel function | Simple, cheap, good deliverability |
| Search | Firestore `array-contains` prefix | No Algolia needed at current scale |
| Payment | COD only | No payment gateway yet |
| Hosting | Vercel (SPA + API routes) | Free tier, edge CDN, cron jobs |

---

## 16. Firestore Rules Template for Products App

Starting point — adapt `validProduct` and `validOrder` for your schema:

```
// Add to existing firestore.rules or create new rules file

match /products/{productId} {
  allow read: if true;
  allow create, update: if isAdmin() && validProduct(request.resource.data);
  allow delete: if isAdmin();
}

match /orders/{orderId} {
  allow create: if isSignedIn() && validOrder(request.resource.data);
  allow read: if isSignedIn()
    && (request.auth.uid == resource.data.userId || isAdmin() || isProvider());
  allow update: if isAdmin()
    || (isProvider() && /* restrict to status fields only */);
  allow delete: if isAdmin();
}

// Cart: reuse users/{uid}/cart/{itemId} — update validCartItem for products
```

---

## 17. File Map (What to Copy)

```
COPY AS-IS:
  src/lib/firebase.ts
  src/lib/locations.ts
  src/lib/locationContent.ts
  src/lib/cloudinary.ts
  src/context/AuthContext.tsx
  src/context/LocationContext.tsx
  src/auth/phone/config.ts
  src/auth/phone/providers.ts
  src/components/auth/AuthLogin.tsx
  src/hooks/useRequireAuth.ts
  src/hooks/useSeo.ts
  api/set-role.ts

COPY & ADAPT:
  src/context/CartContext.tsx          → add quantity, productId
  src/lib/serviceCache.ts             → rename to productCache.ts
  src/lib/services.ts                 → rename to products.ts, new schema
  src/lib/notifications.ts            → adapt payload
  src/pages/Checkout.tsx              → adapt for products + quantities
  api/notify-order.ts                 → product email templates
  firestore.rules                     → add product/order rules
  firestore.indexes.json              → add product/order indexes

DO NOT COPY (service-specific):
  src/lib/categories.ts               → build product categories fresh
  src/lib/blogs.ts                    → only if products app has blog
  src/features/subscriptions/*        → service-specific
  api/generate-visits.ts              → subscription-specific
```

# AfixZ Interview Overview

## Project Summary

AfixZ is a full-stack web application built for the local services space. The idea behind the project is to make premium home and lifestyle services easier to discover, book, manage, and operate.

From the customer side, the app lets users browse services, choose their location, add services to a cart, place bookings, and manage recurring plans like garden care subscriptions.

From the business side, the same project also includes:

- an admin dashboard to manage services, categories, blogs, users, subscriptions, and store data
- a provider dashboard where service professionals can claim jobs and mark them as completed
- backend automation for recurring subscription visits
- security rules and server-side protections around booking, pricing, roles, and API access

This project is a good example of my full-stack skills because I handled frontend experience, backend logic, database design, security hardening, performance optimization, operational tooling, and deployment structure in one system.

## What Problem This Project Solves

Local services are often fragmented. Customers struggle to find trusted professionals, compare offerings, and book reliably. On the operations side, teams need a way to manage orders, service content, provider workflows, and recurring visits without relying on multiple disconnected tools.

AfixZ solves that by combining:

- a service marketplace
- booking and checkout flows
- city-based service availability and pricing
- recurring subscription logic
- internal dashboards for admins and providers
- content and SEO tooling for growth

## My Role In This Project

I built this as a full-stack product, not just a frontend demo. My work covered:

- designing the app architecture
- building the React frontend
- modeling Firestore collections and access patterns
- setting up authentication and role-based access
- writing Firestore security rules
- building Vercel serverless APIs
- adding rate limiting and abuse protection
- handling transactional notifications
- optimizing performance and SEO
- preparing admin and provider workflows

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React icons

### Backend and Infrastructure

- Firebase Authentication
- Firestore
- Firebase Admin SDK
- Vercel Serverless Functions
- Vercel Cron Jobs

### Supporting Services

- Cloudinary for image uploads
- Resend for transactional email
- Upstash Redis for distributed rate limiting
- Vercel Analytics
- Vercel Speed Insights

## Main Product Features

### 1. Customer Service Marketplace

Customers can:

- browse services by category
- open detailed service pages
- see city-specific content and pricing
- search services
- add services to cart
- place bookings online

The current live payment model for service bookings is `Cash on Delivery (COD)`.

### 2. Location-Aware Experience

The app supports different cities such as Delhi, Noida, and Gurgaon.

This is not just a UI filter. The location system affects:

- service availability
- price overrides
- homepage content
- booking validation

That means the app behaves differently based on the city the user selects, while still using one shared codebase.

### 3. Subscription System

The project includes recurring garden care plans. Users can subscribe to maintenance plans and the system tracks visit schedules over time.

Important implementation details:

- subscriptions are stored separately from one-time bookings
- visit bookings are pre-created when a subscription is made
- status changes like pause or cancel can cascade to visit bookings
- there is also a cron-based legacy support flow for older subscriptions

This shows I worked on product logic beyond simple CRUD screens.

### 4. Admin Dashboard

The admin area allows internal teams to manage:

- services
- all services list
- bookings and orders
- subscriptions
- users
- roles
- blog content
- homepage content
- store products and product categories

This part of the project demonstrates CMS-style tooling, operations thinking, and role-restricted internal product design.

### 5. Provider Dashboard

Service providers have their own dashboard where they can:

- view active jobs
- group jobs by customer
- claim bookings
- confirm jobs
- mark work as completed

This creates a real workflow between customers, the business team, and providers.

### 6. Blog and SEO System

The application includes a blog section and SEO infrastructure to help with discoverability.

That includes:

- SEO metadata per page
- SEO fields for blog posts
- prerendering for public routes
- sitemap generation
- structured metadata support

## How Payments Are Handled

It is important to describe this honestly.

For the service booking flow in this codebase, payments are currently handled as `Cash on Delivery (COD)`. The checkout flow captures the booking, validates the price, stores the order, and sends confirmation notifications, but it does not yet integrate a card, wallet, or UPI payment gateway.

So the strength here is not gateway integration yet. The strength is:

- secure booking creation
- price validation before order creation
- order persistence in Firestore
- email notification flow
- clean system design that could later support Razorpay or Stripe

There is also a separate store-oriented data model in the project, including `products`, `productCategories`, and `productOrders`, which shows the system is being extended beyond services.

## Security and Backend Protection

One of the strongest parts of this project is that the backend is not trusting the frontend blindly.

### 1. Firestore Security Rules

The app uses detailed Firestore rules to control who can read and write data.

These rules protect:

- user profiles
- carts
- addresses
- bookings
- subscriptions
- services
- blogs
- products
- product orders

The rules validate:

- allowed fields
- required fields
- data types
- ownership
- roles
- allowed status transitions
- location validity
- price integrity

This is important because Firestore is schemaless by default, so security has to be enforced intentionally.

### 2. Role-Based Access Control

The system uses Firebase custom claims for roles such as:

- `user`
- `provider`
- `admin`

Protected routes on the frontend and protected APIs on the backend both rely on these roles.

There is also an admin-only role management API that updates both:

- Firebase Auth custom claims
- Firestore user profile role values

### 3. Authenticated API Access

Sensitive APIs use token-based checks.

For example:

- `api/set-role.ts` verifies admin access before changing claims
- `api/notify-order.ts` verifies the caller before sending emails
- `api/generate-visits.ts` requires cron or secret-based authorization

This helps prevent unauthorized access to server-side actions.

### 4. App Check

The Firebase client setup includes Firebase App Check with reCAPTCHA v3 support.

That helps reduce abuse such as:

- bot traffic
- automated misuse of Firebase resources
- scraping and quota-drain attacks

### 5. Security Headers

The Vercel deployment is configured with security headers such as:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`

This adds another layer of browser-side hardening.

### 6. Input Sanitization and Payload Limits

The backend also includes defensive checks like:

- HTML escaping for outbound email content
- request size limits on APIs
- method restrictions
- controlled CORS behavior for specific endpoints

This reduces common abuse vectors and prevents APIs from being used as open relays.

## Rate Limiting and Abuse Prevention

The project includes reusable rate limiting logic in the backend.

### How It Works

- It uses Upstash Redis when environment variables are configured
- It falls back to in-memory limiting if Redis is not available
- It sets rate limit headers like:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `Retry-After`

### Where It Is Used

- `notify-order` API to prevent email spam
- `set-role` API to prevent role-management abuse
- `generate-visits` API to prevent repeated trigger abuse

This is one of the parts that shows backend maturity, because the project does not assume internal APIs are automatically safe.

## Caching and Performance Optimization

I also spent effort on performance and cost control.

### 1. In-Memory Data Caching

The app caches services and categories in memory on the client side with a time-to-live of 5 minutes.

This helps reduce repeated Firestore reads and improves page responsiveness.

### 2. Request Deduplication

If multiple components request the same data at the same time, the code reuses the same in-flight promise instead of sending duplicate reads.

This avoids unnecessary network traffic and duplicate Firestore usage.

### 3. Lazy Loading

The route structure uses lazy loading for pages and large feature areas, including:

- public pages
- admin pages
- provider pages
- footer and modal components

This keeps the initial bundle smaller and improves first load performance.

### 4. Prerendering for SEO and Speed

The build process runs a prerender script after the Vite build.

This generates static HTML for important public routes such as:

- home
- services
- about
- blogs
- garden care
- privacy
- terms
- category pages
- published blog pages

This improves both SEO and perceived loading performance.

### 5. Asset Caching

Static assets are configured with long-lived cache headers in Vercel:

- `Cache-Control: public, max-age=31536000, immutable`

That helps browsers reuse already-downloaded assets efficiently.

### 6. Monitoring and Insights

The project uses:

- Vercel Analytics
- Vercel Speed Insights

This shows a production mindset, where performance is measured rather than guessed.

## Data and Architecture Decisions

A few design choices in this project are worth highlighting:

### React Context Instead of Heavy Global State

I used focused React contexts for:

- authentication
- cart
- location

This kept the architecture simpler and easier to reason about than introducing a heavier state library too early.

### Defensive Firestore Normalization

Because Firestore is schemaless, the app uses normalization functions when reading content such as services and categories.

This protects the UI from malformed or incomplete data and makes runtime behavior more predictable.

### Atomic Writes for Important Flows

The checkout flow and subscription creation logic use batched writes where needed so that related records are created consistently.

This matters when a user action should either fully succeed or fully fail.

### Shared Multi-Role Architecture

Instead of building separate apps for every user type, I designed a single codebase that supports:

- public users
- logged-in customers
- providers
- admins

That demonstrates architectural planning and role separation inside one product.

## What This Project Says About My Skills

This project shows that I can work across the full stack, including:

- building modern React interfaces
- structuring a TypeScript codebase
- designing Firestore data models
- writing backend APIs
- implementing authentication and authorization
- securing serverless functions
- using caching and rate limiting effectively
- thinking about operational workflows, not just screens
- optimizing SEO and frontend performance
- designing systems that can grow from MVP to a more complete platform

## Honest Limitations and Current Scope

To keep this recruiter-friendly and technically honest, these are the current boundaries:

- service bookings currently use `COD`, not a live payment gateway
- there is store infrastructure in the project, but the strongest completed customer flow is still the service-booking side
- some backend protections use a production-grade Redis path and a local fallback path, so full strength depends on deployment configuration

I prefer documenting these clearly because it shows product judgment and engineering honesty.

## Short Interview Summary

If I had to explain AfixZ in one paragraph during an interview, I would say:

> AfixZ is a full-stack local services platform I built using React, TypeScript, Firebase, Firestore, and Vercel. It supports customer bookings, city-aware services, recurring subscriptions, admin operations, and provider job handling. I also implemented Firestore security rules, role-based access control, serverless APIs, Redis-backed rate limiting, App Check, caching, prerendering, and SEO tooling, so the project demonstrates both product building and production-minded engineering.

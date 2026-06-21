# AfixZ

AfixZ is a full-stack web application for premium local services. It helps customers discover services, book them online, manage subscriptions, and interact with a location-aware service catalog. The same codebase also includes admin tools, provider workflows, and an in-progress store module.

## Main Docs

- Interview-friendly technical overview: [INTERVIEW_README.md](C:\Users\Mohit\OneDrive\Desktop\afixz\INTERVIEW_README.md)
- Internal implementation notes: [TECH_HANDOFF.md](C:\Users\Mohit\OneDrive\Desktop\afixz\TECH_HANDOFF.md)

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router
- Backend: Firebase Authentication, Firestore, Firebase Admin
- Serverless: Vercel Functions, Vercel Cron
- Media: Cloudinary
- Email: Resend
- Observability: Vercel Analytics, Vercel Speed Insights
- Rate limiting: Upstash Redis with in-memory fallback

## What This Repo Includes

- Customer-facing service marketplace
- Cart and checkout flow for service bookings
- Garden care subscription system
- Admin dashboard for content and operations
- Provider dashboard for job claiming and completion
- Product/store management foundation
- Blog and SEO content system

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build step runs Vite and then prerenders important public pages for better SEO.

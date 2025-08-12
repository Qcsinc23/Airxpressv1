# Architecture

**Stack**: Next.js 15 (App Router), TypeScript, Tailwind (shadcn/ui), Convex (serverless DB + functions), Clerk (auth + billing), Vercel (hosting), Stripe (per-booking payments), S3/Blob (docs).

## High-Level Diagram

```mermaid
graph TD
A[Client (SSR/Suspense)] --> B[Next.js App Router]
B --> C[Convex Client]
C --> D[Convex Functions]
D --> E[Convex Storage/DB]
B --> F[Clerk Auth]
B --> G[Stripe Checkout]
D --> H[S3/Blob Storage]
D --> I[Tender Adapters (Partner/IATA/Airline APIs)]
B --> J[Public Tracking Route]

Domains

Quoting: inputs → rating engine → lane options → booking.

Booking: docs upload, payment, dispatch schedule.

Tender/Tracking: handoff to partner IAC/airline; polling or webhook events.

Programmatic SEO: Convex-backed CMS for lane/location pages.

Routing

Public: /, /quote, /lanes/[slug], /locations/[slug], /tracking/[id|awb], /docs/*

Auth: /dashboard (user), /dashboard/ops (ops), /dashboard/admin/* (admin)

State

Minimal client state; prefer server components + Convex live queries.

Security

Role-based gates in middleware.

PII masked in logs; documents in private storage; signed URLs.

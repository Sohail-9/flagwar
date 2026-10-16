# Dollar War (Flag War) ⚔️

A viral territory-backing competitive war board built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Upstash Redis Sorted Sets**, **PostgreSQL Ledger**, and **Stripe Checkout + Razorpay UPI**.

Based on the official blueprint by **@lolsec**:
- Live ranked board driven by Redis sorted sets (`ZINCRBY` and `ZREVRANGE`).
- Source of truth in an append-only payment ledger: never store a score, compute it from paid rows.
- Real-time updates pushed over Server-Sent Events (SSE).
- Viral referral loops with `/t/[slug]?ref=[slug]` and auto-generated OpenGraph preview cards (`next/og`).
- Season countdown and permanent static freeze to Hall of Fame.

---

## 🚀 Quick Start

### 1. Install & Run Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Zero-Config Ready**: Dollar War features an automatic local file ledger and sorted-set engine. It works immediately out of the box with zero external dependencies required for testing!

### 2. Connect Production Services (Optional)
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```
- **Supabase / Postgres**: Set `DATABASE_URL` (run `src/lib/schema.sql` in Supabase SQL editor).
- **Upstash Redis**: Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- **Stripe**: Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- **Razorpay (India UPI)**: Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.

---

## 🏛️ Architecture & The 8 Build Steps

1. **Waitlist Test (Demand Validation)**:
   - Dedicated tab on the homepage: 500 pre-commit goal meter.
   - Live counter per place with email pre-commit records (`/api/waitlist`).

2. **Data Model**:
   - `teams`: id, name, slug, type (country, state, city), code, flag, region.
   - `payments`: id, provider, provider_session_id (UNIQUE), team_id, amount_cents, status, contributor_name, handle, message, referral_slug, created_at.
   - Scores are computed from paid rows, never stored directly.

3. **Seeded Teams**:
   - ~195 sovereign countries with ISO-2 codes and flags.
   - All 28 Indian states + 8 UTs with regional emblems.
   - 50+ major global & tech cities (New York, Tokyo, London, Bengaluru, Mumbai, Dubai, San Francisco, etc.).

4. **Checkout**:
   - Stripe Checkout session creation (`/api/checkout/stripe`) with `team_id` in metadata.
   - Razorpay order creation (`/api/checkout/razorpay`) with INR conversion and UPI support.
   - Instant Sandbox Demo (`/api/checkout/demo`) for one-click live testing with confetti!

5. **Signed Webhooks**:
   - Stripe Webhook (`/api/webhooks/stripe`): verifies signature, inserts into `payments` table (guarded by unique `provider_session_id`), executes `ZINCRBY`, and pushes SSE update.
   - Razorpay Webhook (`/api/webhooks/razorpay`): verifies HMAC-SHA256 signature, inserts payment once, executes `ZINCRBY`.

6. **Live Board & SSE Stream**:
   - `/api/board`: loads top 50 from Redis, #1 reign duration, and last 20 contributions.
   - `/api/stream`: Server-Sent Events stream delivering real-time contributions, rank movements, and throne takeovers.

7. **Viral Share Loop**:
   - Team war room pages at `/t/[slug]`.
   - Dynamic OpenGraph preview image generated on edge via `next/og` (`/api/og?slug=[slug]`).
   - One-click referral link generation (`?ref=[slug]`) and share integrations for X/Twitter, WhatsApp, and Telegram.

8. **Season End & Freeze**:
   - Fixed timestamp server validation rejecting payments once season ends.
   - `/api/season/freeze` exports static HTML Hall of Fame snapshot for Cloudflare Pages / R2 / Internet Archive.

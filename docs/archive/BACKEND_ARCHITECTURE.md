# Arena Laserplex Backend Architecture

**Status:** Architecture proposal only. No application code, dependencies, migrations, or infrastructure have been added.

## Section 1 — Final tech stack

| Area | Recommendation | Reason |
|---|---|---|
| Web application | Existing Next.js 15 App Router + TypeScript, deployed to Vercel | Preserves the stable UI, supports server-rendered public content, Server Actions, and Route Handlers. |
| Database | PostgreSQL on Neon, in a region close to the application and venue | Relational constraints and transactions fit seat inventory and booking requirements; managed backups and pooling reduce operations burden. |
| ORM and migrations | Prisma ORM | Type-safe queries, schema migrations, and integration with the existing TypeScript application. Use a pooled runtime connection and a direct migration connection. |
| Authentication | Better Auth with database-backed sessions and Prisma integration | Supports email/password and session management without a custom password/session implementation. Use one authentication system. |
| Validation | Zod | Shared input schemas with runtime validation at every server trust boundary. |
| Admin CRUD | Server Actions calling server-only domain services; Route Handlers for webhooks and external clients | Keeps mutations close to the existing App Router UI while ensuring authorization and validation are server-side. |
| File storage | Cloudflare R2 via the S3-compatible API | Stores uploaded posters, event/news imagery, and other owned assets outside the application bundle. Persist object keys, not arbitrary client URLs. |
| Email | Resend for verification, password reset, and booking notices | Managed transactional email with a small TypeScript integration. |
| Payment (when online payment is enabled) | Stripe Checkout and signed webhooks | Hosted checkout avoids handling raw card data; package installation is deferred until payment is in scope and provider availability is confirmed for the venue. |
| Deployment | Vercel for Next.js; Neon for PostgreSQL; Cloudflare R2 for media | Managed services align with the app stack. Configure secrets per environment, backups, logs, health checks, and a tested restore procedure. |

TMDB remains a server-side movie metadata provider. Its key is never exposed to the browser. Arena Laserplex’s database owns local publication state, showtimes, screens, prices, and booking data. Provider-specific integrations must remain behind server services.

## Section 2 — Database schema

Use UUID primary keys for application entities, UTC `timestamptz` for instants, an explicitly configured IANA venue time zone for schedules, and ISO 4217 currency codes. Monetary values use integer minor units, not floating-point numbers. Foreign keys, unique constraints, checks, and transactions enforce invariants in the database.

### Tables and fields

| Table | Proposed fields and constraints |
|---|---|
| `User` | `id` PK; normalized `email` UNIQUE NOT NULL; `name`; `role` ENUM `ADMIN`/`CUSTOMER` NOT NULL DEFAULT `CUSTOMER`; `status` ENUM `ACTIVE`/`DISABLED`; `emailVerifiedAt`; `createdAt`; `updatedAt`. Public registration cannot set role or status. |
| `Session` | Better Auth-managed session ID PK; `userId` FK; unique session token; expiration and timestamps. Revoke sessions when disabling an account or changing privileges. |
| `Account` | Better Auth-managed account ID PK; `userId` FK; provider/account identifiers and provider-managed credential fields. Do not copy password hashes into application-owned tables. |
| `Verification` | Better Auth-managed verification ID PK; identifier, token, expiry, timestamps. Used for email verification and reset flows as supported by the configured provider. |
| `Movie` | `id` PK; nullable `tmdbId` UNIQUE; `slug` UNIQUE; title; overview; poster/backdrop asset key or TMDB path; runtime minutes; release date; original language; status `DRAFT`/`PUBLISHED`/`ARCHIVED`; `publishedAt`; optional `createdById` FK; `createdAt`; `updatedAt`. TMDB metadata is not the local publication state. |
| `Screen` | `id` PK; `code` UNIQUE (`L`, `XL`); name; capacity; active flag; timestamps. Seed the L Screen and XL Screen only after the actual venue capacities are verified. |
| `Seat` | `id` PK; `screenId` FK; row label; seat number; type (e.g. standard/accessibility, based on verified venue layout); active flag. UNIQUE `(screenId, rowLabel, seatNumber)`. |
| `Showtime` | `id` PK; `movieId` FK; `screenId` FK; start/end UTC instants; status `SCHEDULED`/`CANCELLED`/`COMPLETED`; price in minor units; currency; timestamps; optional creator FK. Require end after start. Reject overlapping scheduled showtimes on a screen, preferably with a PostgreSQL exclusion constraint as well as service validation. |
| `ShowtimeSeat` | `id` PK; `showtimeId` FK; `seatId` FK; status `AVAILABLE`/`HELD`/`BOOKED`/`BLOCKED`; nullable `holdExpiresAt`; nullable `bookingId` FK; timestamps. UNIQUE `(showtimeId, seatId)`. One row is materialized for each eligible seat when a showtime is created. |
| `Booking` | `id` PK; unique public `bookingReference`; `userId` FK; `showtimeId` FK; status `PENDING_PAYMENT`/`CONFIRMED`/`CANCELLED`/`EXPIRED`/`REFUNDED`; subtotal, discount, tax, total as integer minor units; currency; optional `promotionId` FK; unique `(userId, idempotencyKey)`; hold expiry; timestamps. |
| `BookingSeat` | `id` PK; `bookingId` FK; `showtimeSeatId` FK; immutable seat label and price snapshot. UNIQUE `(bookingId, showtimeSeatId)`. Historical rows are retained after cancellation/refund. |
| `Event` | `id` PK; unique `slug`; title; category; summary; body; optional media asset key; start/end instants and venue time zone; optional `screenId` FK; status `DRAFT`/`PUBLISHED`/`CANCELLED`/`ARCHIVED`; `publishedAt`; optional author FK; timestamps. If end is present, require end after start. |
| `News` | `id` PK; unique `slug`; title; excerpt; body; category; optional media asset key; status `DRAFT`/`PUBLISHED`/`ARCHIVED`; featured flag; `publishedAt`; optional author FK; timestamps. Published rows must have `publishedAt`. |
| `Promotion` | `id` PK; optional unique code; name; description; discount type `PERCENT`/`FIXED`; value; start/end; status `DRAFT`/`ACTIVE`/`EXPIRED`/`DISABLED`; optional usage limits, per-user limit, minimum spend; timestamps. Enforce valid value and date range. |
| `PromotionRedemption` | `id` PK; `promotionId`, `bookingId`, and `userId` FKs; redeemed time; discount snapshot. UNIQUE `(promotionId, bookingId)`; enforce usage limits transactionally. |
| `Payment` *(introduced with online payments)* | `id` PK; `bookingId` FK; provider; unique provider reference; amount/currency; state `PENDING`/`SUCCEEDED`/`FAILED`/`REFUNDED`; timestamps. Never store card numbers, CVV, or payment credentials. |
| `AuditLog` *(recommended for admin changes)* | `id` PK; nullable actor FK; action; entity type and ID; timestamp; request/correlation ID; filtered metadata. Never log passwords, tokens, or payment secrets. |

### Relationships and ERD description

```text
User 1 ─── * Booking * ─── 1 Showtime * ─── 1 Movie
                     │               │
                     │               ├── 1 Screen 1 ─── * Seat
                     │               │                   │
                     │               └── * ShowtimeSeat * ┘
                     └── * BookingSeat * ─── 1 ShowtimeSeat

Movie * ─── * Genre              (through MovieGenre, if genre filtering is persisted)
User 1 ─── * Event                (author, optional)
User 1 ─── * News                 (author, optional)
Promotion 1 ─── * PromotionRedemption * ─── 1 Booking
User 1 ─── * PromotionRedemption
Event * ─── 0..1 Screen
```

`MovieGenre` is an optional join table if local genre filtering is required; it has FKs to `Movie` and `Genre` and a composite unique key `(movieId, genreId)`. An `Event` is not a movie showtime. If event ticketing is introduced, design event sessions and inventory explicitly rather than treating events as movies.

Use `RESTRICT` or soft deletion for screens, seats, movies, and showtimes that have booking history. A user with booking history is disabled, not hard-deleted. A movie with showtimes is archived, not hard-deleted. `ShowtimeSeat` uniqueness and transactional row locking prevent concurrent sale of one seat. The schema must be reviewed against the selected Better Auth version before generating migrations.

## Section 3 — Role system

### Roles and permissions

| Capability | Public / signed out | `CUSTOMER` | `ADMIN` |
|---|---:|---:|---:|
| Browse published movies, events, news, promotions | Yes | Yes | Yes |
| Register/sign in | Yes | Yes | Yes |
| View/edit own profile and booking history | No | Own records only | Own records only |
| Hold seats and create bookings | No | Yes, for eligible showtimes | Only if explicitly permitted as a customer action; admin privilege alone does not grant access to another customer’s account |
| View or modify another user’s bookings | No | No | View/manage through audited admin workflow |
| Create/edit/publish/archive movies, events, news, promotions | No | No | Yes |
| Create/edit/cancel showtimes and manage screens/seats | No | No | Yes |
| Assign roles or provision admins | No | No | Restricted operational process; do not expose through public registration or ordinary profile editing |

### Route and access rules

- Public routes such as `/movies`, `/event`, and `/news` show only published records.
- `/my-account/**` and booking creation/history require an authenticated customer.
- `/admin/**` requires an authenticated `ADMIN`, except `/admin/login`.
- Check authorization in each Server Action, Route Handler, and service method. Middleware or route redirects improve UX but are not the access-control boundary.
- Registration always assigns `CUSTOMER` on the server. Validate ownership on every customer booking/profile query to prevent IDOR.
- Validate all inputs and identifiers at the server boundary; rate-limit authentication and booking endpoints.

## Section 4 — Booking flow

### Customer journey

```text
Movie
  → Showtime (includes the L Screen or XL Screen)
  → Screen seat map / availability
  → Seat selection
  → Server-created temporary seat hold
  → Booking summary and payment, if enabled
  → Confirmation
  → Account booking history
```

1. The customer selects a published movie and a scheduled, bookable showtime.
2. The server loads the selected showtime’s screen and seats. It derives valid seat IDs from that screen’s inventory; client-provided seat labels are never trusted.
3. On hold creation, the server verifies the user, showtime status and time, seat count, and that every requested seat belongs to the showtime’s screen. In one transaction it locks the corresponding `ShowtimeSeat` rows, rejects blocked/booked/unexpired-held rows, and sets all requested rows to `HELD` with a short expiry (recommended 5–10 minutes). Any invalid or unavailable seat rejects the entire selection.
4. The server creates an idempotent `Booking` and `BookingSeat` price/seat snapshots. The booking summary is calculated server-side; submitted prices and discounts are ignored.
5. If online payment is enabled, use hosted checkout. Payment provider calls happen outside database locks. A verified, signed webhook confirms the booking and marks the inventory `BOOKED` in an idempotent transaction.
6. If payment fails, the customer cancels, or the hold expires, release the seat inventory according to the policy. A scheduled worker expires holds; availability reads may also treat expired holds as available but do not replace the worker.
7. Confirmation is shown and sent only after the transaction commits. The customer can view their booking and seats in account history.

Double-booking prevention is enforced in PostgreSQL with unique showtime-seat inventory, row locking or conditional updates, transaction rollback on conflicts, and idempotency keys. Do not rely on disabled buttons or browser state. Add concurrency tests before enabling real reservations.

## Section 5 — Admin workflow

Every action requires server-side `ADMIN` authorization, Zod validation, database transactions where multiple rows change, an audit entry for material changes, and revalidation of affected routes/data.

### Movie management

- **Create:** Enter metadata manually or look it up from TMDB server-side; validate required title/slug and optional TMDB ID; save as `DRAFT`; publish explicitly.
- **Edit:** Update local metadata and publication state; do not overwrite local operational data (screen, schedule, pricing) from TMDB refreshes.
- **Delete:** Use archive/soft-delete for published movies or movies with showtimes/bookings. Permit hard delete only for an unreferenced draft, subject to foreign-key constraints.

### Showtime management

- **Create:** Choose a published movie, verified active L/XL screen, start time, price/currency, and status. Validate duration, venue hours, screen conflicts, and seat map; create `ShowtimeSeat` rows atomically.
- **Edit:** Allow safe changes before sales begin. If seats are held or booked, restrict changes to a documented policy; never silently change the screen or seat map for existing bookings.
- **Delete:** Cancel a showtime rather than hard-delete once seats are held, bookings exist, or payment has started. Release holds and notify/refund affected customers according to policy. Hard-delete only an unused draft schedule.

### Booking management

- **View:** Filter and paginate bookings by date, status, movie, screen, and booking reference. Mask unnecessary personal information; record administrative access where appropriate.
- **Cancel:** Verify policy and payment state, transition status transactionally, release seats only when allowed, initiate provider refund if applicable, and record actor/reason in the audit log. Do not delete booking history.

## Section 6 — Folder structure changes

Proposed additions; preserve existing presentation components and route URLs wherever possible.

```text
prisma/
  schema.prisma
  migrations/
  seed.ts
src/
  lib/
    db.ts                         # Prisma client singleton; server-only
    auth.ts                       # Better Auth configuration; server-only
  server/
    auth/
      guards.ts                   # requireUser / requireRole
    validation/
      user.ts
      movie.ts
      showtime.ts
      booking.ts
      event.ts
      news.ts
      promotion.ts
    repositories/
      movies.ts
      showtimes.ts
      bookings.ts
      events.ts
      news.ts
      promotions.ts
    services/
      movies.ts
      showtimes.ts
      bookings.ts
      events.ts
      news.ts
      promotions.ts
      media.ts
      payments.ts
  app/
    api/
      auth/[...all]/route.ts
      bookings/                    # Only if client/API integration requires it
      webhooks/payments/route.ts   # Add with payment integration
    admin/
      movies/actions.ts
      showtimes/actions.ts
      bookings/actions.ts
      events/actions.ts
      news/actions.ts
      promotions/actions.ts
  jobs/
    expire-booking-holds.ts        # Invoked by a scheduled platform job
    reconcile-payments.ts          # Add with payment integration
```

Production pages and admin tables should read through server services. Existing `src/data/` modules become development/test fixtures and seed input, not production sources. Keep database and provider modules out of client component imports.

## Section 7 — Package installation

### Install for the initial backend foundation

- `prisma` — CLI, schema validation, and migration generation.
- `@prisma/client` — generated, typed database client.
- `better-auth` — authentication and session management.
- `zod` — server-side runtime validation.
- `resend` — transactional email for verification and account recovery.
- `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` — R2/S3 object upload support when media upload is implemented.

### Install when those features are approved for implementation

- `stripe` — only when online payments are enabled and the provider is confirmed as available for the venue.
- A Prisma PostgreSQL driver adapter only if required by the selected Prisma major version or deployment runtime; choose it together with the final Neon connection configuration rather than adding one speculatively.

Pin compatible versions for Next.js 15 and the deployment Node runtime. Do not upgrade Next.js as part of this work. Configure separate pooled runtime and direct migration URLs; keep all secrets in local ignored environment files and deployment secret stores.

## Section 8 — Implementation order

1. **Confirm operational decisions:** Venue IANA time zone and currency; hosting region; verified L/XL capacities and seat maps; booking account requirement; payment/refund policy; provider eligibility.
2. **Prepare environments:** Provision development/staging/production Neon databases and Vercel projects, secrets, connection pooling, backups, logging, and restore procedure.
3. **Install foundation packages:** Add Prisma, Better Auth, Zod, and email support in compatible versions; configure server-only boundaries and scripts.
4. **Design and review schema:** Finalize auth-provider model mapping, enums, foreign keys, delete behavior, booking states, and indexes before creating the first migration.
5. **Create migrations and seeds:** Apply migrations to a fresh database; create repeatable seeds for verified screens/seats, genres, and a controlled initial admin. Do not seed invented venue or pricing data.
6. **Implement repository and service layer:** Add typed read/query functions and validation for movies, events, news, and promotions. Import existing static content with reviewed publication statuses.
7. **Cut over public reads:** Replace static public event/news reads and TMDB-only movie listing with database-backed catalog services; keep TMDB synchronization server-side. Verify rendered public pages and admin lists in staging.
8. **Implement authentication and authorization:** Add registration, sign-in/out, email verification, password reset, session controls, server guards, and role checks. Test account ownership and privilege escalation.
9. **Implement admin CRUD:** Add movie, event, news, and promotion create/edit/publish/archive actions. Add audit logging and revalidation. Replace mock admin records only after each CRUD path is functional.
10. **Implement screen and showtime management:** Add verified seat maps, schedule conflict rules, showtime creation/edit/cancellation, and atomic inventory generation.
11. **Implement booking holds and history:** Add availability, transactional holds, booking summary, account history, hold expiry worker, and concurrency/idempotency tests. Start with payment disabled or in provider sandbox.
12. **Add payment and media uploads:** After provider and storage approval, add hosted checkout, signed webhooks, refunds/reconciliation, and authorized signed uploads.
13. **Production readiness gate:** Verify access control, database backup/restore, rate limits, email delivery, monitoring/alerts, time-zone boundaries/DST, cancellation, failure recovery, and privacy/legal disclosures. Enable real customer bookings only after all booking and payment gates pass.

Use additive migrations and repeatable backfills. Do not migrate mock bookings or customers as real records. Keep fixtures until each database-backed route has been verified in staging. No implementation code is included in this proposal.

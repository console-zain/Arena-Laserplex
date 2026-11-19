# Launch Readiness Audit

**Audit date:** 2026-11-14  
**Scope:** Operational review of the public website, booking system, admin panel, database, authentication, media, SEO, accessibility, and mobile experience.

## Executive summary

The application has substantial working functionality, but it is **not ready to accept real customer bookings**. The project has no scheduled showtimes in its current content, booking confirmation does not collect payment, and there is no verified production backup/restore or deployment process.

Percentages below are approximate implementation-maturity estimates based on the code and available project records. They are not uptime, compliance, penetration-test, or production-environment measurements.

| Area | Estimated completion | Remaining work | Risk before production |
|---|---:|---|---|
| Public website | 80% | Replace preview events/news with approved announcements; replace temporary auditorium reference photos; confirm venue information, legal copy, site URL, and real showtimes. | **High** — current movie detail pages have no scheduled screenings; preview content and third-party reference photos must not be presented as confirmed venue information. |
| Booking system | 42% | Create and verify actual showtimes, prices, currency, time zone, and seat maps; decide whether unpaid reservations are acceptable; define cancellation/no-show policy; add operational hold-expiry monitoring and concurrency tests. | **Critical** — the current database has zero showtimes, and the flow confirms bookings without collecting payment. |
| Admin panel | 72% | Add or approve an admin-change audit trail; test every mutation and access boundary in staging; establish operational access and customer-data handling procedures; add pagination before customer/booking volume requires it. | **High** — admin mutations are role-guarded, but the schema has no audit-log model and several admin lists load all matching records. |
| Database | 68% | Provision isolated production/staging databases; rehearse migrations and restore; configure and verify backups/retention; confirm actual screen and seat layouts, currency, and venue time zone. | **High** — backup/restore configuration is not evidenced. The seed script hard-codes 120 L seats and 240 XL seats and should not be run in production until verified. |
| Authentication | 60% | Decide and implement account verification and recovery policy; verify explicit rate limiting and admin MFA requirements; test session revocation and disabled-user behavior; fix the media route's disabled-admin check before launch. | **High** — Better Auth login and role guards exist, but no email-verification or password-recovery workflow is configured. The media API checks `ADMIN` role without checking active account status. |
| Media system | 70% | Provision production R2 bucket/domain/credentials; verify upload, retrieval, replacement, and deletion end-to-end; document cleanup/retention for abandoned objects. | **Medium–High** — R2 support is implemented but no production bucket or credentials are evidenced. Managed-image rendering also depends on the R2 environment being configured. |
| SEO | 82% | Set the real canonical site origin before build; verify production sitemap/robots and dynamic metadata against published content; confirm titles, descriptions, and social previews. | **Medium** — the site URL defaults to localhost when unset; sitemap generation queries PostgreSQL and can fail if production database access is unhealthy. |
| Accessibility | 62% | Complete keyboard and screen-reader testing, contrast checks, form-error checks, and a WCAG 2.2 AA review; increase seat targets or provide an equivalent accessible selection method. | **High** — useful semantic labels, focus styles, and reduced-motion handling exist, but no conformance audit is recorded; seat buttons are 32px and the map requires horizontal scrolling on narrow screens. |
| Mobile experience | 68% | Test all public, account, booking, and admin routes at small phone widths and with touch/keyboard; validate data tables and seat selection on real devices. | **Medium–High** — the homepage was reviewed at 390px, 768px, and 1440px with no observed horizontal overflow, but that does not verify the entire site. Seat maps use a 42rem minimum width and horizontal scrolling. |

## Findings by area

### Public website — 80%

**In place**

- Public movie, event, and news pages read database records; public queries are intended to expose published content.
- Page-level and global metadata are present, including Open Graph/Twitter metadata on many routes.
- Public content records and homepage rendering require verification against the active database and approved content before launch.

**Remaining work**

- Replace representative event/news entries with approved, fact-checked venue announcements.
- Replace temporary L/XL auditorium reference photographs with verified Arena Laserplex photos, or remove them until approved.
- Create and validate real showtimes before advertising tickets or directing visitors to booking.
- Confirm venue contact details, operating information, privacy wording, and all public copy before launch.

**Risk**

The current events and news are explicitly preview content. The temporary screen photos depict other cinemas. The project review also records zero showtimes, so film pages cannot offer actual screenings yet. Treat these data as staging content until verified.

### Booking system — 42%

**In place**

- Customer-only booking routes and server actions are protected by authentication guards.
- Seat holds last ten minutes. Booking code uses Prisma transactions, row locks, idempotency keys, server-side seat ownership/availability checks, and conditional updates.
- Seat inventory has a unique `(showtimeId, seatId)` constraint.
- Booking summary, confirmation, and customer history use database records; no payment integration is present.

**Remaining work**

- Create real showtimes only after confirming schedules, screen assignments, actual capacity/seat maps, prices, currency, and venue time zone.
- Decide and clearly communicate how customers pay. The current flow confirms a reservation with no payment; do not treat it as a paid ticket workflow.
- Define cancellation, no-show, and customer-support procedures.
- Add a scheduled hold-expiry job or operational alerting. Expired holds are released opportunistically when booking pages/services run; no cron/worker configuration was found.
- Run concurrent booking tests with separate customer accounts against PostgreSQL and verify that exactly one attempt can claim a seat.
- Test boundary conditions, including expired holds, cancelled showtimes, disabled users, retries, and database failures.

**Risk**

There are no showtimes in the recorded database state. More importantly, users can confirm bookings without paying, and there is no email delivery. Keep real customer booking unavailable until the business explicitly accepts a free-reservation process or an approved payment/collection workflow is introduced.

### Admin panel — 72%

**In place**

- Movie, event, news, promotion, and showtime administration is database-backed.
- Dashboard statistics query live database counts; customer and booking views use real user and booking records.
- Admin pages are protected by an admin layout, and server actions generally call `requireAdmin()` before mutations.
- TMDB lookup is performed server-side for movie details.

**Remaining work**

- Establish per-operator accounts and a controlled admin provisioning/deprovisioning process.
- Add or approve audit logging for who changed or cancelled operational records; no `AuditLog` entity or equivalent persistent admin mutation log was found.
- Test every create/edit/publish/archive/cancel action and authorization boundary in staging.
- Add pagination/filters before the unbounded customer and booking queries become operationally large.
- Review customer data visibility, access logging, and support procedures.

**Risk**

The admin surface handles customer identities and booking operations. Role checks exist, but there is no persistent audit trail in the schema. Bulk `findMany` pages may degrade as data grows.

### Database — 68%

**In place**

- PostgreSQL is configured through Prisma with separate `DATABASE_URL` and `DIRECT_URL` settings.
- The schema includes migrations, relational constraints, and indexes for authentication, showtime inventory, bookings, and content.
- The booking service uses database transactions and row-level locks for inventory changes.

**Remaining work**

- Provision separate staging and production databases and confirm the application and migration roles/credentials.
- Configure managed backups/PITR and a documented retention policy; perform a restore rehearsal into an isolated database.
- Review and rehearse production migrations with a recent backup before deployment.
- Verify seat layouts/capacities against the physical venue. `prisma/seed.ts` currently hard-codes 120 L Screen seats and 240 XL Screen seats.
- Decide on an RPO/RTO and document who can initiate database recovery.

**Risk**

No backup schedule, restore drill, or deployment migration automation is evidenced in the project configuration. Do not rely on the seed's current screen capacities as verified venue facts.

### Authentication — 60%

**In place**

- Better Auth uses the Prisma PostgreSQL adapter for email/password accounts and sessions.
- Registration assigns customers by default; the admin promotion script only elevates an already-existing active account.
- Server guards check authentication and active status for customer/admin page access.

**Remaining work**

- Decide whether email verification and password recovery are launch requirements; neither workflow is configured, and no mail provider integration is present.
- Verify Better Auth's production rate limiting and proxy/IP configuration; no explicit application rate-limit configuration was found.
- Decide whether admin MFA or another stronger admin control is required.
- Test disabled-account behavior, session expiration/revocation, registration abuse, and account recovery.
- Update the media API authorization check to reject disabled admins, not just non-admin roles.

**Risk**

The media upload/delete route's local session helper checks only `role === "ADMIN"` and does not check `status === "ACTIVE"`, unlike the shared guards. Email verification, recovery, rate limiting, and admin MFA need explicit production decisions.

### Media system — 70%

**In place**

- Server-side Cloudflare R2 support uploads and deletes image objects; the database stores object keys.
- Uploads enforce a 5MB limit and inspect file content for JPEG, PNG, or WebP.
- Movie images support TMDB paths as a fallback; R2 URLs are allow-listed for Next Image optimization when configured.

**Remaining work**

- Create separate production/staging buckets or clearly separated prefixes and issue least-privilege credentials.
- Configure an HTTPS public image domain and set it before building the app.
- Test full image lifecycle operations, including upload, public retrieval, content update, deletion, and failure handling.
- Decide retention and orphan cleanup for objects whose content records are changed or deleted.
- Replace temporary auditorium images before representing them as venue photography.

**Risk**

R2 configuration is not evidenced as provisioned or tested. If database records contain managed-media keys but production R2 settings are absent or invalid, URL resolution can fail for those pages.

### SEO — 82%

**In place**

- Root metadata, per-page metadata, and dynamic metadata for movie/event/news detail pages are present.
- `src/app/sitemap.ts` generates public static paths and published movie/event/news URLs from PostgreSQL.
- `src/app/robots.ts` allows public crawling and disallows admin, API, account, and booking paths.

**Remaining work**

- Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin in every deployment environment before build.
- Check generated production sitemap and robots output, including representative published and unpublished records.
- Review page titles, descriptions, social images, canonical behavior, and search indexing after deployment.

**Risk**

The configured site URL falls back to `http://localhost:3000`; a missing production value would generate incorrect absolute metadata and sitemap URLs. Sitemap generation depends on a working database connection.

### Accessibility — 62%

**In place**

- The code uses semantic landmarks, form labels, accessible names for seat buttons, status announcements, visible focus styling, and reduced-motion CSS.
- Seat status and seat type legends are present.

**Remaining work**

- Test the full purchase/reservation and admin workflows using keyboard only and at least one screen reader.
- Run automated checks and manual WCAG 2.2 AA reviews for contrast, focus order, error identification, headings, dialogs/menus, and responsive zoom.
- Increase seat controls from 32px or provide an equally usable alternative; verify the map can be operated without relying on color.
- Test mobile seat-map scrolling and focus visibility with assistive technology.

**Risk**

Accessibility signals in source code are positive but are not evidence of conformance. The seat map's small targets and horizontal scrolling need specific testing.

### Mobile experience — 68%

**In place**

- The homepage review records checks at 390px, 768px, and 1440px with no horizontal overflow; the tablet hero issue was corrected.
- The public navigation collapses to a mobile menu.

**Remaining work**

- Extend viewport testing to every public page, sign-in/register, account history, seat selection, summary/confirmation, and all admin tables/forms.
- Test keyboard, touch target size, loading/error states, zoom, and long content on actual mobile browsers.
- Verify the seat map's horizontal-scroll experience and provide clear row/seat context on small screens.

**Risk**

Homepage screenshots do not prove mobile readiness for booking or admin operations. The seat map intentionally has a 42rem minimum width, and admin tables may require horizontal scrolling.

## Production go/no-go

**No-go for real customer bookings** until showtimes and venue inventory are verified, the unpaid-confirmation policy is resolved, production auth/storage/database settings are tested, and backups have been restored successfully in a rehearsal.

**Possible limited public preview:** only after replacing or clearly labeling preview events/news, verifying image rights and venue claims, setting the real site URL, and confirming privacy/contact information.

## Evidence and limits

- Primary implementation sources reviewed: [Prisma schema](../../prisma/schema.prisma), [Better Auth configuration](../../src/lib/auth.ts), [role guards](../../src/server/auth/guards.ts), [booking service](../../src/server/services/bookings.ts), [media service](../../src/server/services/media.ts), [media API route](../../src/app/api/admin/media/route.ts), [site metadata](../../src/app/layout.tsx), [sitemap](../../src/app/sitemap.ts), [robots rules](../../src/app/robots.ts), [seed script](../../prisma/seed.ts), [package scripts](../../package.json), and [.gitignore](../../.gitignore).
- Project configuration contains no `test` script and no application test files were found under `src`.
- `npm run typecheck` passed during this audit.
- No production deployment, external provider credentials, live backup configuration, penetration test, or full accessibility conformance test was verified.

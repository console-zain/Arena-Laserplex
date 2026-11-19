# Portfolio Security Checklist

## Assessment Scope

This is a source-level review of the current Arena Laserplex code for an academic portfolio demonstration, not a penetration test or production certification. Payment providers, infrastructure, legal certification, enterprise controls, ownership handover, and support operations are excluded as requested.

The referenced `Security checklist.pdf` was not present in the workspace. This review follows the checklist categories and individual criteria included in the request. The credential scan covered the current tracked project files, not historical Git commits or deployment settings.

**Status meanings:** PASS = implemented and supported by code evidence; PARTIAL = a control exists but has a material gap; FAIL = a required control is absent or ineffective; NOT APPLICABLE = no such data path or feature is implemented.

## Authentication

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Login | PARTIAL | Better Auth handles sign-in and the action returns a generic invalid-credentials message. The app calls `auth.api.signInEmail()` directly from a Server Action; Better Auth's HTTP-router rate-limit hook is not a substitute for throttling this action, and no app-level sign-in throttle or lockout was found. | Repeated password guessing can consume database/password-hash resources and test credentials. | Add an explicit server-action rate limit with shared storage for a public deployment, and consider account/IP backoff. |
| Register | PARTIAL | Registration is server-side validated and new users receive the customer role, but email verification is not configured, new accounts are active immediately, and no app-level Server Action throttle was found. | Mistyped/unverified addresses and automated signup can create usable accounts or spam the database. | For internet exposure, add signup throttling and verify email before enabling account actions. |
| Sessions | PASS | Better Auth stores sessions in Prisma/Postgres, sets a seven-day expiry with daily refresh, and protected routes reject inactive users. | A stolen session can remain usable until expiry or revocation; cookie behavior also depends on the configured base URL. | Use the HTTPS production `BETTER_AUTH_URL` and verify `Secure`, `HttpOnly`, and `SameSite` cookie attributes in a deployment smoke test. |
| Admin permissions | PASS | Admin pages, server actions, and the media API require the `ADMIN` role and an active user status. | No disabled-admin media access path was identified after the media API guard was aligned with `requireAdmin()`. | Preserve both role and active-status checks on every admin endpoint. |
| Route protection | PASS | Admin pages are wrapped in an admin-only layout; admin server actions check authorization independently. Customer account, booking-summary, confirmation, and history pages are guarded. Seat-map viewing is public by design. | A future route or action could be added without the corresponding guard. | Keep route/action authorization checks as a review requirement for new server endpoints. |

## Authorization

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Customers cannot access admin routes | PASS | Admin pages and actions require the `ADMIN` role; the media API also requires an active admin and validates request origin. | No customer-to-admin access path was found. | Preserve server-side checks; add regression tests for customer and disabled-admin requests if tests are introduced. |
| Customers cannot access other bookings | PASS | Customer booking lookup filters by both booking ID and the authenticated user ID. Summary, confirmation, and booking actions use the current session identity. | No public booking-reference lookup route was found. | Keep ownership filters in data access, not only in UI navigation. |

## Booking Security

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Seat locking | PASS | Hold creation locks the showtime and selected inventory rows in a transaction, checks availability and screen membership, then conditionally updates only available seats. | Contention may return a booking error, but a client-selected seat is not trusted as authoritative. | Retain transactional checks and test concurrent requests if booking logic changes. |
| Double-booking protection | PASS | Seat inventory has a unique `(showtimeId, seatId)` constraint; booking-seat relations are unique; row locks and conditional updates reject competing holds. | No duplicate-seat creation path was identified in the reviewed service. | Preserve database constraints alongside application-level locking. |
| Booking ownership | PASS | Booking creation/confirmation requires an active customer, and confirmation checks that the booking belongs to that user. Customer lookup is scoped to the user's ID. | Unauthorized IDs resolve as not found rather than granting access. | Keep ownership checks in service/data queries if new booking routes are added. |

## Database

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Secrets in repository | PASS | Only `.env.example` is tracked among the checked environment files; it contains blank placeholders. `.env.local` is ignored. No common private-key or API-token patterns were found in the current tracked files. | This does not establish that an older Git commit or an external deployment has never contained a secret. | Keep real values out of Git; rotate any credential discovered in commit history or deployment logs. |
| Environment variables | PASS | Database, auth, TMDB, and R2 credentials are read from server-side environment variables. `BETTER_AUTH_SECRET` is required and checked for a 32-character minimum; the sample environment file contains placeholders. | Incorrect deployment values can still weaken security or break service access. | Configure secrets only in local ignored env files or the deployment secret store; use an HTTPS auth base URL outside development. |
| Prisma setup | PASS | Prisma uses PostgreSQL, environment-provided pooled/direct URLs, committed schema/migrations, and a development client singleton. Raw booking SQL uses parameterized `Prisma.sql` expressions. | No database-level row security or separate least-privilege app roles were assessed; those are beyond this academic-scope checklist. | Continue managing schema changes through migrations; avoid interpolating untrusted SQL fragments. |

## Forms and Input Validation

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Server-side validation | PASS | Login/register, booking, admin mutations, and media endpoints validate on the server before state changes. | Browser-side constraints alone are not relied upon for these operations. | Keep validation at the server boundary even when client-side validation is also present. |
| Zod validation | PASS | Zod schemas are used for credentials, booking inputs, media categories/deletion keys, and movie/showtime/event/news/promotion/settings mutations. | No unvalidated booking or admin form mutation was identified in the reviewed actions. | Add schema validation to any future server action or API body before calling services. |
| Input validation | PASS | IDs, enum values, text fields, prices, dates, and booking seat selections are constrained; booking services re-check seat availability and ownership against the database. | Validation cannot prevent every abuse pattern, such as excessive request volume. | Keep business-rule checks in services and pair public endpoints with suitable rate limits if exposed beyond a demo. |
| Contact form submission | NOT APPLICABLE | The contact form performs browser validation only and explicitly tells the visitor that the message has not been sent; it has no server submission or customer-data storage path. | No server-side contact-data injection or storage path exists in the current implementation. | If a delivery backend is added, validate and bound all fields server-side and add spam controls before collecting messages. |

## Media Uploads

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Admin-only access | PASS | The media API checks request origin, admin role, and active account status before uploads or deletions. | No disabled-admin media write path was identified after the active-status check was added. | Keep these checks in the server endpoint and revalidate them if media routes change. |
| File validation | PASS | Uploads are limited to 5 MB; file signatures are inspected; only JPEG, PNG, and WebP are accepted; declared MIME type must match detected content. Categories are allow-listed and object names use random UUIDs. Deletion keys are constrained to managed category prefixes. | Pixel dimensions are not bounded, so an unusually large-dimension image could still consume browser memory when displayed. | For a public-facing deployment, enforce image dimension/pixel limits and consider image decoding/re-encoding. |

## General Code Security

| Item | Status | Issue | Risk | Recommended Fix |
| --- | --- | --- | --- | --- |
| Exposed credentials | PASS | No obvious hard-coded credentials were found in the current tracked files; secrets are environment-based. | Historical commits and external logs/configuration were not inspected. | Review secret history before publishing the repository and rotate exposed values immediately. |
| Debug code | PASS | No `debugger`, `console.log`, `console.debug`, `eval`, or `dangerouslySetInnerHTML` use was found in the reviewed source. | None identified in the current source scan. | Keep production diagnostics intentional and avoid adding debug-only routes or output. |
| Dangerous routes | PASS | The API route inventory contains the Better Auth handler and admin media route. Admin mutations are guarded; booking pages/actions enforce their intended public/authenticated boundaries. | The media endpoint checks active-admin status; no separate debug or guest-lookup endpoint was found. | Recheck authentication and authorization whenever adding an API route or server action. |
| Console logging | PASS | `console.error`/`console.info` calls are limited to server-side unexpected errors and operational scripts; no credential logging was identified. | Provider/storage error objects can include implementation details in server logs. | Redact credentials and user-submitted values from future logs; keep logs server-side. |

## Final Scores

These are relative scores for the requested project context, not security certifications.

| Score | Result | Rationale |
| --- | ---: | --- |
| **Portfolio Readiness Score** | **90/100** | Strong visible security practices across auth, server validation, booking ownership, inventory locking, Prisma constraints, and upload validation. Focused authentication hardening remains outside the portfolio scope. |
| **Academic Demonstration Score** | **95/100** | Demonstrates meaningful application-level security, including active-admin enforcement on media operations, without requiring payment, enterprise controls, or production operations. |
| **Production Internet Exposure Score** | **68/100** | Not a production-readiness claim: account verification and application-level authentication throttling remain unimplemented. Infrastructure and operational controls were excluded from this score as requested. |


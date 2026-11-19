# Bug Report

**Report date:** 2026-11-14  
**Scope:** Findings from local read-only workflow checks and targeted source review. No features or design changes were made. Findings that were not safely executable are labeled as code-review or staging-verification items.

## Severity definitions

- **Critical** — blocks the primary customer workflow or makes a release unsafe.
- **High** — material security, money, or operational risk; resolve or explicitly accept before public launch.
- **Medium** — significant user friction, accessibility concern, or reliability gap; resolve before broad release where practical.
- **Low** — limited impact or a finding that needs reproduction before classification.

## Critical

### BUG-001 — No scheduled showtimes; movie CTA cannot reach a bookable screening

- **Area:** Public catalogue, showtime selection, booking.
- **Status:** Open — current data/environment blocker.
- **Evidence:** The local homepage displayed a “View Showtimes” CTA for the featured film. The movie detail page showed “No upcoming showtimes are scheduled for this movie yet.” The recorded database review also reports zero showtimes.
- **Impact:** Customers cannot select a screening, seat, or create a booking; the primary purchase/reservation journey stops after movie discovery.
- **Expected:** Approved, future showtimes with verified screens, seat inventory, venue time zone, price, and currency are available before booking CTAs are presented as actionable.
- **Safe verification:** Public pages were read. No showtime was created because the database was not confirmed isolated.

## High

### BUG-002 — A booking can be confirmed without payment or an approved collection policy

- **Area:** Booking and revenue operations.
- **Status:** Decision required — behavior is intentional in the current no-payment scope.
- **Evidence:** Booking summary and confirmation explicitly state that no payment is required; the booking service changes a held booking to `CONFIRMED` without a payment provider.
- **Impact:** If the business expects paid tickets, customers can obtain confirmed reservations without paying. If free reservations are intended, capacity, no-show, and collection procedures still need approval.
- **Expected:** Product/venue owner explicitly approves a no-payment reservation process or keeps customer booking disabled until an approved collection workflow exists.
- **Safe verification:** Source and customer-visible text reviewed; no booking was created.

### BUG-003 — Disabled administrator status is not checked by the media route

- **Area:** Authorization / media upload and deletion.
- **Status:** Open — code-review finding; runtime behavior of an existing disabled session was not exercised.
- **Evidence:** `src/app/api/admin/media/route.ts` accepts a session when `session.user.role === "ADMIN"`; it does not also require `status === "ACTIVE"`. Shared guards do check active status.
- **Impact:** A disabled administrator with a still-valid session may retain upload/delete access through this API.
- **Expected:** Media route authorization enforces both admin role and active status, consistent with the shared server guard.

### BUG-004 — Plain `.env` files are not ignored by Git

- **Area:** Secret handling.
- **Status:** Open — configuration finding.
- **Evidence:** The current `.gitignore` contains `.env.local` and `.env.*.local` exclusions, but no plain `.env` exclusion.
- **Impact:** A developer can accidentally stage database, auth, TMDB, or R2 credentials in a conventional `.env` file.
- **Expected:** Ensure plain `.env` and all production secret files are ignored; inspect repository history and rotate any credentials that may have been committed.

## Medium

### BUG-005 — Booking deep links are not resumed after sign-in or registration

- **Area:** Customer journey.
- **Status:** Open — source-confirmed; successful login was not runtime-tested.
- **Evidence:** Anonymous access to a booking URL ended at `/login`. `loginAction` and `registerAction` redirect to `/my-account` after success rather than returning to the originally requested booking URL.
- **Impact:** Customers who follow a booking link must find their showtime again after creating an account or signing in.
- **Expected:** After authentication, return the customer to the intended authorized route while validating the destination to avoid open redirects.

### BUG-006 — Password recovery is unavailable

- **Area:** Authentication / account access.
- **Status:** Open — user-visible limitation confirmed.
- **Evidence:** Clicking “Forgot password?” displays “Password recovery is not available yet.” No password-reset workflow or email provider configuration was found.
- **Impact:** Customers who forget their password cannot recover access to their account or booking history through the site.
- **Expected:** Provide an approved recovery process or remove the recovery affordance and publish a support route/process before registration is opened publicly.

### BUG-007 — Customers cannot cancel their own bookings

- **Area:** Booking history and cancellation.
- **Status:** Open — source-review finding; no booking existed to test.
- **Evidence:** Customer history displays confirmed bookings and booking references but no cancellation action. The cancellation action found is admin-only.
- **Impact:** Customers must contact staff for a cancellation; the cancellation policy and support load are unclear.
- **Expected:** Decide and publish a customer cancellation policy and support process. The test did not assume that customer self-service is required.

### BUG-008 — Booking times are displayed and interpreted as UTC

- **Area:** Showtime UX / scheduling.
- **Status:** Open — operational configuration risk.
- **Evidence:** Booking and confirmation pages label showtime values as UTC; showtime form/service builds timestamps with a `Z` suffix. No venue time zone is stored on `Showtime`.
- **Impact:** If the venue operates outside UTC, staff may schedule or customers may interpret screenings at the wrong local time.
- **Expected:** Confirm the venue IANA time zone and ensure admin input, stored instants, and customer display use a consistent, explicit policy before creating production showtimes.

### BUG-009 — Login and registration pages have duplicate level-one headings

- **Area:** Accessibility / document outline / SEO.
- **Status:** Open — reproduced in browser snapshots.
- **Evidence:** Both pages render a `PageBanner` (default `h1`) and a `PageHeader` (`h1`). The browser accessibility snapshot showed two level-one headings on each page.
- **Impact:** Screen-reader heading navigation and the page outline have competing primary headings.
- **Expected:** Keep one `h1` per page and use the banner's supported non-heading title variant or adjust the page header semantics.

### BUG-010 — Admin booking cancellation has no confirmation or recorded reason

- **Area:** Admin operations / booking integrity.
- **Status:** Open — source-review finding; action was not submitted.
- **Evidence:** The booking table submits a direct “Cancel” action; no confirmation step or reason field was found. The service releases held/booked seats and marks the booking cancelled. No persistent audit log exists in the schema.
- **Impact:** A misclick can cancel a confirmed booking and release seats without a recorded reason or actor-level audit history.
- **Expected:** Establish a cancellation confirmation/operational review and audit policy before staff use this action on real bookings.

### BUG-011 — Authentication and booking workflows lack an automated application test suite

- **Area:** Release confidence.
- **Status:** Open — project configuration finding.
- **Evidence:** `package.json` has no `test` script; no application test files were found under `src`. The concurrency, session lifecycle, and admin mutation paths were not exercised end-to-end in this run.
- **Impact:** Regressions in auth, seat locking, expiry, cancellation, or role checks may reach production without repeatable detection.
- **Expected:** Add repeatable staging/CI tests for registration/login/logout, authorization, booking concurrency, expiry, cancellation, and admin mutations before enabling real bookings.

### BUG-012 — Rate-limit protection is not explicitly configured or verified

- **Area:** Security / authentication, booking, and media endpoints.
- **Status:** Needs staging verification; absence of project-level configuration is confirmed, effective runtime behavior is not.
- **Evidence:** No explicit application rate-limit configuration was found in the inspected auth, booking, or media code.
- **Impact:** Brute-force attempts, registration abuse, or repeated uploads may not be sufficiently constrained, depending on framework defaults and deployment proxy configuration.
- **Expected:** Verify Better Auth defaults and trusted client-IP handling in the deployed environment; define and test explicit limits for exposed routes where appropriate.

## Low

### BUG-013 — Embedded trailer request failed in the local browser session

- **Area:** Movie detail / third-party media.
- **Status:** Unconfirmed; verify in a supported network environment.
- **Evidence:** The local browser recorded an `ERR_ABORTED` request for the `youtube-nocookie.com` trailer iframe and related player telemetry while navigating away from the movie page.
- **Impact:** Trailer playback may be unavailable in some environments; the failed request may also be caused by test-browser/network restrictions.
- **Expected:** Recheck the trailer from a normal supported browser/network and ensure the surrounding movie page remains usable if the provider is unavailable.

## Passing checks and non-findings

- Public homepage and a movie detail page rendered from the current database.
- Registration form rejected a mismatched password with a clear message; no account was created.
- Anonymous `/admin/dashboard` access ended at `/admin/login`.
- Anonymous account-history and booking-page access ended at `/login`.
- Source review found `requireAdmin()` calls in the inspected admin mutation actions.
- These checks do **not** prove successful authentication, a complete booking, concurrency safety under live load, or the absence of other issues.

## Recommended retest order

1. Resolve the booking policy, showtime availability, and venue schedule/time-zone data.
2. Patch and verify the disabled-admin media authorization gap; close the secret-ignore gap and audit repository history.
3. Run successful customer/admin workflows only in an explicitly isolated staging database.
4. Verify booking concurrency, expiry, and cancellation with test users and non-production inventory.
5. Confirm account recovery and post-login return behavior, then run accessibility and mobile checks on the full workflows.

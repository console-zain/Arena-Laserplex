# Bug Fix and Stabilization Plan

**Date:** 2026-11-14  
**Scope:** Remediation planning based on [TEST_PLAN.md](./TEST_PLAN.md), [BUG_REPORT.md](./BUG_REPORT.md), [LAUNCH_READINESS_AUDIT.md](./LAUNCH_READINESS_AUDIT.md), and [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).  
**Constraints:** Planning only. No application code, features, or architecture are changed by this document.

## Release posture

**Do not enable real customer bookings yet.** The current data has no scheduled showtimes, the booking flow confirms reservations without payment, and successful booking/auth/admin mutation paths have not been tested against a confirmed isolated staging database.

This plan distinguishes:

- **Existing behavior/data corrections** that use current functionality (for example, entering approved showtimes through the existing admin tools).
- **Policy decisions** that must be made before changing customer-facing behavior.
- **Implementation work** that may be needed after a decision. A password-recovery or customer-cancellation workflow is not to be added without explicit approval; until then, gate public launch on an approved support process or keep affected workflows unavailable.

## Priority order

The six requested priorities are sequenced first, even where an owner decision is a prerequisite to code:

1. **BUG-001 — No showtimes (Critical)**
2. **BUG-002 — Booking confirmation without payment policy (Critical release gate)**
3. **BUG-006 — No password recovery (High)**
4. **BUG-007 — No customer cancellation flow (High)**
5. **Media route missing `ACTIVE` check (High)**
6. **Plain `.env` not ignored (High)**

Resolve or explicitly accept each release gate before progressing to lower-priority stabilization work.

## Critical

### 1. BUG-001 — No scheduled showtimes

**Type:** Operational data/configuration blocker; no new feature is needed.  
**Owner:** Venue/programming operator, with engineering verification.

**Remediation plan**

1. Confirm with the venue the actual IANA time zone, operating hours, screens, seating layouts, accessible seats, capacity, schedule, ticket price, and ISO currency. Do not copy the seed's nominal 120/240 seat counts without verification.
2. In an isolated staging database, use the existing admin movie/showtime workflows to create representative future showtimes for published movies.
3. Verify that each scheduled screening has inventory for every active seat on the selected screen and that overlapping screen schedules are rejected.
4. Run customer browser smoke tests from movie page through showtime selection. Confirm the displayed time and price against the venue's approved schedule.
5. Populate production showtimes only after staging passes and an authorized operator approves the source schedule.
6. Re-test no-showtime behavior and ensure the launch checklist treats it as a booking go/no-go.

**Acceptance criteria**

- At least one approved, future showtime is available for each movie advertised as bookable.
- Showtime timezone, screen, price, currency, and active seat inventory match venue records.
- Admin cannot create an overlapping scheduled screening on the same screen.
- The movie-to-showtime link reaches a real selection rather than an empty showtimes state.

**Do not:** fabricate a schedule, assume the venue is in UTC, or seed unverified capacity/pricing.

### 2. BUG-002 — Booking confirms without payment policy

**Type:** Business-policy release gate; online payment is out of scope and must not be added as part of this stabilization plan.  
**Owner:** Product/venue owner; engineering applies only the approved existing-policy outcome.

**Remediation plan**

1. Decide and document whether the system is intended to make **free reservations** or sell **paid tickets**.
2. If free reservations are approved, record how seats are collected/checked at the venue, the no-show policy, cancellation cutoff, customer wording, and who handles exceptions. Validate the existing no-payment confirmation language and staff procedures against that decision.
3. If paid tickets are required, do not enable customer booking or label reservations as paid/issued tickets. Keep the flow gated until a separately approved payment implementation and operational review exist; do not improvise payment processing in this phase.
4. In staging, test hold → summary → confirmation and verify status, price snapshot, seat inventory, customer history, and cancellation behavior match the written policy.
5. Add the policy decision and sign-off to the launch checklist outside the codebase's secret/configuration records.

**Acceptance criteria**

- A named business owner has approved the no-payment reservation policy, or bookings remain unavailable.
- Customer-facing booking copy and staff procedures do not imply that payment was collected.
- A confirmed booking's status and seat inventory behavior match the approved policy.

**Do not:** add a payment provider, mark a booking paid, or treat a database `CONFIRMED` state as evidence of payment.

## High

### 3. BUG-006 — Password recovery is unavailable

**Type:** Account-access risk; requires a product/operations decision before any recovery capability is scoped.  
**Owner:** Product/operations for recovery policy; engineering/security for any approved implementation.

**Remediation plan**

1. Decide whether self-service password recovery is a launch requirement. Review account verification, identity proofing, support staffing, abuse/rate-limit controls, and recovery-token expiry as part of that decision.
2. If approved, treat email delivery and the complete recovery flow as a separate, explicitly authorized change. Do not build a partial flow or report recovery as available until delivery, token lifecycle, session invalidation, generic responses, abuse protections, and end-to-end testing work.
3. Until implemented, provide an approved, monitored support route for account-access requests or defer public account registration. Ensure the visible “Forgot password?” message accurately reflects the supported process; do not leave customers with an unmonitored promise.
4. Test expired, invalid, reused, and rate-limited recovery attempts in staging if the feature is later approved.

**Acceptance criteria**

- Recovery is either working end-to-end with a documented support owner, or the business accepts the launch limitation and customers have a real support path.
- No recovery token or secret is exposed in logs or analytics.

### 4. BUG-007 — No customer cancellation flow

**Type:** Booking policy and support gap; self-service cancellation is not assumed to be approved.  
**Owner:** Product/venue operations; engineering for the approved path.

**Remediation plan**

1. Decide whether customers may cancel, when cancellation closes, and how the policy applies to confirmed reservations and active holds. Define how cancellations affect seat availability and customer communication.
2. If staff-mediated cancellation is sufficient for launch, publish a monitored contact method and train staff to use the existing admin cancellation action. Document identity verification and the operational record to keep.
3. If customer self-service is required, authorize that work separately. Enforce ownership and eligible status on the server, update booking and seat inventory transactionally, and preserve the booking history. Do not expose admin cancellation privileges to customers.
4. Test allowed, disallowed, duplicate, expired, and concurrent cancellation cases in staging; verify a cancelled seat is released only according to the policy.
5. Add an explicit confirmation and a recorded reason/actor procedure for admin cancellation before staff use it on live bookings.

**Acceptance criteria**

- A published cancellation policy and a monitored customer path exist before bookings open.
- Cancellation does not delete booking history, release seats incorrectly, or permit cross-customer access.
- Staff understand the current admin cancellation action and its consequences.

### 5. Media route does not reject disabled admins

**Type:** Authorization defect; small, narrowly scoped code fix after the plan is approved.  
**Owner:** Engineering/security.

**Remediation plan**

1. Make both upload and delete require a session whose user is `ADMIN` **and** `ACTIVE`; reuse the shared role guard if it is compatible with the Route Handler, otherwise apply the same check locally.
2. Ensure missing sessions and non-active/non-admin accounts are denied before parsing or processing uploaded content.
3. Add focused tests covering anonymous, customer, disabled admin, and active admin cases for both HTTP methods.
4. In staging, verify a disabled admin's existing session cannot upload or delete an object after the account is disabled.

**Acceptance criteria**

- Neither POST nor DELETE performs an R2 operation for a missing, non-admin, or disabled session.
- Active admins retain the authorized upload/delete behavior.
- Tests prove denial for a disabled admin and success for an active admin.

### 6. Plain `.env` is not ignored

**Type:** Secret-management/configuration defect; no application behavior change.  
**Owner:** Repository maintainer/security.

**Remediation plan**

1. Add a plain `.env` ignore rule without weakening existing `.env.local` and `.env.*.local` handling.
2. Check `git status` and tracked files for environment files; never print or paste their contents into tickets or logs.
3. Inspect repository history for previously committed credentials using an approved local secret-scanning process.
4. If any real credential was committed, revoke/rotate it with its provider, update the deployment secret store, and review access logs. Removing a file from the current tree alone does not revoke a leaked secret.
5. Confirm an empty/plain `.env` is ignored and local examples use `.env.example` with blank/non-secret values.

**Acceptance criteria**

- A plain `.env` is not staged by Git.
- No active production credentials are present in tracked files or known repository history; any exposure has been rotated and recorded.

## Medium

### BUG-005 — Booking deep links are not resumed after authentication

1. Decide whether preserving the requested booking URL is required for launch.
2. If approved, preserve only a validated same-site relative destination through sign-in/registration; reject external or malformed destinations.
3. In staging, verify both login and registration return to the requested valid booking route, while unauthenticated/invalid destinations cannot redirect elsewhere.

**Acceptance:** Booking-intent links resume safely after authentication, or the launch copy and operational process clearly accept restarting the movie-selection flow.

### BUG-008 — Booking time zone is shown as UTC

1. Confirm the venue's IANA time zone before any production schedules are entered.
2. Compare admin schedule entry, database UTC instants, and customer-facing time for a known venue-local time, including a daylight-saving boundary if applicable.
3. If current UTC presentation is not acceptable, approve a narrowly scoped time-zone correction before showtimes are published.

**Acceptance:** Staff and customers see an unambiguous time that agrees with the venue schedule; no production showtime is entered under an unverified timezone assumption.

### BUG-010 — Admin cancellation has no confirmation or recorded reason

1. Before live use, define who may cancel, required reason, customer contact procedure, and which seat states are released.
2. If required by policy, add a confirmation/reason to the existing action.
3. Retest cancellation in staging, including duplicate action, and confirm the record remains visible and the released seats are correct.

**Acceptance:** A staff cancellation cannot be triggered inadvertently without the safeguards required by the approved operations policy; the actor/reason is recorded in the approved operational record.

### BUG-011 — No repeatable application test suite for core workflows

1. Confirm staging database isolation before any write tests.
2. Add focused tests for the existing behavior only: auth role boundaries, hold expiry, seat concurrency, ownership checks, booking confirmation/cancellation, and admin mutations.
3. Ensure tests use controlled fixtures and only remove their own test records.
4. Run the tests and `npm run typecheck` in CI before deployment; run the end-to-end checklist in staging before bookings open.

**Acceptance:** Core booking/auth/admin regression cases are repeatable and do not touch production data.

### BUG-012 — Rate limiting is not explicitly verified

1. Review the installed Better Auth version's effective rate-limit defaults and the hosting platform's forwarded-IP behavior.
2. Verify limits in staging for login/registration and exposed booking/media operations; do not test abusive traffic against production.
3. If protections are absent or ineffective, approve narrowly scoped limits and define expected `429` behavior and monitoring.

**Acceptance:** Limits are documented and test results show abusive repeated requests are bounded in the production-equivalent configuration.

### BUG-009 — Duplicate level-one headings on login/register

1. Confirm with an accessibility tree or screen reader on staging.
2. Adjust only heading semantics so each page has a single primary `h1`.
3. Retest heading navigation and page title after the change.

**Acceptance:** Each login and registration page has one meaningful primary heading.

## Low

### BUG-013 — Trailer iframe request aborted in local browser

1. Recheck the trailer from a normal supported browser/network before classifying it as a site defect.
2. If provider playback is unavailable, confirm the movie detail page remains usable and record whether this is an external-provider restriction.
3. Do not change the embedding integration unless a reproducible failure affects supported users.

**Acceptance:** The issue is either reproduced and separately prioritized or documented as a test-network artifact; core movie details remain accessible.

## Execution sequence and verification gates

1. **Gate the release:** Do not advertise bookable screenings while showtimes are absent.
2. **Approve policies:** Obtain written decisions for unpaid bookings, recovery support, and customer cancellations before making workflow changes.
3. **Close quick security issues:** Correct disabled-admin media authorization and `.env` ignore/history exposure before configuring production secrets.
4. **Prepare staging:** Use isolated database/provider credentials; verify backup/restore and approved inventory/time-zone data.
5. **Exercise core journeys:** Run the registration, login/logout, movie-to-seat, booking/history/cancel, and admin CRUD/role checks in [TEST_PLAN.md](./TEST_PLAN.md), updating [BUG_REPORT.md](./BUG_REPORT.md) with results.
6. **Verify code and operations:** Run focused tests, `npm run typecheck`, and `npm run build`; test uploads, backups, restore, monitoring, and rollback in staging.
7. **Production go/no-go:** Require the venue/product, engineering, database, security, and operations sign-offs listed in [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).

## Out of scope

- Adding online payments, email delivery, or unrelated features.
- Refactoring the backend architecture or changing unrelated business logic.
- Creating fabricated production schedules, test customers, or bookings.
- Treating a policy decision or unexecuted test as a completed fix.

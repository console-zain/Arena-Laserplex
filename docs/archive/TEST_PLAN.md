# Customer and Admin Workflow Test Plan

**Test date:** 2026-11-14  
**Test scope:** Registration, authentication/session handling, public movie browsing, showtime and seat selection, booking/history/cancellation, admin CRUD, and role protection. Validation and stabilization only; no features or designs were changed.

## Test environment and safety

- The local Next.js development server was started at `http://127.0.0.1:3000`.
- The app loaded `.env.local`; the database environment was **not confirmed to be isolated from production**.
- Tests were limited to page reads, anonymous access checks, and a registration form submission with mismatched passwords that fails validation before account creation.
- No account, booking, showtime, admin mutation, or other database record was created or changed.
- The recorded database state contains no showtimes. Consequently, booking, seat selection, and cancellation could not be exercised end-to-end.
- Authenticated workflows were reviewed in code but not executed because no dedicated test account/database was available.

## Execution summary

| Workflow | Result | What was verified |
|---|---|---|
| Registration | **Partial — validation passed; success path not run** | Registration page rendered. A mismatched password submission returned the expected “Passwords must match” error; no account was created. |
| Login | **Partial — form rendered; successful login not run** | Customer and admin sign-in pages rendered. No test credentials were available. |
| Logout | **Not run** | Logout action exists, but no authenticated test session was created. |
| Movie browsing | **Pass, limited** | Homepage and a movie detail page rendered real database content and artwork. |
| Showtime selection | **Blocked** | Movie detail showed “No upcoming showtimes are scheduled for this movie yet.” |
| Seat selection | **Blocked** | No showtime/seat inventory was available to enter the seat map. |
| Booking creation | **Blocked** | No showtime and no isolated customer test account. |
| Booking history | **Partial** | Anonymous access redirected to sign-in. Customer history with bookings was not exercised. |
| Booking cancellation | **Not run** | No test booking/admin session was available. Code review found an admin cancellation action but no customer-facing cancellation action. |
| Admin CRUD | **Not run** | Anonymous admin dashboard access redirected to `/admin/login`. Mutations were not submitted. Server actions were inspected for admin guards. |
| Role protection | **Pass, anonymous cases** | Anonymous dashboard access ended at admin sign-in; anonymous account and booking access ended at customer sign-in. |
| Session handling | **Partial** | Anonymous redirects were verified. Successful login, logout, expiry, revocation, and disabled-user session behavior were not exercised end-to-end. |

## Detailed test cases

| ID | Steps | Expected result | Observed result | Status |
|---|---|---|---|---|
| REG-01 | Open `/register`. | Registration form is available with named fields and a customer-only role. | Form rendered; the UI states the account is created with the customer role. | Pass |
| REG-02 | Submit a valid-looking name/email/password with a mismatched confirmation. | Submission is rejected with a clear validation message and creates no account. | “Passwords must match.” appeared in the form alert; no success redirect occurred. | Pass |
| REG-03 | Register a new test customer with matching passwords. | Account is created as `CUSTOMER`; customer session starts; account page opens. | Not attempted: database isolation is unknown and this would persist a user. | Blocked |
| LOGIN-01 | Open `/login` and `/admin/login`. | Correct sign-in form renders for each user class. | Both forms rendered. | Pass |
| LOGIN-02 | Sign in with a dedicated test customer/admin account. | Valid credentials create a session and route to the intended destination. | Not attempted: no dedicated test credentials/session. | Blocked |
| LOGIN-03 | Use the “Forgot password?” control. | Recovery workflow is available or its absence is clearly handled. | The control displays “Password recovery is not available yet.” | Issue — BUG-006 |
| LOGOUT-01 | Sign out from a valid authenticated session and revisit a protected route. | Session is cleared; protected page requires sign-in. | Not attempted: no authenticated test session. Logout action was inspected only. | Blocked |
| MOV-01 | Open `/` and `/movies`. | Published movie catalogue and links render. | Homepage rendered featured movie, Now Showing, Coming Soon, and artwork. `/movies` returned successfully. | Pass |
| MOV-02 | Open a movie detail page from the homepage. | Movie facts and available showtimes appear; booking CTA leads to a bookable showtime. | Ebenezer detail page rendered, but the showtime section reported no scheduled screenings. | Issue — BUG-001 |
| SHOW-01 | Choose a movie showtime. | A real scheduled screening can be selected. | No showtimes exist in the recorded database state; no screening was selectable. | Blocked — BUG-001 |
| SEAT-01 | Open the seat map for a scheduled showtime and select available seats. | Available seats can be selected; held/booked/blocked seats cannot. | Not reachable without a showtime. Seat-map behavior was not runtime-tested. | Blocked |
| BOOK-01 | Create a ten-minute hold, review summary, confirm booking. | Booking is owned by the current user, priced from database values, and confirmed according to policy. | Not run. No showtimes/test account were available. Current UI/code confirms without collecting payment; see BUG-002. | Blocked |
| HIST-01 | Open `/my-account-2` while signed out, then as a customer with bookings. | Signed-out visitor is redirected; signed-in customer sees only their own bookings. | Signed-out request redirected to `/login`; populated history/ownership were not tested. | Partial |
| CANCEL-01 | Cancel a test booking as customer and as admin. | Authorized cancellation follows policy, releases seats, and preserves booking history. | Not run. Code inspection found only an admin cancellation action; customer cancellation is not exposed. | Partial — BUG-007 |
| ADM-01 | Open `/admin/dashboard` while signed out. | Visitor is denied and sent to admin sign-in. | Browser navigation ended at `/admin/login`. | Pass |
| ADM-02 | As an admin, create/edit/publish/archive a movie, event, article, and promotion. | Valid changes persist; invalid changes fail safely; published public pages update. | Not run: no test admin session and no isolated database. Server actions were inspected and call `requireAdmin()`. | Blocked |
| ROLE-01 | Attempt admin and customer routes as an anonymous visitor. | Admin and account/booking routes require the appropriate authenticated role. | Anonymous admin access ended at `/admin/login`; anonymous account and booking access ended at `/login`. | Pass |
| SES-01 | Exercise successful login, logout, expiration, and disabled-account behavior. | Session lifecycle and authorization remain correct at every boundary. | Only unauthenticated redirects were verified. Full lifecycle and revocation tests remain outstanding. | Partial |

## Confirmed usability and security findings

See [BUG_REPORT.md](./BUG_REPORT.md) for severity, impact, and evidence. Findings observed or confirmed by source review include:

- The featured film’s “View Showtimes” path leads to a detail page with no scheduled showtimes.
- A booking deep link redirects a signed-out visitor to sign-in; successful login/signup routes to the account page rather than resuming the selected booking.
- Password recovery is unavailable.
- Login and registration pages expose two level-one headings (banner and page header).
- The seat map and booking times require device/time-zone validation before launch.
- Customer cancellation is not exposed; admin cancellation is a direct action without a confirmation step.
- The media API’s local admin session check does not also require `ACTIVE` status.
- `.gitignore` does not exclude a plain `.env` file.
- No app test script or application test files were found under `src`.

## Required staging rerun

Use a staging database and provider credentials explicitly confirmed not to point to production:

1. [ ] Create separate named test customer and admin accounts; do not use staff's personal or production customer account.
2. [ ] Verify approved screen layout, seat types, timezone, currency, and price; create one published movie and a staging showtime with inventory.
3. [ ] Complete successful registration, login, logout, and login again; verify role defaults and session cookies.
4. [ ] Follow the movie-to-showtime-to-seat flow. Verify one available seat can be held, and unavailable seats cannot be selected.
5. [ ] Confirm the booking, then verify confirmation and customer history contain only that user's booking.
6. [ ] Attempt the same seat concurrently from a second test user; one hold must fail without creating a duplicate booking.
7. [ ] Verify expiry, cancellation, and seat release; verify cancelled records remain visible to authorized staff and do not become confirmed.
8. [ ] Run admin create/edit/publish/archive/disable/cancel cases for each content type, then verify customer and anonymous users cannot invoke mutations.
9. [ ] Test disabled-user and expired-session behavior, and ensure media upload/delete rejects disabled admins.
10. [ ] Remove only the staging test records created for this run, using specific IDs and a reviewed cleanup procedure.

## Limits

This is not a full end-to-end acceptance, load, penetration, or WCAG conformance test. The tests deliberately avoided persistent writes because the local database's isolation was not established. No production credentials were used, and no booking or admin mutation was executed.

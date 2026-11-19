# Booking Workflow Audit

## Workflow Status

**Compliant after the fixes in this audit.** Visitors can browse showtimes and select seats without an account. Authentication is required when they continue toward the booking summary, and the selected showtime and seats are resumed after sign-in or registration.

## Current Workflow Before Fixes

1. Movie browsing and showtime selection were public.
2. Opening `/booking/[showtimeId]` immediately required a customer session, blocking visitors from viewing or selecting seats.
3. `createSeatHoldAction` also required authentication before validating the submitted selection.
4. Successful sign-in and registration both redirected to `/`, losing the pending booking destination.
5. Seat selections existed only in the seat-map component's memory, so they could not survive the authentication redirect.
6. Summary, confirmation, and booking-history routes were customer-authenticated. Booking creation and seat holds were also protected by authenticated server actions and booking-service ownership checks.

## Approved Workflow

Visitors may browse movies, view showtimes and seat maps, and select seats without signing in. Authentication is required only when they continue to the review/confirmation stage. After signing in or registering, the same showtime and seat selection must resume. Holds and bookings must be created only for authenticated customers; booking history remains private. Admin pages and actions require an admin session.

## Differences and Severity

| Severity | Difference | Status |
| --- | --- | --- |
| **Critical** | The seat-selection page required a customer session, preventing public seat-map viewing and selection. | Fixed |
| **High** | The Continue action required authentication before preserving the selected seats. The selection was held only in client component state and would be lost during sign-in. | Fixed |
| **High** | Login and registration always redirected to the homepage instead of the pending booking. | Fixed |
| **Medium** | If a session expired while a customer was reviewing or confirming a booking, the auth guard redirected to login without preserving the booking destination. | Fixed |

No guest booking creation or public guest booking-lookup route was found. The booking service validates customer identity, locks inventory, checks seat availability and ownership, and enforces idempotency. Admin pages use an authenticated admin layout, and admin server actions independently require admin access. No middleware file was found; route layouts and server-side actions enforce access.

## Fixes Applied

- Removed the customer-session requirement from the seat-map page. Showtime and seat inventory remain checked on the server.
- Kept seat selection in tab-scoped `sessionStorage` only when an unauthenticated visitor continues. A per-attempt idempotency key identifies the pending selection.
- On authentication, return to the exact showtime. The seat map restores the saved selection and automatically submits it for a hold.
- Continue still creates a seat hold only after an active customer session is confirmed. The existing booking service revalidates the submitted seats and retains its locking, availability, ownership, and idempotency protections.
- Added allow-listed booking return destinations for seat resumption, summary, and confirmation. External or malformed return URLs are rejected.
- Preserved booking destinations through login/register forms and their server actions; ordinary authentication still falls back to the homepage.
- Preserved summary/confirmation destinations when authentication is required again.
- Added clear recovery messaging when a saved selection is missing or seats are no longer available.
- Kept authenticated admin pages dynamic so private live database data is not fetched during static build/prerender.

## Files Modified

- `src/app/booking/[showtimeId]/page.tsx`
- `src/app/booking/actions.ts`
- `src/app/booking/[showtimeId]/summary/page.tsx`
- `src/app/booking/confirmation/[bookingId]/page.tsx`
- `src/app/admin/layout.tsx`
- `src/components/booking/seat-map.tsx`
- `src/components/booking/confirm-booking-button.tsx`
- `src/server/validation/booking.ts`
- `src/server/auth/booking-return-to.ts`
- `src/server/auth/guards.ts`
- `src/app/(public)/login/page.tsx`
- `src/app/(public)/login/actions.ts`
- `src/components/forms/login-form.tsx`
- `src/app/(public)/register/page.tsx`
- `src/app/(public)/register/actions.ts`
- `src/components/forms/register-form.tsx`

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
- Live Neon-backed booking was not exercised; the configured database endpoint returned `P1001` during earlier build attempts. The final build succeeds without prerendering authenticated admin data.

# Arena Laserplex — Project Case Study

## Project Overview

**Project:** Arena Laserplex  
**Purpose:** An academic cinema website and operations platform that demonstrates a complete movie discovery and account-based booking experience.  
**Problem solved:** Cinema visitors need to find films and showtimes, understand seat availability, and continue a reservation without being forced to create an account too early. Cinema staff also need a central, role-protected interface for managing the content and screening inventory shown on the public site.

Arena Laserplex combines a cinematic public experience with an administrative dashboard. It is a portfolio demonstration, not a production ticketing service; real payment processing and operational support systems are not implemented.

## Features

### Public Website

- Homepage featuring current films, coming-soon titles, cinema information, and events.
- Movie catalogue, movie details, language filters, and showtime listings.
- Event and news listings with individual detail pages.
- Contact, account, legal, help, and status pages.
- Responsive layouts and an accessible light/dark theme control.

### Admin Dashboard

- Role-protected dashboard and account profile.
- Create, edit, publish, archive, and delete workflows for movies, events, news, and promotions.
- Screen, showtime, cinema settings, booking, and managed media interfaces.
- Server-side authorization and validation for administrative mutations.

### Booking System

- Public movie, showtime, seat-map, and seat-selection browsing.
- Authentication required only when a visitor continues toward booking.
- Seat holds, booking review, confirmation, and private booking history.
- Booking creation is tied to an authenticated customer; guest booking lookup is not provided.

### Authentication

- Better Auth email/password sign-in and registration.
- Customer and administrator roles with active-account checks.
- Protected customer routes and independently guarded administrator actions.
- Safe return handling for resuming a pending booking after authentication.

### Movie and Showtime Management

- Movie metadata, language, runtime, genres, artwork, and publication status.
- Screen and showtime configuration with per-seat inventory.
- Admin-managed events, news, promotions, and cinema settings.
- TMDB integration for movie information and Cloudflare R2 for managed media.

## Technical Stack

- **Application:** Next.js 15 App Router, React, TypeScript
- **Styling:** Tailwind CSS and project-specific responsive CSS
- **Authentication:** Better Auth
- **Data access:** Prisma ORM and PostgreSQL, configured for Neon
- **Movie metadata:** TMDB API
- **Media storage:** Cloudflare R2 using the S3-compatible API
- **Validation:** Zod

## System Architecture

### Frontend

Next.js route segments render the public site, booking flow, customer pages, and administrator tools. Shared React components provide consistent navigation, movie cards, forms, seat maps, tables, and feedback states. Client components handle interactions such as catalogue filtering and seat selection; server-rendered pages load protected or database-backed data.

### Backend

Server Actions and API routes form the request boundary. They validate input, verify the current user or role, then call service and repository modules for business rules and persistence. Movie metadata and managed media are integrated through server-side TMDB and Cloudflare R2 clients. Credentials remain in environment variables rather than browser code.

### Database

Prisma models users, sessions, movies, screens, seats, showtimes, seat inventory, bookings, events, news, promotions, and settings in PostgreSQL. Database uniqueness constraints complement application checks. Booking operations use transactions and conditional inventory updates to prevent two customers from holding or confirming the same seat.

### Authentication

Better Auth manages user sessions through the Prisma adapter. Server-side guards distinguish active customers from administrators. Booking summaries, confirmation, and history are scoped to the signed-in customer; administrator routes and mutations require an active admin role.

## Booking Workflow

### User Journey

1. Browse movies and movie details without an account.
2. Choose a showtime and view the seat map.
3. Select seats publicly and click Continue.
4. If unauthenticated, sign in or register and return to the exact showtime and selection.
5. Review the booking summary and confirm while authenticated.
6. View the confirmed booking in private booking history.

Seat selections are treated as client input, not trusted inventory state. The server revalidates the requested seats and availability when creating a hold. Database transactions and unique constraints protect concurrent reservations. Online payment is outside the project scope.

### Admin Journey

1. Sign in through the administrator login.
2. Review dashboard information and navigate to a content or operations area.
3. Create or edit movie and showtime data, events, news, promotions, settings, or media.
4. Validate and save changes through protected server operations.
5. Publish eligible content for display on the public site.

## Challenges Solved

- **Seat inventory:** Representing each seat per showtime and checking it against the selected screen.
- **Double booking prevention:** Combining transactional operations, row-level locking/conditional updates, idempotency, and database uniqueness constraints.
- **Role-based access:** Keeping public browsing open while protecting account data, booking creation, and admin operations.
- **Booking continuity:** Preserving the exact showtime and selected seats across login or registration, then revalidating them server-side.
- **Responsive design:** Adapting cinema imagery, navigation, card grids, forms, and seat selection to narrow screens.

## Design Process

The version labels below summarize the documented project iteration history; exact release dates and a complete V1–V3 specification are not recorded.

- **V1 — Core experience:** Established the cinema website and its foundational public, account, booking, and administration routes.
- **V2 — Shared interaction patterns:** Consolidated movie-card treatments and clarified the relationship between movie discovery, showtime selection, and seat selection.
- **V3 — Refinement and audit:** Improved responsive behavior, page coverage, booking continuity, and implementation consistency through focused review and stabilization.
- **V4 — Immersive cinema system:** Applied the luxury cinema direction across public and admin experiences with dramatic imagery, dark glass surfaces, orange accents, clear typography, restrained motion, and a streamlined booking journey.

## Lessons Learned

- Define the authentication boundary from the user journey: browsing and seat selection can be public while booking creation remains account-bound.
- Never trust a client-side seat selection as proof of availability; validate it again inside the server-side transaction.
- Keep authorization in server routes and actions, not only in navigation or page presentation.
- Make redirect destinations explicit and allow-listed when users must resume a multi-step flow.
- Reuse components for repeated content while keeping each page’s essential purpose clear.
- Choose and label a consistent timezone for event data and user-facing dates.
- Validate the finished interface at small viewports and reduced-motion settings, not only at desktop size.

## Screens Needed

Recommended portfolio screenshots:

1. Homepage hero at desktop, showing the active film, calls to action, and slide indicators.
2. Homepage at mobile width, showing the responsive navigation and hero composition.
3. Movies catalogue with filters and the shared movie-card system.
4. Movie detail page with showtimes and the single synopsis section.
5. Event or news detail page demonstrating the editorial content layout.
6. Public seat map with screen label, aisles, available seats, and seat legend.
7. Login/register screen reached from Continue, paired with a note that the booking resumes afterward.
8. Booking summary and confirmation pages using representative demo data.
9. Customer booking history with both an empty state and a populated example.
10. Admin dashboard and one representative content-management form.
11. Admin showtime/screen configuration and managed media interface.
12. A narrow-screen capture of the booking flow to demonstrate responsive behavior.

Use seeded or anonymized demo data. Do not include real customer records, credentials, session tokens, or private environment values in portfolio captures.

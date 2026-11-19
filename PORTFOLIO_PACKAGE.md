# Arena Laserplex — Portfolio Package

## Project Title

Arena Laserplex

## Short Description (50 words)

Arena Laserplex is a cinema platform built with Next.js, TypeScript, Prisma, and PostgreSQL. Visitors explore films, schedules, and seat availability before signing in to continue a reservation. Administrators manage movies, showtimes, events, promotions, and media through a role-protected dashboard. The project emphasizes transactional seat inventory, responsive design, and cinema branding.

## Medium Description (150 words)

Arena Laserplex is a cinema discovery and booking platform built as an academic portfolio project. Visitors can browse films, movie details, showtimes, events, and seat availability without an account. Sign-in is required only when continuing to booking; the system restores the selected showtime and seats, creates authenticated seat holds, and protects summaries, confirmation, and history by customer ownership.

The admin dashboard provides role-protected management for movies, screens, showtimes, events, news, promotions, settings, and media. The stack includes Next.js 15, React, TypeScript, Tailwind CSS, Better Auth, Prisma, and PostgreSQL configured for Neon. TMDB supplies movie metadata; Cloudflare R2 stores managed media. Server actions and API routes validate requests, while transactions and database constraints protect seat inventory from competing reservations.

V4 uses cinematic imagery, dark glass, orange accents, responsive layouts, and restrained motion. Shared components keep interface patterns consistent across routes. Payment processing, recovery-email delivery, and production operations are outside this demonstration.

## Long Description (500 words)

Arena Laserplex is a cinema website demonstration for theater visitors. It combines public movie discovery, account-based booking, and an administrator dashboard in one Next.js application. The project pairs a polished customer interface with clear server-side business rules and inventory protection.

Visitors can explore the homepage, browse films, inspect movie details, and review showtimes and seat availability without signing in. The booking boundary is delayed: selecting seats is public, while clicking Continue requires an account before a seat hold or booking can be created. If authentication is needed, the application preserves the showtime and seat selection and returns the visitor to that booking session. The server validates inventory; client state is never treated as proof that seats remain available. Booking summaries, confirmation, and history are tied to the authenticated customer; guest bookings and public booking-reference lookup are not provided.

The administrator experience supports the demonstration’s content and operations. Admins can manage movies, showtimes, screens, events, news, promotions, cinema settings, and media. Admin operations check the user’s role and active status on the server. Forms validate input before calling service modules, and external-service credentials are supplied through environment variables rather than client code.

The application uses Next.js 15 App Router, React, TypeScript, Tailwind CSS, Better Auth, Prisma, and Neon PostgreSQL. TMDB provides movie metadata, and Cloudflare R2 stores managed image assets. Backend layers include route handlers and server actions, validation schemas, services, repositories, and the Prisma schema. Booking operations combine transactions, conditional inventory changes, idempotency, and database constraints against conflicting seat reservations.

The visual system evolved toward Arena Laserplex V4, a futuristic luxury cinema identity. Large cinematic imagery, dark surfaces, translucent glass panels, orange accents, confident typography, and restrained ambient motion establish atmosphere without obscuring task-focused controls. Shared movie cards and common form, navigation, and status components keep the experience recognizable across the public catalogue and administration tools. Responsive layouts and reduced-motion support are considered alongside desktop presentation.

This project was built as an academic and portfolio demonstration, not as a live ticketing business. It does not process real payments, deliver account-recovery email, operate a production support desk, or claim enterprise security certification. Those limits are stated rather than hidden. The scope also keeps privacy and account ownership visible throughout implementation. The implementation focuses on demonstrable application behavior: public discovery, protected booking creation, ownership checks, role-based administration, server-side validation, and seat-inventory integrity.

Arena Laserplex showcases a range of engineering concerns beyond page composition. It connects a relational data model to public and administrative workflows, handles authentication redirects across a multi-step process, and treats concurrent inventory as a consistency problem rather than merely a visual state. It also demonstrates how focused audits can drive small corrective changes without redesigning unrelated features. For a portfolio presentation, the project can be shown through a visitor journey from movie browsing to seat selection, account sign-in, booking review, and confirmation, followed by an administrator journey that publishes content and schedules a screening. Screenshots should use seeded or anonymized data and omit credentials, tokens, and private customer information.

## Technologies Used

- Next.js 15, React, TypeScript
- Tailwind CSS and custom responsive CSS
- Prisma ORM and PostgreSQL (Neon configuration)
- Better Auth
- TMDB API
- Cloudflare R2 / S3-compatible media storage
- Zod validation

## Key Features

- Public movie discovery, detail pages, showtimes, events, and news.
- Seat-map viewing and selection before login.
- Authenticated seat holds, booking review, confirmation, and private history.
- Role-protected admin dashboard and content-management tools.
- Movie, screen, showtime, event, news, promotion, settings, and media management.
- Shared cinema design system, responsive layouts, theme toggle, and reduced-motion support.

## Challenges Solved

- Protecting concurrent seat inventory with transactional validation and database constraints.
- Maintaining a selected booking across login/register redirects without trusting stale client data.
- Enforcing customer ownership and administrator roles at server boundaries.
- Coordinating public content, admin-managed records, external movie metadata, and managed image storage.
- Keeping the visual experience immersive while ensuring key actions remain understandable on mobile.

## Resume Bullet Points

- Built a full-stack cinema platform with Next.js 15, TypeScript, Prisma, PostgreSQL, and Better Auth, covering public movie discovery, booking, and role-protected administration.
- Implemented an account-gated booking flow that preserves seat selection across authentication and revalidates inventory server-side.
- Protected seat inventory with transactional updates, idempotency, and database constraints to prevent conflicting reservations.
- Integrated TMDB movie metadata and Cloudflare R2 media storage behind server-side services and validated admin workflows.
- Created a responsive V4 cinema design system shared across public pages, booking screens, and admin tools.

## LinkedIn Project Description

Arena Laserplex is a full-stack cinema discovery and booking platform built as an academic portfolio project. It combines a responsive Next.js 15 website, Better Auth, Prisma/PostgreSQL, a role-protected admin dashboard, TMDB movie metadata, and Cloudflare R2 media storage. Visitors can browse films and select seats before signing in; booking creation remains authenticated and inventory is revalidated server-side. The project emphasizes transactional seat protection, booking ownership, reusable UI patterns, and an immersive V4 cinema design.

## GitHub Repository Description

Full-stack cinema discovery and booking demo built with Next.js 15, TypeScript, Prisma, PostgreSQL, Better Auth, TMDB, and Cloudflare R2.

## Demo Presentation Notes

### 5-minute version

1. **0:00–0:40 — Context:** Introduce the cinema project, academic scope, and user problem.
2. **0:40–1:30 — Public discovery:** Show homepage, movie catalogue, movie details, and showtime selection.
3. **1:30–2:40 — Booking:** Select seats without logging in, continue to authentication, then show the resumed selection and booking summary.
4. **2:40–3:30 — Data integrity:** Explain server-side seat revalidation, transactional holds, idempotency, and ownership checks.
5. **3:30–4:30 — Admin:** Show the dashboard and one movie or showtime management workflow.
6. **4:30–5:00 — Wrap-up:** Summarize the stack, V4 design direction, and explicit limits such as no real payment processing.

### 10-minute version

1. **0:00–1:00 — Overview:** Explain the project purpose, audience, and demonstration boundaries.
2. **1:00–2:30 — Public experience:** Walk through the homepage, navigation, catalogue filters, movie details, events, and responsive presentation.
3. **2:30–4:30 — Booking journey:** Browse publicly, inspect the screen and seat map, select seats, continue through sign-in/register, and review the resumed booking.
4. **4:30–5:45 — Booking integrity:** Describe authentication timing, seat-hold transactions, availability checks, idempotency, ownership, and database uniqueness.
5. **5:45–7:15 — Admin journey:** Demonstrate role-protected content and showtime management, validation, and media handling.
6. **7:15–8:30 — Architecture:** Explain Next.js server/client boundaries, Better Auth, service/repository flow, Prisma/PostgreSQL, TMDB, and R2.
7. **8:30–9:30 — Design process:** Show the V1–V4 evolution and explain the move toward a premium, immersive cinema identity.
8. **9:30–10:00 — Lessons and limits:** Share the main engineering lessons and clarify that payment processing and production operations are outside scope.

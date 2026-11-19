# Project Cleanup Audit

**Audit date:** 2026-11-17
**Scope:** Current working tree: root documentation/configuration, `src`, `public`, Prisma files, dependency manifests, and Git ignore/status. This is a read-only cleanup audit; no application files were deleted, moved, or edited.

## Summary

The application has a clear Next.js/Prisma structure and its important workflows are backed by real routes and server code. Cleanup opportunities are concentrated in a small set of unreferenced components, an orphaned stylesheet, unused constants/repository code, empty local directories, and historical documents at the repository root.

The most important caution is Git state: the worktree contains many staged, modified, and untracked files. Do not run `git clean`, reset, or broad deletion commands as part of cleanup. Review and preserve the intended project changes first.

Risk levels:

- **Low:** No current application reference found; deletion/archive should not affect runtime behavior.
- **Medium:** Likely unused, but touches a core domain or shared styling and needs a final review.
- **High:** May affect release contents or staged work; resolve explicitly before changing.

## Safe To Delete

These are recommendations only. Confirm the references again immediately before deleting.

| File path | Reason | Risk |
| --- | --- | --- |
| `page.tsx` | Root-level placeholder that only renders “Manage Bookings.” The application uses `src/app/`; this file is outside the App Router and has no importers. | Low |
| `src/components/home/quick-book.tsx` | The `QuickBook` component has no importers and is not rendered. It is separate from the active movie/showtime/seat booking flow. Its scoped `.home-quick-book-*` styles in `src/styles/utilities.css` and `src/styles/arena-interface.css` are also orphaned and can be removed with the component after confirming no future use is intended. | Low |
| `src/components/layout/marquee.tsx` | `Marquee` has no importers and is not rendered. Its class names have no corresponding active stylesheet rules. | Low |
| `src/components/home/home-scroll-motion.tsx` — `HeroParallax` export only | The file itself is used for `HomeSectionReveal`, but `HeroParallax` has no callers. Remove only that unused export/function if desired; keep the file and `HomeSectionReveal`. | Low |
| `src/styles/animations.css` | No stylesheet imports it, and its `animate-cinema-*` classes are not used in the application. It has no effect on the current rendered site. | Low |
| `src/lib/constants.ts` | Neither `NAV_LINKS` nor `MOVIE_GENRES` has a caller anywhere in the current source tree. | Low |
| `src/server/repositories/showtimes.ts` | No code imports or calls this repository. Active showtime mutations and reads use `src/server/services/showtimes.ts` and other current query paths. | Low |
| Empty local directories listed under [Empty Directories](#empty-directories) | They contain no files and are not represented in Git. Removing them locally cannot affect the app or deployment. | Low |

## Safe To Archive

Preserve these documents, but move dated audits/plans out of the repository root (for example into `docs/audits/` and `docs/archive/`) if a cleaner portfolio landing directory is desired. Keep links and relative references valid when moving them.

| File path | Reason | Risk |
| --- | --- | --- |
| `BACKEND_ARCHITECTURE.md` | Explicitly labeled an architecture proposal; it includes future email, payment, and deployment recommendations, not just implemented behavior. Useful as design history, but not authoritative current architecture. | Low |
| `BUG_REPORT.md` | Dated findings include issues since fixed, including the admin media active-status check. Retain as historical evidence, not as a current issue list. | Low |
| `BUG_FIX_PLAN.md` | Dated planning document; for example, its plain `.env` ignore finding is superseded by the current `.gitignore`. | Low |
| `LAUNCH_READINESS_AUDIT.md` | A dated readiness snapshot with several findings that have since changed. Avoid presenting its scores as current. | Low |
| `LAUNCH_CHECKLIST.md` | Operational checklist for a future deployment, not proof that those release steps are complete. Preserve as a historical/release reference. | Low |
| `TEST_PLAN.md` | Dated manual test record with blocked paths based on the then-current data/environment. It is useful history but not a current regression-test suite. | Low |
| `BOOKING_WORKFLOW_AUDIT.md` | Completed workflow audit; preserve as evidence, but archive it rather than keeping multiple audit reports beside the portfolio package. | Low |
| `MISSING_PAGES_AUDIT.md` | Completed page inventory and implementation record; preserve as historical evidence. | Low |
| `TEMPORARY_FIX_AUDIT.md` | Completed source audit with a follow-up noting the admin search removal; preserve, but it is not application documentation. | Low |

## Must Keep

| File path | Reason | Risk if removed |
| --- | --- | --- |
| `package.json`, `package-lock.json` | Scripts, exact dependency resolution, and reproducible installation/build. | High |
| `.gitignore`, `.env.example` | The ignore rules already cover `.env`, `.env.*` with an exception for `.env.example`, build output, dependencies, coverage, and TypeScript build info. The example documents required configuration without the local secret values. | High |
| `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json` | Next.js, TypeScript, Tailwind, PostCSS, image-host, and build configuration. | High |
| `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `prisma/promote-admin.ts` | Database schema history, initial screen/seat inventory, and explicit admin provisioning. These are not obsolete mock-data paths. | Critical |
| `src/app/`, `src/server/`, `src/lib/`, `src/services/`, `src/types/` | Active routes, auth/authorization, booking and inventory services, Prisma operations, validation, and external movie metadata integration. No current route module was identified as unused. | Critical |
| `src/styles/theme.css`, `src/styles/utilities.css`, `src/styles/arena-interface.css`, `src/styles/arena-v4.css`, `src/styles/admin-v4.css` | These are loaded by `src/app/globals.css` or `src/app/admin/layout.tsx`. Their tokens and selectors are shared across public and admin pages; do not remove whole files based on a class-name search. | High |
| `src/app/(public)/my-account-2/page.tsx` | Not a duplicate dead route: `/my-account` links to it for full booking history, booking confirmation links to it, and booking actions revalidate it. | High |
| `src/services/movie-service.ts` | Used by the homepage, movie detail page, and admin movie actions to access TMDB-backed metadata. | High |
| `public/images/screens/l-screen.jpg`, `public/images/screens/xl-screen.jpg` | Both are referenced by the About and authentication experience pages. They are used assets, not orphaned placeholders. Verify they are approved venue imagery before release. | Medium |
| `PROJECT_CASE_STUDY.md`, `PORTFOLIO_PACKAGE.md`, `PORTFOLIO_SECURITY_CHECKLIST.md` | These are the primary portfolio presentation and assessment deliverables. Keep them easy to find. | Medium |

## Needs Review

| File path | Finding / recommendation | Risk |
| --- | --- | --- |
| `src/server/auth/guards.ts` — `requireUser` | Export has no current caller; the app currently uses role-specific guards. Remove only after confirming no future caller or external use is intended. | Medium |
| `src/server/repositories/bookings.ts` — `findBookingById`, `findBookingByReference`, `updateBooking`, `deleteBooking` | These exported helpers have no current call sites. Confirm whether they are intentionally retained for planned workflows before pruning; booking lookup and mutation code is security-sensitive. | Medium |
| `src/server/repositories/movies.ts` — `findMovieBySlug`, `deleteMovie` | No current callers were found. The active movie deletion path uses `deleteMovieWithUnusedShowtimes`; preserve that path. | Medium |
| `src/server/repositories/promotions.ts` — `findPromotionByCode` | No current caller was found. Confirm whether promotion redemption is intentionally out of scope before removal. | Medium |
| `src/server/services/events.ts` — `archiveEventRecord`; `src/server/services/news.ts` — `archiveNewsRecord` | These service exports have no current callers. Decide whether archive actions are planned; do not remove until the desired admin lifecycle is confirmed. | Medium |
| `src/styles/utilities.css`, `src/styles/arena-interface.css` | The `.home-quick-book-*` selectors are orphaned with the unrendered `QuickBook` component. They are narrow cleanup candidates, but these files are shared global stylesheets; remove only the scoped rules, not either stylesheet. | Medium |
| `src/styles/theme.css`, `src/app/globals.css`, `tailwind.config.ts` | The theme contains V4 tokens plus compatibility aliases such as `--color-primary`, `--gold-text`, and `--background`. Some legacy-looking variables are still used by global styles/components. Audit token-by-token before consolidation; do not remove the token file or assume the `v3` prefix means unused. | High |
| `next.config.ts` — `images.unsplash.com` remote pattern | No current source URL references Unsplash, but persisted content may contain externally hosted image URLs. Check the actual content data/configuration before removing the allowlist. | Low |
| `src/components/layout/marquee.tsx`, `package.json`, `package-lock.json` — `framer-motion` | The only source import found is in the unused marquee component. If removing that component, confirm there are no runtime/plugin consumers and remove the dependency through the package manager so the lockfile stays synchronized. | Medium |
| `public/images/screens/l-screen.jpg`, `public/images/screens/xl-screen.jpg` | Referenced by the app, but prior release notes call them reference photography. Verify permission and venue accuracy; replace with approved assets if needed rather than deleting currently used files. | Medium |
| `.gitignore` | Existing rules correctly ignore plain `.env`, environment variants, `.next`, `node_modules`, build output, coverage, logs from package managers, and `*.tsbuildinfo`. Consider adding `.vercel/` if using the Vercel CLI, and OS noise such as `.DS_Store`/`Thumbs.db` if it appears. No current ignore rule should be removed. | Low |
| Git index/worktree | `git status --short` shows extensive staged, modified, and untracked application files. Several design/audit files (`AGENTS.md`, `DESIGN_SYSTEM_V2.md`, `DESIGN_SYSTEM_V3.md`, `HOMEPAGE_REVIEW.md`, `POST_CONTENT_REVIEW.md`, `REDESIGN_PLAN.md`, `UI_AUDIT_REPORT.md`) are staged as additions but deleted from the working tree (`AD`). Verify intended staging before release; do not use `git clean` or reset to “tidy” this state. | High |

### Routes and data

- No implemented route file was identified as unused. The root `page.tsx` is not a route because the application route root is `src/app/`.
- The apparently alternate account route `/my-account-2` is actively linked and revalidated; keep it.
- `src/data/` exists locally but is empty. No obsolete static data files remain there.
- No empty mock repository, sample movie/booking fixture, or temporary database fallback was found in the inspected source.
- The `src/services/movie-service.ts` adapter is actively used; do not remove it as part of a cleanup of the older repository files.

### Empty Directories

The following directories are empty in the current worktree. Git does not preserve empty directories, so they are local filesystem residue rather than files that will appear in a commit:

- `src/data/`, `src/hooks/`
- `src/app/admin/customers/`, `src/app/admin/login/`
- `src/app/api/bookings/`, `src/app/api/events/`, `src/app/api/movies/`, `src/app/api/news/`, `src/app/api/users/`
- `src/app/booking/[showtimeId]/resume/`
- `public/fonts/`, `public/icons/`
- `public/images/banners/`, `public/images/events/`, `public/images/logo/`, `public/images/news/`, `public/images/placeholders/`, `public/images/promotions/`
- `public/images/movies/coming-soon/`, `public/images/movies/now-showing/`

The actual admin login route is under `src/app/(admin-auth)/admin/login/`; the empty `src/app/admin/login/` directory is not its implementation.

## Estimates

These are qualitative estimates for repository cleanliness and portfolio presentation, not production-security or deployment-readiness scores.

| Measure | Estimate |
| --- | ---: |
| Current Repository Quality | 7/10 |
| Repository Quality After the safe cleanup/archive recommendations | 8.5/10 |
| Portfolio Readiness Before Cleanup | 82/100 |
| Portfolio Readiness After Cleanup | 91/100 |

The expected improvement is primarily discoverability and confidence: fewer dead modules and root-level historical files, clearer Git state, and a concise portfolio-facing document set. Cleanup alone does not change application capabilities or establish production readiness.

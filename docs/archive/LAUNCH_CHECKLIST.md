# Launch Checklist

**Purpose:** Operational steps for a controlled staging and production release. This is a checklist, not evidence that a provider or deployment has already been configured.

## Release gates

- [ ] Confirm the actual venue time zone, L/XL capacities, accessible-seat positions, operating schedule, ticket prices, and ISO currency with the venue.
- [ ] Confirm whether a booking is a free reservation or a paid ticket. The current app confirms bookings without collecting payment.
- [ ] Add and verify real showtimes before enabling booking links for customers.
- [ ] Replace preview event/news entries and temporary screen reference photography with approved content.
- [ ] Confirm privacy, contact, cancellation, accessibility, and customer-support information.

## Required environment variables

Configure secrets in the deployment platform's secret manager, separately for staging and production. Never put production values in source control or expose server secrets as `NEXT_PUBLIC_*`.

| Variable | Required | Purpose and notes |
|---|---|---|
| `DATABASE_URL` | Yes | Runtime PostgreSQL connection. Use a pooled connection for a serverless deployment where supported. |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection used by Prisma migrations and administrative database tasks. Do not substitute the pooled URL for migration work. |
| `BETTER_AUTH_SECRET` | Yes | Random high-entropy secret, at least 32 characters. Generate a different value for each environment. |
| `BETTER_AUTH_URL` | Yes in production | Exact public HTTPS origin used by Better Auth, e.g. `https://cinema.example`. Keep aligned with the deployed domain and trusted origin. |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Public HTTPS canonical site origin used by metadata, sitemap, and robots. The code fallback is localhost and is not suitable for production. |
| `TMDB_API_KEY` | Yes for TMDB lookup | Server-only TMDB API key. Never expose it to client code. |
| `TMDB_BASE_URL` | Yes for TMDB lookup | Normally `https://api.themoviedb.org/3`; no code fallback is supplied. |
| `R2_ACCOUNT_ID` | Yes if managed R2 images are used | Cloudflare account identifier; the service validates its expected format. |
| `R2_ACCESS_KEY_ID` | Yes if managed R2 images are used | R2 S3-compatible access key ID. |
| `R2_SECRET_ACCESS_KEY` | Yes if managed R2 images are used | R2 S3-compatible secret key. Keep server-side only. |
| `R2_BUCKET_NAME` | Yes if managed R2 images are used | Name of the target R2 bucket. |
| `R2_PUBLIC_BASE_URL` | Yes if managed R2 images are used | HTTPS public/custom-domain base URL for objects. It is used by both the media service and Next Image remote-host configuration; set it before build. |
| `ADMIN_EMAIL` | One-time admin promotion only | Email of an existing active customer account when running `npm run db:promote-admin`. Do not leave it configured as a persistent runtime secret. |

`NODE_ENV` is set by the hosting platform. Email, payment, and scheduled-job credentials are not present because email delivery, online payments, and a hold-expiry worker have not been implemented/configured.

## Deployment steps

### 1. Prepare environments and access

- [ ] Select and record the production host, PostgreSQL provider/region, R2 region/account, domain, and on-call owner. The architecture proposal recommends Vercel, Neon, and Cloudflare R2, but no production deployment configuration was verified.
- [ ] Create separate staging and production projects/databases/buckets or equivalent isolation.
- [ ] Restrict production deployment and secret access to named maintainers.
- [ ] Confirm Node.js 20 or newer, consistent with `package.json`.
- [ ] Add CI steps for dependency install, typecheck, production build, migration review, and automated tests when such tests are introduced.

### 2. Prepare the database

- [ ] Verify `DATABASE_URL` is appropriate for application runtime and `DIRECT_URL` is a direct, non-pooled connection for migrations and dumps.
- [ ] Take a provider snapshot/backup before a production migration.
- [ ] Review pending Prisma migrations; apply only reviewed migrations with `npx prisma migrate deploy`. Do not use `prisma migrate dev` against production.
- [ ] Generate the Prisma client and build against the intended environment.
- [ ] Verify screen and seat data against the actual venue before seeding. The current seed script hard-codes 120 seats for L and 240 for XL; do not run it in production until those values/layouts are approved.
- [ ] Create actual showtimes only after the venue time zone, price, currency, schedule, and screen inventory are confirmed.
- [ ] Verify the production database is not populated with unreviewed preview content.

### 3. Configure application secrets and build

- [ ] Add the required variables above to the hosting platform's production environment.
- [ ] Generate unique `BETTER_AUTH_SECRET` and R2 credentials for production; do not reuse staging or local credentials.
- [ ] Set `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` to the final HTTPS origin before building.
- [ ] Set `R2_PUBLIC_BASE_URL` before building if managed-media objects are in the database.
- [ ] Install from the lockfile with `npm ci`.
- [ ] Run `npm run db:generate`, `npm run typecheck`, and `npm run build`.
- [ ] Deploy to staging first, run smoke tests, then promote the reviewed build to production.
- [ ] Confirm the production runtime starts and logs expose no secrets or customer data.

### 4. Set up the first administrator

- [ ] Register the operator using the normal customer registration flow and a unique named account.
- [ ] Verify the account exists and is active in the intended environment.
- [ ] From a trusted operator environment connected to the correct production database, set `ADMIN_EMAIL` to that exact account and run `npm run db:promote-admin`.
- [ ] Remove/unset `ADMIN_EMAIL` immediately after successful promotion.
- [ ] Sign in at `/admin/login` and verify the account can access the dashboard.
- [ ] Verify a regular customer cannot open admin pages or invoke admin mutations.
- [ ] Keep separate named admin accounts; do not share credentials. Revoke admin access promptly when an operator leaves.
- [ ] Record the initial administrator and promotion date in the organization's approved access-control record (not in the repository).

The promotion script only promotes an existing active user; it does not create an account. Do not promote an account based solely on a client-supplied value.

### 5. Configure TMDB

- [ ] Create/obtain the TMDB API key using the organization's TMDB account.
- [ ] Set `TMDB_API_KEY` and `TMDB_BASE_URL=https://api.themoviedb.org/3` as server environment variables.
- [ ] Confirm the key is not prefixed with `NEXT_PUBLIC_` and does not appear in client bundles, logs, or source control.
- [ ] From the admin movie workflow, fetch one known TMDB ID and verify the returned details; save/publish only after editorial review.
- [ ] Confirm TMDB attribution and applicable provider terms are followed.

### 6. Configure Cloudflare R2

- [ ] Create the production bucket and a separate staging bucket or equivalent isolation.
- [ ] Create a scoped S3-compatible credential with only the required bucket operations; keep the secret server-side.
- [ ] Configure the intended HTTPS custom/public object domain and set `R2_PUBLIC_BASE_URL`.
- [ ] Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.
- [ ] Set all R2 variables before the Next.js build so the image remote-host allowlist includes the production domain.
- [ ] Verify public reads work for intended published images and direct bucket listing is not unintentionally exposed.
- [ ] Test an authorized admin upload and delete for each supported category: movie poster, movie backdrop, event, news, and promotion.
- [ ] Confirm file-size/type validation and failure handling; verify no secrets or untrusted arbitrary URLs are saved as media keys.
- [ ] Document object retention and removal of abandoned/unreferenced objects.

The application uploads to R2 through its server route, so browser-to-R2 CORS should not be broadened unless a future direct-browser upload design requires it.

## Database backup and restore procedure

Do not treat a successful backup command as proof of recoverability. Set retention and recovery objectives with the database owner and test restores regularly.

1. [ ] Enable the managed database provider's automated backup/PITR or snapshot feature and set documented retention. If using Neon, configure its snapshot/restore settings in the Neon project; if using another provider, use its equivalent.
2. [ ] Before each production schema migration, create a named provider snapshot or other approved recovery point.
3. [ ] For an independent encrypted export, use the direct connection (`DIRECT_URL`), a protected backup directory, and a short-lived credential. Example PowerShell procedure:

   ```powershell
   $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
   $backup = Join-Path $env:BACKUP_DIR "arena-$stamp.dump"
   pg_dump --format=custom --no-owner --file=$backup $env:DIRECT_URL
   pg_restore --list $backup
   ```

4. [ ] Encrypt the export at rest, transfer it to approved off-site storage, restrict access, and apply the approved retention schedule. Do not commit it to the repository or leave it on an unmanaged workstation.
5. [ ] On a regular schedule and after material schema changes, restore a recent backup into a disposable isolated staging database, then verify tables, representative content, users, bookings, and media object-key integrity.

   ```powershell
   pg_restore --no-owner --dbname=$env:STAGING_DIRECT_URL $backup
   ```

   Run this only against an empty, isolated restore target. Never test restore commands against the production database.

6. [ ] Record the restore result, duration, backup timestamp, and any recovery gaps. Document the provider's point-in-time recovery procedure and who is authorized to execute it.

## Smoke testing checklist

Run in staging first, using test accounts and non-production media:

- [ ] Public homepage renders with current approved content.
- [ ] Movies list, movie details, events, news, about, contact, and privacy pages load.
- [ ] Draft/archived content is not visible publicly; published content is visible.
- [ ] `/sitemap.xml` uses the production/staging origin and includes only eligible published records.
- [ ] `/robots.txt` disallows admin, API, account, and booking routes as intended.
- [ ] TMDB admin lookup succeeds with a known test ID and handles provider failure without exposing the API key.
- [ ] Admin upload/retrieval/deletion succeeds for one test image in each R2 category.
- [ ] Registration creates a customer, login/logout work, and unauthorized admin access is denied.
- [ ] Admin login, dashboard counts, customer list, booking list, and each required CRUD/publish/archive/cancel workflow work.
- [ ] Create a staging showtime using verified test inventory; verify schedule conflicts are rejected.
- [ ] Two separate test users attempt the same seat concurrently; exactly one hold should succeed.
- [ ] Verify a hold expires after ten minutes, the seat becomes selectable again, and a confirmation cannot use an expired hold.
- [ ] Confirm the current no-payment behavior is intentional and the customer-facing wording matches the approved reservation policy.
- [ ] Verify booking ownership: a customer cannot read another user's summary, confirmation, or history by changing IDs.
- [ ] Test desktop, tablet, and phone widths for public, account, booking, seat selection, and admin pages; include keyboard-only navigation.
- [ ] Inspect browser/server logs for errors, failed database queries, missing media, and accidental personal data or secret logging.
- [ ] Verify monitoring/alerts and the documented rollback procedure before production traffic is enabled.

## Security checklist

- [ ] **Secrets in Git:** `.gitignore` currently ignores `.env.local` and `.env.*.local`, but not a plain `.env`. Before adding secrets, ensure `.env` and all production secret files are ignored; inspect repository history and rotate any credential that was ever committed.
- [ ] Generate unique, high-entropy `BETTER_AUTH_SECRET` values of at least 32 characters per environment.
- [ ] Require HTTPS; align Better Auth URL, site URL, host allowlists, and proxy settings with the exact deployed origin.
- [ ] Keep `DATABASE_URL`, `DIRECT_URL`, TMDB key, R2 keys, and admin credentials server-side; never include them in logs, client bundles, screenshots, or source control.
- [ ] Use separate least-privilege runtime and migration database credentials where supported; restrict production database network access.
- [ ] Restrict R2 credentials to the required bucket and operations; rotate and revoke credentials when staff or vendors change.
- [ ] Confirm admin actions and media endpoints reject unauthenticated, non-admin, and disabled users. Specifically verify the media API rejects disabled admin accounts before launch.
- [ ] Verify explicit rate limiting for login, registration, booking, and media upload/delete endpoints; do not assume platform defaults without testing.
- [ ] Decide whether admin MFA, email verification, password recovery, account lockout, and session revocation are required; current project configuration does not evidence these workflows.
- [ ] Confirm customer ownership checks for every account and booking lookup; run IDOR and role-escalation tests in staging.
- [ ] Restrict admin users to named individuals, review privileges periodically, and maintain an off-repository access record. No persistent application audit log was found.
- [ ] Validate file upload type/size, public object permissions, and upload/delete authorization.
- [ ] Review logs and error reporting for passwords, session tokens, database URLs, TMDB/R2 secrets, and unnecessary customer PII.
- [ ] Review dependency advisories and production build output before release; establish a patch/update owner.
- [ ] Verify privacy notice, data retention, customer support, incident response, and breach-notification responsibilities with the organization.
- [ ] Keep payment collection disabled until an approved payment design and operational process exists; never collect or store card details in this application.

## Go-live sign-off

- [ ] Product/venue owner approved content, schedules, ticket prices, currency, time zone, seat inventory, and unpaid/paid booking policy.
- [ ] Engineering owner verified migrations, production build, environment configuration, monitoring, and rollback.
- [ ] Database owner verified automated backups and a successful restore rehearsal.
- [ ] Security owner reviewed access control, secrets, rate limits, privacy, and admin provisioning.
- [ ] Operations owner verified customer support, cancellation/no-show handling, incident response, and on-call coverage.
- [ ] Enable public booking only after all booking and data-integrity gates are signed off.

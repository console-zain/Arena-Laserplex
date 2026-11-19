# Missing Pages Audit

## Scope and method

The route inventory and current UI/auth/booking behavior were checked in
`src/app`, `src/components`, and `src/server`. The referenced PDF was not
available as a readable workspace attachment; this audit uses the checklist
items included in the request.

The legal pages created here describe current preview behavior. They are not
legal advice and need operator/legal review before production use.

## Already Exists

| Checklist item | Current implementation |
| --- | --- |
| Privacy Policy | `/privacy-policy` |
| Login | `/login` |
| Register | `/register` |
| Account Pages | `/my-account` and `/my-account-2` (account overview, booking history, and read-only personal information) |
| Account Settings | Partially covered by `/my-account`; editable profile/password settings are not present |
| Support | `/contact`; direct contact details are configurable, but the message form currently validates locally and does not send |
| No Search Results | `MovieFilters` displays an empty-results message |
| 404 | `src/app/not-found.tsx` |
| 500 / Error State | `src/app/error.tsx` and `src/app/global-error.tsx` |
| Loading State | `src/app/loading.tsx` |
| Success State | Booking confirmation at `/booking/confirmation/[bookingId]` |

## Missing

### Created in this change

| Page | Route |
| --- | --- |
| Terms of Service | `/terms-of-service` |
| Cookie Policy | `/cookie-policy` |
| Refund Policy | `/refund-policy` |
| Cancellation Policy | `/cancellation-policy` |
| Disclaimer | `/disclaimer` |
| Accessibility Statement | `/accessibility-statement` |
| Security Policy | `/security-policy` |
| Responsible Disclosure | `/responsible-disclosure` |
| Help Center | `/help-center` |
| 403 / Access Denied | `/403` |
| Maintenance | `/maintenance` |
| Session Expired | `/session-expired` |

### Missing, relevant, but deferred

| Page / flow | Reason not created |
| --- | --- |
| Email Verification | Better Auth is not configured for verification and no email-delivery provider is present. |
| Forgot Password | The login UI currently says recovery is unavailable; email delivery is not configured, so a reset request cannot be delivered. |
| Reset Password | Requires a valid reset token and email-delivery flow, neither of which is configured. |

## Recommended

- Configure a trusted email provider, then implement and test verification and
  password-reset flows before relying on customer accounts in production.
- Add editable account settings, including verified email/password changes and
  account recovery, rather than duplicating the existing account pages.
- Make the Contact form deliver messages and publish a dedicated, monitored
  security-reporting address; the new disclosure page explicitly notes that
  neither is configured yet.
- Define and approve the cancellation/refund terms before introducing online
  payment collection.
- Consider Cookie Preferences if optional analytics, advertising, or other
  consent-managed storage is introduced. No such preference categories are
  currently identified in the application.
- Connect maintenance and session-expired states to the relevant runtime
  conditions. The new routes are available, but this change does not add a
  global maintenance switch or change authentication redirects.

## Not Applicable

| Checklist item | Reason |
| --- | --- |
| Cookie Preferences | No optional cookie/analytics preference categories are currently configured; the theme is controlled by the existing theme toggle. |
| Onboarding | The cinema account flow has no required profile setup or multi-step onboarding process. |
| Billing | The current booking flow explicitly collects no online payment. |
| Acceptable Use Policy | No separate policy page is needed for the current site; basic acceptable-use rules are included in Terms of Service. |
| Community Guidelines | There are no public posts, reviews, comments, or community features. |
| Offline | No service worker or offline-capable application shell exists, so an offline route would not be available when the browser is actually offline. |

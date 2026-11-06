# Patient portal development validation

## Latest patient workflow refinement

The sign-in, dashboard, draft saving and test submission implementation now also
includes complete read-only submission fields, saved/submitted timestamps,
pending draft creation, accessible form labels and failed email-link feedback.

- Lint, generated-route TypeScript check and production build: passed.
- Database/configuration suite: **16 passed**, none failed or skipped.
- Default-mode browser suite: **20 passed**, none failed or skipped.
- Hosted configuration test discovery: four desktop/mobile cases listed using
  explicitly fictional settings; no network calls or actual execution.
- Hosted runner without configuration: stopped with the expected missing-setting
  error before network activity. This is a guard check, not a passing live test.
- Actual authenticated hosted workflow: **four cases unrun**, because the project,
  publishable key and two confirmed development test accounts are not configured.

The embedded database cases still simulate the JWT subject; they do not prove
Supabase authentication or email delivery. See HOSTED_SUPABASE.md for the hosted
runner and environment settings. The historic local results below are retained
for context; Docker is not required for the selected hosted workflow.

## Earlier development validation

Validated in the cloud environment on November 5, 2026, with Node.js 24.22.1,
npm 11.9.0, Next.js 16.4.3, and system Chromium.

| Check | Result |
| --- | --- |
| Frozen installation | `npm ci --offline --cache /workspace/.npm-cache` passed with elevated native-process execution. |
| Lint | Passed. Generated Playwright report and result assets are excluded. |
| TypeScript | Passed, including generated Next.js route types. |
| Embedded PostgreSQL and schema tests | 12 passed, 0 failed, 0 skipped. |
| Production build | Passed; session/configuration-dependent pages are partially prerendered and the auth callback is dynamic. |
| Default-site and disabled-portal browser suite | 20 passed, 0 failed, 0 skipped across desktop and mobile Chromium. |
| Supabase CLI installer | Official 2.75.0 archive downloaded through the proxy; published SHA-256 verified; helper executed successfully. |
| Live Supabase test helper | Correctly exits with a missing-backend error without printing credentials. This is not a passing live integration test. |
| Authenticated live browser suite | 6 cases defined; **not executed**, blocked by local backend startup. |

Database tests apply the real migration in embedded PostgreSQL, with a fixture
for the verified JWT subject and auth-user table. They test ownership/RLS,
anonymous denial, rejection of direct table writes, incomplete draft saving,
version increments, stale or missing-version rejection, required test fields,
explicit fictional-data confirmation, submitted-record locks, and data limits.
They do not validate GoTrue authentication, SMTP, or JWT signature verification.

Browser tests cover the existing site, mobile navigation, donation fallback,
default portal notices, absence of credential collection without configuration,
protected-route redirects, and callback redirect safety. An initial callback
test found host normalization to `localhost`; a relative same-origin redirect
corrected it. A request-time gate keeps callback configuration dynamic after
builds. Both callback cases passed in the final complete 20-case run.

## External blocker and limits

The local Supabase startup failed pulling images from `public.ecr.aws` with
HTTP 403. The host was added to the environment draft; the last observed runtime
policy still did not allow it. Apply the setting before retrying startup.

Until that succeeds, full signup/signin, email confirmation/recovery, session
refresh/revocation, and browser-to-Supabase save/resume/submission remain unverified.
No hosted project, real patient data, production intake, document storage,
staff dashboard, deployment, or main-branch merge was used or activated.

These are development foundations, not approval to open a real patient service.
See `PATIENT_PORTAL.md` for setup and remaining security/operational work.

# Hosted Supabase development — selected workflow

The user selected a hosted development project to avoid the local image-registry
blocker. A project has **not** been created or connected yet. No Docker, AWS
account, local Supabase stack, or local CLI installation is required for this path.

## User setup

1. Create a new, empty project named `nhcaf-dev` at
   https://supabase.com/dashboard. Choose your organization and a suitable region.
   Save the database password privately; the application does not need it.
2. Share only the **Project URL** with the agent. The exact project hostname will
   be added to this cloud environment's allowed network destinations.
3. Enter the project's **publishable key** in the environment variable
   `SUPABASE_PUBLISHABLE_KEY` through environment settings. Do not send it in chat.
   Do not supply a service-role/secret key or database password. The app rejects
   privileged key types. Key-type validation is not provider authentication.
4. In the new project's SQL editor, run the complete, tracked migration
   `supabase/migrations/202611050001_patient_portal.sql` **once**. Review it first.
   It creates development patient tables, row-level policies and constrained
   write functions. Do not run it against an existing production database.
5. In authentication settings, enable email sign-up and email confirmation,
   configure email delivery for your test addresses, and set the password minimum
   to at least 12 characters. Keep provider abuse controls enabled.

## Environment and redirects

| Variable | Development value |
| --- | --- |
| `SUPABASE_URL` | Exact HTTPS Project URL supplied by the dashboard. |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key, or legacy anon key; never a service-role/secret key. |
| `PATIENT_PORTAL_MODE` | Keep `disabled` during preparation; set `development` only for isolated testing. |
| `PATIENT_PORTAL_SITE_URL` | Actual origin of the app being tested. |

Configure Supabase's Site URL and exact allowed Redirect URLs to match the app's
origin and both `/portal/auth/callback` and
`/portal/auth/callback?next=password`. Do not add wildcard redirects. For local
development, the app origin can be `http://127.0.0.1:3000`; email links must be
opened in the same browser with access to that running app so PKCE cookies match.
A local address inside the cloud machine is not automatically accessible from
the user's computer. Choose an actual reachable development app origin before
email-link testing. Onboarding does not provide a user-facing localhost preview.

In this managed cloud environment, preserve the supplied HTTP proxy and CA trust.
Node 24 can use its built-in proxy support with `NODE_USE_ENV_PROXY=1` when running
the app against hosted Supabase. Keep `NO_PROXY` intact so local app requests stay
local. Add only the exact project hostname after it is known; do not broadly
allow every Supabase project. Apply/save environment changes and publish when
required. Saved draft changes do not establish running connectivity.

## Read-only preflight

After configuration is applied:

```bash
npm run check:patient:hosted
```

The preflight uses the configured HTTPS project and publishable key, follows no
redirects, contacts auth settings, and checks that anonymous patient-table
requests are denied. It never creates accounts or records and prints no key or
response body. It is not full authentication/RLS validation.

The existing `test:patient:local` remains local-only. Its generated-account tests
assume local email auto-confirmation and must **not** be pointed at the hosted
project. For hosted testing, first create two dedicated fictional test accounts,
confirm their emails normally, and verify sign-in, save/resume, submission,
cross-patient denial, sign-out, reset/confirmation links, and session expiry.

## Hosted patient workflow tests

The `npm run test:patient:hosted` command now runs the implemented sign-in,
dashboard, partial draft/save/sign-out/resume, validation, fictional-data
confirmation, read-only test submission, session-cookie and cross-patient checks
against the configured hosted development project. It runs two cases at desktop
and mobile sizes (four cases total). It does not create users, send email, or
disable confirmation. Password recovery and actual email-link expiry still need
separate validation.

Supply these **additional** environment settings only for isolated test accounts:

| Name | Value |
| --- | --- |
| `PATIENT_TEST_TARGET_URL` | Exact expected development Project URL, matching `SUPABASE_URL`. |
| `PATIENT_TEST_EMAIL_A`, `PATIENT_TEST_PASSWORD_A` | First dedicated, confirmed development account. |
| `PATIENT_TEST_EMAIL_B`, `PATIENT_TEST_PASSWORD_B` | Second dedicated, confirmed development account; a different email. |

Enter account values through secure environment settings, never chat or committed
files. Do not use real patient accounts. The runner requires development mode,
HTTPS, a publishable/anon key, and an explicitly matching project target. It runs
the read-only preflight before launching a temporary production app on port 3100.
No Docker or local Supabase CLI is needed. Run `npm run build` first.

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:patient:hosted
```

Browser tracing, video, screenshots and automatic failure DOM snapshots are
disabled for these credential-bearing tests. Sign-in helper errors are generic.
Successful tests leave fictional application records in the development database
for review; they do not delete existing data or use a privileged cleanup key.
The normal `npm test` suite excludes both local and hosted authenticated tests.
Keep portal variables disabled/unset for that default-mode suite.

## Current limits

The default portal remains closed. No hosted connectivity, migration application,
email delivery, authenticated patient workflow, or live storage has been verified.
Do not accept real patient information or enable production intake.

Latest verification: lint, TypeScript, all **16** database/configuration tests,
production build, and all **20** default-mode desktop/mobile browser tests passed.
Hosted test discovery lists four cases using fictional configuration without
running them. The hosted runner correctly stops before network activity when
project/account configuration is missing. Its preflight and four authenticated
hosted cases remain **unrun** against a real project.

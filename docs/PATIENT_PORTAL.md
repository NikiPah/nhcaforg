# Patient portal — development implementation

Work is in `NikiPah/nhcaforg`, branch `feature/patient-portal`, based on the
Milestone 1 contribution. This is a development workflow, not an open assistance
service. Use fictional application details only. Staff administration is deferred.

## Implemented

- Supabase-backed email/password sign-up and sign-in, sign-out, confirmation
  callback, password reset, and password update integration.
- Server-validated sessions using `auth.getUser()`, HttpOnly session cookies,
  refresh in Next.js Proxy, and request-time data access with no shared caching.
- Patient dashboard, new test applications, partial drafts, save/resume,
  validation, explicit fictional-data confirmation, and read-only test submissions.
- PostgreSQL row-level ownership policies and narrowly scoped write functions.
  No service-role key is used by the application. Each mutation verifies the
  authenticated owner, draft state, and expected version, and records a minimal
  event in the same transaction.
- Database constraints and independent tests for ownership, anonymous denial,
  direct-write denial, stale drafts, invalid fields, and submitted-record locks.

Missing configuration keeps the portal closed and hides credential forms. Only
`PATIENT_PORTAL_MODE=development` is supported; `production` does not enable it.
The questionnaire is a development draft and is not approved intake policy.

## Local Supabase setup

Requires Docker and Supabase CLI 2.75.0. The onboarding machine has a verified
CLI at `/workspace/tools/supabase-2.75.0/supabase`. A fresh environment needs the
CLI installed from its official release with the published SHA-256 verified.
On Linux x86_64, `bash scripts/install-supabase-cli.sh` performs that verified
installation without writing to the home directory.
The npm CLI was not retained: version 3 attempted to write to a read-only home,
and version 2's npm installer did not respect this environment's HTTP proxy.

In the repository:

```bash
supabase start --exclude realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
```

The tracked `supabase/config.toml` is **local test configuration**. It disables
document storage and email confirmation for locally generated test accounts.
Email is captured in the local test mailbox, not sent to real recipients.
The migration is applied by a fresh local startup. Never run a destructive
database reset on existing user data. Apply outstanding migrations normally.

The current environment blocked image downloads from `public.ecr.aws` with
HTTP 403. That domain was added to the saved environment configuration draft;
the user must save/apply the networking change and publish as required. Recheck
the actual image pull after it is applied. The draft does not change the running
policy by itself. No AWS account or AWS key is required for these public images.

## Application configuration

For an isolated development project only, provide these in secure environment
settings or an ignored local environment file. Never commit credentials:

| Name | Meaning |
| --- | --- |
| `PATIENT_PORTAL_MODE` | `development`; omitted by default so intake remains closed. |
| `SUPABASE_URL` | Local API URL, or the HTTPS URL of an approved isolated development project. |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key, never a service-role or secret key. |
| `PATIENT_PORTAL_SITE_URL` | The actual app origin used for auth redirects; HTTPS except on local loopback. |

For a hosted development project, apply the migration through its reviewed
database migration workflow, enable email confirmation, configure email delivery
and exact callback URLs, set provider rate limits, and test recovery flows. Do
not connect a production patient database. Do not request or paste keys in chat.

## Verification commands

```bash
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

The normal browser suite expects the portal to be unconfigured. Remove the
development portal variables when running it. It includes the original site
checks plus disabled-portal safeguards.

After the local Supabase stack starts, run:

```bash
SUPABASE_CLI_PATH=/workspace/tools/supabase-2.75.0/supabase \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:patient:local
```

That helper captures local CLI status without printing its key values, enables
the development portal only in the test subprocess, and starts the production
server on port 3100. It refuses a remote backend and uses fictional records and
generated local-only accounts. It tests authenticated navigation, save/sign-out/
resume, validation, submission, cookies, and cross-patient record isolation.

The embedded PostgreSQL tests simulate the verified JWT subject and `auth.users`
table, then apply the actual migration. They validate database rules but do not
replace Supabase Auth, SMTP, refresh, or full browser-to-backend integration tests.

## Work remaining before real intake

Complete live local integration and email confirmation/recovery/expiry testing;
choose an isolated hosted development project; approve the questionnaire,
eligibility criteria, real consent, privacy and retention policies; implement
secure private document quarantine/scanning and authorized download; implement
staff review and patient communications with negative permission tests; review
logging, backups, recovery, abuse controls, and accessibility. Opening a real
patient service requires separate security and operational approval.

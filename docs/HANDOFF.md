# Continue the NHCAF patient portal

Repository: **https://github.com/NikiPah/nhcaforg**

Current branch: **feature/patient-portal**

The user chose to use this repository only. Do not pursue the old
`nhcafoundation/nhcaf-platform` integration unless explicitly requested again.
The user confirmed **patient applications first, using Supabase**. Admin portal
work is deferred. Do not deploy or merge to main without explicit approval.

## Starting context

The supplied website ZIP was preserved as the initial baseline on `main`.
Milestone 1 was committed separately as `696e4d4` on
`feature/milestone-1-foundations`: informational apply/portal/staff pages, shared
components, data-model/roadmap documentation, 14 passing browser tests, and
working webpack builds with locally installed Source Sans/Serif fonts.

The patient portal branch builds on that work. Read `AGENTS.md`,
`docs/PATIENT_PORTAL.md`, and the bundled Next.js docs. It retains Cache Components,
so all session/config checks must run at request time behind Suspense boundaries.
Preserve homepage branding, assistance program copy, and Zeffy donation support.

## Current state

Patient portal code, Supabase migration, disabled-mode browser tests,
embedded PostgreSQL rule tests, and local live integration tests are written.
The default portal stays closed. No provider credentials are configured and no
real patient information has been used.

The embedded PostgreSQL/schema tests executed **12 tests, all passed**.
Lint/types passed before the final changes. The first patient production build
passed; final checks must be rerun after later edits.

**Live Supabase integration remains blocked:** `supabase start` could not pull
images from `public.ecr.aws` (HTTP 403). A network allowance was saved in this
account's environment draft but was not yet applied when last checked. Saved
environment drafts and this chat do not automatically transfer between accounts.
In a new account, configure the required network destination in that account's
environment settings. Do not bypass the proxy or disable verification.

## Next actions

1. Inspect the current branch and preserve local changes. Each task is isolated;
   use the existing checkout, without a worktree unless the user asks for one.
2. Run lint, types, the 12 database/schema tests, production build, and normal
   disabled-mode browser tests. Record actual current results.
3. Confirm `public.ecr.aws` is allowed in the running environment, then start the
   local Supabase stack and run `npm run test:patient:local` as documented.
   Diagnose any failures instead of treating unrun tests as passing.
4. Test confirmation, password recovery, expired/revoked sessions, refresh,
   database visibility, and concurrency against the real local backend.
5. Help the user create an isolated Supabase development project if desired.
   Request configuration through environment settings, never secret values in chat.
6. Push fixes and prepare a PR in NikiPah/nhcaforg. Do not enable real intake,
   production uploads, staff access, production deployment, or an unapproved merge.

The old shared ChatGPT link could not be read. No decisions from that separate
chat are assumed. Ask for an export if it contains additional requirements.

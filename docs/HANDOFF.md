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

The user has now selected **hosted Supabase development** to avoid the local
registry blocker, but has **not created the project yet**. Follow
`docs/HOSTED_SUPABASE.md`. Ask for its Project URL only once it exists; request
the publishable key through environment settings, never in chat. Add the exact
project hostname to networking after it is known. Local Docker startup and the
`public.ecr.aws` allowance are optional for this selected path.

The hosted-preparation change passed lint, types, 13 database/configuration tests,
and production build. A read-only `npm run check:patient:hosted` is provided; it
currently stops because project configuration is absent. It confirms a database
permission error, rather than treating a generic network/auth rejection as proof
of patient-table protection. Privileged keys are rejected by configuration.

The latest patient-workflow refinement adds full saved-field submission review,
dashboard saved/submitted times, pending state for draft creation, accessible
password/form labels, and email-link failure feedback. It also adds
`npm run test:patient:hosted` with two confirmed development accounts and a pinned
project target. The account settings are absent; those four desktop/mobile cases
are written but not executed. Read HOSTED_SUPABASE.md for the secure fixture setup.
The latest database/configuration suite has **16** passing tests.
Lint, types, production build, and all 20 default-mode browser checks also passed
for this refinement. Hosted test discovery lists four cases, but no live hosted
case has been executed. The runner stopped before network activity when checked
without configuration. Do not report discovery or missing-config checks as a
working patient backend.

Patient portal code, Supabase migration, disabled-mode browser tests,
embedded PostgreSQL rule tests, and local live integration tests are written.
The default portal stays closed. No provider credentials are configured and no
real patient information has been used.

The final independent checks passed: frozen reinstall, lint, TypeScript,
**12 embedded PostgreSQL/schema tests**, production build, and **20 desktop/mobile
browser tests** of the default site and unconfigured portal. See
`PATIENT_PORTAL_VALIDATION.md` for scope and the live integration blocker.

**Live hosted integration remains blocked:** the user has not provided a
development project URL or configured the publishable key. No project/account
settings were present when last inspected. The old local startup failed pulling
images from `public.ecr.aws`; its obsolete draft allowance was removed after the
hosted path was selected. It is not a prerequisite for the selected workflow.
Saved environment drafts and this chat do not automatically transfer between
accounts. Do not bypass the proxy or disable verification.

## Next actions

1. Inspect the current branch and preserve local changes. Each task is isolated;
   use the existing checkout, without a worktree unless the user asks for one.
2. After code or setup changes, rerun the relevant lint, type, database/schema,
   production-build and browser checks. Avoid repeating unchanged passing checks
   unless new changes or failures justify it.
3. Connect an isolated hosted Supabase development project, add only its exact
   hostname to networking, apply the reviewed migration once, and configure
   confirmed test accounts as documented. Run `npm run check:patient:hosted` and
   `npm run test:patient:hosted`; diagnose failures and record actual outcomes.
4. Test confirmation, password recovery, expired/revoked sessions, refresh,
   database visibility, and concurrency against the real local backend.
5. Help the user create an isolated Supabase development project if desired.
   Request configuration through environment settings, never secret values in chat.
6. Push fixes and prepare a PR in NikiPah/nhcaforg. Do not enable real intake,
   production uploads, staff access, production deployment, or an unapproved merge.

The old shared ChatGPT link could not be read. No decisions from that separate
chat are assumed. Ask for an export if it contains additional requirements.

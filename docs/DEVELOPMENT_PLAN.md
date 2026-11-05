# NHCAF development plan

## Milestone 1 — interface foundations

- [x] Read the supplied existing Next.js architecture and bundled framework docs.
- [x] Preserve the homepage, program descriptions, branding, and Zeffy integration.
- [x] Add an informational `/apply` page and connect assistance links.
- [x] Add `/portal` and `/staff` informational route/layout foundations.
- [x] Clearly mark services as nonoperational; add no intake, login, or storage.
- [x] Add shared layout, intro, development notice, and planned-feature components.
- [x] Propose the application data model and document security boundaries.
- [x] Add browser tests for desktop/mobile navigation, notices, no intake controls,
  route metadata, missing data endpoints, and donation fallback behavior.
- [x] Complete lint, type, browser-test, and production build validation (results in `VALIDATION.md`).
- [ ] Review contribution in `NikiPah/nhcaforg`.
- [ ] Merge the reviewed contribution into this repository's main branch after approval.

The user selected **NikiPah/nhcaforg only** for continued development. Upstream
integration is deferred. The next priority is the **patient application portal**,
using **Supabase**. See `PATIENT_PORTAL.md` and `HANDOFF.md` for the current
development implementation and live-backend testing blocker. Admin work follows.

## Next milestone — database and security foundation

Select and approve managed authentication, database, and private storage. Turn
the proposed data model into reviewed migrations and implement server-side
authorization with meaningful negative tests before adding real application
forms. Establish staff MFA, role provisioning/revocation, audit logging, document
quarantine, consent, retention/deletion, and backup/recovery requirements.

Provider selection and production credentials are pending. They do not block
Milestone 1. Do not connect a production database or accept real patient data
until security and operational requirements have been approved.

## Later milestones

1. Patient portal: approved eligibility prescreen, validated application,
   save/resume, private uploads, consent, status and information requests.
2. Staff portal: role-scoped queues, reviews, human decisions, assistance
   delivery tracking, patient history, and administrative reporting.
3. Public integration: approved program/eligibility/contact information,
   operational portal links, continued Zeffy donation support.
4. Release: end-to-end permissions/security verification, accessibility checks,
   recovery procedures, deployment documentation, and explicit release approval.

## Decisions recorded

- Keep the existing Next.js App Router, React, TypeScript, Tailwind design, and
  Cache Components configuration. Consult installed Next.js docs for changes.
- Milestone 1 portal routes render public informational pages only. No fake login,
  staff dashboard, case records, API routes, or browser-persisted application data.
- Shared server-rendered interface components support future layouts; the existing
  client navigation component remains shared across pages.
- Portal/staff `noindex` metadata reduces accidental indexing; it is not access control.
- Use the same Source Sans 3 and Source Serif 4 font families through locked
  Fontsource packages and `next/font/local`. The original Google-hosted build-time
  downloads were blocked in the cloud environment. Keep font licenses in packages.
- Use Next.js's supported webpack mode for development and production builds,
  with the documented Tailwind PostCSS plugin. Turbopack's native CSS worker could
  not bind its local connection in this environment, even with elevated execution.
  The App Router, framework versions, Cache Components, and brand CSS are retained.
- The uploaded ZIP is a source snapshot without upstream Git history. Keep the
  import separate from contribution commits so only the contribution can later
  be applied to the real upstream history. Never force-push or replace that history.

## Open questions

- Supabase is selected; which isolated hosted development project will be used?
- Who approves eligibility criteria, questionnaires, consent, and patient messages?
- What are staff case scopes, financial controls, and separation-of-duties rules?
- What retention, deletion, incident response, and compliance requirements apply?
- Are there additional project decisions in the shared chat? Its link was blocked
  by this environment; the text/export has not been read.

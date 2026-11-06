# NHCAF patient portal — review package

Repository: https://github.com/NikiPah/nhcaforg

Branch: `feature/patient-portal`

## See the patient flow without installing anything

Open **`docs/patient-flow.html`** in a browser. Choose steps 1–6 or use Next and
Previous. It is self-contained, works offline, and can be shared with reviewers.
Print it to show all six steps at once.

The illustrated screens are a read-only walkthrough using fictional examples.
They are not live patient records, sign-in screens, or operational application
forms. Nothing is collected, saved, submitted, or sent over the network.

The flow is: account/sign-in → dashboard → application draft → save/resume →
review/test submission → read-only test status. Real intake is not open.

## Review the code

- Patient pages: `app/portal/`.
- Patient components: `components/patient/`.
- Server authentication and configuration: `lib/patient/` and `proxy.ts`.
- Database migration and ownership rules: `supabase/migrations/`.
- Hosted setup: `docs/HOSTED_SUPABASE.md`.
- Actual checks and remaining limits: `docs/PATIENT_PORTAL_VALIDATION.md`.
- Continue development: `docs/HANDOFF.md`.

Build, lint, TypeScript, 16 database/configuration tests and 20 default-mode
browser tests passed for the latest workflow code. The authenticated hosted
workflow still needs a configured Supabase development project and two confirmed
test accounts; its four test cases have not run against a real hosted backend.

## Run the development application

Use Node.js 24 LTS. In the project directory:

```bash
npm ci
npm run dev
```

The default app keeps patient accounts and intake closed until an isolated
development backend is configured. Follow `docs/HOSTED_SUPABASE.md`; never use
real patient data. No credentials, environment files, installed dependencies,
Git history or generated test reports are included in the source ZIP. Install
dependencies from the committed lockfile. Do not deploy or merge without approval.

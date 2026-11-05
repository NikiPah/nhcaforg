# NHCAF website and assistance platform

Existing North Houston Cancer Assistance Foundation website, with Milestone 1
informational foundations for a future assistance platform.

The `feature/patient-portal` branch adds a Supabase-backed **development-only**
patient workflow. Read [the handoff](docs/HANDOFF.md) and
[patient portal setup](docs/PATIENT_PORTAL.md). The portal remains closed unless
explicitly configured for an isolated development backend. Admin work is deferred.

## Local development

Use Node.js 24 LTS and npm (the lockfile is committed).

```bash
npm ci
npm run dev
```

The public routes are `/`, `/donate`, and `/apply`. `/portal` and `/staff` are
**nonoperational informational pages**. There is no authentication, database,
patient intake, document storage, or functioning staff dashboard. No secrets or
patient data are needed for this milestone. Do not use real patient data.

This description applies to the default, unconfigured portal. The development
branch's optional authenticated workflow is documented separately above.

Fonts are installed from npm and served locally. The existing live donation
integration uses Zeffy; local tests intercept its requests and do not make payments.
Development and production builds use Next.js's supported webpack mode and the
standard Tailwind PostCSS plugin for compatibility with the cloud environment.

## Checks

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright install chromium
npm test
```

Tests start their own production server on port 3100 and require a successful
build. On supported Linux hosts, `npx playwright install --with-deps chromium`
also installs browser system dependencies. If Chromium is already provided,
set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its absolute path when running tests.
Tests cover desktop and mobile sizes and save page screenshots in `test-results/`.

`npm run start` serves a completed production build. Read `AGENTS.md` and the
installed Next.js docs before making framework changes.

## Project documentation

- [Development roadmap and decisions](docs/DEVELOPMENT_PLAN.md)
- [Proposed data model and access rules](docs/DATA_MODEL.md)
- [Validation results and limitations](docs/VALIDATION.md)
- [Contribution and upstream integration](docs/CONTRIBUTING.md)

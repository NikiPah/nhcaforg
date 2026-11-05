# Add Milestone 1 assistance and portal foundations

Assistance links now lead to an informational `/apply` page explaining the
planned digital process. `/portal` and `/staff` provide reusable layout
foundations and clearly state that they are nonoperational. There are no login
forms, intake controls, uploads, staff dashboards, or patient records.

The existing homepage branding, assistance-program copy, and Zeffy integration
are preserved. Source Sans 3 and Source Serif 4 are now installed locally to avoid
blocked Google Fonts downloads. Supported webpack builds with standard Tailwind
PostCSS avoid this environment's Turbopack worker binding failure.

Includes a proposed data model, role/security boundaries, development roadmap,
integration instructions, browser tests, CI workflow, and desktop/mobile
screenshots. The ZIP import is a separate baseline commit; this contribution must
be applied to the actual upstream Git history before an upstream PR is merged.

Validation: production build, lint, generated-route TypeScript check, and all 14
desktop/mobile Chromium tests passed. Zeffy fallback was tested with network
requests intercepted; live payments and future authorization are not validated.

No production deployment or upstream merge is included. Managed authentication,
private storage, operational policy approval, and server-side permissions are
prerequisites for a functioning assistance service.

See [validation and screenshots](VALIDATION.md) and the
[roadmap](DEVELOPMENT_PLAN.md). This document is prepared PR text; it does not
establish that a GitHub PR exists.

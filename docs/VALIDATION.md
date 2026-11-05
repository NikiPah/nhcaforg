# Milestone 1 validation

Validated in the current cloud instance on November 5, 2026, using Node.js
24.22.1, npm 11.9.0, Next.js 16.4.3, and the provided system Chromium.

## Original supplied snapshot

- `npm ci`: passed with the original lockfile.
- `npm run lint`: passed.
- `npm run build`: failed fetching Source Sans 3 and Source Serif 4 from Google
  Fonts. Direct checks through the configured proxy returned HTTP 403.
- After switching the fonts to local packages, Turbopack failed binding a local
  worker connection during CSS processing, including an elevated retry. The
  supported webpack compiler and documented Tailwind PostCSS integration resolved
  this environment failure without changing framework versions or program copy.
- No test suite was present in the snapshot.

## Completed contribution

| Check | Result |
| --- | --- |
| Production build (`npm run build`) | Passed; homepage, donate, apply, portal, staff and metadata routes generated. |
| Lint (`npm run lint`) | Passed after correcting the PostCSS configuration export warning. |
| Type check (`npm run typecheck`) | Passed with generated Next.js route types. |
| Browser tests (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`) | 14 passed, 0 failed, 0 skipped; desktop and mobile Chromium. |
| Screenshots | Captured for all three new pages at desktop and mobile sizes. Apply desktop and portal mobile were visually inspected. |
| Whitespace/diff checks | `git diff --check` passed. |
| Frozen reinstall | `npm ci --offline --cache /workspace/.npm-cache` passed using cached verified packages; lint and types passed again afterward. |
| Development startup | `npm run dev -- --hostname 127.0.0.1 --port 3200` served `/apply` with HTTP 200 and the expected notice; the started process was stopped. |

Browser checks exercise navigation, mobile menu, notices, missing intake controls,
no horizontal overflow, lack of runtime page errors on new routes, portal/staff
indexing metadata, missing record/API routes, sitemap entries, patient/apply links,
and the existing Zeffy embed's failure fallback and independent donation link.
They do not submit donations or contact a production patient system.

## Screenshots

| Route | Desktop | Mobile |
| --- | --- | --- |
| Apply | [Screenshot](screenshots/apply-desktop.png) | [Screenshot](screenshots/apply-mobile.png) |
| Patient portal | [Screenshot](screenshots/portal-desktop.png) | [Screenshot](screenshots/portal-mobile.png) |
| Staff portal | [Screenshot](screenshots/staff-desktop.png) | [Screenshot](screenshots/staff-mobile.png) |

## Limits and remaining external work

- These are interface foundations only, with no secure account, application,
  upload, document, review, or record service. No real patient data was used.
- Browser coverage uses Chromium; it is not a full accessibility, security, or
  cross-browser audit. Staff/patient authorization remains a future milestone.
- The live Zeffy payment flow is not verified. Its source was preserved and its
  fallback behavior was tested with intercepted network requests.
- The imported archive has no upstream Git history. Merge the contribution into
  the real upstream history using `CONTRIBUTING.md`, after resolving any drift.
- Read access to `nhcafoundation/nhcaf-platform` returned HTTP 403 with the
  supplied platform Git authentication. Upstream review/merge remains blocked.
- GitHub API access used by `gh` returned Forbidden; Git pushes to the user's own
  repository are available. A pull request has not been created through that API.
- The linked shared ChatGPT conversation could not be retrieved because its
  CONNECT request was blocked. No decisions from that chat are assumed.
- Remote GitHub Actions execution and a newly published cloud snapshot have not
  been verified by this local validation.

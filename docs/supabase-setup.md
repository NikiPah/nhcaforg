# Supabase setup for the assistance inquiry

Target project: `weugtgpfxvobaejqbcbv`.

The current patient flow is `/apply`: an inquiry without login or attachments. The existing publishable-key binding has been mapped into ignored `.env.local`; no key is committed or printed. No service-role key is needed. The agent has not applied the new migration to the live project. Workspace policy has blocked live Supabase access, so activation and live testing remain outstanding.

## Database setup

Open https://supabase.com/dashboard/project/weugtgpfxvobaejqbcbv/sql/new and run the complete contents of `supabase/migrations/202611110001_assistance_inquiries.sql` **once**. It creates the private `nhcaf_assistance_inquiries` table and the restricted `nhcaf_submit_assistance_inquiry` function in one transaction. It does not require the old account-based portal migration and does not delete or modify older tables or patient records. If the new objects already exist, inspect migration history rather than dropping them or rerunning fragments.

Only the function is exposed to browser roles. Those roles cannot list, read, insert directly, update, or delete inquiry rows. Test existing project policies and privileges before launch to ensure there are no broader grants. The function returns a receipt reference and accepts identical retries without creating duplicate rows. A contact may submit up to five new inquiries per hour; identical retries continue to return their original reference.

Authorized foundation staff currently review these rows through privileged Supabase administration and follow up manually using the selected contact method. There is no staff app, automated email notification, automatic document request, or patient status lookup in this release. Avoid granting project-administrator access to everyone on staff; define the appropriate review workflow and least-privilege roles before public use.

## Runtime configuration

Set these variables through hosting environment settings or an ignored `.env.local` based on `.env.example`:

- `SUPABASE_URL=https://weugtgpfxvobaejqbcbv.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`: this project's publishable key, never a service-role key.
- `PORTAL_ORIGIN`: the exact website origin, e.g. `https://www.nhcafoundation.org` in production. Use the address and port actually used in development. This must be the website origin, not the Supabase dashboard URL; mutations check Origin against it.

There is no email-provider, SMTP, auth callback or account-signup setup requirement for this inquiry flow. Former `/portal` links and auth callbacks redirect to `/apply`. The old `/api/portal` returns HTTP 410.

For this cloud workspace to contact Supabase, its outbound policy must allow `weugtgpfxvobaejqbcbv.supabase.co`. This is separate from the Supabase project's dashboard settings. The configuration-draft tool has failed, so reusable configuration persistence is unconfirmed. Keep existing domain settings when adding access. On Node 24 behind the inherited proxy, use `NODE_USE_ENV_PROXY=1` for outbound requests and preserve CA trust and TLS verification. The main site's Google Fonts downloads still require fonts.googleapis.com and fonts.gstatic.com for production builds.

## Local checks

From `/workspace/nhcaforg`:

```sh
npm ci
npm run lint
./node_modules/.bin/next typegen
./node_modules/.bin/tsc --noEmit
npm run test:portal:db
NEXT_TELEMETRY_DISABLED=1 npm run dev -- --hostname 127.0.0.1 --port 3001
```

In another terminal run `npm run test:portal:ui`. Those package script names are retained for convenience, but now run the new inquiry tests. The older `scripts/test-portal-database.mjs` covers historical account-based tables and is not needed to install or validate the new inquiry flow.

The database tests use local PGlite with the actual new SQL migration. Browser tests simulate successful/failed backend submission responses; invalid API requests, CSRF denial, navigation and layout checks use the real local Next.js routes. They do not establish live connectivity, a live migration, or privacy/compliance approval.

After deployment setup, use fictional data to verify: clicking the top-right Apply for Assistance button opens `/apply` in a separate tab/window; a valid inquiry saves and returns its reference; failed/lost responses can be retried without duplicate rows; anonymous and patient roles cannot read or modify inquiries; staff can access the record through their authorized process. Confirm current poverty guidelines, household/income definitions, accepted proof documents, geographic eligibility, retention/deletion, privacy/consent and any required agreements before accepting real patient information. No HIPAA compliance claim is made by this code.

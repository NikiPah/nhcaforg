# Apply for Assistance: inquiry-first patient flow

The public **Apply for Assistance** buttons now open `/apply` in a separate browser tab/window using a real link with `target="_blank"` and `rel="noopener noreferrer"`. They no longer jump to `#apply`. The browser chooses whether the new browsing context is a tab or a window. The foundation site's existing branding and button wording are retained.

## Patient experience

No account, email verification, dashboard, draft autosave, document upload, or chat is required. A seven-step application on `/apply` explains eligibility and asks about:

- Food, treatment-related transportation, temporary lodging, or help understanding options.
- Whether the applicant is the patient, a family member/caregiver, or a care-team member/social worker. Patient name is requested separately only when someone else is making the inquiry.
- Preferred contact method, phone/email, county and ZIP code. An email address is optional for applicants who prefer phone contact.
- Whether a cancer diagnosis has been received, household size, and estimated gross household income per month or year. Applicants may enter zero income or request help estimating income.
- Ability to provide proof of income and cancer diagnosis, including an option to request help obtaining documents.
- Optional short notes, with instructions not to include detailed medical information, Social Security numbers, or account numbers.
- Authorization and consent to NHCAF follow-up.

The eligibility guidance implements the user's requirement: a cancer diagnosis and household income at or below 300% of the Federal Poverty Guidelines. It does not hardcode dollar thresholds or issue automated eligibility decisions. Staff must confirm applicable guideline year, household definition, income definition/verification, geographic service area, and available resources. Uncertain diagnosis/income answers are accepted as inquiries, not approvals.

The layout follows the HealthWell screenshots supplied by the user: a language selector, percentage progress bar, left-side step list with completed markers, one section at a time, Previous/Next controls, Cancel, and a Submit button that is enabled only on the final review after acknowledgement. On small screens the step list scrolls horizontally above the current section. The seven steps are Information, Initial Attestation, Patient Qualifications, Type of Assistance, Patient Attestation, Patient Information, and Final Review.

English and Spanish interface text are available throughout the wizard, including validation, review and receipt. Switching languages preserves answers. Stored option values stay in English to preserve the existing API/database contract; this UI selector does not record a preferred spoken language for staff follow-up. The design does not add HealthWell's fund/medication rules, age restrictions, duplicate-benefit exclusions, credit checks, third-party medical-release authorization, provider portal or SMS verification. NHCAF's existing eligibility and inquiry-only workflow remain in effect.

Each step validates its own visible fields before advancing. Previously visited steps can be revisited, but forward navigation validates earlier required answers. The final review includes edit links for each section, a summary of the actual answers, and a required acknowledgement covering accuracy, authority to inquire, contact permission and resource-dependent assistance. Editing an answer clears that final acknowledgement. Completed-step percentages reach 86% before submission and 100% only after a confirmed receipt. The initial authorization is an in-session prerequisite; the final combined contact/authorization acknowledgement is the boolean persisted by the existing API.

Answers remain only in component memory until the applicant deliberately submits. There is no localStorage/sessionStorage copy and no save-on-typing request. Leaving before submission warns about unsent answers. Cancel asks before discarding entered answers and resets the application to Information without submitting anything. A failed submission preserves the form, displays an error, and offers contact information. Identical retries reuse the same UUID, so a lost server response need not create a duplicate inquiry.

The confirmation page appears only after the server confirms a database receipt. It displays a reference and explains that NHCAF will contact the applicant using their preferred method. It does not claim an email notification was sent, promise a response deadline, or guarantee funding. No automatic emails, staff notifications, private upload invitations, staff dashboard, or grant payments are implemented in this version. Follow-up is a manual NHCAF responsibility using the stored inquiry and the foundation's approved process.

## Data flow and privacy

`POST /api/assistance-inquiries` checks same-origin requests, limits JSON request size, validates all fields, and uses the existing Supabase publishable key to call a narrowly scoped submit-only database function. No service-role credential is added. A hidden honeypot filters basic form automation. The database rejects unrecognized fields and invalid values, caps new inquiries at five per contact per hour, and returns only a reference. This is basic abuse protection, not a complete distributed bot-defense service.

`nhcaf_assistance_inquiries` has RLS enabled and no direct table privileges for anonymous or authenticated browser roles. The `SECURITY DEFINER` function has a fixed empty search path, accepts only explicit inquiry fields, cannot set staff status, and exposes no read/list/update/delete operation. Authorized project administrators can review inquiries through Supabase administration. The idempotency key is a random UUID, not a public lookup endpoint.

Even without attachments, diagnosis confirmation and financial/contact answers are sensitive. NHCAF must confirm HIPAA applicability, vendor/contract requirements, staff access, retention/deletion, privacy notices and consent, and the approved private follow-up method before public launch. This implementation does not assert HIPAA compliance. Do not request medical records as ordinary email attachments.

## Migration and older portal

Apply `supabase/migrations/202611110001_assistance_inquiries.sql` once; it is independent of the earlier account-based portal migration. See `supabase-setup.md`. The live migration has not been applied by the agent, and live Supabase connectivity remains unverified.

The old `/portal`, `/portal/demo`, and auth callback route redirect to `/apply`. The old `/api/portal` endpoints return HTTP 410 rather than continuing account-based application/upload writes. The former patient dashboard components and obsolete UI tests have been removed. Existing database tables, authentication records, storage documents, and the historical migration have been preserved; no patient data is deleted or automatically migrated.

## Verification

Run `npm run lint`, `next typegen`, `tsc --noEmit`, and `npm run test:portal:db`. Start development at port 3001 and run `npm run test:portal:ui`. The database test executes the new migration in local PGlite Postgres and exercises anonymous submission, denial of reads/updates/deletes, field validation, idempotency, and limits. The browser test uses real Next.js navigation, redirects, invalid API/CSRF handlers, and explicitly simulated successful/failed submission responses. It verifies desktop/mobile new-window behavior, no login/upload fields, seven-step gating, English/Spanish answer preservation, Back/Edit navigation, final acknowledgement, Cancel/reset, error preservation, receipt behavior, and responsive sizing. This does not establish a working live Supabase connection.

The user supplied 15 cancer-support organizations as planning references. Live access to their pages and federal guidance was denied by this workspace's network policy, so their current forms, eligibility and interfaces have not been independently verified. The inquiry design follows the user's boss's requirements and the explicitly agreed inquiry-first flow.

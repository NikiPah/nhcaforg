# Application data model — proposed, not deployed

This is a logical design for discussion. There is no database connection,
migration, seed patient data, authentication service, or storage bucket in
Milestone 1. Names and fields below are proposals, not approved eligibility policy.
Collect only information approved for the assistance process.

## Entities and relationships

All records use opaque IDs and UTC creation/update timestamps. Foreign keys,
validation, and authorization must be enforced on the server and in the chosen
database. Never rely on hidden links or client-supplied roles for access control.

| Entity | Proposed fields | Relationships and purpose |
| --- | --- | --- |
| Patient | id, auth_subject_id (unique), approved contact fields | One managed identity per patient; one patient can have many applications. Keep medical and financial details out of identity metadata. |
| Application | id, patient_id, status, schema_version, criteria_version_id, draft_payload, submitted_at, version | Patient owns the draft. Freeze submitted revisions; corrections create an explicit revision. Allowlisted payload fields require an approved questionnaire. |
| SupportingDocument | id, application_id, uploaded_by_subject, private_object_key, document_type, original_name, size_bytes, content_type, scan_status, retention_due_at | Belongs to one application. Store bytes only in private object storage, never public URLs. Original names can contain sensitive information. |
| EligibilityCriteriaVersion | id, version, approved_by_staff_id, effective_from, effective_to, rules | Version approved criteria so reviews can be explained later. No thresholds or medical criteria are invented here. |
| EligibilityReview | id, application_id, reviewer_staff_id, criteria_version_id, findings, recommendation, completed_at | An application can have multiple reviews. Automated findings are advisory; recommendations are not decisions. |
| InformationRequest | id, application_id, requested_by_staff_id, requested_items, status, requested_at, responded_at | Supports requests for additional information and patient responses. Do not put sensitive content into email notifications. |
| Decision | id, application_id, approver_staff_id, review_id, outcome, reason_code, patient_message, decided_at, supersedes_decision_id | A human approver records approval or denial. Decisions are append-only; corrections explicitly supersede prior decisions. |
| AssistanceRecord | id, patient_id, application_id, decision_id, program_code, amount_minor_units, currency, status, approved_at, delivered_at, recorded_by_staff_id | Separate approved assistance from actual delivery. Use integer currency amounts and verify all related records belong to the same patient/application. |
| ConsentRecord | id, application_id, patient_id, consent_version, accepted_at, method | Capture consent text version and the authenticated actor; no prechecked consent. Requirements need legal/operational approval. |
| StaffMembership | id, auth_subject_id, role, active, granted_by, granted_at, revoked_at | Roles: reviewer, approver, finance, administrator. Revocation must invalidate access promptly; patients cannot grant roles. |
| AuditEvent | id, actor_subject_id, action, target_type, target_id, occurred_at, correlation_id, result | Append-only record of reads of sensitive documents and important mutations. No document contents, raw form answers, tokens, or secrets in audit payloads. |

## Proposed lifecycle

`draft → submitted → in_review → approved | denied`

`in_review → needs_information → submitted` supports a staff request and patient
response. This is a proposal for operational review. A server-side transition
service must check the current state, actor permission, required review/consent,
and optimistic version in one transaction. No client may directly set an approved
status. Record decisions, application state changes, and audit events atomically.
An approved decision does not mark assistance as delivered.

## Proposed access rules

| Actor | Intended permissions, subject to approval |
| --- | --- |
| Anonymous | Public information only; no patient or staff records. |
| Patient | Own applications, own approved document operations, requests, decisions, and assistance history. Edit only allowed fields in allowed states. |
| Reviewer | Review authorized cases and documents; request information; record findings. No final approval or finance actions. |
| Approver | Review authorized cases and record human decisions. Separation-of-duties policy remains to be approved. |
| Finance | Minimum necessary approved assistance information; record delivery. No unrestricted medical-document access. |
| Administrator | Manage staff access and approved configuration. Administrator status must not automatically grant unrestricted access to patient records. |

Every operation needs server-side identity, role, ownership/case-scope checks and,
where available, database row-level rules. Layouts and `noindex` metadata do not
provide security. Add negative tests for anonymous access, cross-patient reads,
role escalation, revoked staff, document URL expiry, and invalid state changes.

## Document and data controls to approve before implementation

- Managed authentication, staff MFA, session expiry/revocation, and account recovery.
- Private storage with short-lived signed access after authorization; enforce file
  type/size limits, content inspection, malware quarantine, and download auditing.
- Encryption in transit/at rest, backup/restore, deletion, retention, consent,
  incident response, and data residency appropriate to approved requirements.
- Avoid sensitive data in browser storage, analytics, URLs, logs, and notifications.
  Disable shared caching of patient and staff responses.
- Define reporting aggregation, export permissions, and audit access/retention.

The selected provider, final questionnaire, eligibility criteria, retention
periods, staff case scope, and compliance obligations are open decisions. This
document does not claim HIPAA compliance or authorize real patient intake.

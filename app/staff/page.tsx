import { PageIntro } from "@/components/PlatformLayout";

export default function StaffPortalPage() {
  return (
    <>
      <PageIntro eyebrow="Staff portal · In development" title="Staff access is not available">
        <p>This is an informational page for a future staff portal. It does not provide access to applications, documents, decisions, or patient records.</p>
      </PageIntro>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <section aria-labelledby="staff-access-heading" className="max-w-3xl rounded-2xl border border-line bg-teal-50 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-plum-700">Not operational</p>
          <h2 id="staff-access-heading" className="mt-3 font-serif text-2xl font-semibold text-teal-950">Staff tools will follow security approval</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">Authorized staff will eventually be able to review applications and track assistance. Sign-in, role-based permissions, private document storage, and audit logging must be implemented and approved before those services open.</p>
          <p className="mt-4 leading-relaxed text-ink-soft">There is no staff sign-in on this page. Please do not submit personal, financial, or medical information through this website.</p>
        </section>
      </div>
    </>
  );
}

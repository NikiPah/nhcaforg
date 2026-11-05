import Link from "next/link";
import { NotOpenNotice, PageIntro, PlannedFeature } from "@/components/PlatformLayout";

export default function PatientPortalPage() {
  return (
    <>
      <PageIntro eyebrow="Patient portal · Coming soon" title="Your future place to manage assistance">
        <p>We are developing a patient portal to make applying for support and following your application easier. This is an informational page; there is no sign-in or application service here yet.</p>
      </PageIntro>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <NotOpenNotice />
        <section aria-labelledby="patient-features-heading">
          <h2 id="patient-features-heading" className="font-serif text-3xl font-semibold text-teal-950">Planned patient services</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            <PlannedFeature title="Apply at your own pace">Complete an application and save unfinished work to continue later.</PlannedFeature>
            <PlannedFeature title="Share documents privately">Provide supporting documents and consent through a secure, approved process.</PlannedFeature>
            <PlannedFeature title="Stay informed">Follow application status, respond to staff requests, and view your assistance history.</PlannedFeature>
          </ul>
        </section>
        <Link href="/apply" className="inline-block rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900">Read about the planned application</Link>
      </div>
    </>
  );
}

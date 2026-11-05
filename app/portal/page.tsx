import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { patientConfig } from "@/lib/patient/config";
import { DevelopmentNotice } from "@/components/patient/DevelopmentNotice";
import { NotOpenNotice, PageIntro, PlannedFeature } from "@/components/PlatformLayout";

async function PatientPortalContent() {
  await connection();
  if (patientConfig()) return (
    <>
      <PageIntro eyebrow="Patient portal · Development" title="A place to begin, and return to">
        <p>Explore the NHCAF patient application process with a test account. Save a draft, return at your own pace, and follow your test submission.</p>
      </PageIntro>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
        <DevelopmentNotice />
        <div className="flex flex-wrap gap-4">
          <Link href="/portal/login" className="rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900">Sign in</Link>
          <Link href="/portal/register" className="rounded-full border border-teal-800 px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50">Create a test account</Link>
          <Link href="/portal/dashboard" className="px-3 py-3 font-semibold text-teal-800 underline underline-offset-4">My applications</Link>
        </div>
        <p className="text-ink-soft">Real applications and document uploads are not open. <Link href="/apply" className="font-semibold text-teal-800 underline underline-offset-4">Read about the planned application</Link>.</p>
      </div>
    </>
  );
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

export default function PatientPortalPage() {
  return <Suspense fallback={<p className="p-8" role="status">Loading patient portal…</p>}><PatientPortalContent /></Suspense>;
}

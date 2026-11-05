import type { Metadata } from "next";
import Link from "next/link";
import { NotOpenNotice, PageIntro, PlannedFeature, PlatformLayout } from "@/components/PlatformLayout";

export const metadata: Metadata = {
  title: "Apply for Assistance | NHCAF",
  description: "Learn about the planned NHCAF online assistance application. Applications are not open yet.",
  alternates: { canonical: "/apply" },
};

export default function ApplyPage() {
  return (
    <PlatformLayout>
      <PageIntro eyebrow="Assistance" title="A path to support, in development">
        <p>We are preparing an online application process for eligible individuals and families affected by cancer. Here is what the future process is intended to include.</p>
      </PageIntro>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <NotOpenNotice />
        <section aria-labelledby="process-heading">
          <h2 id="process-heading" className="font-serif text-3xl font-semibold text-teal-950">The planned application process</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">These steps describe the service we are building. They are not an application or a guarantee of assistance. Detailed eligibility requirements are still being finalized.</p>
          <ol className="mt-8 grid gap-5 md:grid-cols-2">
            <PlannedFeature title="1. Create your account">Access a patient account through a secure sign-in process once the portal opens.</PlannedFeature>
            <PlannedFeature title="2. Review eligibility and apply">Complete an eligibility prescreening and application, with the ability to save your progress and return later.</PlannedFeature>
            <PlannedFeature title="3. Provide documents and consent">Submit requested supporting documents and electronic consent through approved private storage.</PlannedFeature>
            <PlannedFeature title="4. Follow the review">Track your application, respond to requests for information, and view decisions made by authorized NHCAF staff.</PlannedFeature>
          </ol>
        </section>
        <section aria-labelledby="next-heading" className="rounded-2xl border border-line bg-teal-50 p-6 sm:p-8">
          <h2 id="next-heading" className="font-serif text-2xl font-semibold text-teal-950">Where to find updates</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">Assistance is subject to established eligibility criteria and available foundation resources. Check this website for updates as the application process becomes available.</p>
          <div className="mt-6 flex flex-wrap gap-5 font-semibold text-teal-800">
            <Link href="/portal" className="underline underline-offset-4">Patient portal information →</Link>
            <Link href="/#programs" className="underline underline-offset-4">Explore NHCAF programs</Link>
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { patientApplication } from "@/lib/patient/server";
import { idSchema, supportOptions } from "@/lib/patient/schema";
import { DevelopmentNotice } from "@/components/patient/DevelopmentNotice";
import { PatientNav } from "@/components/patient/PatientNav";
import { ApplicationForm } from "@/components/patient/ApplicationForm";

async function ApplicationDetail({ params, searchParams }: PageProps<"/portal/applications/[id]">) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const app = await patientApplication(id);
  if (!app) notFound();
  const query = await searchParams;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <PatientNav /><DevelopmentNotice />
      <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-plum-700">{app.status === "draft" ? "Draft · Save and return later" : "Submitted for testing"}</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-teal-950">{app.status === "draft" ? "Your test application" : "Your test submission"}</h1>
      {app.status === "draft" && query.saved === "1" && <p role="status" className="mt-5 rounded-xl bg-teal-50 p-4 text-teal-900">Your draft has been saved. You can sign out and return later.</p>}
      {app.status === "draft" ? <ApplicationForm key={app.version} application={app} /> : (
        <section className="mt-8 rounded-2xl border border-line bg-teal-50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold text-teal-950">Test submission recorded</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">Your test application is now read-only. It has not entered a real review queue, and no eligibility or assistance decision has been made.</p>
          <dl className="mt-6 space-y-4">
            <div><dt className="font-semibold">Fictional contact</dt><dd>{app.contact_name}</dd></div>
            <div><dt className="font-semibold">Fictional phone</dt><dd>{app.phone || "Not provided"}</dd></div>
            <div><dt className="font-semibold">Fictional city</dt><dd>{app.city}</dd></div>
            <div><dt className="font-semibold">Support areas</dt><dd>{supportOptions.filter(o => app.support_types.includes(o.value)).map(o => o.label).join(", ")}</dd></div>
            <div><dt className="font-semibold">Fictional support summary</dt><dd className="whitespace-pre-wrap break-words">{app.request_summary || "Not provided"}</dd></div>
            <div><dt className="font-semibold">Submitted</dt><dd>{app.submitted_at ? new Date(app.submitted_at).toLocaleString("en-US", { timeZone: "America/New_York", timeZoneName: "short" }) : "Not recorded"}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
}

export default function Page(props: PageProps<"/portal/applications/[id]">) {
  return <Suspense fallback={<p className="p-8" role="status">Loading your application…</p>}><ApplicationDetail {...props} /></Suspense>;
}

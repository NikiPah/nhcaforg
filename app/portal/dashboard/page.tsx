import { Suspense } from "react";
import Link from "next/link";
import { patientApplications } from "@/lib/patient/server";
import { createApplication } from "@/app/portal/actions";
import { DevelopmentNotice } from "@/components/patient/DevelopmentNotice";
import { PatientNav } from "@/components/patient/PatientNav";
import { CreateApplicationButton } from "@/components/patient/CreateApplicationButton";

async function Dashboard() {
  const applications = await patientApplications();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PatientNav />
      <DevelopmentNotice />
      <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-plum-700">Patient portal</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-teal-950">My applications</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">Start a test application, save your progress, and return when you are ready. Your test submissions do not request assistance.</p>
      {applications === null ? (
        <p role="alert" className="mt-8 rounded-2xl border border-line p-6">Applications are temporarily unavailable. Refresh the page or try again later.</p>
      ) : (
        <>
          <form action={createApplication} className="mt-7"><CreateApplicationButton /></form>
          {applications.length === 0 ? (
            <section className="mt-10 rounded-2xl border border-line bg-sand-50 p-8"><h2 className="font-serif text-2xl font-semibold text-teal-950">A place to begin</h2><p className="mt-3 text-ink-soft">You have no applications yet. Start one above to explore the development process.</p></section>
          ) : (
            <ul className="mt-10 grid gap-5 sm:grid-cols-2">
              {applications.map(app => (
                <li key={app.id} className="rounded-2xl border border-line bg-white p-6">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">{app.status === "draft" ? "Draft" : "Submitted for testing"}</span>
                  <h2 className="mt-5 font-serif text-xl font-semibold text-teal-950">Assistance test application</h2>
                  <p className="mt-3 text-sm text-ink-soft">Started {new Date(app.created_at).toLocaleDateString("en-US", { timeZone: "UTC" })}</p>
                  <p className="mt-2 text-sm text-ink-soft">{app.status === "draft" ? "Last saved" : "Submitted"} {new Date(app.submitted_at ?? app.updated_at).toLocaleString("en-US", { timeZone: "America/New_York", timeZoneName: "short" })}</p>
                  <Link href={`/portal/applications/${app.id}`} className="mt-5 inline-block font-semibold text-teal-800 underline underline-offset-4">{app.status === "draft" ? "Continue application" : "View test submission"} →</Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <section className="mt-12 border-t border-line pt-8"><h2 className="font-serif text-xl font-semibold text-teal-950">Documents will come later</h2><p className="mt-3 text-ink-soft">Document uploads are not enabled. Do not send medical or financial documents through this development portal.</p></section>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<p className="p-8" role="status">Loading your applications…</p>}><Dashboard /></Suspense>;
}

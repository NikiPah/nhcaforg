import Link from "next/link";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { patientConfig } from "@/lib/patient/config";

export async function PortalGate({ children }: { children: ReactNode }) {
  await connection();
  if (!patientConfig()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold text-teal-950">Patient accounts are not available yet</h1>
        <p className="mt-5 leading-relaxed text-ink-soft">The patient portal is not operational. Please do not submit personal or medical information. We will share updates when the application service is ready.</p>
        <Link href="/portal" className="mt-6 inline-block font-semibold text-teal-800 underline underline-offset-4">Return to patient portal information</Link>
      </div>
    );
  }
  return children;
}

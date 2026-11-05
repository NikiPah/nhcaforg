import { Suspense } from "react";
import { AuthPage } from "@/components/patient/AuthPage";
import { requirePatient } from "@/lib/patient/server";

async function PasswordPage() {
  await requirePatient();
  return <AuthPage intent="password" title="Choose a new password" description="Set a new password for your patient test account." />;
}

export default function Page() {
  return <Suspense fallback={<p className="p-8">Checking your session…</p>}><PasswordPage /></Suspense>;
}

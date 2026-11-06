import { AuthPage } from "@/components/patient/AuthPage";
import { Suspense } from "react";

async function LoginContent({ searchParams }: PageProps<"/portal/login">) {
  const query = await searchParams;
  return <AuthPage intent="login" title="Welcome back" description="Sign in to continue your development application and check its test status." confirmationFailed={query.confirmation === "failed"} />;
}

export default function LoginPage(props: PageProps<"/portal/login">) {
  return <Suspense fallback={<p className="p-8" role="status">Loading sign-in…</p>}><LoginContent {...props} /></Suspense>;
}

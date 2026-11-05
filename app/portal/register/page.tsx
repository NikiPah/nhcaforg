import { AuthPage } from "@/components/patient/AuthPage";

export default function RegisterPage() {
  return <AuthPage intent="signup" title="Create your test account" description="Use an email address you control to test account access. All application details must be fictional." />;
}

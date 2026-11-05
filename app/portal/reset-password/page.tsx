import { AuthPage } from "@/components/patient/AuthPage";

export default function ResetPage() {
  return <AuthPage intent="reset" title="Reset your password" description="We will send a reset link if an account exists for your email address." />;
}

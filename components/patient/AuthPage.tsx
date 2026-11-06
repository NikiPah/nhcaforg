import { Suspense } from "react";
import { PortalGate } from "./PortalGate";
import { AuthForm } from "./AuthForm";
import { DevelopmentNotice } from "./DevelopmentNotice";

export function AuthPage({ intent, title, description, confirmationFailed = false }: { intent: "login" | "signup" | "reset" | "password"; title: string; description: string; confirmationFailed?: boolean }) {
  return (
    <Suspense fallback={<p className="p-8">Loading patient portal…</p>}>
      <PortalGate>
        <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
          <DevelopmentNotice />
          <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-plum-700">NHCAF patient portal</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-teal-950">{title}</h1>
          <p className="mt-4 leading-relaxed text-ink-soft">{description}</p>
          {confirmationFailed && <p role="alert" className="mt-5 rounded-xl border border-plum-700/20 bg-plum-100/60 p-4">We could not confirm that email link. It may have expired or been opened in a different browser. Sign in if your account is already confirmed, or request a new password-reset link if you are recovering your account.</p>}
          <AuthForm intent={intent} />
        </section>
      </PortalGate>
    </Suspense>
  );
}

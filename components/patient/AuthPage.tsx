import { Suspense } from "react";
import { PortalGate } from "./PortalGate";
import { AuthForm } from "./AuthForm";
import { DevelopmentNotice } from "./DevelopmentNotice";

export function AuthPage({ intent, title, description }: { intent: "login" | "signup" | "reset" | "password"; title: string; description: string }) {
  return (
    <Suspense fallback={<p className="p-8">Loading patient portal…</p>}>
      <PortalGate>
        <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
          <DevelopmentNotice />
          <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-plum-700">NHCAF patient portal</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-teal-950">{title}</h1>
          <p className="mt-4 leading-relaxed text-ink-soft">{description}</p>
          <AuthForm intent={intent} />
        </section>
      </PortalGate>
    </Suspense>
  );
}

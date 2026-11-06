"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate, requestPasswordReset, updatePassword, type FormResult } from "@/app/portal/actions";

const inputClass = "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink";

export function AuthForm({ intent }: { intent: "login" | "signup" | "reset" | "password" }) {
  const action = intent === "reset" ? requestPasswordReset : intent === "password" ? updatePassword : authenticate;
  const [state, formAction, pending] = useActionState<FormResult, FormData>(action, {});
  const label = { login: "Sign in", signup: "Create test account", reset: "Send reset email", password: "Update password" }[intent];
  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="intent" value={intent} />
      {intent !== "password" && (
        <label className="block font-semibold text-teal-950">Email address
          <input name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} />
        </label>
      )}
      {intent !== "reset" && (
        <div className="font-semibold text-teal-950">
          <label htmlFor="patient-password" className="block">Password</label>
          <input id="patient-password" name="password" type="password" autoComplete={intent === "login" ? "current-password" : "new-password"} required minLength={intent === "login" ? 1 : 12} maxLength={128} aria-describedby="password-help" className={inputClass} />
          <span id="password-help" className="mt-2 block text-sm font-normal text-ink-soft">Use at least 12 characters. Do not reuse a password from another account.</span>
        </div>
      )}
      {state.message && <p role={state.success ? "status" : "alert"} className="rounded-xl border border-line bg-sand-50 p-4 text-ink">{state.message}</p>}
      <button disabled={pending} className="w-full rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-60">{pending ? "Please wait…" : label}</button>
      <div className="flex flex-wrap justify-between gap-4 text-sm font-semibold text-teal-800">
        {intent === "login" ? <><Link href="/portal/register" className="underline underline-offset-4">Create an account</Link><Link href="/portal/reset-password" className="underline underline-offset-4">Forgot your password?</Link></> : <Link href="/portal/login" className="underline underline-offset-4">Return to sign in</Link>}
      </div>
    </form>
  );
}

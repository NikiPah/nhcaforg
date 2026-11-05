"use client";

import { useActionState, useState } from "react";
import { saveApplication, type FormResult } from "@/app/portal/actions";
import { supportOptions, type Application } from "@/lib/patient/schema";

const inputClass = "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink";

export function ApplicationForm({ application }: { application: Application }) {
  const [state, action, pending] = useActionState<FormResult, FormData>(saveApplication, {});
  const [values, setValues] = useState(application);
  const [confirmed, setConfirmed] = useState(false);
  function error(field: string) { return state.errors?.[field]?.join(" "); }
  return (
    <form action={action} className="mt-8 space-y-8">
      <input type="hidden" name="id" value={application.id} />
      <input type="hidden" name="version" value={application.version} />
      <fieldset disabled={pending} className="rounded-2xl border border-line p-6 sm:p-8">
        <legend className="px-2 font-serif text-xl font-semibold text-teal-950">1. Test contact details</legend>
        <p className="mb-5 text-sm text-ink-soft">Drafts may be incomplete. Fields marked * are required only when submitting a test application.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { name: "contact_name", label: "Fictional contact name *", max: 100, hint: "Example: Test Patient" },
            { name: "phone", label: "Fictional phone number (optional)", max: 30, hint: "Use a fictional number such as 202-555-0100" },
            { name: "city", label: "Fictional city *", max: 100, hint: "Example: Test City" },
          ].map(field => (
            <label key={field.name} className="block font-semibold text-teal-950">{field.label}
              <input name={field.name} value={values[field.name as "contact_name" | "phone" | "city"]} onChange={event => setValues({ ...values, [field.name]: event.target.value })} maxLength={field.max} autoComplete="off" className={inputClass} aria-invalid={!!error(field.name)} aria-describedby={`${field.name}-hint ${field.name}-error`} />
              <span id={`${field.name}-hint`} className="mt-2 block text-sm font-normal text-ink-soft">{field.hint}</span>
              <span id={`${field.name}-error`} className="mt-1 block text-sm font-normal text-plum-700">{error(field.name)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={pending} className="rounded-2xl border border-line p-6 sm:p-8">
        <legend className="px-2 font-serif text-xl font-semibold text-teal-950">2. Explore support areas *</legend>
        <p className="mb-5 text-sm text-ink-soft">These areas are already described on the NHCAF donation page. Selection does not determine eligibility or guarantee assistance.</p>
        <div className="space-y-3">{supportOptions.map(option => (
          <label key={option.value} className="flex items-center gap-3 rounded-xl border border-line p-4 text-teal-950">
            <input type="checkbox" name="support_types" value={option.value} checked={values.support_types.includes(option.value)} onChange={event => setValues({ ...values, support_types: event.target.checked ? [...values.support_types, option.value] : values.support_types.filter(value => value !== option.value) })} className="h-5 w-5 accent-teal-800" aria-describedby="support-error" />{option.label}
          </label>
        ))}</div>
        <p id="support-error" className="mt-2 text-sm text-plum-700">{error("support_types")}</p>
        <label className="mt-6 block font-semibold text-teal-950">Fictional support summary (optional)
          <textarea name="request_summary" rows={4} maxLength={2000} value={values.request_summary} onChange={event => setValues({ ...values, request_summary: event.target.value })} className={inputClass} aria-describedby="summary-help summary-error" />
          <span id="summary-help" className="mt-2 block text-sm font-normal text-ink-soft">Maximum 2,000 characters. Use fictional details only; do not include diagnosis, medical history, financial account details, or identity numbers.</span>
          <span id="summary-error" className="mt-1 block text-sm font-normal text-plum-700">{error("request_summary")}</span>
        </label>
      </fieldset>
      <fieldset disabled={pending} className="rounded-2xl border border-line bg-sand-50 p-6 sm:p-8">
        <legend className="px-2 font-serif text-xl font-semibold text-teal-950">3. Save or submit for testing</legend>
        <p className="mb-5 text-sm leading-relaxed text-ink-soft">Save a draft to return later. Submitting locks the test application so you can verify status tracking. Staff review and real applications are not open.</p>
        <label className="flex items-start gap-3 text-ink"><input type="checkbox" name="test_consent" value="yes" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-teal-800" /><span>I confirm these are fictional test details and understand this submission does not request assistance.</span></label>
      </fieldset>
      {state.message && <p role="alert" className="rounded-xl border border-plum-700/20 bg-plum-100/60 p-4">{state.message}</p>}
      <div className="flex flex-wrap gap-4">
        <button name="intent" value="save" disabled={pending} className="rounded-full border border-teal-800 px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-60">{pending ? "Saving…" : "Save draft"}</button>
        <button name="intent" value="submit" disabled={pending} className="rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-60">Submit test application</button>
      </div>
      <p className="text-sm text-ink-soft">Changes are saved only when you choose a button above. Nothing is stored in your browser’s local storage.</p>
    </form>
  );
}

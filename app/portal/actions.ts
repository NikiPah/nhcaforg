"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { patientClient, requirePatient } from "@/lib/patient/server";
import { portalOrigin } from "@/lib/patient/config";
import { credentialsSchema, idSchema, readDraft, submissionSchema, versionSchema } from "@/lib/patient/schema";

export type FormResult = { message?: string; success?: boolean; errors?: Record<string, string[]> };

export async function authenticate(_previous: FormResult, form: FormData): Promise<FormResult> {
  const parsed = credentialsSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { message: "Enter a valid email address and your password." };
  const client = await patientClient();
  const signup = form.get("intent") === "signup";
  if (signup && parsed.data.password.length < 12) return { message: "Use a password of at least 12 characters." };
  const result = signup
    ? await client.auth.signUp({ ...parsed.data, options: { emailRedirectTo: `${portalOrigin()}/portal/auth/callback` } })
    : await client.auth.signInWithPassword(parsed.data);
  if (result.error) return { message: signup ? "Unable to create an account. Try again or check your email for an existing invitation." : "Unable to sign in. Check your details and try again." };
  if (!result.data.session) return { success: true, message: "Check your email to confirm your account before signing in." };
  redirect("/portal/dashboard");
}

export async function signOut() {
  const client = await patientClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw new Error("Sign-out failed. Please try again.");
  redirect("/portal/login");
}

export async function requestPasswordReset(_previous: FormResult, form: FormData): Promise<FormResult> {
  const email = z.email().max(254).safeParse(form.get("email"));
  if (!email.success) return { message: "Enter a valid email address." };
  const client = await patientClient();
  await client.auth.resetPasswordForEmail(email.data, { redirectTo: `${portalOrigin()}/portal/auth/callback?next=password` });
  return { success: true, message: "If this address has an account, a password-reset email will be sent. Check your inbox." };
}

export async function updatePassword(_previous: FormResult, form: FormData): Promise<FormResult> {
  const password = z.string().min(12).max(128).safeParse(form.get("password"));
  if (!password.success) return { message: "Use a password of 12–128 characters." };
  const { client } = await requirePatient();
  const { error } = await client.auth.updateUser({ password: password.data });
  if (error) return { message: "Unable to update your password. Request a new reset email and try again." };
  redirect("/portal/dashboard");
}

export async function createApplication() {
  const { client } = await requirePatient();
  const { data, error } = await client.rpc("create_patient_application");
  if (error || typeof data !== "string") throw new Error("Unable to create a test application. Please try again.");
  redirect(`/portal/applications/${data}`);
}

export async function saveApplication(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { client } = await requirePatient();
  const id = idSchema.safeParse(form.get("id"));
  const version = versionSchema.safeParse(form.get("version"));
  const draft = readDraft(form);
  if (!id.success || !version.success) return { message: "Refresh this application before trying again." };
  if (!draft.success) return { message: "Review the highlighted fields.", errors: z.flattenError(draft.error).fieldErrors };
  const submit = form.get("intent") === "submit";
  if (submit) {
    const complete = submissionSchema.safeParse(draft.data);
    if (!complete.success) return { message: "Complete the required test fields before submitting.", errors: z.flattenError(complete.error).fieldErrors };
    if (form.get("test_consent") !== "yes") return { message: "Confirm that you are submitting fictional test information only." };
  }
  // Database function checks ownership, state and version atomically; no service key.
  const { error } = await client.rpc("save_patient_application", {
    application_id: id.data, expected_version: version.data, draft: draft.data, submit_test: submit,
    confirmed_test_data: form.get("test_consent") === "yes",
  });
  if (error) return { message: "Could not save. This draft may have changed in another tab. Refresh the page, check your connection, and try again." };
  revalidatePath("/portal/dashboard");
  revalidatePath(`/portal/applications/${id.data}`);
  redirect(`/portal/applications/${id.data}?${submit ? "submitted" : "saved"}=1`);
}

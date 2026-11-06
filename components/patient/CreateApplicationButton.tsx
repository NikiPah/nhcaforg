"use client";

import { useFormStatus } from "react-dom";

export function CreateApplicationButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-60">{pending ? "Creating your draft…" : "Start a test application"}</button>;
}

import Link from "next/link";
import { signOut } from "@/app/portal/actions";

export function PatientNav() {
  return (
    <nav aria-label="Patient portal" className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 text-sm font-semibold text-teal-800">
      <Link href="/portal/dashboard" className="underline underline-offset-4">My applications</Link>
      <form action={signOut}><button className="rounded-full border border-teal-800 px-5 py-2 hover:bg-teal-50">Sign out</button></form>
    </nav>
  );
}

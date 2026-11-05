import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-900">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line bg-sand-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-teal-800 underline underline-offset-4">← Back to NHCAF</Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.14em] text-plum-700">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-teal-950 sm:text-5xl">{title}</h1>
        <div className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-soft">{children}</div>
      </div>
    </section>
  );
}

export function NotOpenNotice() {
  return (
    <aside aria-labelledby="not-open-heading" className="rounded-2xl border border-plum-700/20 bg-plum-100/60 p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-plum-700">In development · Not operational</p>
      <h2 id="not-open-heading" className="mt-2 font-serif text-2xl font-semibold text-teal-950">Online applications are not open yet</h2>
      <p className="mt-3 leading-relaxed text-ink-soft">This page provides information only. Account creation, applications, document uploads, and staff access are not available.</p>
      <p className="mt-3 font-semibold text-teal-950">Please do not send personal, financial, or medical information through this website.</p>
    </aside>
  );
}

export function PlannedFeature({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-white p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-wider text-plum-700">Planned</p>
      <h3 className="mt-2 font-serif text-xl font-semibold text-teal-950">{title}</h3>
      <p className="mt-3 leading-relaxed text-ink-soft">{children}</p>
    </li>
  );
}

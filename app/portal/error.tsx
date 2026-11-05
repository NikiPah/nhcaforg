"use client";

export default function PortalError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl font-semibold text-teal-950">The portal is temporarily unavailable</h1><p className="mt-4 text-ink-soft">We could not complete that request. Reopen your last saved draft and check its status before trying again.</p><button onClick={reset} className="mt-6 rounded-full bg-teal-800 px-6 py-3 font-semibold text-white">Try again</button></section>;
}

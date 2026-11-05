import type { Metadata } from "next";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import nhcafLogo from "@/public/images/nhcaf-logo.png";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ZeffyEmbed } from "@/components/ZeffyEmbed";
import { ExternalIcon, FoodIcon, LodgingIcon, ShieldIcon, TransportIcon } from "@/components/icons";

const title = "Donate | North Houston Cancer Assistance Foundation";
const description =
  "Support North Houston Cancer Assistance Foundation and help eligible cancer patients and families with food assistance, treatment-related transportation, and temporary lodging.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/donate" },
  openGraph: {
    type: "website",
    url: "https://www.nhcafoundation.org/donate",
    siteName: "North Houston Cancer Assistance Foundation",
    title,
    description,
    locale: "en_US",
  },
  twitter: { card: "summary", title, description },
};

const ZEFFY_DONATION_PAGE =
  "https://www.zeffy.com/en-US/donation-form/support-cancer-patients-through-nhcaf";

// Approved program areas only — do not add descriptions that imply other benefits.
const programAreas: { title: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { title: "Food Assistance", icon: FoodIcon },
  { title: "Treatment-Related Transportation", icon: TransportIcon },
  { title: "Temporary Lodging", icon: LodgingIcon },
];

export default function DonatePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-900 focus:shadow"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Intro */}
        <section aria-labelledby="donate-heading" className="bg-sand-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-3xl">
              {/* The PNG is a square canvas with transparent padding above and
                  below the artwork. Negative vertical margins (relative to the
                  wrapper width) let that padding overlap the surrounding space
                  without cropping, scaling, or distorting the image. */}
              <div className="mb-8 -ml-[15px] w-44 sm:-ml-[18px] sm:w-52 lg:-ml-[20px] lg:w-60">
                <Image
                  src={nhcafLogo}
                  alt="North Houston Cancer Assistance Foundation"
                  sizes="(min-width: 1024px) 240px, (min-width: 640px) 208px, 176px"
                  preload
                  className="-my-[22%] h-auto w-full"
                />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-plum-700">
                Support Our Mission
              </p>
              <h1
                id="donate-heading"
                className="mt-3 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-teal-950 sm:text-5xl"
              >
                Support Cancer Patients Beyond Treatment
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl">
                Cancer treatment affects far more than medical care. Your donation helps North
                Houston Cancer Assistance Foundation provide eligible individuals and families
                experiencing financial hardship with assistance for essential non-medical needs,
                including food, treatment-related transportation, and temporary lodging.
              </p>
            </div>

            <h2 className="sr-only">What your donation supports</h2>
            <ul className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
              {programAreas.map((p) => (
                <li
                  key={p.title}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,40,45,0.04)] sm:p-6"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-serif text-lg font-semibold leading-snug text-teal-950">
                    {p.title}
                  </h3>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              Assistance is provided to eligible individuals and families based on established
              eligibility criteria and available foundation resources.
            </p>
          </div>
        </section>

        {/* Donation form */}
        <section
          id="donation-form"
          aria-labelledby="make-donation-heading"
          className="border-t border-line py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="make-donation-heading"
                className="font-serif text-3xl font-semibold tracking-tight text-teal-950 sm:text-4xl"
              >
                Make a Donation
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                Your generosity helps eligible cancer patients and families in our community manage
                essential non-medical needs during treatment.
              </p>
            </div>

            <div className="mx-auto mt-10 w-full max-w-3xl min-w-0">
              <ZeffyEmbed />
            </div>

            <div className="mx-auto mt-8 max-w-3xl space-y-4 text-center text-ink-soft">
              <p className="flex items-start justify-center gap-2 text-sm leading-relaxed sm:text-base">
                <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                <span>
                  North Houston Cancer Assistance Foundation is an IRS-recognized 501(c)(3) public
                  charity. Contributions are tax-deductible to the extent permitted by law.
                </span>
              </p>
              <p className="text-sm">
                Having trouble with the form?{" "}
                <a
                  href={ZEFFY_DONATION_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-teal-800 underline decoration-teal-700/40 underline-offset-4 hover:decoration-teal-800"
                >
                  Donate securely through Zeffy
                  <ExternalIcon className="h-4 w-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

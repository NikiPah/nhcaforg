import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CampaignIcon,
  ClockIcon,
  CommunityIcon,
  FamilyIcon,
  GlobeIcon,
  GrantIcon,
  HandsIcon,
  MailIcon,
  PartnershipIcon,
  RepeatIcon,
  ShieldIcon,
} from "@/components/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const ORG_NAME = "North Houston Cancer Assistance Foundation";

export default function Home() {
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
        <Hero />
        <Mission />
        <WhoWeHelp />
        <Programs />
        <Give />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-plum-700">{eyebrow}</p>
      <h2
        id={id}
        className="mt-3 font-serif text-3xl font-semibold tracking-tight text-teal-950 sm:text-4xl"
      >
        {title}
      </h2>
      {children && <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
}

function IconBadge({ icon: IconCmp, tone = "teal" }: { icon: Icon; tone?: "teal" | "plum" }) {
  const styles = tone === "plum" ? "bg-plum-100 text-plum-700" : "bg-teal-100 text-teal-800";
  return (
    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${styles}`}>
      <IconCmp className="h-6 w-6" />
    </span>
  );
}

function ComingSoonNotice({ icon: IconCmp = ClockIcon, children }: { icon?: Icon; children: ReactNode }) {
  return (
    <div
      role="note"
      className="flex items-start gap-4 rounded-2xl border border-plum-700/20 bg-plum-100/60 p-5 sm:p-6"
    >
      <IconCmp className="mt-0.5 h-6 w-6 shrink-0 text-plum-700" />
      <div className="text-base leading-relaxed text-ink">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-sand-50"
    >
      <HeroShapes />
      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-700/20 bg-white/70 px-4 py-1.5 text-sm font-medium text-teal-800">
            <ShieldIcon className="h-4 w-4" />
            IRS-recognized 501(c)(3) public charity · Spring, Texas
          </p>
          <h1
            id="hero-heading"
            className="mt-6 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-teal-950 sm:text-5xl lg:text-6xl"
          >
            Helping individuals and families affected by cancer
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            {ORG_NAME} is an IRS-recognized 501(c)(3) public charity dedicated to helping eligible
            individuals and families affected by cancer who are experiencing financial hardship.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#apply"
              className="rounded-full bg-teal-800 px-7 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-900"
            >
              Apply for Assistance
            </a>
            <Link
              href="/donate"
              className="rounded-full bg-teal-800 px-7 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-900 sm:min-w-44"
            >
              Donate
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroShapes() {
  // Soft, static abstract shapes — decorative only.
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -right-40 top-1/2 hidden h-[640px] w-[640px] -translate-y-1/2 md:block lg:-right-24"
      viewBox="0 0 640 640"
      fill="none"
    >
      <circle cx="320" cy="320" r="300" fill="#dcecec" opacity="0.6" />
      <circle cx="320" cy="320" r="220" fill="#eef6f5" />
      <path
        d="M140 430c0-99.4 80.6-180 180-180s180 80.6 180 180"
        stroke="#1a6670"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.18"
      />
      <path
        d="M220 430c0-55.2 44.8-100 100-100s100 44.8 100 100"
        stroke="#6a3d63"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.18"
      />
      <circle cx="320" cy="200" r="22" fill="#1a6670" opacity="0.18" />
    </svg>
  );
}

function Mission() {
  return (
    <section id="mission" aria-labelledby="mission-heading" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <SectionHeading id="mission-heading" eyebrow="Our Mission" title="Easing the financial burden of cancer">
          <p>
            A cancer diagnosis can bring substantial financial hardship. Alongside the physical and
            emotional challenges, individuals and families often face added costs and disruptions
            to work and household income.
          </p>
          <p>
            NHCAF exists to provide charitable financial assistance and related support to eligible
            individuals and families affected by cancer, so they can focus on what matters most.
          </p>
        </SectionHeading>

        <aside
          aria-labelledby="funding-heading"
          className="self-start rounded-2xl border border-line bg-sand-50 p-7 sm:p-8"
        >
          <h3 id="funding-heading" className="font-serif text-xl font-semibold text-teal-950">
            How our work is funded
          </h3>
          <p className="mt-3 leading-relaxed text-ink-soft">
            NHCAF raises charitable funds from a broad base of supporters, including:
          </p>
          <ul className="mt-5 space-y-3">
            {["Individuals", "Businesses", "Foundations", "Grants", "Community partners"].map((s) => (
              <li key={s} className="flex items-center gap-3 text-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-700" />
                {s}
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </section>
  );
}

function WhoWeHelp() {
  return (
    <section
      id="who-we-help"
      aria-labelledby="who-heading"
      className="border-y border-line bg-teal-50 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading id="who-heading" eyebrow="Who We Help" title="Support for eligible individuals and families">
          <p>
            Assistance is provided to eligible individuals and families affected by cancer, based on
            established charitable eligibility criteria and available foundation resources.
          </p>
        </SectionHeading>

        <div id="apply" className="space-y-5 self-center scroll-mt-28">
          <h3 className="font-serif text-2xl font-semibold text-teal-950">Applying for assistance</h3>
          <p className="text-lg leading-relaxed text-ink-soft">
            Detailed eligibility requirements and a secure online application process are being
            developed.
          </p>
          <ComingSoonNotice>
            <p className="font-semibold text-teal-950">Online application — coming soon</p>
            <p className="mt-1 text-ink-soft">
              We are not accepting applications through this website yet. Please check back for
              updates as our eligibility guidelines and application process are finalized.
            </p>
          </ComingSoonNotice>
        </div>
      </Container>
    </section>
  );
}

const programs: { title: string; icon: Icon; body: string }[] = [
  {
    title: "Patient & Family Assistance",
    icon: FamilyIcon,
    body: "Charitable financial assistance for eligible individuals and families affected by cancer who are experiencing financial hardship, guided by established eligibility criteria and available resources.",
  },
  {
    title: "Community Support",
    icon: CommunityIcon,
    body: "Working within the North Houston community to support individuals and families affected by cancer and to raise awareness of the charitable resources available to them.",
  },
  {
    title: "Fundraising & Partnerships",
    icon: PartnershipIcon,
    body: "Building relationships with individuals, businesses, foundations, grantmakers, and community partners to sustain and grow the Foundation's charitable assistance programs.",
  },
];

function Programs() {
  return (
    <section id="programs" aria-labelledby="programs-heading" className="py-20 sm:py-28">
      <Container>
        <SectionHeading id="programs-heading" eyebrow="Programs" title="How the Foundation helps">
          <p>
            Our charitable programs are focused on financial assistance, community support, and the
            fundraising and partnerships that make that work possible.
          </p>
        </SectionHeading>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {programs.map((p) => (
            <li
              key={p.title}
              className="flex flex-col rounded-2xl border border-line bg-white p-7 shadow-[0_1px_2px_rgba(16,40,45,0.04)]"
            >
              <IconBadge icon={p.icon} />
              <h3 className="mt-6 font-serif text-xl font-semibold text-teal-950">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

const givingWays: { title: string; icon: Icon; body: string }[] = [
  {
    title: "Individual Giving",
    icon: HandsIcon,
    body: "One-time gifts from individuals help fund charitable assistance for eligible individuals and families.",
  },
  {
    title: "Monthly Giving",
    icon: RepeatIcon,
    body: "Recurring gifts provide steady, dependable support for the Foundation's programs.",
  },
  {
    title: "Corporate & Community Partnerships",
    icon: PartnershipIcon,
    body: "Businesses and community organizations can partner with NHCAF to extend support across North Houston.",
  },
  {
    title: "Grants",
    icon: GrantIcon,
    body: "Foundations and grantmakers can support NHCAF's charitable mission through grant funding.",
  },
  {
    title: "Fundraising Campaigns",
    icon: CampaignIcon,
    body: "Community fundraising campaigns and events help raise awareness and resources for families affected by cancer.",
  },
];

function Give() {
  return (
    <section
      id="give"
      aria-labelledby="give-heading"
      className="bg-teal-950 py-20 text-white sm:py-28"
    >
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d9b9d2]">
            Give
          </p>
          <h2
            id="give-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Support NHCAF
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-teal-100">
            Charitable contributions help support NHCAF&apos;s assistance programs for eligible
            individuals and families affected by cancer. There are several ways to get involved.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {givingWays.map((w) => (
            <li key={w.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sand-100">
                <w.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 leading-relaxed text-teal-100">{w.body}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center rounded-2xl bg-sand-100 p-6 text-ink">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-teal-950">
              <HandsIcon className="h-5 w-5 text-plum-700" />
              Support Our Mission
            </h3>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Your generosity helps eligible cancer patients and families in our community with
              essential non-medical needs during treatment.
            </p>
            <Link
              href="/donate"
              className="mt-5 self-start rounded-full bg-teal-800 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-900"
            >
              Donate to NHCAF
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}

function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <SectionHeading id="about-heading" eyebrow="About NHCAF" title="An independent charitable organization">
          <p>
            {ORG_NAME} is an IRS-recognized 501(c)(3) public charity organized to provide charitable
            assistance and support to individuals and families affected by cancer.
          </p>
          <p>
            NHCAF is a separate nonprofit charitable organization with its own governance,
            charitable programs, financial resources, and eligibility requirements.
          </p>
        </SectionHeading>

        <div className="self-center rounded-2xl border-l-4 border-teal-700 bg-sand-50 p-7 sm:p-8">
          <p className="flex items-start gap-3 font-serif text-xl font-semibold leading-snug text-teal-950">
            <ShieldIcon className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" />
            NHCAF is an independent charitable foundation and is not a healthcare provider.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            The Foundation&apos;s activities focus on charitable assistance, fundraising, and
            community support.
          </p>
          <p className="mt-3 leading-relaxed text-ink-soft">
            NHCAF does not operate a medical clinic, provide medical treatment, bill patients or
            insurers for healthcare services, or function as a hospital or health system.
          </p>
        </div>
      </Container>
    </section>
  );
}

function Contact() {
  const rows: { icon: Icon; label: string; value: ReactNode }[] = [
    { icon: ShieldIcon, label: "Organization", value: ORG_NAME },
    {
      icon: GlobeIcon,
      label: "Website",
      value: (
        <a
          href="https://www.nhcafoundation.org"
          className="font-medium text-teal-800 underline decoration-teal-700/40 underline-offset-4 hover:decoration-teal-800"
        >
          nhcafoundation.org
        </a>
      ),
    },
    {
      icon: MailIcon,
      label: "Email",
      value:
        "Foundation email addresses and the secure assistance application portal are being established. Please check back for updates.",
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-line bg-sand-50 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading id="contact-heading" eyebrow="Contact" title="Get in touch">
          <p>
            We are in the early stages of establishing the Foundation&apos;s public channels. Contact
            details will be added here as they become available.
          </p>
        </SectionHeading>

        <dl className="divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-4 p-5 sm:p-6">
              <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-ink-soft">{r.label}</dt>
                <dd className="mt-1 text-lg text-ink">{r.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

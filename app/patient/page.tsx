import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ExternalIcon, FamilyIcon, FoodIcon, LodgingIcon, TransportIcon } from "@/components/icons";
import { PrintChecklistButton } from "@/components/patient/PrintChecklistButton";
import "./patient.css";

export const metadata: Metadata = {
  title: "Patient Information & Resources | NHCAF",
  description: "Information, practical support resources, and contact options for people affected by cancer and their families in the North Houston community.",
  alternates: { canonical: "/patient" },
};

const programs = [
  { title: "Food assistance", icon: FoodIcon, description: "Cancer can put pressure on everyday expenses. NHCAF’s charitable assistance includes support for essential food needs for eligible individuals and families." },
  { title: "Treatment-related transportation", icon: TransportIcon, description: "Getting to treatment can be a practical and financial challenge. Explore support for transportation connected with cancer treatment." },
  { title: "Temporary lodging", icon: LodgingIcon, description: "Receiving treatment away from home can bring extra costs. NHCAF’s assistance includes temporary lodging support for eligible patients and families." },
];

// Planning references supplied by the user; current program availability must be checked directly.
const resources = [
  { name: "American Cancer Society", category: "Transportation, lodging & guidance", description: "Explore Road To Recovery, Hope Lodge, cancer information, and resources for patients and caregivers.", href: "https://www.cancer.org/support-programs-and-services.html" },
  { name: "CancerCare", category: "Practical & financial support", description: "Explore information about cancer-related financial assistance, counseling, and support services.", href: "https://www.cancercare.org/financial_assistance" },
  { name: "Family Reach", category: "Everyday living expenses", description: "Explore financial support resources for families facing the costs of cancer, including essential living expenses.", href: "https://familyreach.org/" },
  { name: "Patient Advocate Foundation", category: "Navigation & advocacy", description: "Find information about patient advocacy, insurance-related challenges, and financial aid resources.", href: "https://www.patientadvocate.org/" },
  { name: "Texas Oncology Foundation", category: "Support in Texas", description: "Explore regional assistance information and resources for people affected by cancer in Texas.", href: "https://texasoncologyfoundation.org/" },
  { name: "Cancer Support Community", category: "Emotional support & navigation", description: "Explore support groups, education, and help navigating the practical and emotional effects of cancer.", href: "https://www.cancersupportcommunity.org/" },
];

const eligibility = [
  { question: "Has the patient received a cancer diagnosis?", answer: "NHCAF assistance is intended for people with a cancer diagnosis. During review, the foundation will ask for confirmation from the treating care team. You do not need to upload medical records to start an inquiry. If you are unsure what proof to provide, ask for help in the application." },
  { question: "Does your household income fall within our guidelines?", answer: "Household income must be at or below 300% of the Federal Poverty Guidelines, based on household size. The inquiry asks for an estimate of household income before taxes, per month or per year. Enter 0 if there is no income, or choose the option to request help estimating it. NHCAF will confirm the applicable guidelines, household definition, and supporting information during review." },
  { question: "What kind of assistance do you need?", answer: "NHCAF’s charitable support areas are food assistance, treatment-related transportation, and temporary lodging. Tell us which needs you are facing, or select help understanding your options. Assistance depends on the foundation’s program guidelines and available resources." },
  { question: "Are you in the North Houston community?", answer: "NHCAF is based in Spring, Texas, and focuses on the North Houston community. Include your county and ZIP code in the inquiry so the foundation can confirm whether your location is within the current service area." },
  { question: "Can someone help you apply or obtain documents?", answer: "An authorized family member, caregiver, or care-team member may make an inquiry on behalf of a patient. If you cannot obtain proof of income or cancer diagnosis, select the document-help option in the application. NHCAF will contact you about the next steps; submitting an inquiry does not confirm eligibility or guarantee funding." },
];

export default function PatientPage() {
  return <div className="patient-page">
    <a href="#patient-main" className="patient-no-print sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-900 focus:shadow">Skip to patient information</a>
    <SiteHeader />
    <main id="patient-main">
      <section className="patient-hero" aria-labelledby="patient-heading">
        <div className="patient-hero-art" aria-hidden="true"><span /><span /><FamilyIcon /></div>
        <div className="patient-container patient-hero-content">
          <p className="patient-eyebrow">Patients &amp; families</p>
          <h1 id="patient-heading">Facing cancer and struggling with everyday expenses?</h1>
          <p className="patient-hero-intro">We’re here to help you take the next step. North Houston Cancer Assistance Foundation considers charitable assistance for food, treatment-related transportation, and temporary lodging for eligible patients and families.</p>
          <div className="patient-hero-actions" aria-label="Patient actions">
            <Link href="/apply" target="_blank" rel="noopener noreferrer" className="patient-button patient-button-primary">Apply online <ExternalIcon /><span className="sr-only">(opens in a new tab or window)</span></Link>
            <a href="#patient-eligibility" className="patient-button patient-button-light">Check eligibility</a>
            <a href="#patient-documents" className="patient-button patient-button-outline">Document checklist</a>
            <a href="#patient-contact" className="patient-button patient-button-outline">Contact NHCAF</a>
          </div>
          <p className="patient-hero-note">Start with an inquiry. No account or document upload is needed to begin; NHCAF will contact you about the next steps.</p>
        </div>
      </section>

      <nav className="patient-section-nav patient-no-print" aria-label="On this Patient page"><div className="patient-container"><a href="#patient-support">Our support</a><a href="#patient-eligibility">Eligibility</a><a href="#patient-how-to-apply">How to apply</a><a href="#patient-documents">Documents</a><a href="#patient-resources">Resources</a><a href="#patient-contact">Contact</a></div></nav>

      <section id="patient-support" className="patient-section" aria-labelledby="support-heading"><div className="patient-container">
        <div className="patient-section-heading"><p className="patient-eyebrow">Support beyond treatment</p><h2 id="support-heading">Help with the everyday needs.</h2><p>Cancer can bring practical challenges alongside treatment. NHCAF’s charitable support focuses on these areas, subject to eligibility and available resources.</p></div>
        <div className="patient-program-grid">{programs.map((program) => <article key={program.title} className="patient-program-card"><span className="patient-icon"><program.icon /></span><h3>{program.title}</h3><p>{program.description}</p></article>)}</div>
      </div></section>

      <section id="patient-eligibility" className="patient-section patient-section-white" aria-labelledby="eligibility-heading"><div className="patient-container">
        <div className="patient-section-heading"><p className="patient-eyebrow">Before you begin</p><h2 id="eligibility-heading">Eligibility</h2><p>Start with these questions to understand NHCAF’s assistance guidelines.</p></div>
        <div className="patient-faq">{eligibility.map((item, index) => <details key={item.question}><summary><span className="patient-faq-number" aria-hidden="true">{index + 1}.</span><h3>{item.question}</h3><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 9 7 7 7-7" /></svg></summary><div className="patient-faq-answer"><p>{item.answer}</p>{index === 1 && <a href="https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines" target="_blank" rel="noopener noreferrer">View the federal poverty guidelines <ExternalIcon /><span className="sr-only">(opens in a new tab or window)</span></a>}</div></details>)}</div>
        <p className="patient-footnote">These answers are guidance, not an eligibility decision. NHCAF reviews each inquiry and confirms program requirements and available resources.</p>
      </div></section>

      <section id="patient-how-to-apply" className="patient-section" aria-labelledby="how-heading"><div className="patient-container">
        <div className="patient-section-heading"><p className="patient-eyebrow">One step at a time</p><h2 id="how-heading">How to Apply</h2><p>A short online inquiry starts the conversation. Here’s how to get ready.</p></div>
        <ol className="patient-application-steps">
          <li><span className="patient-large-number" aria-hidden="true">1.</span><div><h3>Review the eligibility guidelines.</h3><p>Read about the cancer-diagnosis and household-income requirements, the types of support NHCAF considers, and the information the foundation will review.</p><a href="#patient-eligibility" className="patient-inline-link">Read the eligibility questions <span aria-hidden="true">↑</span></a></div></li>
          <li><span className="patient-large-number" aria-hidden="true">2.</span><div><h3>Have a few details ready.</h3><ul><li>Your name and preferred phone or email contact.</li><li>The patient’s name if you are applying on someone else’s behalf.</li><li>Your county, ZIP code, household size, and estimated household income before taxes.</li><li>The assistance you are looking for: food, treatment-related transportation, temporary lodging, or help understanding your options.</li></ul><p>Proof of income and cancer diagnosis will be discussed during follow-up. You can start the inquiry if you need help obtaining documents.</p><a href="#patient-documents" className="patient-inline-link">See the document checklist <span aria-hidden="true">↓</span></a></div></li>
          <li><span className="patient-large-number" aria-hidden="true">3.</span><div><h3>Complete and send your inquiry.</h3><p>The online application guides you through short sections, with a final review before you send it. English and Español are available in the application.</p><Link href="/apply" target="_blank" rel="noopener noreferrer" className="patient-inline-link">Apply online here <ExternalIcon /><span className="sr-only">(opens in a new tab or window)</span></Link><p>Keep the reference shown after confirmed submission. NHCAF will contact you using your preferred method to discuss eligibility, your needs, and how to provide any requested documents privately.</p></div></li>
        </ol>
        <div className="patient-apply-bottom"><p>Patients, authorized family members, caregivers, and care-team members can use the same inquiry form.</p><Link href="/apply" target="_blank" rel="noopener noreferrer" className="patient-button patient-button-teal">Start an assistance inquiry <ExternalIcon /><span className="sr-only">(opens in a new tab or window)</span></Link><p className="patient-footnote">Already sent an inquiry? Keep your reference and use the foundation’s published contact options if you need help with the next step. Submission is not a guarantee of assistance.</p></div>
      </div></section>

      <section id="patient-documents" className="patient-section patient-section-white" aria-labelledby="documents-heading"><div className="patient-container">
        <p className="patient-print-only">North Houston Cancer Assistance Foundation · Patient document checklist</p>
        <div className="patient-section-heading"><p className="patient-eyebrow">Prepare at your own pace</p><h2 id="documents-heading">Documents to have in mind.</h2><p>No files are uploaded with the initial inquiry. NHCAF will explain which documents are needed and how to provide them privately.</p></div>
        <div className="patient-document-grid"><article><span className="patient-card-label">Income information</span><h3>Proof of household income</h3><p>Examples may include pay statements, a benefits or Social Security award letter, or other income information NHCAF accepts. If you have no income, or cannot obtain a document, ask for guidance.</p></article><article><span className="patient-card-label">Diagnosis information</span><h3>Confirmation of cancer diagnosis</h3><p>A confirmation letter or form from the treating care team may be appropriate. Ask NHCAF which information is needed before requesting or sending medical records.</p></article></div>
        <div className="patient-document-note"><strong>Need help obtaining documents?</strong><p>Choose the document-help option in the application. Please do not send Social Security numbers, bank/account numbers, or full medical records in the inquiry or as ordinary email attachments.</p></div>
        <div className="patient-print-action patient-no-print"><PrintChecklistButton /><p>This prints a preparation checklist, not an application or an authorization form.</p></div>
      </div></section>

      <section id="patient-resources" className="patient-section" aria-labelledby="resources-heading"><div className="patient-container"><div className="patient-section-heading"><p className="patient-eyebrow">More places to turn</p><h2 id="resources-heading">Resources for patients and caregivers.</h2><p>Independent organizations may offer additional information and support. Check directly for current programs, eligibility, service areas, and availability.</p></div><div className="patient-resource-grid">{resources.map((resource) => <article key={resource.name}><span className="patient-card-label">{resource.category}</span><h3>{resource.name}</h3><p>{resource.description}</p><a href={resource.href} target="_blank" rel="noopener noreferrer">Visit organization <ExternalIcon /><span className="sr-only">(opens in a new tab or window)</span></a></article>)}</div><p className="patient-footnote">These links are informational references. Listing an organization does not imply an NHCAF partnership or endorsement. Other organizations make their own assistance decisions.</p></div></section>

      <section id="patient-contact" className="patient-section patient-section-white" aria-labelledby="contact-heading"><div className="patient-container"><div className="patient-section-heading"><p className="patient-eyebrow">Questions and next steps</p><h2 id="contact-heading">Contact and support.</h2><p>Find the right contact for your question.</p></div><div className="patient-contact-grid"><article><h3>For NHCAF questions</h3><p>Use the contact information published on the foundation’s main website. NHCAF’s public contact channels are being finalized; check the contact section for updates.</p><Link href="/#contact" className="patient-button patient-button-teal">View NHCAF contact information</Link><p className="patient-footnote">If your question concerns an inquiry you already sent, have your reference ready. Please wait for instructions before sharing medical or financial documents.</p></article><article><span className="patient-card-label">Independent cancer information line</span><h3>American Cancer Society</h3><p>The American Cancer Society offers cancer information and help finding support resources, 24 hours a day, seven days a week.</p><a href="tel:18002272345" className="patient-phone" aria-label="Call the American Cancer Society at 1-800-227-2345">1-800-227-2345</a><p className="patient-footnote">This is the American Cancer Society’s number, not NHCAF’s. They cannot provide updates or decisions about an NHCAF request. For medical questions, contact your treating care team.</p></article></div></div></section>
    </main>
    <SiteFooter />
  </div>;
}

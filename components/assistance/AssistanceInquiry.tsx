"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { LogoMark } from "@/components/SiteHeader";
import { applicantRoles, assistanceOptions, diagnosisOptions, proofOptions, validateInquiry } from "@/lib/assistance/inquiry";

const initial = { applicant_name: "", patient_name: "", applicant_role: "Patient", email: "", phone: "", contact_method: "Phone", county: "", zip: "", diagnosis_status: "", household_size: "", income_amount: "", income_frequency: "Monthly", income_unsure: false, needs: [] as string[], income_proof: "", diagnosis_proof: "", notes: "", contact_consent: false, website: "" };

export function AssistanceInquiry() {
  const [answers, setAnswers] = useState(initial);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const attempt = useRef<{ id: string; fingerprint: string } | null>(null);
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  const touched = JSON.stringify(answers) !== JSON.stringify(initial);
  useEffect(() => {
    if (!touched || receipt) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [touched, receipt]);
  useEffect(() => { if (receipt) receiptHeading.current?.focus(); }, [receipt]);
  function leave(event: MouseEvent<HTMLAnchorElement>) {
    if (event.currentTarget.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (touched && !receipt && !window.confirm("Your inquiry has not been sent. Leave this page and discard your answers?")) event.preventDefault();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setError("");
    try {
      const details = validateInquiry({ ...answers, patient_name: answers.applicant_role === "Patient" ? answers.applicant_name : answers.patient_name, household_size: answers.household_size === "" ? null : Number(answers.household_size), income_amount: answers.income_amount === "" ? null : Number(answers.income_amount) });
      const fingerprint = JSON.stringify(details);
      if (!attempt.current || attempt.current.fingerprint !== fingerprint) attempt.current = { id: crypto.randomUUID(), fingerprint };
      setSending(true);
      const response = await fetch("/api/assistance-inquiries", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...details, inquiry_id: attempt.current.id, website: answers.website }), signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not confirm receipt. Please try again.");
      if (typeof result.reference !== "string" || !/^NHCAF-[0-9A-F]{32}$/.test(result.reference)) throw new Error("We could not confirm receipt. Your answers are still here; please try again.");
      setReceipt(result.reference);
    } catch (issue) {
      setError(issue instanceof Error && !["TypeError", "TimeoutError", "SyntaxError"].includes(issue.name) ? issue.message : "We could not reach the inquiry service. Your answers are still here. Please try again or contact NHCAF.");
    } finally { setSending(false); }
  }
  const update = (name: keyof typeof initial, value: string | boolean | string[]) => setAnswers((current) => ({ ...current, [name]: value }));
  return <div className="assistance-page">
    <a href="#assistance-main" className="assistance-skip">Skip to assistance form</a>
    <header className="assistance-header"><div><Link href="/" onClick={leave} className="assistance-brand" aria-label="NHCAF foundation home"><LogoMark className="h-11 w-11" /><span><strong>NHCAF</strong><small>North Houston Cancer Assistance Foundation</small></span></Link><Link href="/" onClick={leave} className="assistance-back">← Foundation website</Link></div></header>
    <main id="assistance-main">
      {receipt ? <section className="assistance-receipt assistance-container" aria-labelledby="receipt-heading">
        <span className="assistance-check" aria-hidden="true">✓</span><p className="assistance-eyebrow">YOUR NEXT STEP STARTS HERE</p><h1 id="receipt-heading" ref={receiptHeading} tabIndex={-1}>We received your assistance inquiry.</h1>
        <p>Thank you for reaching out. NHCAF will contact you by {answers.contact_method.toLowerCase()} to discuss your needs and explain the next steps.</p>
        <div className="assistance-reference"><strong>Your inquiry reference</strong><span>{receipt}</span><small>Keep this reference if you contact the foundation about your inquiry.</small></div>
        <h2>What happens next?</h2><ol><li>NHCAF reviews the information you shared.</li><li>We contact you about eligibility, your needs, and any additional information.</li><li>We explain how to provide proof of income and cancer diagnosis privately. If you need help obtaining documents, let us know.</li></ol>
        <p className="assistance-note">This confirms receipt of an inquiry, not approval or a promise of funding. Please wait for document instructions; don’t send medical records as ordinary email attachments.</p>
        <div className="assistance-actions"><Link className="assistance-button" href="/">Return to the foundation website</Link><Link className="assistance-text-link" href="/#contact">Contact NHCAF</Link></div>
      </section> : <>
        <section className="assistance-hero"><div className="assistance-container"><p className="assistance-eyebrow">SUPPORT BEYOND TREATMENT</p><h1>Apply for Assistance</h1><p className="assistance-intro">Cancer affects more than your health. Tell us about the everyday needs you’re facing, and we’ll contact you about the next steps.</p><div className="assistance-intro-tags"><span>No account or password needed</span><span>No documents to upload today</span></div></div></section>
        <div className="assistance-container assistance-layout">
          <div className="assistance-form-column">
            <section className="assistance-eligibility" aria-labelledby="eligibility-heading"><p className="assistance-eyebrow">BEFORE YOU BEGIN</p><h2 id="eligibility-heading">Who is this assistance for?</h2><p>NHCAF considers assistance for individuals and families affected by cancer who are experiencing financial hardship. Applicants must have a cancer diagnosis and household income at or below <strong>300% of the Federal Poverty Guidelines</strong>, based on household size.</p><p>NHCAF will review eligibility and available resources. If you’re unsure about income or documents, you can explain that below and ask for help.</p></section>
            <form onSubmit={submit} aria-label="Assistance inquiry" className="assistance-form">
              <div className="assistance-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" value={answers.website} onChange={(event) => update("website", event.target.value)} /></label></div>
              <fieldset disabled={sending} className="assistance-form-body">
                <fieldset className="assistance-section"><legend><span>1</span> Tell us what would help</legend><p>Select all that apply. Required fields are marked with an asterisk (*).</p><div className="assistance-options" role="group" aria-label="Assistance requested">{assistanceOptions.map((need) => <label key={need} className={answers.needs.includes(need) ? "is-selected" : ""}><input type="checkbox" checked={answers.needs.includes(need)} onChange={() => update("needs", answers.needs.includes(need) ? answers.needs.filter((item) => item !== need) : [...answers.needs, need])} /><span>{need}</span></label>)}</div><p className="assistance-field-help">Choose at least one option. Selecting a program does not guarantee assistance.</p></fieldset>
                <fieldset className="assistance-section"><legend><span>2</span> How can we contact you?</legend><div className="assistance-fields">
                  <label className="assistance-full">I am applying as *<select value={answers.applicant_role} onChange={(event) => update("applicant_role", event.target.value)}>{applicantRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
                  <label>Your name *<input name="applicant_name" required autoComplete="name" maxLength={100} value={answers.applicant_name} onChange={(event) => update("applicant_name", event.target.value)} /></label>
                  {answers.applicant_role !== "Patient" && <label>Patient’s name *<input name="patient_name" required autoComplete="off" maxLength={100} value={answers.patient_name} onChange={(event) => update("patient_name", event.target.value)} /></label>}
                  <label>Preferred contact method *<select value={answers.contact_method} onChange={(event) => update("contact_method", event.target.value)}><option>Phone</option><option>Email</option></select></label>
                  <label>Phone number {answers.contact_method === "Phone" ? "*" : "(optional)"}<input name="phone" type="tel" autoComplete="tel" required={answers.contact_method === "Phone"} maxLength={30} value={answers.phone} onChange={(event) => update("phone", event.target.value)} /></label>
                  <label>Email address {answers.contact_method === "Email" ? "*" : "(optional)"}<input name="email" type="email" autoComplete="email" required={answers.contact_method === "Email"} maxLength={254} value={answers.email} onChange={(event) => update("email", event.target.value)} /></label>
                  <label>County *<input name="county" required maxLength={100} value={answers.county} onChange={(event) => update("county", event.target.value)} /></label>
                  <label>ZIP code *<input name="zip" required autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={answers.zip} onChange={(event) => update("zip", event.target.value)} /></label>
                </div></fieldset>
                <fieldset className="assistance-section"><legend><span>3</span> A little about your circumstances</legend><div className="assistance-fields">
                  <label className="assistance-full">Has the patient received a cancer diagnosis? *<select required value={answers.diagnosis_status} onChange={(event) => update("diagnosis_status", event.target.value)}><option value="">Select an answer</option>{diagnosisOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <label>Number of people in the household *<input name="household_size" type="number" required min={1} max={100} step={1} inputMode="numeric" aria-describedby="household-help" value={answers.household_size} onChange={(event) => update("household_size", event.target.value)} /></label>
                  <p id="household-help" className="assistance-field-help assistance-full">Include the patient. NHCAF will confirm the household definition and income information during review.</p>
                  <label className="assistance-checkbox assistance-full"><input type="checkbox" checked={answers.income_unsure} onChange={(event) => update("income_unsure", event.target.checked)} /><span>I need help estimating household income.</span></label>
                  {!answers.income_unsure && <><label>Household income before taxes *<input name="income_amount" type="number" required min={0} max={999999999} step="0.01" inputMode="decimal" aria-describedby="income-help" value={answers.income_amount} onChange={(event) => update("income_amount", event.target.value)} /></label><label>Income period *<select value={answers.income_frequency} onChange={(event) => update("income_frequency", event.target.value)}><option>Monthly</option><option>Yearly</option></select></label><p id="income-help" className="assistance-field-help assistance-full">Use your best estimate of total household income before taxes. Enter 0 if there is no income. NHCAF will check this information against the applicable guidelines.</p></>}
                </div></fieldset>
                <fieldset className="assistance-section"><legend><span>4</span> Know what documents come next</legend><p>You do not need to upload anything with this inquiry. NHCAF will explain how to provide documents privately after contacting you.</p><div className="assistance-document"><h3>Proof of income</h3><p>Examples may include pay statements, a benefits or Social Security award letter, or other income information accepted by NHCAF. If you have no income or cannot obtain documents, ask us for guidance.</p><label>Can you provide proof of income? *<select required value={answers.income_proof} onChange={(event) => update("income_proof", event.target.value)}><option value="">Select an answer</option>{proofOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div><div className="assistance-document"><h3>Proof of cancer diagnosis</h3><p>A confirmation letter or form from the treating care team may be appropriate. Please wait for instructions rather than sending a full medical record.</p><label>Can you provide proof of cancer diagnosis? *<select required value={answers.diagnosis_proof} onChange={(event) => update("diagnosis_proof", event.target.value)}><option value="">Select an answer</option>{proofOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div>
                  <label>Anything else you would like us to know? (optional)<textarea name="notes" rows={3} maxLength={1500} value={answers.notes} onChange={(event) => update("notes", event.target.value)} aria-describedby="notes-help" /></label><p id="notes-help" className="assistance-field-help">Please do not include detailed medical information, Social Security numbers, or bank/account numbers.</p>
                </fieldset>
                <div className="assistance-submit-panel"><label className="assistance-checkbox"><input type="checkbox" required checked={answers.contact_consent} onChange={(event) => update("contact_consent", event.target.checked)} /><span>I confirm that I am the patient or authorized to make this inquiry, and NHCAF may contact me about it. I understand this is an inquiry and assistance depends on eligibility and available resources.</span></label><div role="alert">{error && <p className="assistance-error">{error} <Link href="/#contact" target="_blank" rel="noopener noreferrer">Contact NHCAF (opens a new tab or window)</Link>.</p>}</div><button type="submit" className="assistance-button" disabled={sending}>{sending ? "Sending your inquiry…" : "Send assistance inquiry"}<span aria-hidden="true">→</span></button><p className="assistance-field-help" role="status">{sending ? "Please keep this page open while we confirm receipt." : "Your answers are sent only when you select Send assistance inquiry. They are not saved as a draft on this device."}</p></div>
              </fieldset>
            </form>
          </div>
          <aside className="assistance-aside" aria-label="What to expect"><div className="assistance-next"><p className="assistance-eyebrow">ONE STEP AT A TIME</p><h2>Start with an inquiry.<br />We’ll take it from there.</h2><ol><li><strong>Tell us what you need.</strong><p>Complete this form without creating an account.</p></li><li><strong>Hear from NHCAF.</strong><p>We contact you by your preferred method to discuss your circumstances.</p></li><li><strong>Provide documents privately.</strong><p>We explain what is needed and how to provide it.</p></li></ol><Link href="/#contact" onClick={leave} target="_blank" rel="noopener noreferrer">Need help? Contact the foundation ↗<span className="sr-only"> (opens in a new tab or window)</span></Link></div><p className="assistance-note">NHCAF provides charitable assistance, not medical care. For medical questions, contact your treating care team.</p></aside>
        </div>
      </>}
    </main><footer className="assistance-footer assistance-container">North Houston Cancer Assistance Foundation · Spring, Texas</footer>
  </div>;
}

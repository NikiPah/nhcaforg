"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { LogoMark } from "@/components/SiteHeader";
import { applicantRoles, assistanceOptions, diagnosisOptions, proofOptions, validateInquiry } from "@/lib/assistance/inquiry";

const initial = { applicant_name: "", patient_name: "", applicant_role: "Patient", email: "", phone: "", contact_method: "Phone", county: "", zip: "", diagnosis_status: "", household_size: "", income_amount: "", income_frequency: "Monthly", income_unsure: false, needs: [] as string[], income_proof: "", diagnosis_proof: "", notes: "", contact_consent: false, website: "" };
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const stepNames = {
  en: ["Information", "Initial Attestation", "Patient Qualifications", "Type of Assistance", "Patient Attestation", "Patient Information", "Final Review"],
  es: ["Información", "Autorización inicial", "Requisitos del paciente", "Tipo de ayuda", "Declaración del paciente", "Información del paciente", "Revisión final"],
};
const spanishOptions: Record<string, string> = {
  "Patient": "Paciente", "Family member or caregiver": "Familiar o persona cuidadora", "Care-team member or social worker": "Integrante del equipo de atención o trabajador/a social",
  "Food assistance": "Ayuda para alimentos", "Treatment-related transportation": "Transporte relacionado con el tratamiento", "Temporary lodging": "Alojamiento temporal", "I need help understanding my options": "Necesito ayuda para entender mis opciones",
  "Yes": "Sí", "Not yet confirmed": "Aún no se ha confirmado", "I’m not sure": "No estoy seguro/a",
  "I can provide this": "Puedo presentar este documento", "I need help obtaining this": "Necesito ayuda para obtenerlo", "I’m not sure what to provide": "No sé qué documento presentar",
  "Phone": "Teléfono", "Email": "Correo electrónico", "Monthly": "Mensual", "Yearly": "Anual",
};

export function AssistanceInquiry() {
  const hydrated = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [answers, setAnswers] = useState(initial);
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const attempt = useRef<{ id: string; fingerprint: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorPanel = useRef<HTMLDivElement>(null);
  const progressPanel = useRef<HTMLDivElement>(null);
  const stepList = useRef<HTMLOListElement>(null);
  const firstRender = useRef(true);
  const t = (en: string, es: string) => locale === "en" ? en : es;
  const display = (value: string) => locale === "es" ? spanishOptions[value] || value : value;
  const touched = authorized || JSON.stringify(answers) !== JSON.stringify(initial);
  const names = stepNames[locale];
  const titles = [
    t("Welcome to NHCAF’s online assistance application", "Bienvenido/a a la solicitud de ayuda de NHCAF"),
    t("Let’s get started.", "Comencemos."),
    t("Tell us about your circumstances.", "Cuéntenos sobre su situación."),
    t("Which type of assistance would help?", "¿Qué tipo de ayuda necesita?"),
    t("Documents and your acknowledgement", "Documentos y su declaración"),
    t("How can we contact you?", "¿Cómo podemos comunicarnos con usted?"),
    t("Review your inquiry before sending", "Revise su consulta antes de enviarla"),
  ];

  useEffect(() => {
    if (!touched || receipt) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [touched, receipt]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 650px)").matches) stepList.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
    progressPanel.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [step, receipt]);
  useEffect(() => { if (error) errorPanel.current?.focus(); }, [error]);

  function leave(event: MouseEvent<HTMLAnchorElement>) {
    if (event.currentTarget.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (touched && !receipt && !window.confirm(t("Your inquiry has not been sent. Leave this page and discard your answers?", "Su consulta no se ha enviado. ¿Desea salir y descartar sus respuestas?"))) event.preventDefault();
  }
  function update<K extends keyof typeof initial>(name: K, value: (typeof initial)[K]) {
    setAnswers((current) => ({ ...current, [name]: value, contact_consent: name === "contact_consent" ? value as boolean : false }));
    if (name === "applicant_role") setAuthorized(false);
    setError("");
  }
  function stepError(index: number) {
    if (index === 1 && !authorized) return t("Confirm that you are the patient or are authorized to make this inquiry.", "Confirme que es el paciente o que tiene autorización para hacer esta consulta.");
    if (index === 2) {
      if (!answers.diagnosis_status) return t("Select an answer about the cancer diagnosis.", "Seleccione una respuesta sobre el diagnóstico de cáncer.");
      const size = Number(answers.household_size);
      if (!answers.household_size || !Number.isInteger(size) || size < 1 || size > 100) return t("Enter the number of people in your household, including the patient.", "Indique cuántas personas hay en su hogar, incluido el paciente.");
      const income = Number(answers.income_amount);
      if (!answers.income_unsure && (answers.income_amount === "" || !Number.isFinite(income) || income < 0 || income > 999999999 || Math.abs(income * 100 - Math.round(income * 100)) > .00001)) return t("Enter household income before taxes, or select that you need help estimating it. Enter 0 if there is no income.", "Indique los ingresos del hogar antes de impuestos o seleccione que necesita ayuda para estimarlos. Indique 0 si no hay ingresos.");
    }
    if (index === 3 && !answers.needs.length) return t("Choose at least one type of support, or choose help understanding your options.", "Seleccione al menos un tipo de ayuda o la opción de ayuda para entender sus opciones.");
    if (index === 4 && (!answers.income_proof || !answers.diagnosis_proof)) return t("Tell us whether you can provide each document or need help obtaining it.", "Indique si puede presentar cada documento o si necesita ayuda para obtenerlo.");
    if (index === 5) {
      if (!answers.applicant_name.trim() || (answers.applicant_role !== "Patient" && !answers.patient_name.trim()) || !answers.county.trim() || !/^\d{5}$/.test(answers.zip)) return t("Complete your name, the patient’s name if needed, county and five-digit ZIP code.", "Complete su nombre, el nombre del paciente si corresponde, el condado y el código postal de cinco dígitos.");
      if ((answers.contact_method === "Email" && !answers.email) || (answers.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email))) return t("Enter a valid contact email address.", "Indique un correo electrónico de contacto válido.");
      if ((answers.contact_method === "Phone" && !answers.phone) || (answers.phone && (!/^[+()\d .-]+$/.test(answers.phone) || answers.phone.replace(/\D/g, "").length < 10 || answers.phone.replace(/\D/g, "").length > 15))) return t("Enter a phone number with 10–15 digits.", "Indique un número de teléfono de entre 10 y 15 dígitos.");
    }
    if (index === 6 && !answers.contact_consent) return t("Confirm the final acknowledgement before submitting.", "Confirme la declaración final antes de enviar.");
    return "";
  }
  function go(index: number) {
    if (sending) return;
    if (index > step) {
      for (let i = 0; i < index; i++) {
        const issue = stepError(i);
        if (issue) { setStep(i); setError(issue); return; }
      }
    }
    setStep(index); setError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const issue = stepError(step);
    if (issue) { setError(issue); return; }
    if (step < 6) {
      setCompleted((current) => [...new Set([...current, step])]);
      setFurthest((current) => Math.max(current, step + 1));
      setStep(step + 1); setError(""); return;
    }
    for (let i = 0; i < 6; i++) {
      const issue = stepError(i);
      if (issue) { setStep(i); setError(issue); return; }
    }
    setError("");
    try {
      const details = validateInquiry({ ...answers, patient_name: answers.applicant_role === "Patient" ? answers.applicant_name : answers.patient_name, household_size: Number(answers.household_size), income_amount: answers.income_amount === "" ? null : Number(answers.income_amount) });
      const fingerprint = JSON.stringify(details);
      if (!attempt.current || attempt.current.fingerprint !== fingerprint) attempt.current = { id: crypto.randomUUID(), fingerprint };
      setSending(true);
      const response = await fetch("/api/assistance-inquiries", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...details, inquiry_id: attempt.current.id, website: answers.website }), signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok) throw new Error(locale === "es" ? t("", "No pudimos confirmar la recepción. Sus respuestas siguen aquí. Inténtelo de nuevo o contacte a NHCAF.") : result.error || "We could not confirm receipt. Please try again.");
      if (typeof result.reference !== "string" || !/^NHCAF-[0-9A-F]{32}$/.test(result.reference)) throw new Error(t("We could not confirm receipt. Your answers are still here; please try again.", "No pudimos confirmar la recepción. Sus respuestas siguen aquí; inténtelo de nuevo."));
      setReceipt(result.reference);
    } catch (issue) {
      setError(issue instanceof Error && !["TypeError", "TimeoutError", "SyntaxError"].includes(issue.name) ? issue.message : t("We could not reach the inquiry service. Your answers are still here. Please try again or contact NHCAF.", "No pudimos conectar con el servicio. Sus respuestas siguen aquí. Inténtelo de nuevo o contacte a NHCAF."));
    } finally { setSending(false); }
  }
  function cancel() {
    if (touched && !window.confirm(t("Cancel this unsent inquiry and clear all your answers?", "¿Desea cancelar esta consulta sin enviar y borrar todas sus respuestas?"))) return;
    setAnswers(initial); setAuthorized(false); setStep(0); setFurthest(0); setCompleted([]); setError(""); attempt.current = null;
  }
  const completeCount = completed.filter((index) => !stepError(index)).length;
  const progress = receipt ? 100 : Math.round(completeCount / names.length * 100);
  const choose = (value: string, onChange: (value: string) => void, options: string[], label: string, required = true) => <label>{label}<select required={required} value={value} onChange={(event) => onChange(event.target.value)}><option value="">{t("Select an answer", "Seleccione una respuesta")}</option>{options.map((option) => <option key={option} value={option}>{display(option)}</option>)}</select></label>;
  const review = (title: string, index: number, rows: [string, ReactNode][]) => <section className="assistance-review-group"><div><h3>{title}</h3><button type="button" onClick={() => go(index)} disabled={sending} aria-label={`${t("Edit", "Editar")}: ${title}`}>{t("Edit", "Editar")}</button></div><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || t("Not provided", "No indicado")}</dd></div>)}</dl></section>;

  return <div className="assistance-page" lang={locale}>
    <a href="#assistance-main" className="assistance-skip">{t("Skip to application", "Ir a la solicitud")}</a>
    <header className="assistance-header"><div><Link href="/" onClick={leave} className="assistance-brand" aria-label="NHCAF foundation home"><LogoMark className="h-11 w-11" /><span><strong>NHCAF</strong><small>North Houston Cancer Assistance Foundation</small></span></Link><Link href="/" onClick={leave} className="assistance-back">← {t("Foundation website", "Sitio de la fundación")}</Link></div></header>
    <main id="assistance-main" className="assistance-container">
      <div className="assistance-page-title"><p>{t("PATIENT ASSISTANCE", "AYUDA PARA PACIENTES")}</p><h1>{t("Apply for Assistance", "Solicitar ayuda")}</h1></div>
      <section className="assistance-wizard" aria-label={t("Online assistance application", "Solicitud de ayuda en línea")}>
        <div className="assistance-wizard-top" ref={progressPanel}>
          <fieldset className="assistance-language" disabled={sending || !hydrated}><legend>{t("Select a language", "Seleccione un idioma")}</legend>{([['en', 'English'], ['es', 'Español']] as const).map(([code, label]) => <label key={code}><input type="radio" name="language" value={code} checked={locale === code} onChange={() => { setLocale(code); setError(""); }} />{label}</label>)}</fieldset>
          <div className="assistance-progress-label"><p>{receipt ? t("Your inquiry has been received.", "Hemos recibido su consulta.") : t("Complete the steps below to send your assistance inquiry.", "Complete los pasos siguientes para enviar su consulta de ayuda.")}</p><strong aria-live="polite">{progress}% {t("Complete", "completado")}</strong></div>
          <progress max={100} value={progress} aria-label={t("Application progress", "Progreso de la solicitud")} />
        </div>
        {receipt ? <div className="assistance-receipt"><span className="assistance-check" aria-hidden="true">✓</span><h2 ref={heading} tabIndex={-1} id="receipt-heading">{t("We received your assistance inquiry.", "Hemos recibido su consulta de ayuda.")}</h2><p>{t("Thank you for reaching out. NHCAF will contact you by", "Gracias por comunicarse con nosotros. NHCAF le contactará por")} {display(answers.contact_method).toLowerCase()} {t("to discuss your needs and explain the next steps.", "para conversar sobre sus necesidades y explicarle los próximos pasos.")}</p><div className="assistance-reference"><strong>{t("Your inquiry reference", "Su número de referencia")}</strong><span>{receipt}</span><small>{t("Keep this reference if you contact the foundation about your inquiry.", "Guarde esta referencia si contacta a la fundación sobre su consulta.")}</small></div><h3>{t("What happens next?", "¿Qué sigue?")}</h3><ol><li>{t("NHCAF reviews the information you shared.", "NHCAF revisa la información que usted proporcionó.")}</li><li>{t("We contact you about eligibility, your needs and any additional information.", "Le contactamos sobre los requisitos, sus necesidades y cualquier información adicional.")}</li><li>{t("We explain how to provide proof of income and cancer diagnosis privately, and help if documents are difficult to obtain.", "Le explicamos cómo presentar comprobantes de ingresos y del diagnóstico de cáncer de forma privada, y le orientamos si tiene dificultades para obtenerlos.")}</li></ol><p className="assistance-note">{t("This confirms receipt, not approval or a promise of funding. Please wait for document instructions; don’t send medical records as ordinary email attachments.", "Esto confirma la recepción, no una aprobación ni una promesa de fondos. Espere las instrucciones para los documentos; no envíe expedientes médicos como archivos adjuntos por correo electrónico ordinario.")}</p><div className="assistance-actions"><Link className="assistance-button" href="/">{t("Return to the foundation website", "Volver al sitio de la fundación")}</Link><Link className="assistance-text-link" href="/#contact">{t("Contact NHCAF", "Contactar a NHCAF")}</Link></div></div> : <div className="assistance-wizard-layout">
          <nav className="assistance-steps" aria-label={t("Application steps", "Pasos de la solicitud")}><ol ref={stepList}>{names.map((name, index) => {
            const done = completed.includes(index) && !stepError(index);
            return <li key={index} className={index === step ? "is-current" : done ? "is-complete" : ""}><button type="button" disabled={sending || !hydrated || index > furthest} onClick={() => go(index)} aria-current={index === step ? "step" : undefined}><span className="assistance-step-marker" aria-hidden="true">{done && index !== step ? "✓" : ""}</span><span>{name}</span><span className="sr-only">{done && index !== step ? t(" (completed)", " (completado)") : ""}</span></button></li>;
          })}</ol><p>{t("Your answers stay here as you move between steps. Nothing is sent until final submission.", "Sus respuestas se conservan mientras avanza entre los pasos. Nada se envía hasta el envío final.")}</p><Link href="/#contact" target="_blank" rel="noopener noreferrer">{t("Need help? Contact NHCAF", "¿Necesita ayuda? Contacte a NHCAF")} ↗<span className="sr-only">{t(" (opens a new tab or window)", " (abre otra pestaña o ventana)")}</span></Link></nav>
          <div className="assistance-wizard-content"><p className="assistance-step-count">{t("Step", "Paso")} {step + 1} {t("of", "de")} {names.length}</p><h2 ref={heading} tabIndex={-1}>{titles[step]}</h2>{step > 0 && <p className="assistance-required">{t("An asterisk (*) indicates required information.", "Un asterisco (*) indica información obligatoria.")}</p>}
            <form ref={form} method="post" onSubmit={submit} aria-label={t("Assistance inquiry", "Consulta de ayuda")}>
              <div className="assistance-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" value={answers.website} onChange={(event) => update("website", event.target.value)} /></label></div>
              <noscript><p className="assistance-note">Enable JavaScript to complete this form, or contact NHCAF through the foundation website for help.</p></noscript><fieldset disabled={sending || !hydrated} className="assistance-form-body">
                {step === 0 && <div className="assistance-information"><p>{t("Before you apply, please note the following:", "Antes de solicitar ayuda, tenga en cuenta lo siguiente:")}</p><ul><li>{t("NHCAF considers help with food, treatment-related transportation and temporary lodging for individuals and families affected by cancer.", "NHCAF considera ayuda para alimentos, transporte relacionado con el tratamiento y alojamiento temporal para personas y familias afectadas por el cáncer.")}</li><li>{t("Applicants must have a cancer diagnosis and household income at or below", "Las personas solicitantes deben tener un diagnóstico de cáncer e ingresos del hogar iguales o inferiores al")} <strong>{t("300% of the Federal Poverty Guidelines", "300% de las pautas federales de pobreza")}</strong>{t(", based on household size. NHCAF will review eligibility and available resources.", ", según el tamaño del hogar. NHCAF revisará los requisitos y los recursos disponibles.")}</li><li>{t("This starts an inquiry. You don’t need an account, password, or document upload today. NHCAF will contact you about the next steps.", "Esto inicia una consulta. Hoy no necesita cuenta, contraseña ni cargar documentos. NHCAF le contactará sobre los próximos pasos.")}</li></ul><h3>{t("Your privacy", "Su privacidad")}</h3><p>{t("Share only what is requested. Do not include Social Security numbers, bank/account numbers, or detailed medical records. We use this inquiry to review your request and contact you. Your answers are not saved as a draft on this device; closing or refreshing this page clears them.", "Comparta solo lo que se solicita. No incluya números del Seguro Social, datos bancarios ni expedientes médicos detallados. Usamos esta consulta para revisar su solicitud y contactarle. Sus respuestas no se guardan como borrador en este dispositivo; se borran al cerrar o actualizar la página.")}</p><h3>{t("What to have ready", "Qué debe preparar")}</h3><p>{t("Your contact details, household size and estimated income. We’ll explain the income and diagnosis documents needed later. You may ask for help if you’re unsure.", "Sus datos de contacto, el tamaño del hogar y una estimación de ingresos. Más adelante explicaremos qué comprobantes de ingresos y diagnóstico se necesitan. Puede pedir ayuda si tiene dudas.")}</p></div>}
                {step === 1 && <div><fieldset className="assistance-radio-group"><legend>{t("Who is making this inquiry? *", "¿Quién hace esta consulta? *")}</legend>{applicantRoles.map((role) => <label key={role}><input type="radio" name="applicant_role" value={role} checked={answers.applicant_role === role} onChange={() => update("applicant_role", role)} /><span>{display(role)}</span></label>)}</fieldset><div className="assistance-note">{t("Family members, caregivers and authorized care-team members can make an inquiry on behalf of a patient. NHCAF will confirm any further authorization needed during follow-up.", "Los familiares, personas cuidadoras e integrantes autorizados del equipo de atención pueden consultar en nombre de un paciente. NHCAF confirmará cualquier autorización adicional necesaria durante el seguimiento.")}</div><h3>{t("Initial acknowledgement", "Declaración inicial")}</h3><p>{t("Please make sure the patient knows about this inquiry if you are acting on their behalf.", "Si actúa en nombre de otra persona, asegúrese de que el paciente sepa de esta consulta.")}</p><label className="assistance-checkbox"><input type="checkbox" required checked={authorized} onChange={(event) => { setAuthorized(event.target.checked); setError(""); }} /><span>{t("I am the patient, or I am authorized to make this inquiry on the patient’s behalf.", "Soy el paciente o tengo autorización para hacer esta consulta en su nombre.")}</span></label></div>}
                {step === 2 && <div className="assistance-fields">{choose(answers.diagnosis_status, (value) => update("diagnosis_status", value), diagnosisOptions, t("Has the patient received a cancer diagnosis? *", "¿El paciente ha recibido un diagnóstico de cáncer? *"))}<label>{t("Number of people in the household *", "Número de personas en el hogar *")}<input name="household_size" type="number" required min={1} max={100} step={1} inputMode="numeric" aria-describedby="household-help" value={answers.household_size} onChange={(event) => update("household_size", event.target.value)} /></label><p id="household-help" className="assistance-field-help assistance-full">{t("Include the patient. NHCAF will confirm the household definition and income information during review.", "Incluya al paciente. NHCAF confirmará la definición del hogar y la información de ingresos durante la revisión.")}</p><label className="assistance-checkbox assistance-full"><input type="checkbox" checked={answers.income_unsure} onChange={(event) => update("income_unsure", event.target.checked)} /><span>{t("I need help estimating household income.", "Necesito ayuda para estimar los ingresos del hogar.")}</span></label>{!answers.income_unsure && <><label>{t("Household income before taxes *", "Ingresos del hogar antes de impuestos *")}<input name="income_amount" type="number" required min={0} max={999999999} step="0.01" inputMode="decimal" aria-describedby="income-help" value={answers.income_amount} onChange={(event) => update("income_amount", event.target.value)} /></label><label>{t("Income period *", "Período de ingresos *")}<select value={answers.income_frequency} onChange={(event) => update("income_frequency", event.target.value)}>{["Monthly", "Yearly"].map((value) => <option key={value} value={value}>{display(value)}</option>)}</select></label><p id="income-help" className="assistance-field-help assistance-full">{t("Use your best estimate of total household income before taxes. Enter 0 if there is no income. NHCAF will compare the information with the applicable poverty guidelines; this form does not approve eligibility.", "Indique su mejor estimación de los ingresos totales del hogar antes de impuestos. Indique 0 si no hay ingresos. NHCAF comparará la información con las pautas de pobreza correspondientes; este formulario no aprueba la elegibilidad.")}</p></>}</div>}
                {step === 3 && <div><p>{t("Select all that apply. We’ll discuss available support when we contact you.", "Seleccione todas las opciones que correspondan. Conversaremos sobre la ayuda disponible cuando le contactemos.")}</p><fieldset className="assistance-options"><legend>{t("Type of assistance *", "Tipo de ayuda *")}</legend>{assistanceOptions.map((need) => <label key={need} className={answers.needs.includes(need) ? "is-selected" : ""}><input type="checkbox" checked={answers.needs.includes(need)} onChange={() => update("needs", answers.needs.includes(need) ? answers.needs.filter((item) => item !== need) : [...answers.needs, need])} /><span>{display(need)}</span></label>)}</fieldset><p className="assistance-field-help">{t("Choose at least one option. Selecting a program does not guarantee assistance.", "Seleccione al menos una opción. Seleccionar un programa no garantiza la ayuda.")}</p></div>}
                {step === 4 && <div><p>{t("You do not need to upload documents with this inquiry. NHCAF will contact you with instructions for providing them privately.", "No necesita cargar documentos con esta consulta. NHCAF le contactará con instrucciones para presentarlos de forma privada.")}</p><div className="assistance-document"><h3>{t("Proof of income", "Comprobante de ingresos")}</h3><p>{t("Examples may include pay statements, benefits or Social Security award letters, or other information accepted by NHCAF. If you have no income or cannot obtain documents, ask us for guidance.", "Los ejemplos pueden incluir comprobantes de pago, cartas de beneficios o del Seguro Social, u otra información aceptada por NHCAF. Si no tiene ingresos o no puede obtener documentos, pida orientación.")}</p>{choose(answers.income_proof, (value) => update("income_proof", value), proofOptions, t("Can you provide proof of income? *", "¿Puede presentar un comprobante de ingresos? *"))}</div><div className="assistance-document"><h3>{t("Proof of cancer diagnosis", "Comprobante del diagnóstico de cáncer")}</h3><p>{t("A confirmation letter or form from the treating care team may be appropriate. Please wait for instructions rather than sending a full medical record.", "Puede ser apropiada una carta o un formulario de confirmación del equipo médico tratante. Espere las instrucciones en vez de enviar un expediente médico completo.")}</p>{choose(answers.diagnosis_proof, (value) => update("diagnosis_proof", value), proofOptions, t("Can you provide proof of cancer diagnosis? *", "¿Puede presentar un comprobante del diagnóstico de cáncer? *"))}</div><div className="assistance-note">{t("Please provide information that is accurate to the best of your knowledge. NHCAF will review supporting information before deciding whether assistance is available. Submission is not an approval or a promise of funding.", "Proporcione información correcta según su leal saber y entender. NHCAF revisará los comprobantes antes de decidir si hay ayuda disponible. El envío no es una aprobación ni una promesa de fondos.")}</div></div>}
                {step === 5 && <div><p>{t("We’ll contact you using your preferred method.", "Le contactaremos por el medio que prefiera.")}</p><div className="assistance-fields"><label>{t("Your name *", "Su nombre *")}<input name="applicant_name" required autoComplete="name" maxLength={100} value={answers.applicant_name} onChange={(event) => update("applicant_name", event.target.value)} /></label>{answers.applicant_role !== "Patient" && <label>{t("Patient’s name *", "Nombre del paciente *")}<input name="patient_name" required autoComplete="off" maxLength={100} value={answers.patient_name} onChange={(event) => update("patient_name", event.target.value)} /></label>}<label>{t("Preferred contact method *", "Medio de contacto preferido *")}<select value={answers.contact_method} onChange={(event) => update("contact_method", event.target.value)}>{["Phone", "Email"].map((value) => <option key={value} value={value}>{display(value)}</option>)}</select></label><label>{t("Phone number", "Número de teléfono")} {answers.contact_method === "Phone" ? "*" : t("(optional)", "(opcional)")}<input name="phone" type="tel" autoComplete="tel" required={answers.contact_method === "Phone"} maxLength={30} value={answers.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>{t("Email address", "Correo electrónico")} {answers.contact_method === "Email" ? "*" : t("(optional)", "(opcional)")}<input name="email" type="email" autoComplete="email" required={answers.contact_method === "Email"} maxLength={254} value={answers.email} onChange={(event) => update("email", event.target.value)} /></label><label>{t("County *", "Condado *")}<input name="county" required maxLength={100} value={answers.county} onChange={(event) => update("county", event.target.value)} /></label><label>{t("ZIP code *", "Código postal *")}<input name="zip" required autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={answers.zip} onChange={(event) => update("zip", event.target.value)} /></label><label className="assistance-full">{t("Anything else you would like us to know? (optional)", "¿Desea agregar algo más? (opcional)")}<textarea name="notes" rows={3} maxLength={1500} value={answers.notes} onChange={(event) => update("notes", event.target.value)} aria-describedby="notes-help" /></label><p id="notes-help" className="assistance-field-help assistance-full">{t("Do not include detailed medical information, Social Security numbers, or bank/account numbers.", "No incluya información médica detallada, números del Seguro Social ni datos bancarios.")}</p></div></div>}
                {step === 6 && <div><p>{t("Check your answers. Use Edit to make corrections before submitting. Your inquiry has not been sent yet.", "Revise sus respuestas. Use Editar para hacer correcciones antes de enviar. Su consulta todavía no se ha enviado.")}</p>{review(names[1], 1, [[t("Applying as", "Solicita como"), display(answers.applicant_role)]])}{review(names[2], 2, [[t("Cancer diagnosis", "Diagnóstico de cáncer"), display(answers.diagnosis_status)], [t("Household size", "Personas en el hogar"), answers.household_size], [t("Household income before taxes", "Ingresos del hogar antes de impuestos"), answers.income_unsure ? t("Help estimating requested", "Se solicita ayuda para estimarlos") : `${new Intl.NumberFormat(locale === "en" ? "en-US" : "es-US", { style: "currency", currency: "USD" }).format(Number(answers.income_amount))} / ${display(answers.income_frequency).toLowerCase()}`]])}{review(names[3], 3, [[t("Support requested", "Ayuda solicitada"), answers.needs.map(display).join(", ")]])}{review(names[4], 4, [[t("Income documents", "Comprobantes de ingresos"), display(answers.income_proof)], [t("Diagnosis documents", "Comprobantes del diagnóstico"), display(answers.diagnosis_proof)]])}{review(names[5], 5, [[t("Applicant", "Solicitante"), answers.applicant_name], [t("Patient", "Paciente"), answers.applicant_role === "Patient" ? answers.applicant_name : answers.patient_name], [t("Contact preference", "Contacto preferido"), display(answers.contact_method)], [t("Phone", "Teléfono"), answers.phone], [t("Email", "Correo electrónico"), answers.email], [t("County / ZIP", "Condado / código postal"), `${answers.county} / ${answers.zip}`], [t("Additional notes", "Notas adicionales"), answers.notes]])}<label className="assistance-checkbox assistance-final-consent"><input type="checkbox" required checked={answers.contact_consent} onChange={(event) => update("contact_consent", event.target.checked)} /><span>{t("I confirm that this information is accurate to the best of my knowledge, that I am the patient or authorized to make this inquiry, and that NHCAF may contact me about it. I understand that assistance depends on eligibility and available resources.", "Confirmo que esta información es correcta según mi leal saber y entender, que soy el paciente o tengo autorización para hacer esta consulta, y que NHCAF puede contactarme al respecto. Entiendo que la ayuda depende de los requisitos y de los recursos disponibles.")}</span></label></div>}
                <div ref={errorPanel} tabIndex={-1} role="alert">{error && <p className="assistance-error">{error} <Link href="/#contact" target="_blank" rel="noopener noreferrer">{t("Contact NHCAF", "Contactar a NHCAF")} ↗</Link></p>}</div>
                <div className="assistance-step-actions"><button type="button" className="assistance-secondary" disabled={step === 0 || sending} onClick={() => go(step - 1)}>{t("Previous", "Anterior")}</button>{step < 6 && <button type="submit" className="assistance-secondary assistance-next-button">{t("Next", "Siguiente")}</button>}</div>
                <div className="assistance-final-actions"><button type="button" className="assistance-cancel" onClick={cancel}>{t("Cancel", "Cancelar")}</button><button type="submit" className="assistance-button" disabled={step !== 6 || !answers.contact_consent || sending}>{sending ? t("Submitting…", "Enviando…") : t("Submit inquiry", "Enviar consulta")}</button></div>
                <p className="assistance-field-help assistance-submission-help" role="status">{sending ? t("Keep this page open while we confirm receipt.", "Mantenga esta página abierta mientras confirmamos la recepción.") : t("Cancel clears this unsent inquiry. Your answers are sent only when you select Submit inquiry on Final Review.", "Cancelar borra esta consulta sin enviar. Sus respuestas solo se envían al seleccionar Enviar consulta en Revisión final.")}</p>
              </fieldset>
            </form>
          </div>
        </div>}
      </section>
    </main><footer className="assistance-footer assistance-container">North Houston Cancer Assistance Foundation · Spring, Texas</footer>
  </div>;
}

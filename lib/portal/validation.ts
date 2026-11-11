export const PROGRAMS = ["Food assistance", "Treatment-related transportation", "Temporary lodging"];
export const DOCUMENT_KINDS = ["Proof of residence", "Care-team confirmation", "Household financial information", "Other supporting document"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export class PortalError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new PortalError("Please check the form fields and try again.");
  return value.trim();
}
export function applicationInput(input: Record<string, unknown>) {
  if (!Array.isArray(input.needs) || input.needs.some((item) => typeof item !== "string" || !PROGRAMS.includes(item)) || new Set(input.needs).size !== input.needs.length) throw new PortalError("Choose valid assistance programs.");
  const submit = input.submit === true;
  const needs = input.needs as string[];
  const name = text(input.name, 100, submit);
  const email = text(input.email, 254, submit);
  const county = text(input.county, 100, submit);
  const applicant_role = text(input.applicant_role, 30, true);
  const contact_preference = text(input.contact_preference, 30, true);
  if (!["Patient", "Caregiver", "Care-team member"].includes(applicant_role) || !["Email", "Portal message"].includes(contact_preference)) throw new PortalError("Choose valid contact and applicant options.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new PortalError("Enter a valid email address.");
  if (submit && (!needs.length || input.consent !== true)) throw new PortalError("Choose support and confirm your request before submitting.");
  return { needs, name, email, county, applicant_role, contact_preference, status: submit ? "submitted" : "draft", submission_consent: submit };
}
export function documentType(bytes: Uint8Array) {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) return { mime: "application/pdf", extension: "pdf" };
  if ([137,80,78,71,13,10,26,10].every((byte, i) => bytes[i] === byte)) return { mime: "image/png", extension: "png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", extension: "jpg" };
  throw new PortalError("Choose a PDF, PNG, or JPEG file. The file contents must match its format.");
}
export function validId(id: string) { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new PortalError("Invalid document reference."); return id; }

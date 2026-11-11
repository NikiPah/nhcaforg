export const assistanceOptions = ["Food assistance", "Treatment-related transportation", "Temporary lodging", "I need help understanding my options"];
export const applicantRoles = ["Patient", "Family member or caregiver", "Care-team member or social worker"];
export const diagnosisOptions = ["Yes", "Not yet confirmed", "I’m not sure"];
export const proofOptions = ["I can provide this", "I need help obtaining this", "I’m not sure what to provide"];

export type Inquiry = {
  applicant_name: string; patient_name: string; applicant_role: string;
  email: string; phone: string; contact_method: string; county: string; zip: string;
  diagnosis_status: string; household_size: number; income_amount: number | null;
  income_frequency: string; income_unsure: boolean; needs: string[];
  income_proof: string; diagnosis_proof: string; notes: string; contact_consent: boolean;
};
export class InquiryError extends Error {}
function field(input: Record<string, unknown>, key: string, max: number, required = true) {
  const value = input[key];
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new InquiryError("Please check the required fields and try again.");
  return value.trim();
}
function option(value: string, options: string[]) { if (!options.includes(value)) throw new InquiryError("Please select one of the available options."); return value; }

export function validateInquiry(input: Record<string, unknown>): Inquiry {
  const applicant_name = field(input, "applicant_name", 100);
  const patient_name = field(input, "patient_name", 100);
  const applicant_role = option(field(input, "applicant_role", 60), applicantRoles);
  const contact_method = option(field(input, "contact_method", 20), ["Phone", "Email"]);
  const email = field(input, "email", 254, contact_method === "Email");
  const phone = field(input, "phone", 30, contact_method === "Phone");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InquiryError("Enter a valid email address.");
  if (phone && (!/^[+()\d .-]+$/.test(phone) || phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 15)) throw new InquiryError("Enter a phone number with 10–15 digits.");
  const county = field(input, "county", 100);
  const zip = field(input, "zip", 5);
  if (!/^\d{5}$/.test(zip)) throw new InquiryError("Enter a five-digit ZIP code.");
  const diagnosis_status = option(field(input, "diagnosis_status", 30), diagnosisOptions);
  const household_size = input.household_size;
  if (typeof household_size !== "number" || !Number.isInteger(household_size) || household_size < 1 || household_size > 100) throw new InquiryError("Enter the number of people in your household, including yourself.");
  if (typeof input.income_unsure !== "boolean") throw new InquiryError("Please check your household income answer.");
  const income_unsure = input.income_unsure;
  const income_frequency = option(field(input, "income_frequency", 20), ["Monthly", "Yearly"]);
  const income_amount = income_unsure ? null : input.income_amount;
  if (!income_unsure && (typeof income_amount !== "number" || !Number.isFinite(income_amount) || income_amount < 0 || income_amount > 999999999 || Math.abs(income_amount * 100 - Math.round(income_amount * 100)) > .00001)) throw new InquiryError("Enter household income before taxes, or select that you need help estimating it. Enter 0 if there is no income.");
  if (!Array.isArray(input.needs) || !input.needs.length || input.needs.length > assistanceOptions.length || input.needs.some((need) => typeof need !== "string" || !assistanceOptions.includes(need)) || new Set(input.needs).size !== input.needs.length) throw new InquiryError("Select the assistance you need, or choose help understanding your options.");
  const income_proof = option(field(input, "income_proof", 50), proofOptions);
  const diagnosis_proof = option(field(input, "diagnosis_proof", 50), proofOptions);
  const notes = field(input, "notes", 1500, false);
  if (input.contact_consent !== true) throw new InquiryError("Confirm that NHCAF may contact you about this inquiry.");
  return { applicant_name, patient_name, applicant_role, contact_method, email, phone, county, zip, diagnosis_status, household_size, income_amount: income_amount as number | null, income_frequency, income_unsure, needs: input.needs as string[], income_proof, diagnosis_proof, notes, contact_consent: true };
}

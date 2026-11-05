import { z } from "zod";

export const supportOptions = [
  { value: "food", label: "Food assistance" },
  { value: "transportation", label: "Treatment-related transportation" },
  { value: "lodging", label: "Temporary lodging" },
] as const;

export const draftSchema = z.object({
  contact_name: z.string().trim().max(100),
  phone: z.string().trim().max(30).regex(/^[0-9+() .-]*$/, "Use a phone number with digits and standard punctuation."),
  city: z.string().trim().max(100),
  support_types: z.array(z.enum(["food", "transportation", "lodging"])).max(3),
  request_summary: z.string().trim().max(2000),
});

export const submissionSchema = draftSchema.extend({
  contact_name: z.string().trim().min(1, "Enter a fictional contact name.").max(100),
  city: z.string().trim().min(1, "Enter a fictional city.").max(100),
  support_types: z.array(z.enum(["food", "transportation", "lodging"])).min(1, "Select a support area.").max(3),
});

export const idSchema = z.uuid();
export const versionSchema = z.coerce.number().int().min(1).max(2147483647);
export const credentialsSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) });
export type Draft = z.infer<typeof draftSchema>;
export type Application = Draft & {
  id: string;
  status: "draft" | "submitted";
  version: number;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
};

export function readDraft(form: FormData) {
  return draftSchema.safeParse({
    contact_name: form.get("contact_name"),
    phone: form.get("phone"),
    city: form.get("city"),
    support_types: form.getAll("support_types"),
    request_summary: form.get("request_summary"),
  });
}

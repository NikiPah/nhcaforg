import { test } from "node:test";
import assert from "node:assert/strict";
import { draftSchema, submissionSchema, idSchema, versionSchema } from "../../lib/patient/schema";
import { patientConfig } from "../../lib/patient/config";

test("draft validation permits partial work but submission requires development fields", () => {
  const empty = { contact_name: "", phone: "", city: "", support_types: [], request_summary: "" };
  assert.equal(draftSchema.safeParse(empty).success, true);
  assert.equal(submissionSchema.safeParse(empty).success, false);
  assert.equal(submissionSchema.safeParse({ ...empty, contact_name: "Test Patient", city: "Test City", support_types: ["food"] }).success, true);
});

test("schema rejects oversized values, unknown support areas, and malformed identifiers", () => {
  assert.equal(idSchema.safeParse("another-patient").success, false);
  assert.equal(versionSchema.safeParse("0").success, false);
  assert.equal(versionSchema.safeParse("2.5").success, false);
  const sample = { contact_name: "Test Patient", phone: "202-555-0100", city: "Test City", support_types: ["food"], request_summary: "" };
  assert.equal(draftSchema.safeParse({ ...sample, request_summary: "x".repeat(2001) }).success, false);
  assert.equal(draftSchema.safeParse({ ...sample, support_types: ["unapproved"] }).success, false);
});

test("portal configuration stays disabled by default and rejects insecure remote origins", () => {
  const names = ["PATIENT_PORTAL_MODE", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "PATIENT_PORTAL_SITE_URL"];
  const old = names.map(name => process.env[name]);
  try {
    names.forEach(name => delete process.env[name]);
    assert.equal(patientConfig(), null);
    Object.assign(process.env, { PATIENT_PORTAL_MODE: "development", SUPABASE_URL: "http://127.0.0.1:54321", SUPABASE_PUBLISHABLE_KEY: "fictional-config-test", PATIENT_PORTAL_SITE_URL: "http://127.0.0.1:3100" });
    assert.ok(patientConfig());
    process.env.SUPABASE_URL = "http://unsafe.example.com";
    assert.equal(patientConfig(), null);
    process.env.SUPABASE_URL = "https://development.example.com";
    process.env.PATIENT_PORTAL_SITE_URL = "http://unsafe.example.com";
    assert.equal(patientConfig(), null);
    process.env.PATIENT_PORTAL_SITE_URL = "https://portal.example.com";
    process.env.PATIENT_PORTAL_MODE = "production";
    assert.equal(patientConfig(), null);
  } finally {
    names.forEach((name, i) => { if (old[i] === undefined) delete process.env[name]; else process.env[name] = old[i]; });
  }
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { validateInquiry } from "../lib/assistance/inquiry.ts";

const db = new PGlite();
let checks = 0;
const sample = { applicant_name: "Alex Example", patient_name: "Alex Example", applicant_role: "Patient", email: "", phone: "555-010-2345", contact_method: "Phone", county: "Harris", zip: "77373", diagnosis_status: "Yes", household_size: 2, income_amount: 2000, income_frequency: "Monthly", income_unsure: false, needs: ["Food assistance"], income_proof: "I need help obtaining this", diagnosis_proof: "I can provide this", notes: "", contact_consent: true };
async function submit(details = sample, id = randomUUID()) { return (await db.query("select public.nhcaf_submit_assistance_inquiry($1,$2::jsonb) as reference", [id, JSON.stringify(details)])).rows[0].reference; }
async function rejected(sql, parameters = []) { await assert.rejects(db.query(sql, parameters)); checks++; }
try {
  await db.exec("create role anon; create role authenticated; grant usage on schema public to anon,authenticated;");
  await db.exec(await readFile(new URL("../supabase/migrations/202611110001_assistance_inquiries.sql", import.meta.url), "utf8")); checks++;
  await db.exec("set role anon");
  const id = randomUUID();
  const reference = await submit(sample, id);
  assert.equal(reference, `NHCAF-${id.replaceAll("-", "").toUpperCase()}`); checks++;
  assert.equal(await submit(sample, id), reference); checks++;
  await assert.rejects(submit({ ...sample, patient_name: "Changed" }, id)); checks++;
  await rejected("select * from public.nhcaf_assistance_inquiries");
  await rejected("insert into public.nhcaf_assistance_inquiries(id) values ($1)", [randomUUID()]);
  await rejected("update public.nhcaf_assistance_inquiries set status='decision_recorded'");
  await rejected("delete from public.nhcaf_assistance_inquiries");
  for (const invalid of [
    { ...sample, status: "decision_recorded" }, { ...sample, contact_consent: false }, { ...sample, applicant_name: "" },
    { ...sample, needs: ["Unapproved program"] }, { ...sample, income_amount: -1 }, { ...sample, household_size: 0 },
    { ...sample, diagnosis_status: "arbitrary" }, { ...sample, zip: "ABCDE" }, { ...sample, phone: "bad" },
    { ...sample, contact_method: "Email", email: "" }, { ...sample, income_unsure: true, income_amount: 1 },
  ]) { await assert.rejects(submit(invalid)); checks++; }
  const unsure = { ...sample, phone: "555-010-2346", income_unsure: true, income_amount: null, diagnosis_status: "I’m not sure", diagnosis_proof: "I need help obtaining this" };
  assert.match(await submit(unsure), /^NHCAF-/); checks++;
  assert.match(await submit({ ...sample, phone: "555-010-2347", income_amount: 0 }), /^NHCAF-/); checks++;
  for (let i = 0; i < 4; i++) await submit(sample);
  await assert.rejects(submit(sample), (error) => error.code === "P0001"); checks++;
  assert.equal(await submit(sample, id), reference); checks++;
  await db.exec("reset role");
  assert.equal((await db.query("select count(*)::integer as n from public.nhcaf_assistance_inquiries where phone=$1", [sample.phone])).rows[0].n, 5); checks++;
  await db.exec("set role authenticated");
  await rejected("select * from public.nhcaf_assistance_inquiries");
  await rejected("update public.nhcaf_assistance_inquiries set status='under_review'");
  assert.match(await submit({ ...sample, phone: "555-010-2348", applicant_role: "Family member or caregiver", patient_name: "Taylor Example" }), /^NHCAF-/); checks++;
  assert.equal(validateInquiry(sample).phone, sample.phone); checks++;
  for (const invalid of [{ ...sample, income_amount: "2000" }, { ...sample, income_amount: null }, { ...sample, income_amount: Infinity }, { ...sample, household_size: 1.2 }, { ...sample, needs: [] }, { ...sample, contact_consent: false }]) { assert.throws(() => validateInquiry(invalid)); checks++; }
  console.log(`PASS: ${checks} inquiry validation, private storage, restricted submission, idempotency, and contact-limit checks (local Postgres).`);
} catch (error) { console.error(error.message); process.exitCode = 1; } finally { await db.close(); }

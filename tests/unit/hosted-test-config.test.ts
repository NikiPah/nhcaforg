import { test } from "node:test";
import assert from "node:assert/strict";
import { hostedTestConfig } from "../../lib/patient/hosted-test-config";

const fixture = {
  PATIENT_PORTAL_MODE: "development",
  SUPABASE_URL: "https://fictional-development.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fictional_test",
  PATIENT_TEST_TARGET_URL: "https://fictional-development.supabase.co",
  PATIENT_TEST_EMAIL_A: "fictional-patient-a@example.test",
  PATIENT_TEST_PASSWORD_A: "fictional-password-a",
  PATIENT_TEST_EMAIL_B: "fictional-patient-b@example.test",
  PATIENT_TEST_PASSWORD_B: "fictional-password-b",
};

test("hosted test runner requires an explicit matching HTTPS development target", () => {
  assert.equal(hostedTestConfig(fixture).ok, true);
  for (const change of [
    { PATIENT_PORTAL_MODE: "production" },
    { PATIENT_TEST_TARGET_URL: "https://different-project.supabase.co" },
    { SUPABASE_URL: "http://fictional-development.supabase.co" },
    { PATIENT_TEST_TARGET_URL: "https://fictional-development.supabase.co/other" },
    { PATIENT_TEST_TARGET_URL: "https://user:pass@fictional-development.supabase.co" },
  ]) assert.equal(hostedTestConfig({ ...fixture, ...change }).ok, false);
});

test("hosted isolation tests require two different accounts and no privileged key", () => {
  for (const change of [
    { PATIENT_TEST_EMAIL_B: fixture.PATIENT_TEST_EMAIL_A.toUpperCase() },
    { PATIENT_TEST_EMAIL_A: "invalid-email" },
    { PATIENT_TEST_PASSWORD_B: "short" },
    { SUPABASE_PUBLISHABLE_KEY: "sb_secret_fictional_test" },
  ]) assert.equal(hostedTestConfig({ ...fixture, ...change }).ok, false);
});

test("missing hosted configuration stops without exposing supplied credentials", () => {
  const result = hostedTestConfig({ ...fixture, PATIENT_TEST_EMAIL_B: undefined });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.message.includes("PATIENT_TEST_EMAIL_B"));
    for (const value of [fixture.PATIENT_TEST_PASSWORD_A, fixture.PATIENT_TEST_PASSWORD_B, fixture.SUPABASE_PUBLISHABLE_KEY]) assert.equal(result.message.includes(value), false);
  }
});

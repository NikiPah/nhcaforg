import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

// This runs the actual migration in embedded PostgreSQL. Only Supabase's auth
// schema/verified JWT subject are simulated; it is not a hosted-auth E2E test.
const db = new PGlite();
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const draft = { contact_name: "Fictional Patient", phone: "202-555-0100", city: "Test City", support_types: ["food"], request_summary: "Fictional test request" };

before(async () => {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    insert into auth.users(id) values('${alice}'),('${bob}');
  `);
  await db.exec(readFileSync(new URL("../../supabase/migrations/202611050001_patient_portal.sql", import.meta.url), "utf8"));
});
beforeEach(async () => {
  await db.exec("reset role; truncate public.patient_profiles cascade;");
  await login(alice);
});
after(async () => { await db.close(); });

async function login(subject: string) {
  await db.exec("reset role; set role authenticated;");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [subject]);
}
async function create() {
  const result = await db.query<{ id: string }>("select public.create_patient_application() as id");
  return result.rows[0].id;
}
async function save(id: string, version = 1, submit = false, confirm = false, data = draft) {
  return db.query("select public.save_patient_application($1,$2,$3::jsonb,$4,$5)", [id, version, JSON.stringify(data), submit, confirm]);
}

test("anonymous visitors cannot read applications or invoke write functions", async () => {
  await create();
  await db.exec("reset role; set role anon;");
  await assert.rejects(db.query("select * from public.patient_applications"), /permission denied/);
  await assert.rejects(db.query("select public.create_patient_application()"), /permission denied/);
  await assert.rejects(db.query("select public.save_patient_application(null,1,'{}',false,false)"), /permission denied/);
});

test("patients only see their own applications, profiles, and events", async () => {
  const id = await create();
  await login(bob);
  for (const table of ["patient_applications", "patient_profiles", "patient_application_events"]) {
    const result = await db.query(`select * from public.${table}`);
    assert.equal(result.rows.length, 0);
  }
  await create();
  const own = await db.query<{ id: string }>("select id from public.patient_applications");
  assert.equal(own.rows.length, 1);
  assert.notEqual(own.rows[0].id, id);
});

test("another patient's application cannot be edited even with its exact ID", async () => {
  const id = await create();
  await login(bob);
  await assert.rejects(save(id), /Application unavailable/);
  await login(alice);
  const result = await db.query<{ version: number; contact_name: string }>("select version,contact_name from public.patient_applications");
  assert.equal(result.rows[0].version, 1);
  assert.equal(result.rows[0].contact_name, "");
});

test("direct writes cannot bypass ownership, state, or event controls", async () => {
  const id = await create();
  for (const query of [
    "insert into public.patient_profiles(id) values('" + bob + "')",
    "insert into public.patient_applications(patient_id) values('" + alice + "')",
    "update public.patient_applications set status='submitted' where id='" + id + "'",
    "delete from public.patient_applications",
    "delete from public.patient_application_events",
    "update public.patient_application_events set action='test_submitted'",
  ]) await assert.rejects(db.query(query), /permission denied/);
});

test("incomplete drafts save, increment their version, and record a minimal event", async () => {
  const id = await create();
  await save(id, 1, false, false, { ...draft, contact_name: "", city: "", support_types: [] });
  const result = await db.query<{ version: number; status: string }>("select version,status from public.patient_applications");
  assert.deepEqual(result.rows[0], { version: 2, status: "draft" });
  const events = await db.query<{ action: string }>("select action from public.patient_application_events order by id");
  assert.deepEqual(events.rows.map(e => e.action), ["created", "draft_saved"]);
});

test("stale versions cannot overwrite a newer draft", async () => {
  const id = await create();
  await save(id);
  await assert.rejects(save(id), /Draft has changed/);
  await assert.rejects(db.query("select public.save_patient_application($1,null,$2::jsonb,false,false)", [id, JSON.stringify(draft)]), /Draft has changed/);
  const events = await db.query("select * from public.patient_application_events");
  assert.equal(events.rows.length, 2);
});

test("test submission requires complete development fields and explicit confirmation", async () => {
  const id = await create();
  await assert.rejects(save(id, 1, true, false), /confirmation required/);
  await assert.rejects(save(id, 1, true, true, { ...draft, contact_name: "" }), /confirmation required/);
  await assert.rejects(save(id, 1, true, true, { ...draft, support_types: [] }), /confirmation required/);
  const result = await db.query<{ status: string; version: number }>("select status,version from public.patient_applications");
  assert.deepEqual(result.rows[0], { status: "draft", version: 1 });
});

test("submitted test records are read-only and cannot be submitted twice", async () => {
  const id = await create();
  await save(id, 1, true, true);
  const result = await db.query<{ status: string; test_consent_version: string; submitted_at: Date }>("select status,test_consent_version,submitted_at from public.patient_applications");
  assert.equal(result.rows[0].status, "submitted");
  assert.equal(result.rows[0].test_consent_version, "fictional-test-v1");
  assert.ok(result.rows[0].submitted_at);
  await assert.rejects(save(id, 2), /Draft has changed/);
  await assert.rejects(save(id, 2, true, true), /Draft has changed/);
});

test("database rejects out-of-policy lengths, fields, and support types", async () => {
  const id = await create();
  await assert.rejects(save(id, 1, false, false, { ...draft, contact_name: "x".repeat(101) }), /check constraint/);
  await assert.rejects(save(id, 1, false, false, { ...draft, phone: "not a phone" }), /check constraint/);
  await assert.rejects(save(id, 1, false, false, { ...draft, support_types: ["unapproved"] }), /Invalid support areas/);
  await assert.rejects(save(id, 1, false, false, { ...draft, request_summary: "x".repeat(2001) }), /check constraint/);
});

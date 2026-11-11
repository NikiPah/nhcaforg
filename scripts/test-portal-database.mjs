import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { applicationInput, documentType, PortalError } from "../lib/portal/validation.ts";

const db = new PGlite();
let checks = 0;
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const fileId = "33333333-3333-4333-8333-333333333333";
async function rejected(sql, params = []) { await assert.rejects(db.query(sql, params)); checks++; }
async function patient(id) { await db.exec("reset role; set role authenticated;"); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]); }
try {
  // Minimal Supabase system schemas; actual Postgres executes the real migration and policies.
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth,storage to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant select,insert,delete on storage.objects to authenticated;
    insert into auth.users values ('${alice}'),('${bob}');`);
  await db.exec(await readFile(new URL("../supabase/migrations/202611100001_patient_portal.sql", import.meta.url), "utf8")); checks++;
  await db.exec("set role anon");
  await rejected("select * from public.nhcaf_applications");
  await patient(alice);
  const app = (await db.query("insert into public.nhcaf_applications(user_id) values ($1) returning id", [alice])).rows[0].id; checks++;
  await rejected("insert into public.nhcaf_applications(user_id) values ($1)", [bob]);
  await patient(bob);
  assert.equal((await db.query("select * from public.nhcaf_applications where id=$1", [app])).rows.length, 0); checks++;
  assert.equal((await db.query("update public.nhcaf_applications set name='Stolen' where id=$1 returning id", [app])).rows.length, 0); checks++;
  await rejected("insert into public.nhcaf_messages(application_id,subject,body) values ($1,'Other patient','Forbidden')", [app]);
  const path = `${alice}/${app}/${fileId}.pdf`;
  await rejected("insert into storage.objects(bucket_id,name) values ('nhcaf-patient-documents',$1)", [path]);
  await patient(alice);
  await rejected("update public.nhcaf_applications set status='approved' where id=$1", [app]);
  await rejected("update public.nhcaf_applications set status='submitted' where id=$1", [app]);
  await rejected("update public.nhcaf_applications set user_id=$1 where id=$2", [bob, app]);
  await db.query("insert into public.nhcaf_messages(application_id,subject,body) values ($1,'My application','Please explain the checklist')", [app]); checks++;
  await rejected("insert into public.nhcaf_messages(application_id,subject,body,sender_role) values ($1,'Impersonation','Forbidden','team')", [app]);
  await db.query("insert into storage.objects(bucket_id,name) values ('nhcaf-patient-documents',$1)", [path]); checks++;
  await db.query("insert into public.nhcaf_documents(id,application_id,kind,filename,storage_path,mime_type,size) values ($1,$2,'Proof of residence','example.pdf',$3,'application/pdf',20)", [fileId,app,path]); checks++;
  for (const table of ["public.nhcaf_documents", "public.nhcaf_messages", "storage.objects"]) { assert.equal((await db.query(`select * from ${table}`)).rows.length, 1); checks++; }
  await rejected("insert into public.nhcaf_documents(application_id,kind,filename,storage_path,mime_type,size) values ($1,'Proof of residence','forged.pdf',$2,'application/pdf',20)", [app,`${bob}/${app}/${fileId}.pdf`]);
  await patient(bob);
  for (const table of ["nhcaf_documents","nhcaf_messages"]) { assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0); checks++; }
  assert.equal((await db.query("select * from storage.objects")).rows.length, 0); checks++;
  assert.equal((await db.query("delete from public.nhcaf_documents returning id")).rows.length, 0); checks++;
  assert.equal((await db.query("delete from storage.objects returning id")).rows.length, 0); checks++;
  await patient(alice);
  const submitted = await db.query("update public.nhcaf_applications set needs=array['Food assistance'],name='Alex Example',email='alex@example.com',county='Harris',submission_consent=true,status='submitted' where id=$1 returning submitted_at", [app]);
  assert.ok(submitted.rows[0].submitted_at); checks++;
  assert.equal((await db.query("update public.nhcaf_applications set name='Changed' where id=$1 returning id", [app])).rows.length, 0); checks++;
  assert.equal((await db.query("delete from storage.objects returning id")).rows.length, 1); checks++;
  assert.equal((await db.query("delete from public.nhcaf_documents returning id")).rows.length, 1); checks++;
  await db.exec("reset role");
  assert.equal((await db.query("select public from storage.buckets where id='nhcaf-patient-documents'")).rows[0].public, false); checks++;
  assert.throws(() => applicationInput({ needs: ["Unapproved program"] }), PortalError); checks++;
  assert.throws(() => documentType(new TextEncoder().encode("<html>not a PDF</html>")), PortalError); checks++;
  assert.equal(documentType(new TextEncoder().encode("%PDF-1.7")).mime, "application/pdf"); checks++;
  console.log(`PASS: ${checks} migration, account-isolation, storage, submission, impersonation, and validation checks (local Postgres).`);
} catch (error) { console.error(error.message); process.exitCode = 1; } finally { await db.close(); }

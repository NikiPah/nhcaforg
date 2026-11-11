-- New inquiry-first flow. Apply once; independent of the older account-based portal migration.
-- Existing patient tables and documents are preserved.
begin;
create table public.nhcaf_assistance_inquiries (
  id uuid primary key,
  reference text generated always as ('NHCAF-' || upper(replace(id::text,'-',''))) stored,
  status text not null default 'received' check (status in ('received','contact_needed','documents_requested','under_review','decision_recorded')),
  applicant_name text not null check (length(btrim(applicant_name)) between 1 and 100),
  patient_name text not null check (length(btrim(patient_name)) between 1 and 100),
  applicant_role text not null check (applicant_role in ('Patient','Family member or caregiver','Care-team member or social worker')),
  email text not null check (length(email) <= 254 and (email = '' or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  phone text not null check (length(phone) <= 30 and (phone = '' or (phone ~ '^[+()0-9 .-]+$' and length(regexp_replace(phone,'[^0-9]','','g')) between 10 and 15))),
  contact_method text not null check (contact_method in ('Phone','Email')),
  county text not null check (length(btrim(county)) between 1 and 100),
  zip text not null check (zip ~ '^[0-9]{5}$'),
  diagnosis_status text not null check (diagnosis_status in ('Yes','Not yet confirmed','I’m not sure')),
  household_size integer not null check (household_size between 1 and 100),
  income_amount numeric(12,2),
  income_frequency text not null check (income_frequency in ('Monthly','Yearly')),
  income_unsure boolean not null,
  needs text[] not null check (cardinality(needs) between 1 and 4 and needs <@ array['Food assistance','Treatment-related transportation','Temporary lodging','I need help understanding my options']::text[]),
  income_proof text not null check (income_proof in ('I can provide this','I need help obtaining this','I’m not sure what to provide')),
  diagnosis_proof text not null check (diagnosis_proof in ('I can provide this','I need help obtaining this','I’m not sure what to provide')),
  notes text not null check (length(notes) <= 1500),
  contact_consent boolean not null check (contact_consent),
  request_fingerprint text not null,
  contact_key text not null,
  created_at timestamptz not null default now(),
  check ((contact_method = 'Email' and email <> '') or (contact_method = 'Phone' and phone <> '')),
  check ((income_unsure and income_amount is null) or (not income_unsure and income_amount is not null and income_amount between 0 and 999999999))
);
create index nhcaf_inquiry_contact_window on public.nhcaf_assistance_inquiries(contact_key, created_at);
alter table public.nhcaf_assistance_inquiries enable row level security;
revoke all on public.nhcaf_assistance_inquiries from anon, authenticated;

create function public.nhcaf_submit_assistance_inquiry(p_id uuid, p_details jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare
  incoming public.nhcaf_assistance_inquiries;
  existing public.nhcaf_assistance_inquiries;
  fingerprint text;
  contact text;
  receipt text;
begin
  if p_id is null or jsonb_typeof(p_details) is distinct from 'object' or length(p_details::text) > 12000 then
    raise exception using errcode = '22023', message = 'Invalid inquiry';
  end if;
  -- Only these input fields are accepted. Caller-supplied status, timestamps, and references are rejected.
  if (p_details - array['applicant_name','patient_name','applicant_role','email','phone','contact_method','county','zip','diagnosis_status','household_size','income_amount','income_frequency','income_unsure','needs','income_proof','diagnosis_proof','notes','contact_consent']::text[]) <> '{}'::jsonb then
    raise exception using errcode = '22023', message = 'Invalid fields';
  end if;
  select * into incoming from jsonb_populate_record(null::public.nhcaf_assistance_inquiries, p_details);
  fingerprint := md5(p_details::text);
  contact := md5(case when incoming.contact_method = 'Email' then lower(incoming.email) else regexp_replace(incoming.phone,'[^0-9]','','g') end);
  if contact is null then raise exception using errcode = '22023', message = 'Missing contact'; end if;
  -- Serialize submissions for the same contact, including retries after a lost response.
  perform pg_advisory_xact_lock(hashtext(contact)::bigint);
  select * into existing from public.nhcaf_assistance_inquiries where id = p_id;
  if found then
    if existing.request_fingerprint <> fingerprint then raise exception using errcode = '22023', message = 'Inquiry reference already used'; end if;
    return existing.reference;
  end if;
  if (select count(*) from public.nhcaf_assistance_inquiries where contact_key = contact and created_at > now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'Submission limit reached';
  end if;
  insert into public.nhcaf_assistance_inquiries(id,applicant_name,patient_name,applicant_role,email,phone,contact_method,county,zip,diagnosis_status,household_size,income_amount,income_frequency,income_unsure,needs,income_proof,diagnosis_proof,notes,contact_consent,request_fingerprint,contact_key)
  values (p_id,incoming.applicant_name,incoming.patient_name,incoming.applicant_role,incoming.email,incoming.phone,incoming.contact_method,incoming.county,incoming.zip,incoming.diagnosis_status,incoming.household_size,incoming.income_amount,incoming.income_frequency,incoming.income_unsure,incoming.needs,incoming.income_proof,incoming.diagnosis_proof,incoming.notes,incoming.contact_consent,fingerprint,contact)
  returning reference into receipt;
  return receipt;
end;
$$;
revoke all on function public.nhcaf_submit_assistance_inquiry(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.nhcaf_submit_assistance_inquiry(uuid,jsonb) to anon, authenticated;
commit;

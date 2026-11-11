-- Apply once to project weugtgpfxvobaejqbcbv using Supabase SQL Editor or migrations.
-- Additive, namespaced tables. Does not modify existing application tables or auth users.
begin;

create table public.nhcaf_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  needs text[] not null default '{}' check (needs <@ array['Food assistance','Treatment-related transportation','Temporary lodging']::text[]),
  name text not null default '' check (length(name) <= 100),
  email text not null default '' check (length(email) <= 254),
  county text not null default '' check (length(county) <= 100),
  applicant_role text not null default 'Patient' check (applicant_role in ('Patient','Caregiver','Care-team member')),
  contact_preference text not null default 'Email' check (contact_preference in ('Email','Portal message')),
  status text not null default 'draft' check (status in ('draft','submitted','under_review','needs_information','approved','declined')),
  submission_consent boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or (submission_consent and cardinality(needs) > 0 and length(btrim(name)) > 0 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and length(btrim(county)) > 0))
);

create function public.nhcaf_application_timestamps() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'submitted' and old.status = 'draft' then new.submitted_at := now(); end if;
  return new;
end;
$$;
create trigger nhcaf_application_timestamps before update on public.nhcaf_applications for each row execute function public.nhcaf_application_timestamps();

create table public.nhcaf_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.nhcaf_applications(id) on delete cascade,
  kind text not null check (kind in ('Proof of residence','Care-team confirmation','Household financial information','Other supporting document')),
  filename text not null check (length(filename) between 1 and 150),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('application/pdf','image/png','image/jpeg')),
  size integer not null check (size > 0 and size <= 5242880),
  created_at timestamptz not null default now()
);
create index nhcaf_documents_application on public.nhcaf_documents(application_id);

create table public.nhcaf_messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.nhcaf_applications(id) on delete cascade,
  subject text not null check (length(btrim(subject)) between 1 and 120),
  body text not null check (length(btrim(body)) between 1 and 2000),
  sender_role text not null default 'patient' check (sender_role in ('patient','team')),
  created_at timestamptz not null default now()
);
create index nhcaf_messages_application on public.nhcaf_messages(application_id, created_at);

alter table public.nhcaf_applications enable row level security;
alter table public.nhcaf_documents enable row level security;
alter table public.nhcaf_messages enable row level security;
revoke all on public.nhcaf_applications, public.nhcaf_documents, public.nhcaf_messages from anon, authenticated;
grant select on public.nhcaf_applications, public.nhcaf_documents, public.nhcaf_messages to authenticated;
grant insert(user_id, needs, name, email, county, applicant_role, contact_preference, status, submission_consent) on public.nhcaf_applications to authenticated;
grant update(needs, name, email, county, applicant_role, contact_preference, status, submission_consent) on public.nhcaf_applications to authenticated;
grant insert(id, application_id, kind, filename, storage_path, mime_type, size), delete on public.nhcaf_documents to authenticated;
grant insert(application_id, subject, body) on public.nhcaf_messages to authenticated;

create policy nhcaf_application_read on public.nhcaf_applications for select to authenticated using (user_id = (select auth.uid()));
create policy nhcaf_application_create on public.nhcaf_applications for insert to authenticated with check (user_id = (select auth.uid()) and status = 'draft' and not submission_consent);
create policy nhcaf_application_edit on public.nhcaf_applications for update to authenticated using (user_id = (select auth.uid()) and status = 'draft') with check (user_id = (select auth.uid()) and status in ('draft','submitted'));

create policy nhcaf_document_read on public.nhcaf_documents for select to authenticated using (exists (select 1 from public.nhcaf_applications a where a.id = application_id and a.user_id = (select auth.uid())));
create policy nhcaf_document_delete on public.nhcaf_documents for delete to authenticated using (exists (select 1 from public.nhcaf_applications a where a.id = application_id and a.user_id = (select auth.uid())));
create policy nhcaf_document_create on public.nhcaf_documents for insert to authenticated with check (
  exists (select 1 from public.nhcaf_applications a where a.id = application_id and a.user_id = (select auth.uid()))
  and storage_path = (select auth.uid())::text || '/' || application_id::text || '/' || id::text || case mime_type when 'application/pdf' then '.pdf' when 'image/png' then '.png' else '.jpg' end
  and exists (select 1 from storage.objects o where o.bucket_id = 'nhcaf-patient-documents' and o.name = storage_path)
);

create policy nhcaf_message_read on public.nhcaf_messages for select to authenticated using (exists (select 1 from public.nhcaf_applications a where a.id = application_id and a.user_id = (select auth.uid())));
create policy nhcaf_message_create on public.nhcaf_messages for insert to authenticated with check (sender_role = 'patient' and exists (select 1 from public.nhcaf_applications a where a.id = application_id and a.user_id = (select auth.uid())));

-- A dedicated private bucket. No public URLs or service-role credential in the app.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('nhcaf-patient-documents','nhcaf-patient-documents',false,5242880,array['application/pdf','image/png','image/jpeg']);

create policy nhcaf_file_read on storage.objects for select to authenticated using (
  bucket_id = 'nhcaf-patient-documents' and split_part(objects.name,'/',1) = (select auth.uid())::text
  and exists (select 1 from public.nhcaf_applications a where a.id::text = split_part(objects.name,'/',2) and a.user_id = (select auth.uid()))
);
create policy nhcaf_file_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'nhcaf-patient-documents' and split_part(objects.name,'/',1) = (select auth.uid())::text
  and objects.name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|png|jpg)$'
  and exists (select 1 from public.nhcaf_applications a where a.id::text = split_part(objects.name,'/',2) and a.user_id = (select auth.uid()))
);
create policy nhcaf_file_delete on storage.objects for delete to authenticated using (
  bucket_id = 'nhcaf-patient-documents' and split_part(objects.name,'/',1) = (select auth.uid())::text
  and exists (select 1 from public.nhcaf_applications a where a.id::text = split_part(objects.name,'/',2) and a.user_id = (select auth.uid()))
);
commit;

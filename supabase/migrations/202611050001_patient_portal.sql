-- Development application workflow only. No production intake or document storage.
create table public.patient_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.patient_applications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  version integer not null default 1 check (version > 0),
  contact_name text not null default '' check (char_length(contact_name) <= 100),
  phone text not null default '' check (char_length(phone) <= 30 and phone ~ '^[0-9+() .-]*$'),
  city text not null default '' check (char_length(city) <= 100),
  support_types text[] not null default '{}' check (support_types <@ array['food','transportation','lodging']::text[] and cardinality(support_types) <= 3),
  request_summary text not null default '' check (char_length(request_summary) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  test_consent_version text,
  check ((status = 'draft' and submitted_at is null and test_consent_version is null)
    or (status = 'submitted' and submitted_at is not null and test_consent_version = 'fictional-test-v1'))
);
create index patient_applications_owner on public.patient_applications(patient_id, created_at desc);

create table public.patient_application_events (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.patient_applications(id) on delete cascade,
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  action text not null check (action in ('created','draft_saved','test_submitted')),
  occurred_at timestamptz not null default now()
);

alter table public.patient_profiles enable row level security;
alter table public.patient_applications enable row level security;
alter table public.patient_application_events enable row level security;

create policy patient_profile_read on public.patient_profiles for select to authenticated using (id = (select auth.uid()));
create policy patient_application_read on public.patient_applications for select to authenticated using (patient_id = (select auth.uid()));
create policy patient_event_read on public.patient_application_events for select to authenticated using (patient_id = (select auth.uid()));

-- All writes go through narrowly scoped functions; even direct API requests
-- cannot assign another owner, edit a submitted record, or invent a status.
revoke all on public.patient_profiles, public.patient_applications, public.patient_application_events from anon, authenticated;
grant select on public.patient_profiles, public.patient_applications, public.patient_application_events to authenticated;

create function public.create_patient_application() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  patient uuid := auth.uid();
  application uuid;
begin
  if patient is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  insert into public.patient_profiles(id) values(patient) on conflict(id) do nothing;
  insert into public.patient_applications(patient_id) values(patient) returning id into application;
  insert into public.patient_application_events(application_id, patient_id, action) values(application, patient, 'created');
  return application;
end;
$$;

create function public.save_patient_application(
  application_id uuid, expected_version integer, draft jsonb,
  submit_test boolean default false, confirmed_test_data boolean default false
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  patient uuid := auth.uid();
  current_app public.patient_applications;
  areas text[];
begin
  if patient is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into current_app from public.patient_applications
    where id = application_id and patient_id = patient for update;
  if not found then raise exception 'Application unavailable' using errcode = '42501'; end if;
  if expected_version is null or expected_version < 1 or current_app.status <> 'draft' or current_app.version <> expected_version then
    raise exception 'Draft has changed' using errcode = '40001';
  end if;
  if jsonb_typeof(draft) <> 'object' or draft is null then raise exception 'Invalid draft'; end if;
  if jsonb_typeof(draft->'support_types') <> 'array' then raise exception 'Invalid support areas'; end if;
  if exists(select 1 from jsonb_array_elements(draft->'support_types') v where jsonb_typeof(v) <> 'string') then raise exception 'Invalid support area'; end if;
  areas := array(select jsonb_array_elements_text(draft->'support_types'));
  if not areas <@ array['food','transportation','lodging']::text[] or cardinality(areas) > 3 then raise exception 'Invalid support areas'; end if;
  if jsonb_typeof(draft->'contact_name') <> 'string' or jsonb_typeof(draft->'phone') <> 'string'
    or jsonb_typeof(draft->'city') <> 'string' or jsonb_typeof(draft->'request_summary') <> 'string'
    then raise exception 'Invalid field types'; end if;
  if submit_test and (not confirmed_test_data or confirmed_test_data is null or
    coalesce(length(trim(draft->>'contact_name')),0) = 0 or coalesce(length(trim(draft->>'city')),0) = 0 or cardinality(areas) = 0)
    then raise exception 'Complete test fields and confirmation required'; end if;
  if submit_test is null then raise exception 'Invalid submission intent'; end if;

  update public.patient_applications set
    contact_name = trim(draft->>'contact_name'), phone = trim(draft->>'phone'),
    city = trim(draft->>'city'), support_types = areas, request_summary = trim(draft->>'request_summary'),
    version = version + 1, updated_at = now(),
    status = case when submit_test then 'submitted' else 'draft' end,
    submitted_at = case when submit_test then now() else null end,
    test_consent_version = case when submit_test then 'fictional-test-v1' else null end
    where id = application_id and patient_id = patient;
  insert into public.patient_application_events(application_id, patient_id, action)
    values(application_id, patient, case when submit_test then 'test_submitted' else 'draft_saved' end);
end;
$$;

revoke all on function public.create_patient_application() from public, anon;
revoke all on function public.save_patient_application(uuid,integer,jsonb,boolean,boolean) from public, anon;
grant execute on function public.create_patient_application() to authenticated;
grant execute on function public.save_patient_application(uuid,integer,jsonb,boolean,boolean) to authenticated;

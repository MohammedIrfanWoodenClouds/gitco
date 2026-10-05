create table if not exists public.report_versions (
  id uuid primary key default gen_random_uuid(),
  report_code text not null,
  file_name text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by text not null,
  status text not null check (status in ('active','archived','pending')),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists report_versions_code_status_idx on public.report_versions(report_code,status,uploaded_at desc);

insert into storage.buckets (id,name,public)
values ('report-files','report-files',false)
on conflict (id) do nothing;

-- The service-role key is used by the Next.js server for storage/database writes.
-- No public client policy is required for the application upload flow.

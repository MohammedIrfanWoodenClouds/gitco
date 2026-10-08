-- Table: report_versions
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

-- Enable Row Level Security
alter table public.report_versions enable row level security;

-- Index for querying report versions by code and status
create index if not exists report_versions_code_status_idx on public.report_versions(report_code, status, uploaded_at desc);

-- Storage bucket for excel report uploads
insert into storage.buckets (id, name, public)
values ('report-files', 'report-files', false)
on conflict (id) do nothing;

-- Service role bypasses RLS automatically when using SUPABASE_SERVICE_ROLE_KEY.


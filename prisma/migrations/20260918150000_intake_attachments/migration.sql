create table public.intake_attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);

create index intake_attachments_entity_idx on public.intake_attachments(entity_type, entity_id);
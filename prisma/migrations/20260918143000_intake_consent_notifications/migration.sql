alter table public.mandates
  add column contact_name text,
  add column contact_email text,
  add column contact_phone text,
  add column source text not null default 'public_form',
  add column consent_version text not null default '2026-09-18-v1',
  add column consent_accepted_at timestamptz not null default now();

alter table public.buyer_requests
  add column contact_phone text,
  add column source text not null default 'public_form',
  add column consent_version text not null default '2026-09-18-v1',
  add column consent_accepted_at timestamptz not null default now();

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  subject text not null,
  body text not null,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index admin_notifications_read_idx on public.admin_notifications(read_at, created_at desc);
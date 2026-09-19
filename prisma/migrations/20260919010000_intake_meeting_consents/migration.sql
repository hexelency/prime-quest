alter table public.mandates
  add column contact_consent boolean not null default false,
  add column meeting_consent boolean not null default false,
  add column preferred_call_windows jsonb not null default '[]'::jsonb,
  add column timezone text;

alter table public.buyer_requests
  add column contact_consent boolean not null default false,
  add column meeting_consent boolean not null default false,
  add column preferred_call_windows jsonb not null default '[]'::jsonb,
  add column timezone text;
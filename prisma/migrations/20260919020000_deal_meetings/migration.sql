create table public.deal_meetings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.buyer_request_mandate_matches(id) on delete cascade,
  scheduled_at timestamptz not null,
  timezone text not null default 'Africa/Lagos',
  duration_minutes integer not null default 30,
  invite_token text not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index deal_meetings_scheduled_status_idx on public.deal_meetings(scheduled_at, status);
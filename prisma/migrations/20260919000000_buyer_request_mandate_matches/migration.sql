create table public.buyer_request_mandate_matches (
  id uuid primary key default gen_random_uuid(),
  buyer_request_id uuid not null references public.buyer_requests(id) on delete cascade,
  seller_mandate_id uuid not null references public.mandates(id) on delete cascade,
  score integer not null,
  reasons jsonb not null default '[]'::jsonb,
  status text not null default 'potential',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (buyer_request_id, seller_mandate_id)
);

create index buyer_request_mandate_matches_status_score_idx
  on public.buyer_request_mandate_matches(status, score);

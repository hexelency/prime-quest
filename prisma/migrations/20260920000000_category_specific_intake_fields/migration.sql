alter table public.mandates
  add column imo_number text,
  add column verification_details text;

alter table public.buyer_requests
  add column imo_number text,
  add column verification_details text,
  add column requirements jsonb not null default '{}'::jsonb;

alter table public.asset_listings
  add column imo_number text,
  add column verification_details text;
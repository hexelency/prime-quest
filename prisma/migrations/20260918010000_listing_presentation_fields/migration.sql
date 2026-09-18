alter table public.asset_listings
  add column image_url text,
  add column tags jsonb not null default '[]'::jsonb,
  add column published_at timestamptz;
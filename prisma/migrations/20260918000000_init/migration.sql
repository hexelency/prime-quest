create extension if not exists pgcrypto;

create type public.counterparty_kind as enum ('buyer', 'seller', 'trader', 'broker', 'mandate');
create type public.verification_status as enum ('potential', 'confirmed', 'under_review', 'verified', 'rejected');
create type public.mandate_direction as enum ('buy', 'sell');
create type public.mandate_status as enum ('new', 'under_review', 'active', 'matched', 'closed', 'expired');
create type public.lead_status as enum ('discovered', 'researched', 'contacted', 'interested', 'registered', 'rejected');
create type public.asset_category as enum ('vessel', 'property', 'land', 'track_farm', 'energy');
create type public.asset_listing_status as enum ('discovered', 'under_review', 'approved', 'published', 'withdrawn');

create table public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null, country text, website text,
  created_at timestamptz not null default now()
);
create table public.counterparties (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete set null,
  name text not null, kind public.counterparty_kind not null, country text,
  verification_status public.verification_status not null default 'potential', notes text,
  created_at timestamptz not null default now()
);
create table public.mandates (
  id uuid primary key default gen_random_uuid(), counterparty_id uuid references public.counterparties(id) on delete set null,
  direction public.mandate_direction not null, asset_type text not null, product text not null, quantity numeric,
  quantity_unit text, delivery_location text, terms text, budget text,
  status public.mandate_status not null default 'new', verification_status public.verification_status not null default 'under_review',
  requirements jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), company_name text not null, kind public.counterparty_kind not null,
  country text, website text, source_url text, source_summary text, confidence_score numeric check (confidence_score >= 0 and confidence_score <= 100),
  status public.lead_status not null default 'discovered', verification_status public.verification_status not null default 'potential',
  risk_flags jsonb not null default '[]'::jsonb, last_researched_at timestamptz, created_at timestamptz not null default now()
);
create table public.asset_listings (
  id uuid primary key default gen_random_uuid(), reference text not null unique, title text not null,
  category public.asset_category not null, asset_type text not null, location text, summary text, source_url text,
  source_platform text, source_summary text, discovered_by text not null default 'ai_agent', confidence_score numeric check (confidence_score >= 0 and confidence_score <= 100),
  status public.asset_listing_status not null default 'discovered', verification_status public.verification_status not null default 'potential',
  risk_flags jsonb not null default '[]'::jsonb, last_researched_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.buyer_requests (
  id uuid primary key default gen_random_uuid(), request_text text not null, category public.asset_category, asset_type text,
  location text, budget text, contact_name text, contact_email text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'matched', 'closed')), created_at timestamptz not null default now()
);
create table public.matches (
  id uuid primary key default gen_random_uuid(), buyer_mandate_id uuid not null references public.mandates(id) on delete cascade,
  seller_mandate_id uuid not null references public.mandates(id) on delete cascade, score numeric check (score >= 0 and score <= 100),
  reasons jsonb not null default '[]'::jsonb, status text not null default 'potential', reviewed_at timestamptz,
  created_at timestamptz not null default now(), unique (buyer_mandate_id, seller_mandate_id)
);
create table public.ai_threads (
  id uuid primary key default gen_random_uuid(), title text not null default 'Trade intelligence session',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.ai_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')), content text not null, created_at timestamptz not null default now()
);

create index mandates_status_idx on public.mandates(status, verification_status);
create index leads_status_idx on public.leads(status, verification_status);
create index asset_listings_status_idx on public.asset_listings(status, verification_status);
create index asset_listings_category_idx on public.asset_listings(category);
create index buyer_requests_status_idx on public.buyer_requests(status, created_at desc);
create index matches_score_idx on public.matches(score desc);
create index ai_messages_thread_idx on public.ai_messages(thread_id, created_at);

alter table public.organizations enable row level security;
alter table public.counterparties enable row level security;
alter table public.mandates enable row level security;
alter table public.leads enable row level security;
alter table public.asset_listings enable row level security;
alter table public.buyer_requests enable row level security;
alter table public.matches enable row level security;
alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;

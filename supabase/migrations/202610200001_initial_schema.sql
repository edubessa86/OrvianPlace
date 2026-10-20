-- OrvianPlace initial schema
-- Apply only after creating the Supabase project. No credentials belong in this file.
-- Create the first Auth user in Supabase, then manually insert that user's UUID into
-- public.profiles with role='admin' using the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Administrador',
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_orvian_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  contact_name text,
  contact_email text,
  contact_phone text,
  state text,
  city text,
  shipping_notes text,
  dropshipping_available boolean not null default false,
  catalog_format text not null default 'manual'
    check (catalog_format in ('manual', 'csv', 'xlsx', 'xml', 'pdf')),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_sku text,
  name text not null,
  description text,
  category text not null default 'Outros',
  brand text,
  image_url text,
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  suggested_price numeric(12,2) not null default 0 check (suggested_price >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  availability_status text not null default 'unknown'
    check (availability_status in ('available', 'unavailable', 'unknown')),
  source_import text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_supplier_sku_unique
  on public.products (supplier_id, supplier_sku)
  where supplier_sku is not null and supplier_id is not null;

create index if not exists products_name_search_idx
  on public.products using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(category, '')));

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  size text,
  color text,
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_imports (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  file_name text not null,
  file_type text not null check (file_type in ('csv', 'xlsx', 'xml', 'pdf')),
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'completed', 'completed_with_errors', 'failed')),
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  skipped_rows integer not null default 0,
  error_report jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.marketplace_rules (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('mercado_livre', 'shopee', 'amazon')),
  commission_percent numeric(7,4) not null default 0 check (commission_percent between 0 and 100),
  fixed_fee numeric(12,2) not null default 0 check (fixed_fee >= 0),
  tax_percent numeric(7,4) not null default 0 check (tax_percent between 0 and 100),
  shipping_cost numeric(12,2) not null default 0 check (shipping_cost >= 0),
  target_margin_percent numeric(7,4) not null default 25 check (target_margin_percent between 0 and 100),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(channel)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media enable row level security;
alter table public.catalog_imports enable row level security;
alter table public.marketplace_rules enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins manage suppliers" on public.suppliers;
create policy "Admins manage suppliers" on public.suppliers
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins manage product variants" on public.product_variants;
create policy "Admins manage product variants" on public.product_variants
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins manage product media" on public.product_media;
create policy "Admins manage product media" on public.product_media
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins manage catalog imports" on public.catalog_imports;
create policy "Admins manage catalog imports" on public.catalog_imports
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins manage marketplace rules" on public.marketplace_rules;
create policy "Admins manage marketplace rules" on public.marketplace_rules
for all to authenticated using (public.is_orvian_admin()) with check (public.is_orvian_admin());

drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs" on public.audit_logs
for select to authenticated using (public.is_orvian_admin());

drop policy if exists "Admins write audit logs" on public.audit_logs;
create policy "Admins write audit logs" on public.audit_logs
for insert to authenticated with check (public.is_orvian_admin());

insert into public.marketplace_rules (channel, commission_percent, fixed_fee, tax_percent, shipping_cost, target_margin_percent)
values
  ('mercado_livre', 0, 0, 0, 0, 25),
  ('shopee', 0, 0, 0, 0, 25),
  ('amazon', 0, 0, 0, 0, 25)
on conflict (channel) do nothing;

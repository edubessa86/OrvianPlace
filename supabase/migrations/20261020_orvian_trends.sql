-- Orvian Trends: conteúdo editorial e fila de aprovação.
-- Execute no SQL Editor do projeto Supabase antes de ativar a automação.
create table if not exists public.editorial_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Estilo',
  source_urls jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  instagram_caption text,
  facebook_caption text,
  status text not null default 'draft' check (status in ('draft','approved','published','rejected')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists editorial_posts_status_created_idx
  on public.editorial_posts (status, created_at desc);
create index if not exists editorial_posts_published_idx
  on public.editorial_posts (published_at desc) where status = 'published';
alter table public.editorial_posts enable row level security;
-- Conteúdo público: somente artigos publicados podem ser lidos anonimamente.
drop policy if exists "Public can read published editorial posts" on public.editorial_posts;
create policy "Public can read published editorial posts"
  on public.editorial_posts for select to anon, authenticated
  using (status = 'published');
-- Escrita de automação deve usar SUPABASE_SERVICE_ROLE_KEY exclusivamente no servidor.

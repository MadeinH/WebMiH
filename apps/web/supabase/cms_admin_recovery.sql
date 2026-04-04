-- ============================================
-- Made in Heaven — Recovery SQL (CMS + Admin)
-- Compatible con esquema SQL plano + fallback de compatibilidad
-- Idempotente: seguro para ejecutar varias veces
-- ============================================

-- 1) CMS site content (asegura columnas usadas por código actual)
create table if not exists public.cms_site_content (
  id                         text primary key,
  hero_description           text,
  catalog_intro              text,
  accessories_intro          text,
  out_of_catalog_title       text,
  out_of_catalog_description text,
  featured_product_slugs     text[] default '{}',
  updated_at                 timestamptz not null default now()
);

alter table public.cms_site_content add column if not exists hero_description text;
alter table public.cms_site_content add column if not exists catalog_intro text;
alter table public.cms_site_content add column if not exists accessories_intro text;
alter table public.cms_site_content add column if not exists out_of_catalog_title text;
alter table public.cms_site_content add column if not exists out_of_catalog_description text;
alter table public.cms_site_content add column if not exists featured_product_slugs text[] default '{}';
alter table public.cms_site_content add column if not exists updated_at timestamptz not null default now();

-- Soporte legado (si existe esquema JSON de recuperación previa)
alter table public.cms_site_content add column if not exists content jsonb;

insert into public.cms_site_content (
  id,
  hero_description,
  catalog_intro,
  accessories_intro,
  out_of_catalog_title,
  out_of_catalog_description,
  featured_product_slugs
)
values (
  'site',
  'Personaliza camisetas, hoodies, gorras y mas para tu marca, evento o estilo personal. DTF, sublimacion, bordado y mas tecnicas a tu disposicion.',
  'Todas nuestras prendas son personalizables con diferentes tecnicas segun la cantidad y el tipo de diseno.',
  'Cuadros, posters, gorras, termos y mas accesorios personalizables para diferentes estilos y necesidades.',
  'Buscas algo diferente?',
  'Tambien manejamos ropa para bebe, mascotas, articulos especiales y mas. Si no lo ves en el catalogo, escribenos y tratamos de conseguirlo.',
  array['camiseta', 'hoodie-un-color', 'camiseta-oversize', 'rompevientos']
)
on conflict (id) do nothing;

-- Si existe fila legacy site-content, migrar a site cuando site este vacio
insert into public.cms_site_content (
  id,
  hero_description,
  catalog_intro,
  accessories_intro,
  out_of_catalog_title,
  out_of_catalog_description,
  featured_product_slugs,
  updated_at
)
select
  'site',
  coalesce(s.hero_description, (s.content ->> 'heroDescription')),
  coalesce(s.catalog_intro, (s.content ->> 'catalogoIntro')),
  coalesce(s.accessories_intro, (s.content ->> 'accesoriosIntro')),
  coalesce(s.out_of_catalog_title, (s.content ->> 'outOfCatalogTitle')),
  coalesce(s.out_of_catalog_description, (s.content ->> 'outOfCatalogDescription')),
  coalesce(
    s.featured_product_slugs,
    array(
      select jsonb_array_elements_text(
        coalesce(s.content -> 'featuredProductSlugs', '[]'::jsonb)
      )
    )
  ),
  coalesce(s.updated_at, now())
from public.cms_site_content s
where s.id = 'site-content'
  and not exists (select 1 from public.cms_site_content x where x.id = 'site');

-- 2) Audit logs (schema compatible)
create table if not exists public.cms_audit_logs (
  id              uuid default gen_random_uuid() primary key,
  action          text not null,
  username        text,
  ip              text,
  user_agent      text,
  payload_summary jsonb,
  created_at      timestamptz not null default now()
);

alter table public.cms_audit_logs add column if not exists payload_summary jsonb;
alter table public.cms_audit_logs add column if not exists username text;
alter table public.cms_audit_logs add column if not exists ip text;
alter table public.cms_audit_logs add column if not exists user_agent text;

create index if not exists cms_audit_logs_created_at_idx
  on public.cms_audit_logs (created_at desc);

-- 3) Login attempts
create table if not exists public.admin_login_attempts (
  ip             text primary key,
  failed_count   integer not null default 0,
  blocked_until  timestamptz,
  last_failed_at timestamptz,
  updated_at     timestamptz not null default now()
);

create index if not exists admin_login_attempts_blocked_until_idx
  on public.admin_login_attempts (blocked_until);

-- 4) Compatibilidad de productos/precios para CMS
alter table public.productos add column if not exists image_url text;
alter table public.productos add column if not exists media_urls text[] default '{}';
alter table public.productos add column if not exists sort_order integer default 0;

-- Compatibilidad legacy (si alguna ejecución previa creó imagen_url)
alter table public.productos add column if not exists imagen_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'precios_producto_id_unique'
      AND conrelid = 'public.precios'::regclass
  ) THEN
    ALTER TABLE public.precios
      ADD CONSTRAINT precios_producto_id_unique UNIQUE (producto_id);
  END IF;
END $$;

-- 5) Bucket multimedia esperado por panel
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-media',
  'catalog-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 6) RLS (si no estaba habilitado)
alter table public.cms_site_content enable row level security;
alter table public.cms_audit_logs enable row level security;
alter table public.admin_login_attempts enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cms_site_content'
      AND policyname = 'Lectura publica cms'
  ) THEN
    CREATE POLICY "Lectura publica cms"
      ON public.cms_site_content
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cms_audit_logs'
      AND policyname = 'Sin lectura publica audit logs'
  ) THEN
    CREATE POLICY "Sin lectura publica audit logs"
      ON public.cms_audit_logs
      FOR SELECT
      USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_login_attempts'
      AND policyname = 'Sin lectura publica admin login attempts'
  ) THEN
    CREATE POLICY "Sin lectura publica admin login attempts"
      ON public.admin_login_attempts
      FOR SELECT
      USING (false);
  END IF;
END $$;

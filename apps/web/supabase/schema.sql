-- ============================================
-- Made in Heaven — Esquema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Productos
create table public.productos (
  id           uuid default gen_random_uuid() primary key,
  slug         text unique not null,
  nombre       text not null,
  descripcion  text,
  categoria    text not null,           -- 'prendas' | 'accesorios'
  subcategoria text,
  material     text,
  horma        text,                    -- 'hombre' | 'mujer' | 'nino' | 'unisex' | null
  solo_cotizar boolean default false,
  activo       boolean default true,
  created_at   timestamptz default now()
);

-- Cantidad mínima por producto (opcional)
alter table public.productos add column if not exists min_order_quantity integer;

-- Precios por cantidad (solo productos con solo_cotizar=false)
create table public.precios (
  id             uuid default gen_random_uuid() primary key,
  producto_id    uuid references productos(id) on delete cascade,
  detal_carta    integer,
  detal_estandar integer,
  mayoreo_3      integer,
  mayoreo_6      integer,
  mayoreo_12     integer,
  updated_at     timestamptz default now()
);

-- Solicitudes de cotización
create table public.cotizaciones (
  id          uuid default gen_random_uuid() primary key,
  nombre      text not null,
  email       text not null,
  whatsapp    text not null,
  comentarios text,
  items       jsonb not null,
  estado      text default 'pendiente',  -- 'pendiente' | 'procesada' | 'respondida'
  created_at  timestamptz default now()
);

-- ============================================
-- Row Level Security 
-- ============================================

alter table public.productos    enable row level security;
alter table public.precios      enable row level security;
alter table public.cotizaciones enable row level security;

-- Productos: lectura pública de productos activos
create policy "Lectura pública productos"
  on public.productos for select using (activo = true);

-- Precios: lectura pública
create policy "Lectura pública precios"
  on public.precios for select using (true);

-- Cotizaciones: solo service role puede insertar (desde API route)
create policy "Solo service role inserta cotizaciones"
  on public.cotizaciones for insert with check (false);

-- ============================================
-- Datos iniciales — Prendas
-- ============================================

insert into public.productos (slug, nombre, descripcion, categoria, subcategoria, material, horma, solo_cotizar) values
  ('camiseta', 'Camiseta', 'Camiseta clásica personalizable. Piel de durazno o algodón 100%.', 'prendas', 'camisetas', 'Piel de durazno / Algodón 100%', 'hombre', false),
  ('camiseta-ranglan', 'Camiseta Ranglan', 'Camiseta ranglan con mangas contrastantes.', 'prendas', 'camisetas', 'Poliéster tacto algodón', 'hombre', false),
  ('camiseta-premium', 'Camiseta Calidad Premium', 'Camiseta premium en algodón peruano o tela burda.', 'prendas', 'camisetas', 'Algodón peruano / Tela burda', 'unisex', false),
  ('camibuzo', 'Camibuzo', 'Camibuzo personalizable en piel de durazno o algodón.', 'prendas', 'camisetas', 'Piel de durazno / Algodón 100%', 'hombre', false),
  ('camiseta-polo', 'Camiseta Polo', 'Camiseta tipo polo en poliéster o algodón Lacoste.', 'prendas', 'camisetas', 'Poliéster / Algodón Lacoste', 'hombre', false),
  ('ranglan-manga-34', 'Ranglan Manga 3/4 / Camibuzo Ranglan', 'Ranglan manga 3/4 o camibuzo ranglan personalizable.', 'prendas', 'camisetas', 'Poliéster tacto algodón', 'hombre', false),
  ('camiseta-acid-wash', 'Camiseta Acid Wash', 'Camiseta acid wash con acabado vintage.', 'prendas', 'camisetas', 'Poli-algodón', 'unisex', false),
  ('camiseta-oversize', 'Camiseta Oversize', 'Camiseta oversize de corte relajado.', 'prendas', 'camisetas', 'Algodón 100% / Piel de durazno', 'unisex', false),
  ('camiseta-oversize-premium', 'Camiseta Oversize Premium', 'Oversize premium en múltiples materiales.', 'prendas', 'camisetas', 'Tela fría / Algodón 100% / Burda / Galleta', 'unisex', false),
  ('hoodie-un-color', 'Hoodie (Un Color)', 'Hoodie en algodón perchado de un solo color.', 'prendas', 'hoodies', 'Algodón perchado', 'unisex', false),
  ('chaqueta-un-color', 'Chaqueta (Un Color)', 'Chaqueta en algodón perchado de un solo color.', 'prendas', 'chaquetas', 'Algodón perchado', 'unisex', false),
  ('rompevientos', 'Rompevientos', 'Rompevientos en nylon premium.', 'prendas', 'chaquetas', 'Nylon premium', 'unisex', false),
  ('rompevientos-semireflectivo', 'Rompevientos Semireflectivo', 'Rompevientos con material semireflectivo.', 'prendas', 'chaquetas', 'Nylon premium', 'unisex', false),
  ('sueter-un-color', 'Suéter (Un Color)', 'Suéter en algodón perchado de un solo color.', 'prendas', 'hoodies', 'Algodón perchado', 'unisex', false),
  ('sueter-premium', 'Suéter Calidad Premium', 'Suéter premium en algodón 100%.', 'prendas', 'hoodies', 'Algodón 100%', 'unisex', false),
  ('hoodie-multicolor', 'Hoodie / Chaqueta / Suéter (2–3 Colores)', 'Hoodie, chaqueta o suéter multicolor.', 'prendas', 'hoodies', 'Perchado mónaco / Poliéster', 'unisex', false),
  ('hoodie-oversize', 'Hoodie Oversize', 'Hoodie oversize de corte amplio.', 'prendas', 'hoodies', 'Perchado mónaco / Poliéster', 'unisex', false),
  ('hoodie-premium', 'Hoodie Calidad Premium', 'Hoodie premium en algodón peruano perchado.', 'prendas', 'hoodies', 'Algodón peruano perchado', 'unisex', false),
  ('camiseta-deportiva', 'Camiseta / Esqueleto Deportivo', 'Camiseta o esqueleto deportivo de alto rendimiento.', 'prendas', 'deportiva', 'Poliéster deportivo premium', 'hombre', false),
  ('buzo-compresivo', 'Buzo Compresivo Deportivo', 'Buzo compresivo para entrenamiento.', 'prendas', 'deportiva', 'Poliéster deportivo premium', 'hombre', false),
  ('camisa-compresiva', 'Camisa Compresiva Deportiva', 'Camisa compresiva deportiva — disponible por mayoreo.', 'prendas', 'deportiva', 'Poliéster deportivo premium', 'hombre', false);

-- Establecer cantidad mínima para la camisa compresiva
update public.productos set min_order_quantity = 6 where slug = 'camisa-compresiva';

-- Precios por producto (solo los que no son solo_cotizar)
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 34500, 41500, 22500, 21000, 18500 from public.productos where slug = 'camiseta';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 36500, 41500, 27500, 24700, 22500 from public.productos where slug = 'camiseta-ranglan';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 67500, 74500, 45500, 41500, 37500 from public.productos where slug = 'camiseta-premium';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 45500, 52500, 37500, 33500, 30500 from public.productos where slug = 'camibuzo';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 42500, 49500, 30500, 28500, 24500 from public.productos where slug = 'camiseta-polo';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 42000, 47000, 35500, 32500, 30500 from public.productos where slug = 'ranglan-manga-34';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 52500, 59500, 35500, 32500, 30500 from public.productos where slug = 'camiseta-acid-wash';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 55500, 62500, 35500, 32500, 30500 from public.productos where slug = 'camiseta-oversize';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 75500, 82500, 52500, 48500, 45500 from public.productos where slug = 'camiseta-oversize-premium';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 76500, 83500, 65500, 62500, 58500 from public.productos where slug = 'hoodie-un-color';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 76500, 83500, 65500, 62500, 58500 from public.productos where slug = 'chaqueta-un-color';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 62500, 69500, 40000, 36500, 33500 from public.productos where slug = 'rompevientos';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 77000, 84000, 61500, 55500, 52000 from public.productos where slug = 'rompevientos-semireflectivo';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 70000, 77000, 38500, 34500, 31500 from public.productos where slug = 'sueter-un-color';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 80500, 87500, 58500, 54500, 51500 from public.productos where slug = 'sueter-premium';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 80000, 87000, 67500, 65500, 61500 from public.productos where slug = 'hoodie-multicolor';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 90000, 97000, 72800, 70800, 67500 from public.productos where slug = 'hoodie-oversize';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 92000, 99000, 82500, 80500, 76500 from public.productos where slug = 'hoodie-premium';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 52000, 59000, 47800, 38500, 35500 from public.productos where slug = 'camiseta-deportiva';
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, 56000, 63000, 55500, 46500, 43500 from public.productos where slug = 'buzo-compresivo';

-- Camisa compresiva: disponible desde 6 unidades (mayoreo6 y mayoreo12)
insert into public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
select id, null, null, null, 37500, 35500 from public.productos where slug = 'camisa-compresiva';

-- ============================================
-- Datos iniciales — Accesorios
-- ============================================

insert into public.productos (slug, nombre, descripcion, categoria, subcategoria, material, horma, solo_cotizar) values
  ('cuadro-mdf', 'Cuadro', 'Cuadro personalizado en MDF.', 'accesorios', 'decoracion', 'MDF', null, false),
  ('poster', 'Póster', 'Póster personalizado en papel o aluminio.', 'accesorios', 'decoracion', 'Papel / Aluminio', null, false),
  ('termos', 'Termos y Carimañolas', 'Termos y carimañolas personalizados.', 'accesorios', 'bebidas', 'Vidrio / Acero inox / Aluminio', null, false),
  ('gorras', 'Gorras', 'Gorras personalizadas.', 'accesorios', 'gorras', 'Algodón / Poliéster', null, false),
  ('medias', 'Medias', 'Medias personalizadas con diseño completo.', 'accesorios', 'medias', 'Poliéster tacto algodón', null, false),
  ('cojin', 'Cojín', 'Cojín personalizado.', 'accesorios', 'decoracion', null, null, false),
  ('mousepad', 'Mousepad', 'Mousepad personalizado en neopreno.', 'accesorios', 'tech', 'Neopreno', null, false),
  ('peluches', 'Peluches', 'Peluches personalizados — solo por cotización.', 'accesorios', 'otros', null, null, true),
  ('bufanda', 'Bufanda', 'Bufanda personalizada — solo por cotización.', 'accesorios', 'otros', null, null, true);

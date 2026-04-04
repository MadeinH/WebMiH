-- Schema SQL para Made in Heaven e-commerce
-- Idempotente: puede ejecutarse múltiples veces sin errores
-- Autor: GitHub Copilot
-- Fecha: 2025

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Productos (catálogo)
CREATE TABLE IF NOT EXISTS public.productos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  categoria    TEXT NOT NULL DEFAULT 'prendas',
  subcategoria TEXT,
  material     TEXT,
  horma        TEXT CHECK (horma IN ('hombre', 'mujer', 'nino', 'unisex', NULL)),
  solo_cotizar BOOLEAN DEFAULT FALSE,
  activo       BOOLEAN DEFAULT TRUE,
  imagen_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Precios (tabla por categoría o producto base)
CREATE TABLE IF NOT EXISTS public.precios (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id    UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  detal_carta    INTEGER,
  detal_estandar INTEGER,
  mayoreo_3      INTEGER,
  mayoreo_6      INTEGER,
  mayoreo_12     INTEGER,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id)
);

-- Pedidos (pagos completados vía Wompi)
CREATE TABLE IF NOT EXISTS public.pedidos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wompi_reference TEXT UNIQUE,
  wompi_id        TEXT UNIQUE,
  estado          TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'error')),
  total_cop       INTEGER NOT NULL,
  nombre_cliente  TEXT NOT NULL,
  email_cliente   TEXT NOT NULL,
  whatsapp        TEXT,
  items           JSONB NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Cotizaciones (productos sin precio fijo → enviados por WhatsApp)
CREATE TABLE IF NOT EXISTS public.cotizaciones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  whatsapp    TEXT NOT NULL,
  comentarios TEXT,
  items       JSONB NOT NULL,
  estado      TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesada', 'respondida')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoría de eventos (security logging)
CREATE TABLE IF NOT EXISTS public.auditlog (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento       TEXT NOT NULL,
  tabla        TEXT,
  registro_id  UUID,
  usuario_ip   TEXT,
  detalles     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_productos_slug ON public.productos(slug);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria, subcategoria);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON public.pedidos(email_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_wompi_ref ON public.pedidos(wompi_reference);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_whatsapp ON public.cotizaciones(whatsapp);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON public.cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_auditlog_created ON public.auditlog(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditlog_evento ON public.auditlog(evento);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.productos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditlog     ENABLE ROW LEVEL SECURITY;

-- Política: productos activos son públicos (lectura)
DROP POLICY IF EXISTS "Productos activos publicos" ON public.productos;
CREATE POLICY "Productos activos publicos"
  ON public.productos FOR SELECT
  USING (activo = TRUE);

-- Política: precios son públicos (lectura)
DROP POLICY IF EXISTS "Precios publicos" ON public.precios;
CREATE POLICY "Precios publicos"
  ON public.precios FOR SELECT
  USING (TRUE);

-- Política: clientes pueden insertar pedidos
DROP POLICY IF EXISTS "Clientes insertan pedidos" ON public.pedidos;
CREATE POLICY "Clientes insertan pedidos"
  ON public.pedidos FOR INSERT
  WITH CHECK (TRUE);

-- Política: solo service role puede leer pedidos
DROP POLICY IF EXISTS "Service role lee pedidos" ON public.pedidos;
CREATE POLICY "Service role lee pedidos"
  ON public.pedidos FOR SELECT
  USING (current_user = 'postgres'); -- Reemplazar con role específico si aplica

-- Política: clientes pueden insertar cotizaciones
DROP POLICY IF EXISTS "Clientes insertan cotizaciones" ON public.cotizaciones;
CREATE POLICY "Clientes insertan cotizaciones"
  ON public.cotizaciones FOR INSERT
  WITH CHECK (TRUE);

-- Política: solo service role puede leer cotizaciones
DROP POLICY IF EXISTS "Service role lee cotizaciones" ON public.cotizaciones;
CREATE POLICY "Service role lee cotizaciones"
  ON public.cotizaciones FOR SELECT
  USING (current_user = 'postgres');

-- Política: solo service role puede escribir auditlog
DROP POLICY IF EXISTS "Service role escribe auditlog" ON public.auditlog;
CREATE POLICY "Service role escribe auditlog"
  ON public.auditlog FOR INSERT
  WITH CHECK (current_user = 'postgres');

DROP POLICY IF EXISTS "Service role lee auditlog" ON public.auditlog;
CREATE POLICY "Service role lee auditlog"
  ON public.auditlog FOR SELECT
  USING (current_user = 'postgres');

-- ============================================================================
-- FUNCIONES HELPER
-- ============================================================================

-- Función: registrar cambios en auditlog (trigger)
CREATE OR REPLACE FUNCTION public.fn_auditlog_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.auditlog (evento, tabla, registro_id, detalles)
  VALUES (
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Triggers de auditlog en pedidos y cotizaciones
DROP TRIGGER IF EXISTS trg_pedidos_audit ON public.pedidos;
CREATE TRIGGER trg_pedidos_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auditlog_insert();

DROP TRIGGER IF EXISTS trg_cotizaciones_audit ON public.cotizaciones;
CREATE TRIGGER trg_cotizaciones_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auditlog_insert();

-- Función: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

-- Triggers de updated_at
DROP TRIGGER IF EXISTS trg_productos_timestamp ON public.productos;
CREATE TRIGGER trg_productos_timestamp
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_pedidos_timestamp ON public.pedidos;
CREATE TRIGGER trg_pedidos_timestamp
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_cotizaciones_timestamp ON public.cotizaciones;
CREATE TRIGGER trg_cotizaciones_timestamp
  BEFORE UPDATE ON public.cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_precios_timestamp ON public.precios;
CREATE TRIGGER trg_precios_timestamp
  BEFORE UPDATE ON public.precios
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

-- ============================================================================
-- DATOS SAMPLE (opcional — comentar en producción)
-- ============================================================================

-- INSERT INTO public.productos (slug, nombre, descripcion, categoria, subcategoria, material, horma, solo_cotizar)
-- VALUES 
--   ('cami-oversize-jojo', 'Camiseta Oversize JoJo', 'Camiseta oversize de algodón 100%', 'prendas', 'camisetas', 'Algodón', 'unisex', FALSE),
--   ('hoodie-stand', 'Hoodie Stand Power', 'Hoodie con diseño Stand personalizado', 'prendas', 'hoodies', 'Algodón/Poliéster', 'unisex', FALSE),
--   ('peluche-naruto', 'Peluche Naruto Chibi', 'Peluche suave de Naruto', 'accesorios', 'peluches', 'Polyester', 'unisex', TRUE);

-- INSERT INTO public.precios (producto_id, detal_carta, detal_estandar, mayoreo_3, mayoreo_6, mayoreo_12)
-- SELECT id, 35000, 45000, 40000, 38000, 35000
-- FROM public.productos
-- WHERE slug = 'cami-oversize-jojo';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar tablas creadas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

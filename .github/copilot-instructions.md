# GitHub Copilot Agent Instructions — Made in Heaven · E-commerce Web

## Proyecto

Made in Heaven es una tienda colombiana de ropa y accesorios personalizados con temática
geek/anime/nicho (referencia a JoJo's Bizarre Adventure). El sitio es un e-commerce funcional
con catálogo, carrito, pagos vía Wompi y cotización por WhatsApp para productos sin precio fijo.

Stack:
- Framework: Next.js 14 (App Router) + TypeScript strict
- Estilos: Tailwind CSS con design system `heaven-*`
- Base de datos: Supabase (PostgreSQL + RLS) — migración en curso desde backend Express/EJS
- Pasarela de pagos: Wompi (Bancolombia) — 2.65% + $700 COP por transacción
- Validaciones: Zod
- Animaciones: GSAP (ScrollTrigger, gsap.timeline) — uso estratégico, no excesivo
- Hosting: Vercel (free tier — cuidar function invocations y bundle size)

Estructura del repo:

```
WebMiH/
├── backend/           # Express + EJS — legado, NO modificar sin auditar primero
├── frontend/          # Legado — NO modificar sin auditar primero
├── mih-FrontEnd/      # Legado — NO modificar sin auditar primero
├── mih-next/          # PROYECTO ACTIVO — Next.js 14
├── scripts/
├── tasks/
│   ├── todo.md
│   └── lessons.md
└── design-system/
    ├── MASTER.md
    └── pages/
```

---

## FASE 0 — AUDITORÍA OBLIGATORIA (ejecutar antes de cualquier cambio)

Antes de escribir una sola línea de código nuevo, ejecuta esta auditoría completa.
**No avances a la Fase 1 hasta completarla y documentar los hallazgos en `tasks/todo.md`.**

### 0.1 — Identificación del código activo

Examina las 4 carpetas (`backend`, `frontend`, `mih-FrontEnd`, `mih-next`) y determina:

```
Para cada carpeta, documenta en tasks/todo.md:
- ¿Tiene package.json? ¿Cuál es el framework/versión?
- ¿Hay imports cruzados con otras carpetas?
- ¿Está referenciada en vercel.json o algún deploy config?
- ¿Tiene código que no existe en mih-next?
- Veredicto: ACTIVO | LEGADO-REUTILIZABLE | LEGADO-DESCARTABLE
```

Una vez identificado qué es activo y qué es legado, **reorganiza el repo**:

```
WebMiH/
├── apps/
│   └── web/          # Todo el código Next.js activo va aquí
├── legacy/           # Todo el código legado va aquí (NO eliminar sin confirmación)
├── scripts/
├── tasks/
└── design-system/
```

### 0.2 — Auditoría de funcionalidad (botones y flujos rotos)

Mapea todos los elementos interactivos del sitio actual y verifica cada uno:

```
Para cada elemento interactivo, documenta:
- Componente y ubicación exacta en el repo
- Acción esperada
- Estado actual: FUNCIONA | ROTO | PARCIALMENTE ROTO
- Causa del problema (si aplica): handler faltante, estado mal gestionado, 
  fetch fallido, variable de entorno ausente, etc.
```

Corrige todos los elementos rotos ANTES de continuar.
Ejecuta `npm run build` y verifica que no hay errores de compilación.

### 0.3 — Auditoría OWASP Top 10 (2025)

Revisa el código activo contra cada categoría. Documenta hallazgos en `tasks/todo.md`:

```
A01 — Broken Access Control
[ ] ¿Existen rutas de admin accesibles sin autenticación?
[ ] ¿Las API routes validan quién llama antes de operar?
[ ] ¿Hay datos expuestos en URLs o parámetros que no deberían estar?

A02 — Cryptographic Failures
[ ] ¿Hay secretos hardcodeados en el código fuente?
[ ] ¿Se usan variables de entorno correctamente (NEXT_PUBLIC_ solo para cliente)?
[ ] ¿Las cookies tienen Secure, HttpOnly, SameSite?

A03 — Injection
[ ] ¿Hay concatenación de strings en queries o URLs con input del usuario?
[ ] ¿Todo input del usuario pasa por Zod antes de usarse?
[ ] ¿Los parámetros de URL están sanitizados?

A04 — Insecure Design
[ ] ¿Existe rate limiting en las API routes? (mínimo 5 req/IP/min en formularios)
[ ] ¿El flujo de cotización puede ser abusado para spam a WhatsApp?
[ ] ¿Hay validación server-side además de client-side?

A05 — Security Misconfiguration
[ ] ¿next.config.ts tiene headers de seguridad? (X-Frame-Options, CSP, HSTS, etc.)
[ ] ¿poweredByHeader está desactivado?
[ ] ¿Hay rutas de debug o endpoints de desarrollo expuestos?

A06 — Vulnerable & Outdated Components
[ ] Ejecuta: npm audit — documenta vulnerabilidades encontradas
[ ] ¿Hay dependencias con versiones major desactualizadas?

A07 — Identification & Authentication Failures
[ ] ¿El panel de admin (si existe) tiene autenticación robusta?
[ ] ¿Las sesiones tienen timeout?
[ ] ¿Hay protección contra fuerza bruta en login?

A08 — Software & Data Integrity Failures
[ ] ¿Los webhooks de Wompi verifican la firma HMAC antes de procesar?
[ ] ¿Hay validación de integridad en los datos del carrito antes de procesar el pago?

A09 — Security Logging & Monitoring Failures
[ ] ¿Los errores en API routes se loguean server-side con suficiente contexto?
[ ] ¿Los errores al cliente son mensajes genéricos (sin stack traces ni paths)?

A10 — Server-Side Request Forgery (SSRF)
[ ] ¿Hay fetches a URLs construidas con input del usuario?
[ ] ¿Las imágenes externas están restringidas a dominios conocidos en next.config.ts?
```

Para cada hallazgo crítico (A01-A04, A08): **corregir antes de continuar**.
Para hallazgos moderados (A05-A07, A09-A10): **corregir en la misma fase de refactor**.

### 0.4 — Auditoría de rendimiento y consumo de servidor

```
Métricas a medir (npm run build + análisis):
[ ] Bundle size total — objetivo: < 200KB first load JS
[ ] Número de Server Components vs Client Components
[ ] ¿Hay 'use client' innecesarios (componentes sin estado/eventos)?
[ ] ¿Las imágenes usan next/image con lazy loading?
[ ] ¿Hay fetches en cada render que podrían ser cacheados?
[ ] ¿Cuántas Vercel Function invocations genera el flujo principal?
[ ] ¿Hay polling o websockets activos innecesariamente?
```

Documenta el estado baseline en `tasks/todo.md` antes de cualquier cambio.

---

## FASE 1 — REFACTOR Y CONSOLIDACIÓN

Solo después de completar la Fase 0 y sus correcciones:

### 1.1 — Design System (ejecutar primero)

Antes de tocar ningún componente, genera el design system completo:

```bash
# Si tienes ui-ux-pro-max instalado:
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "geek anime streetwear ecommerce nicho colombia" \
  --design-system -p "Made in Heaven" --persist

# Si no está instalado, aplica directamente el design system definido abajo
```

**Design System — tokens `heaven-*` (Source of Truth)**

Guardar en `design-system/MASTER.md` y en `tailwind.config.ts`:

```ts
// tailwind.config.ts
colors: {
  heaven: {
    'bg-dark':  '#12121f',  // Fondo principal
    'bg-card':  '#1c1c30',  // Cards y paneles
    'bg-light': '#f0eefa',  // Secciones claras (uso mínimo)
    'lilac':    '#c9b8e8',  // Acento principal — lila pastel
    'mint':     '#b8e8d4',  // Acento secundario — verde menta
    'rose':     '#f0c4d4',  // Acento terciario — rosa pálido
    'cream':    '#f5e6c8',  // Acento cuaternario
    'sky':      '#b8d4f0',  // Acento quinario
    'text':     '#f5f5f0',  // Texto principal
    'muted':    '#9b99b0',  // Texto secundario
    'divider':  '#2e2e4a',  // Bordes
  }
},
boxShadow: {
  'heaven-cta':  '0 0 24px rgba(201,184,232,0.35)',
  'heaven-card': '0 4px 32px rgba(18,18,31,0.7)',
  'heaven-glow': '0 0 20px rgba(184,232,212,0.25)',
},
fontFamily: {
  display: ['var(--font-display)', 'sans-serif'],  // Dela Gothic One o Bebas Neue
  body:    ['var(--font-body)', 'sans-serif'],     // DM Sans o Outfit
},
```

**Reglas del design system:**
- Nunca usar valores hex arbitrarios `[#hex]` para colores del brand en componentes
- Nunca usar: Arial, Inter, Roboto, Space Grotesk
- Modo oscuro primario. La variante clara es excepcional.
- No emojis como íconos — usar SVG: Heroicons o Lucide
- `cursor-pointer` en todos los elementos clickeables
- Hover con transición `duration-200` mínimo
- Contraste texto/fondo mínimo WCAG AA (4.5:1)
- `prefers-reduced-motion` respetado en todas las animaciones

**Anti-patrones a evitar:**
- Gradientes genéricos de IA (purple/pink sobre blanco)
- Sombras excesivas en móvil
- Glassmorphism en componentes de datos (solo decorativo)
- Animaciones en cada scroll event (usar `once: true` en ScrollTrigger)

### 1.2 — Componentes UI atómicos

Implementar con el patrón ElevaForge: `interface` de props + variantes string literal + tokens `heaven-*`.

```
components/
├── ui/
│   ├── SectionWrapper.tsx    # variant: 'dark' | 'light'
│   ├── GlowDivider.tsx       # aria-hidden, gradiente via heaven-divider
│   ├── Badge.tsx             # variant: 'lilac' | 'mint' | 'rose'
│   ├── CTAButton.tsx         # variant: 'primary' | 'outline' | 'whatsapp'
│   ├── ProductCard.tsx       # soloWhatsApp?: boolean
│   ├── PriceTable.tsx        # columnas: detal_carta, detal_estandar, x3, x6, x12
│   ├── WhatsAppFAB.tsx       # flotante, fixed bottom-right, siempre visible
│   └── AddToCartButton.tsx   # maneja estado optimista + feedback visual
├── sections/
│   ├── HeroSection.tsx       # banner rotativo con GSAP
│   ├── CategoriasGrid.tsx
│   ├── ProductosDestacados.tsx
│   ├── PersonalizacionSection.tsx
│   └── OutOfCatalogBanner.tsx
└── layout/
    ├── Navbar.tsx            # sticky, con contador de carrito
    └── Footer.tsx
```

**CTAButton — variantes:**
```tsx
// primary   → bg-heaven-lilac hover:bg-heaven-mint text-heaven-bg-dark shadow-heaven-cta
// outline   → border-2 border-heaven-lilac text-heaven-lilac hover:bg-heaven-lilac/10
// whatsapp  → bg-[#25D366] hover:bg-[#20BA5A] text-white — icono SVG WhatsApp inline
// Siempre: focus:ring-2 focus:ring-heaven-lilac focus:ring-offset-heaven-bg-dark
// target="_blank" rel="noopener noreferrer" en links externos
```

**ProductCard — lógica de precio:**
```tsx
// soloWhatsApp=false → mostrar precio "Desde $XX.XXX" + botón "Agregar al carrito"
// soloWhatsApp=true  → ocultar precio completamente, mostrar solo CTAButton variant='whatsapp'
//                      con texto "Cotizar por WhatsApp"
// bg-heaven-bg-card, rounded-2xl, shadow-heaven-card
// hover: shadow-heaven-glow + translateY(-2px), transition duration-200
```

### 1.3 — GSAP: animaciones estratégicas

**Regla de oro: cada animación debe tener propósito, no ser decorativa.**

Instalar: `npm install gsap`

Usar GSAP solo para:

```ts
// 1. Hero — entrada staggered de elementos (una sola vez al cargar)
gsap.from('.hero-element', {
  y: 40, opacity: 0, duration: 0.8,
  stagger: 0.15, ease: 'power3.out',
  clearProps: 'all'  // libera memoria post-animación
})

// 2. ProductCards — reveal al hacer scroll (once: true — NO repetir)
ScrollTrigger.create({
  trigger: '.products-grid',
  start: 'top 80%',
  once: true,  // CRÍTICO: evita re-renders en scroll
  onEnter: () => gsap.from('.product-card', {
    y: 30, opacity: 0, duration: 0.6,
    stagger: 0.08, ease: 'power2.out',
    clearProps: 'all'
  })
})

// 3. Navbar — hide/show en scroll (throttled, no en cada px)
// 4. Banner rotativo del Hero — gsap.timeline() con pausa en hover
```

**Lo que NO hacer con GSAP:**
- Animar en cada pixel de scroll (sin `once: true`)
- Animaciones en listas largas de productos (>12 items)
- Parallax en móvil (destruye performance)
- Timeline sin `clearProps: 'all'` (memory leak)

**Patrón correcto para componentes React + GSAP:**
```tsx
useGSAP(() => {
  // toda la lógica GSAP aquí
  return () => ScrollTrigger.getAll().forEach(t => t.kill())  // cleanup obligatorio
}, { scope: containerRef })
```

---

## FASE 2 — E-COMMERCE: CARRITO Y PAGOS

### 2.1 — Lógica del carrito

```ts
// types/carrito.ts
interface ItemCarrito {
  productoId: string
  slug: string
  nombre: string
  imagenUrl?: string
  variantes: string        // "Talla M · Piel de durazno"
  cantidad: number
  precioUnitario: number   // 0 si soloWhatsApp=true
  soloWhatsApp: boolean
  comentario?: string
}

interface Carrito {
  items: ItemCarrito[]
  updatedAt: string
}
```

**Persistencia:** `localStorage` con key `mih_carrito_v2`.
Usar un custom hook `useCarrito()` que encapsula toda la lógica:

```ts
// hooks/useCarrito.ts
export function useCarrito() {
  // agregar, eliminar, actualizar cantidad, vaciar, calcularTotal
  // subtotal informativo en COP
  // separar items con precio vs items soloWhatsApp
  // no exponer localStorage directamente fuera del hook
}
```

**Validación antes de pago:**
- Verificar que items con precio tienen `precioUnitario > 0`
- Verificar cantidades mínimas (accesorios: mínimo 2)
- Si hay mezcla de items pagables + cotización → flujo mixto (ver 2.3)

### 2.2 — Pasarela de pagos: Wompi

**Justificación de la elección:**
Wompi (Bancolombia) tiene las comisiones más bajas del mercado colombiano (2.65% + $700 COP),
acepta tarjetas Visa/Mastercard, PSE, Efecty y botón Bancolombia, tiene SDK oficial para
JavaScript, documentación en español, y webhook con verificación HMAC.

**Integración:**

```bash
npm install @wompi-co/sdk  # o usar la API REST directamente
```

**Variables de entorno:**
```env
WOMPI_PUBLIC_KEY=pub_...           # para el frontend (checkout widget)
WOMPI_PRIVATE_KEY=prv_...         # solo backend/API routes — NUNCA exponer
WOMPI_EVENTS_SECRET=...           # para verificar webhooks
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_...
```

**Flujo de pago:**

```
Cliente agrega productos → Carrito → Checkout
→ app/api/checkout/create/route.ts
  - Valida items con Zod
  - Calcula total en centavos (COP × 100)
  - Crea transacción en Wompi API
  - Devuelve reference + redirect URL

→ Cliente es redirigido al checkout de Wompi (hosted page)
  o se usa el widget embebido Wompi

→ Wompi hace POST a app/api/checkout/webhook/route.ts
  - Verifica firma HMAC (OBLIGATORIO — OWASP A08)
  - Actualiza estado del pedido en Supabase
  - Envía confirmación por email (opcional fase 2)

→ Cliente es redirigido a /pedido/[id]?status=APPROVED|DECLINED
```

**Verificación HMAC del webhook (CRÍTICO — no omitir):**
```ts
// app/api/checkout/webhook/route.ts
import { createHmac } from 'crypto'

function verificarFirmaWompi(payload: string, signature: string): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET!
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  // Comparación segura contra timing attacks
  return expected.length === signature.length &&
    createHmac('sha256', 'compare').update(expected).digest('hex') ===
    createHmac('sha256', 'compare').update(signature).digest('hex')
}
```

**Manejo de errores de pago:**
```ts
// Respuesta al cliente: NUNCA exponer detalles internos
// Loguear internamente: código de error Wompi + referencia + timestamp
// Mostrar al usuario: mensaje genérico + botón para reintentar o ir a WhatsApp
```

### 2.3 — Flujo mixto: items con precio + items de cotización

Si el carrito contiene ambos tipos:

```
Mostrar resumen separado en /carrito:
  ┌─ Productos con precio ──────────────────┐
  │  Camiseta Oversize × 2    $111.000      │
  │  Hoodie Premium × 1       $92.000       │
  │  ─────────────────────────────────      │
  │  Total                    $203.000      │
  │  [Pagar con Wompi]                      │
  └─────────────────────────────────────────┘

  ┌─ Productos para cotizar ────────────────┐
  │  Peluche Naruto × 1       A cotizar     │
  │  Mousepad personalizado × 1  A cotizar  │
  │  [Cotizar por WhatsApp]                 │
  └─────────────────────────────────────────┘
```

El botón "Cotizar por WhatsApp" construye el mensaje con `buildCotizacionUrl(itemsCotizacion)`.
El botón "Pagar con Wompi" solo procesa los items con precio.
Ambos pueden usarse en el mismo flujo — no son mutuamente excluyentes.

### 2.4 — API routes y consumo de servidor

**Regla de Vercel free tier: minimizar function invocations.**

```ts
// ✅ CORRECTO — Server Component lee directo de Supabase (0 invocations extras)
// app/catalogo/page.tsx — Server Component
const productos = await supabaseServer.from('productos').select('*').eq('activo', true)

// ✅ CORRECTO — Static generation para páginas de producto
// app/catalogo/[slug]/page.tsx
export async function generateStaticParams() { /* genera en build */ }
export const revalidate = 3600  // ISR: revalida cada hora

// ❌ INCORRECTO — API route innecesaria para datos estáticos
// No crear /api/productos que el cliente llama en cada render
```

**Rate limiting en API routes que reciben datos del usuario:**
```ts
// app/api/checkout/create/route.ts
// app/api/cotizacion/route.ts
// Implementar con upstash/ratelimit o con un Map<IP, count> simple en memory
// Límite: 5 requests por IP por minuto
```

---

## FASE 3 — MIGRACIÓN A SUPABASE

**Objetivo:** Migrar la lógica del backend Express/EJS a Supabase sin romper funcionalidad existente.

### 3.1 — Schema de base de datos

```sql
-- Ejecutar en Supabase SQL Editor

-- Productos
create table public.productos (
  id           uuid default gen_random_uuid() primary key,
  slug         text unique not null,
  nombre       text not null,
  descripcion  text,
  categoria    text not null check (categoria in ('prendas', 'accesorios')),
  subcategoria text,
  material     text,
  horma        text check (horma in ('hombre', 'mujer', 'nino', 'unisex', null)),
  solo_cotizar boolean default false,
  activo       boolean default true,
  imagen_url   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Precios (solo para productos con solo_cotizar=false)
create table public.precios (
  id             uuid default gen_random_uuid() primary key,
  producto_id    uuid references productos(id) on delete cascade,
  detal_carta    integer,     -- COP, puede ser null
  detal_estandar integer,
  mayoreo_3      integer,
  mayoreo_6      integer,
  mayoreo_12     integer,
  updated_at     timestamptz default now()
);

-- Pedidos (productos con precio — procesados por Wompi)
create table public.pedidos (
  id              uuid default gen_random_uuid() primary key,
  wompi_reference text unique,
  wompi_id        text,
  estado          text default 'pendiente'
                  check (estado in ('pendiente', 'aprobado', 'rechazado', 'error')),
  total_cop       integer not null,
  nombre_cliente  text not null,
  email_cliente   text not null,
  whatsapp        text,
  items           jsonb not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Cotizaciones (productos solo_cotizar=true — van a WhatsApp)
create table public.cotizaciones (
  id          uuid default gen_random_uuid() primary key,
  nombre      text not null,
  email       text not null,
  whatsapp    text not null,
  comentarios text,
  items       jsonb not null,
  estado      text default 'pendiente'
              check (estado in ('pendiente', 'procesada', 'respondida')),
  created_at  timestamptz default now()
);

-- RLS
alter table public.productos    enable row level security;
alter table public.precios      enable row level security;
alter table public.pedidos      enable row level security;
alter table public.cotizaciones enable row level security;

-- Políticas
create policy "Productos activos públicos"
  on public.productos for select using (activo = true);

create policy "Precios públicos"
  on public.precios for select using (true);

create policy "Clientes pueden insertar pedidos"
  on public.pedidos for insert with check (true);

create policy "Solo service role lee pedidos"
  on public.pedidos for select using (false);

create policy "Clientes pueden insertar cotizaciones"
  on public.cotizaciones for insert with check (true);

create policy "Solo service role lee cotizaciones"
  on public.cotizaciones for select using (false);
```

### 3.2 — Clientes Supabase

```ts
// lib/supabase/server.ts — para Server Components y API routes
import { createClient } from '@supabase/supabase-js'
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // solo server
  { auth: { persistSession: false } }
)

// lib/supabase/client.ts — para Client Components (solo lectura pública)
import { createBrowserClient } from '@supabase/ssr'
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 3.3 — Estrategia de migración sin romper funcionalidad

```
Paso 1: Cargar datos actuales del catálogo en Supabase (seed script)
Paso 2: Cambiar las páginas de catálogo para leer de Supabase (Server Components)
Paso 3: Verificar que todas las páginas cargan correctamente
Paso 4: Migrar la lógica de cotizaciones del backend Express a /api/cotizacion
Paso 5: Verificar flujo de cotización end-to-end
Paso 6: Solo después de verificar → marcar backend Express como legado
```

---

## ESTRUCTURA DE ARCHIVOS FINAL

```
apps/web/
├── app/
│   ├── layout.tsx               # fuentes, metadata, JSON-LD, skip nav, WhatsAppFAB
│   ├── page.tsx                 # Homepage
│   ├── globals.css
│   ├── catalogo/
│   │   ├── page.tsx             # Server Component — lista con filtros
│   │   └── [slug]/
│   │       └── page.tsx         # ISR — página de producto
│   ├── accesorios/
│   │   └── page.tsx
│   ├── personalizacion/
│   │   └── page.tsx
│   ├── carrito/
│   │   └── page.tsx             # Client Component — carrito + checkout
│   ├── pedido/
│   │   └── [id]/
│   │       └── page.tsx         # Confirmación de pago
│   └── api/
│       ├── checkout/
│       │   ├── create/route.ts  # POST — crea transacción Wompi
│       │   └── webhook/route.ts # POST — recibe eventos Wompi (verifica HMAC)
│       ├── cotizacion/route.ts  # POST — guarda cotización en Supabase
│       └── health/route.ts
├── components/
│   ├── sections/
│   ├── ui/
│   └── layout/
├── hooks/
│   ├── useCarrito.ts
│   └── useGSAPReveal.ts         # hook reutilizable para animaciones scroll
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── wompi.ts                 # helpers: buildCheckoutUrl, verificarFirma
│   ├── whatsapp.ts              # buildWhatsAppUrl, buildCotizacionUrl
│   └── validations.ts           # schemas Zod
├── types/
│   ├── producto.ts
│   ├── carrito.ts
│   └── pedido.ts
└── public/
    └── fonts/
```

---

## next.config.ts (seguridad + optimización)

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    unoptimized: true,  // reduce function invocations en Vercel free
    domains: [],        // añadir dominios de imágenes externas si aplica
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Probes de seguridad → 404
  redirects: async () => [
    ...['.git', '.env', 'wp-admin', 'wp-login', 'phpmyadmin',
        'wp-content', 'node_modules', 'xmlrpc.php', '.htaccess'
    ].map(seg => ({
      source: `/${seg}/:path*`,
      destination: '/404',
      permanent: false,
    })),
    { source: '/admin/:path*', destination: '/404', permanent: false },
  ],

  // Headers de seguridad estáticos (sin middleware — menor consumo)
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://checkout.wompi.co",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https://checkout.wompi.co",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://checkout.wompi.co https://api.wompi.co",
            "frame-src https://checkout.wompi.co",
            "frame-ancestors 'none'",
            "form-action 'self' https://checkout.wompi.co",
            "base-uri 'self'",
            "object-src 'none'",
            'upgrade-insecure-requests',
          ].join('; '),
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
    },
    {
      source: '/fonts/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
}

export default config
```

---

## app/layout.tsx

```tsx
// Patrón obligatorio:
// 1. localFont para display + Google Font para body (display:'swap', preload:true)
// 2. Metadata: title template, description, keywords, openGraph, twitter, robots
// 3. JSON-LD LocalBusiness:
//    - name: "Made in Heaven"
//    - @type: "ClothingStore"
//    - telephone: "+573249207921"
//    - address: { addressCountry: "CO", addressRegion: "Nariño" }
//    - sameAs: [Instagram URL, TikTok URL]
//    - paymentAccepted: ["Credit Card", "PSE", "Cash", "Bancolombia"]
// 4. dns-prefetch y preconnect a Google Fonts y Wompi
// 5. Skip navigation: sr-only → focus:not-sr-only
// 6. <WhatsAppFAB> en el body, fuera del main
// 7. <html lang="es" dir="ltr">
```

---

## lib/validations.ts

```ts
import { z } from 'zod'

export const checkoutSchema = z.object({
  nombre:    z.string().min(2).max(100),
  email:     z.string().email(),
  whatsapp:  z.string().regex(/^(\+?57)?3\d{9}$/, 'Número colombiano inválido').optional(),
  items:     z.array(z.object({
    productoId:     z.string().uuid(),
    cantidad:       z.number().int().min(1).max(999),
    precioUnitario: z.number().int().min(0),
    variantes:      z.string().max(200),
    comentario:     z.string().max(200).optional(),
  })).min(1),
})

export const cotizacionSchema = z.object({
  nombre:      z.string().min(2).max(100),
  email:       z.string().email(),
  whatsapp:    z.string().regex(/^(\+?57)?3\d{9}$/, 'Número colombiano inválido'),
  comentarios: z.string().max(500).optional(),
  items:       z.array(z.object({
    productoId: z.string().uuid(),
    nombre:     z.string(),
    variantes:  z.string(),
    cantidad:   z.number().int().min(1),
    comentario: z.string().max(200).optional(),
  })).min(1),
})

// Validación del webhook de Wompi
export const wompiWebhookSchema = z.object({
  event:       z.string(),
  data:        z.object({ transaction: z.object({ id: z.string(), reference: z.string(), status: z.string() }) }),
  signature:   z.object({ properties: z.array(z.string()), checksum: z.string() }),
  timestamp:   z.number(),
})
```

---

## lib/whatsapp.ts

```ts
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '573249207921'

export function buildWhatsAppUrl(mensaje?: string): string {
  const base = `https://wa.me/${WA_NUMBER}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}

export function buildCotizacionUrl(items: Array<{
  nombre: string, variantes: string, cantidad: number, comentario?: string
}>): string {
  const lineas = items.map(i =>
    `• ${i.nombre} (${i.variantes}) ×${i.cantidad}${i.comentario ? ` — ${i.comentario}` : ''}`
  )
  const texto = `Hola Made in Heaven! 👋\nQuiero cotizar:\n\n${lineas.join('\n')}\n\n¿Me pueden dar precio?`
  return buildWhatsAppUrl(texto)
}
```

---

## Gestión de tareas

Al iniciar cualquier tarea de 3 o más pasos:

1. Lee `tasks/todo.md` — es el plan activo
2. Lee `tasks/lessons.md` — patrones de errores a evitar
3. Escribe el plan con checkboxes en `tasks/todo.md` **antes** de implementar
4. Ejecuta la tarea sin pedir confirmación en cada paso si la dirección es clara
5. Marca ítems completados conforme avanzas
6. Al terminar: añade revisión en `tasks/todo.md` y lecciones aprendidas en `tasks/lessons.md`
7. Ejecuta `npm run build`, `npm run lint`, `npm run type-check` antes de declarar done
8. Muestra el output. Si hay errores, corrígelos sin pedirme guía

---

## Principios de código

**Simplicidad:** mínimo cambio necesario. No tocar lo que no hace falta.

**Sin parches:** busca la causa raíz. Si el fix se siente chapucero, implementa
la solución correcta desde el principio.

**Verificación:** nunca declares algo listo sin haber ejecutado build + lint.

**Elegancia:** antes de implementar algo no trivial, pregúntate si hay una
solución más simple. "Sabiendo todo lo que sé ahora, ¿cuál es la solución elegante?"

**Bugs:** cuando recibas un reporte de bug, corrígelo directamente.
Apunta a logs, errores y comportamiento anómalo. No pidas guía paso a paso.

**Los 7 principios de Linus Torvalds:**
1. Hazlo simple o no lo hagas (KISS)
2. Elimina sin miedo el código inútil
3. Si necesitas comentarios para entenderlo, rehazlo
4. No mezcles refactors con arreglos de bugs en el mismo commit
5. Si no puedes explicarlo rápido, está mal diseñado
6. Que funcione primero, optimiza después
7. Commits pequeños — los commits grandes ocultan problemas

---

## Pre-delivery checklist (ejecutar antes de cada PR)

```
FUNCIONALIDAD
[ ] npm run build — sin errores
[ ] npm run lint — sin warnings
[ ] npm run type-check — sin errores TypeScript
[ ] Todos los botones del flujo principal funcionan
[ ] Flujo de carrito → pago Wompi → confirmación funciona end-to-end en staging
[ ] Flujo de cotización → WhatsApp abre con mensaje correcto
[ ] Webhook de Wompi verifica firma HMAC

UI/UX
[ ] No emojis como íconos (usar SVG: Heroicons/Lucide)
[ ] cursor-pointer en todos los elementos clickeables
[ ] Hover states con transición duration-200 mínimo
[ ] Contraste texto/fondo ≥ 4.5:1 (WCAG AA)
[ ] Focus states visibles para navegación por teclado
[ ] prefers-reduced-motion respetado en animaciones GSAP
[ ] Responsive: 375px, 768px, 1024px, 1440px
[ ] WhatsApp FAB visible en todas las páginas

SEGURIDAD
[ ] Sin secretos hardcodeados — todo en variables de entorno
[ ] Variables nuevas documentadas en .env.local.example
[ ] Rate limiting activo en /api/checkout/create y /api/cotizacion
[ ] Webhook de Wompi rechaza requests sin firma válida (403)
[ ] Inputs del usuario validados con Zod server-side
[ ] Headers de seguridad presentes (verificar con securityheaders.com)

RENDIMIENTO
[ ] Bundle size first load JS < 200KB
[ ] GSAP solo con ScrollTrigger once: true y clearProps: 'all'
[ ] Server Components para páginas de catálogo (0 JS al cliente)
[ ] ISR activo en páginas de producto (revalidate: 3600)
[ ] Sin console.log en producción

SUPABASE / DATOS
[ ] RLS activo en todas las tablas
[ ] SERVICE_ROLE_KEY solo en server (nunca en NEXT_PUBLIC_)
[ ] Wompi private key solo en server
```

---

## Variables de entorno (.env.local.example)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # SOLO SERVER — nunca exponer al cliente

# Wompi — https://dashboard.wompi.co/
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_stagtest_...
WOMPI_PRIVATE_KEY=prv_stagtest_...  # SOLO SERVER
WOMPI_EVENTS_SECRET=...             # SOLO SERVER — para verificar webhooks

# WhatsApp
NEXT_PUBLIC_WA_NUMBER=573249207921

# Site
NEXT_PUBLIC_SITE_URL=https://madeinheavenco.com

# Entorno
NODE_ENV=development
```

---

## Tono y comunicación del sitio

- Cercano, directo, entusiasta — nunca corporativo
- Énfasis en **personalización** como diferenciador
- Énfasis en **atención al cliente** y proceso simple
- Lenguaje colombiano natural
- CTAs: *"Cotiza ya"*, *"Escríbenos al WhatsApp"*, *"Personaliza tu pedido"*,
  *"Pagar ahora"*, *"Agregar al carrito"*
- Mensaje de fuera de catálogo: *"¿Buscas algo diferente? Escríbenos y lo conseguimos "*
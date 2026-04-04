# Made in Heaven — Frontend

Tienda online de ropa y accesorios personalizados con temática geek, anime y cultura pop. Construida con Next.js 14, TypeScript y Tailwind CSS.

## Stack Tecnológico

- **Next.js 14** — App Router, SSR/SSG, API Routes
- **React 18** — Server & Client Components
- **TypeScript** — Modo estricto
- **Tailwind CSS 3** — Design system `heaven-*`
- **Supabase** — Base de datos + auth (preparado)
- **Zod** — Validación de schemas
- **reCAPTCHA v3** — Protección anti-bot
- **Vercel** — Deploy optimizado (region gru1 — São Paulo)

## Estructura del Proyecto

```
frontend/
├── app/                    # App Router pages
│   ├── page.tsx            # Homepage
│   ├── catalogo/           # Catálogo + detalle de producto
│   ├── accesorios/         # Accesorios personalizados
│   ├── personalizacion/    # Técnicas de personalización
│   ├── cotizacion/         # Carrito + formulario
│   ├── api/                # API Routes (cotizacion, health)
│   ├── sitemap.ts          # Sitemap dinámico
│   ├── robots.ts           # Robots.txt
│   ├── error.tsx            # Error boundary global
│   ├── loading.tsx          # Loading UI global
│   └── not-found.tsx        # 404 personalizado
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── sections/           # Hero, Categorías, Destacados, etc.
│   └── ui/                 # Badge, CTAButton, ProductCard, etc.
├── lib/
│   ├── cart-context.tsx    # Context global del carrito
│   ├── recaptcha.ts        # Hook reCAPTCHA v3
│   ├── utils.ts            # Utilidades (formatCOP, etc.)
│   ├── validations.ts      # Zod schemas
│   ├── whatsapp.ts         # URLs WhatsApp + Instagram
│   ├── security/           # CSRF, sanitize, rate-limiter, logger
│   └── supabase/           # Clientes browser + server
├── types/                  # TypeScript types
├── supabase/               # Schema SQL + seed data
└── middleware.ts           # Security middleware (rate limit, WAF)
```

## Requisitos Previos

- Node.js >= 18.17
- npm o pnpm

## Instalación

```bash
cd frontend
npm install
```

## Variables de Entorno

Copiar `.env.local.example` a `.env.local` y completar los valores:

```bash
cp .env.local.example .env.local
```

Variables requeridas:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo server) |
| `NEXT_PUBLIC_WA_NUMBER` | Número de WhatsApp con código de país |
| `NEXT_PUBLIC_IG_USERNAME` | Usuario de Instagram |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Site key de reCAPTCHA v3 |
| `RECAPTCHA_SECRET_KEY` | Secret key de reCAPTCHA v3 |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build de Producción

```bash
npm run build
npm start
```

## Deploy

El proyecto está configurado para Vercel:

```bash
# Desde la raíz del monorepo
vercel --cwd frontend
```

- Region: `gru1` (São Paulo)
- Framework: Next.js (auto-detectado)
- Las variables de entorno deben configurarse en el dashboard de Vercel.

## Seguridad (OWASP Top 10 2025)

- **A01 (Broken Access Control)**: RLS en Supabase, CSRF tokens
- **A02 (Cryptographic Failures)**: HSTS, no secrets en client
- **A03 (Injection)**: Zod + sanitización, CSP estricto
- **A04 (Insecure Design)**: Rate limiting, WAF patterns en middleware
- **A05 (Security Misconfiguration)**: Headers hardened, `poweredByHeader: false`
- **A06 (Vulnerable Components)**: Deps pinned (sin `^`), renovate.json
- **A07 (Auth Failures)**: reCAPTCHA v3, rate limit por IP
- **A08 (Data Integrity)**: SRI para scripts, origin validation
- **A09 (Logging Failures)**: Security logger con audit trail
- **A10 (SSRF)**: Error boundary seguro, no exposición de server info

## Licencia

Todos los derechos reservados — Made in Heaven © 2026

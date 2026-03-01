import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/* ============================================
   Middleware de Seguridad Centralizado
   Cubre: A01 (Access Control), A02 (Misconfiguration),
          A05 (Injection), A07 (Auth), A09 (Logging)
   ============================================ */

/** Rutas bloqueadas — honeypots y probes conocidos */
const BLOCKED_PATHS = [
  /^\/.git/,
  /^\/.env/,
  /^\/.svn/,
  /^\/.hg/,
  /^\/wp-(admin|login|content|includes|json)/,
  /^\/xmlrpc\.php/,
  /^\/admin(?!\/)/,
  /^\/phpmyadmin/i,
  /^\/cgi-bin/,
  /^\/\.well-known\/(?!acme-challenge)/,
  /^\/server-status/,
  /^\/server-info/,
  /^\/debug/,
  /^\/config\./,
  /^\/backup/i,
  /^\/\.DS_Store/,
  /^\/Thumbs\.db/,
  /^\/robots\.txt\.bak/,
]

/** Patrones sospechosos en query params — inyección SQL/XSS/path traversal */
const SUSPICIOUS_PATTERNS = [
  /(\.\.\/)/, // Path traversal
  /<script/i, // XSS
  /javascript:/i, // XSS protocol
  /on(load|error|click|mouseover)=/i, // Event handlers
  /union\s+(all\s+)?select/i, // SQL injection
  /;\s*drop\s+table/i, // SQL injection
  /exec(\s|\+)+(s|x)p/i, // SQL injection
  /\/etc\/passwd/, // File inclusion
  /\x00/, // Null byte injection
]

/** User-Agent de bots/scanners maliciosos conocidos */
const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /acunetix/i,
  /netsparker/i,
  /havij/i,
  /appscan/i,
  /w3af/i,
  /wraithx/i,
  /masscan/i,
]

/** Rate limiter en memoria (por IP) — para Edge ≤ 60s de vida */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minuto
const RATE_LIMIT_MAX_GENERAL = 120 // Máximo requests generales por IP
const RATE_LIMIT_MAP_MAX_SIZE = 2_000 // Evitar memory leak en instancias warm

/** Obtiene IP del request para rate limiting */
function getClientIP(request: NextRequest): string {
  // Preferir request.ip (Vercel Edge, inalterable por el cliente)
  // Luego x-real-ip (header controlado por la plataforma, un solo valor)
  // Luego x-forwarded-for (puede contener múltiples IPs, tomar la primera)
  return (
    request.ip ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

/** Verifica rate limit */
function checkRateLimit(ip: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: limit - 1 }
  }

  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  return { allowed: entry.count <= limit, remaining }
}

/** Limpieza del mapa de rate limit (evitar memory leak en instancias Edge warm) */
function cleanupRateLimitMap(): void {
  const now = Date.now()
  // Si excede maxSize, limpiar todo (defensa contra botnets)
  if (rateLimitMap.size > RATE_LIMIT_MAP_MAX_SIZE) {
    rateLimitMap.clear()
    return
  }
  const entries = Array.from(rateLimitMap.entries())
  for (const [key, value] of entries) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') ?? ''

  // Limpieza periódica (~1 de cada 20 requests) o forzada si el Map es grande
  if (Math.random() < 0.05 || rateLimitMap.size > RATE_LIMIT_MAP_MAX_SIZE) {
    cleanupRateLimitMap()
  }

  // ── A09: Logging de seguridad ──────────────────────
  // Los eventos se loguean en el edge (Vercel captura stdout)
  const logPrefix = `[SEC] ${ip} ${request.method} ${pathname}`

  // ── A01/A02: Bloquear rutas prohibidas (honeypots) ─
  // Sin log: bots generan miles de probes/día, no vale la pena loguearlo en Edge
  if (BLOCKED_PATHS.some((re) => re.test(pathname))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // ── A07: Bloquear user-agents de scanners ────────────
  // Sin log: misma razón - noise de bots
  if (BLOCKED_USER_AGENTS.some((re) => re.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── A05: Detectar patrones de inyección en URL ─────
  const fullUrl = request.url
  if (SUSPICIOUS_PATTERNS.some((re) => re.test(fullUrl))) {
    console.warn(`${logPrefix} INJECTION_ATTEMPT: ${fullUrl.substring(0, 200)}`)
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Revisar query params individualmente
  for (const [key, value] of searchParams) {
    if (SUSPICIOUS_PATTERNS.some((re) => re.test(key) || re.test(value))) {
      console.warn(`${logPrefix} SUSPICIOUS_PARAM: ${key}=${value.substring(0, 100)}`)
      return new NextResponse('Bad Request', { status: 400 })
    }
  }

  // ── A01: Rate limiting (solo tráfico general, APIs tienen su propio limiter) ──
  const isAPI = pathname.startsWith('/api/')

  // API routes tienen rate limiting propio (cotizacionLimiter, etc.)
  // Aquí solo protegemos contra scraping/crawling masivo de páginas
  if (!isAPI) {
    const { allowed, remaining } = checkRateLimit(ip, RATE_LIMIT_MAX_GENERAL)

    if (!allowed) {
      console.warn(`${logPrefix} RATE_LIMITED`)
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX_GENERAL),
          'X-RateLimit-Remaining': '0',
        },
      })
    }

    // Rate limit headers solo en páginas
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_GENERAL))
    response.headers.set('X-RateLimit-Remaining', String(remaining))

    // Cross-Origin policies (A01: prevenir leaks cross-origin)
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

    return response
  }

  // ── A02: Security headers para APIs (sin rate limit, lo maneja cada route handler) ─
  const response = NextResponse.next()

  // Cross-Origin policies (A01: prevenir leaks cross-origin)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  return response
}

/** Matcher — excluir assets estáticos del procesamiento del middleware */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon\.ico|fonts|images|api/health|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}

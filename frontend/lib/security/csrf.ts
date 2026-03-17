/**
 * CSRF Protection — Token-based
 * OWASP A01 (Broken Access Control)
 *
 * Para una aplicación que es mayormente estática con un solo
 * endpoint de API POST, usamos verificación de Origin/Referer
 * como método principal de protección CSRF (recomendado por OWASP
 * para APIs JSON que no usan cookies de sesión).
 */

/** Dominios permitidos para requests API */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  'https://madeinhshop.com',
  'https://www.madeinhshop.com',
  'https://madeinheaven.co',
  'https://www.madeinheaven.co',
  'https://madeinheavenco.com',
  'https://www.madeinheavenco.com',
].filter(Boolean)

function getRequestOrigin(request: Request): string | null {
  try {
    return new URL(request.url).origin
  } catch {
    return null
  }
}

function getForwardedOrigin(request: Request): string | null {
  const host = request.headers.get('x-forwarded-host')
  if (!host) return null

  const proto = request.headers.get('x-forwarded-proto') || 'https'
  try {
    return new URL(`${proto}://${host}`).origin
  } catch {
    return null
  }
}

function getTrustedOrigins(request: Request): string[] {
  const values = [
    getRequestOrigin(request),
    getForwardedOrigin(request),
    ...ALLOWED_ORIGINS,
  ].filter((value): value is string => Boolean(value))

  return Array.from(new Set(values))
}

/**
 * Verifica que el request viene de un origin permitido
 * Implementa la recomendación OWASP de "Verifying Origin with Standard Headers"
 *
 * @returns true si el origin es válido, false si no
 */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const trustedOrigins = getTrustedOrigins(request)

  // Para requests que incluyen Origin header
  if (origin) {
    return trustedOrigins.some((allowed) => origin === allowed)
  }

  // Fallback a Referer si Origin no está presente
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = refererUrl.origin
      return trustedOrigins.some((allowed) => refererOrigin === allowed)
    } catch {
      return false
    }
  }

  // Si no hay Origin ni Referer, rechazar (podría ser un request directo/curl)
  return false
}

/**
 * Verifica que el Content-Type sea JSON
 * Previene ataques CSRF basados en forms (A01)
 */
export function verifyContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type')
  return contentType?.toLowerCase().includes('application/json') ?? false
}

function isSameSiteBrowserRequest(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site')
  return fetchSite === 'same-origin' || fetchSite === 'same-site'
}

/**
 * Verifica todas las protecciones CSRF de una vez
 * @returns null si todo está OK, o un string con el error
 */
export function validateCSRF(request: Request): string | null {
  if (!verifyContentType(request)) {
    return 'Content-Type must be application/json'
  }

  // Browser same-origin/same-site requests are safe against cross-site form posts.
  if (isSameSiteBrowserRequest(request)) {
    return null
  }

  // In development (local/Codespaces previews), Origin/Referer can be rewritten
  // by reverse proxies and trigger false CSRF positives.
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  if (!verifyOrigin(request)) {
    return 'Invalid request origin'
  }

  return null
}

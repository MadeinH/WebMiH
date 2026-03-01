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
  'https://madeinheaven.co',
  'https://www.madeinheaven.co',
  'https://madeinheavenco.com',
  'https://www.madeinheavenco.com',
].filter(Boolean)

/**
 * Verifica que el request viene de un origin permitido
 * Implementa la recomendación OWASP de "Verifying Origin with Standard Headers"
 *
 * @returns true si el origin es válido, false si no
 */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Para requests que incluyen Origin header
  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed)
  }

  // Fallback a Referer si Origin no está presente
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = refererUrl.origin
      return ALLOWED_ORIGINS.some((allowed) => refererOrigin === allowed)
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

/**
 * Verifica todas las protecciones CSRF de una vez
 * @returns null si todo está OK, o un string con el error
 */
export function validateCSRF(request: Request): string | null {
  if (!verifyContentType(request)) {
    return 'Content-Type must be application/json'
  }

  if (!verifyOrigin(request)) {
    return 'Invalid request origin'
  }

  return null
}

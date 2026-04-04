/**
 * Rate Limiter para API Routes (Serverless-compatible)
 * OWASP A01 (Broken Access Control), A07 (Auth Failures)
 *
 * En Vercel Serverless, cada instancia tiene su propia memoria,
 * así que este rate limiter es por-instancia. Para rate limiting
 * distribuido se necesitaría Vercel KV o Upstash Redis.
 * Aún así, provee protección contra abuso básico.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  /** Ventana de tiempo en milisegundos */
  windowMs: number
  /** Máximo de requests por ventana */
  maxRequests: number
  /** Identificador del limiter */
  name: string
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

/**
 * Crea un rate limiter con configuración específica
 * Usar uno diferente por tipo de endpoint
 */
export function createRateLimiter(config: RateLimitConfig) {
  if (!stores.has(config.name)) {
    stores.set(config.name, new Map())
  }
  const store = stores.get(config.name)!

  return {
    /**
     * Verifica si la IP tiene permitido hacer el request
     * @returns Objeto con allowed, remaining, y resetAt headers
     */
    check(ip: string): {
      allowed: boolean
      remaining: number
      resetAt: number
      limit: number
    } {
      const now = Date.now()
      const entry = store.get(ip)

      // Limpieza periódica
      if (Math.random() < 0.05) {
        const entries = Array.from(store.entries())
        for (const [key, val] of entries) {
          if (now > val.resetAt) store.delete(key)
        }
      }

      if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + config.windowMs })
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetAt: now + config.windowMs,
          limit: config.maxRequests,
        }
      }

      entry.count++
      const remaining = Math.max(0, config.maxRequests - entry.count)

      return {
        allowed: entry.count <= config.maxRequests,
        remaining,
        resetAt: entry.resetAt,
        limit: config.maxRequests,
      }
    },

    /** Obtiene headers de rate limit para la respuesta */
    getHeaders(result: { remaining: number; resetAt: number; limit: number }): Record<string, string> {
      return {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      }
    },
  }
}

/** Rate limiter pre-configurado para el endpoint de cotización */
export const cotizacionLimiter = createRateLimiter({
  name: 'cotizacion',
  windowMs: 60_000, // 1 minuto
  maxRequests: 5,   // 5 cotizaciones por minuto por IP
})

/** Rate limiter para crear sesiones de pago */
export const checkoutCreateLimiter = createRateLimiter({
  name: 'checkout-create',
  windowMs: 60_000, // 1 minuto
  maxRequests: 5,   // 5 intentos de checkout por minuto por IP
})

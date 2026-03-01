/**
 * Security Logger — Registro de eventos de seguridad
 * OWASP A09 (Security Logging and Monitoring Failures)
 *
 * En Vercel, console.log/warn/error van a los Vercel Logs
 * que se pueden integrar con Datadog, LogDNA, etc.
 * Este módulo estructura los logs para fácil búsqueda.
 */

export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'RATE_LIMITED'
  | 'INJECTION_ATTEMPT'
  | 'INVALID_INPUT'
  | 'RECAPTCHA_FAILURE'
  | 'BLOCKED_PATH'
  | 'BLOCKED_UA'
  | 'SUSPICIOUS_REQUEST'
  | 'API_ERROR'
  | 'ACCESS_DENIED'
  | 'COTIZACION_SUCCESS'

interface SecurityEvent {
  type: SecurityEventType
  ip: string
  path: string
  method: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

/**
 * Registra un evento de seguridad estructurado
 * Los logs en Vercel se pueden filtrar por el prefijo [SECURITY]
 */
export function logSecurityEvent(
  event: Omit<SecurityEvent, 'timestamp'>
): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  // Nivel de log según severidad
  const highSeverity: SecurityEventType[] = [
    'INJECTION_ATTEMPT',
    'AUTH_FAILURE',
    'ACCESS_DENIED',
  ]

  const prefix = `[SECURITY] [${fullEvent.type}]`
  const logLine = `${prefix} ${fullEvent.ip} ${fullEvent.method} ${fullEvent.path} — ${fullEvent.message}`

  if (highSeverity.includes(event.type)) {
    console.error(logLine, fullEvent.details ?? '')
  } else {
    console.warn(logLine, fullEvent.details ?? '')
  }
}

/**
 * Extrae IP del request de forma segura
 * Compatible con Vercel edge y serverless
 */
export function getRequestIP(request: Request): string {
  const headers = request.headers
  // Priorizar headers controlados por la plataforma (no manipulables por el cliente)
  // x-real-ip: Vercel/Nginx lo setean directamente, un solo valor
  // x-forwarded-for: puede contener múltiples IPs, tomar la primera
  // cf-connecting-ip: Cloudflare, un solo valor
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('cf-connecting-ip') ??
    'unknown'
  )
}

/**
 * Crea un context object para los logs desde un Request
 */
export function createLogContext(request: Request): {
  ip: string
  path: string
  method: string
} {
  const url = new URL(request.url)
  return {
    ip: getRequestIP(request),
    path: url.pathname,
    method: request.method,
  }
}

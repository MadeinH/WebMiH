/**
 * Utilidades de sanitización de entrada
 * OWASP A03 (Injection), A05 (XSS Prevention)
 */

/** Entidades HTML que deben escaparse */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
}

const HTML_ENTITY_REGEX = /[&<>"'`/]/g

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS
 * Usar cuando se renderiza texto del usuario en HTML
 */
export function escapeHtml(input: string | null | undefined): string {
  if (typeof input !== 'string') return ''
  return input.replace(HTML_ENTITY_REGEX, (char) => HTML_ENTITIES[char] ?? char)
}

/**
 * Elimina tags HTML/XML de un string
 * Usar como capa extra de defensa además del escape
 */
export function stripTags(input: string | null | undefined): string {
  if (typeof input !== 'string') return ''
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Sanitiza un string para uso seguro: strip tags + trim + limitar longitud
 * Es la función principal para sanitizar entradas de texto libre
 */
export function sanitizeText(input: string | null | undefined, maxLength = 500): string {
  return stripTags(input).trim().slice(0, maxLength)
}

/**
 * Sanitiza un string para uso en URLs (WhatsApp, enlaces, etc.)
 * Previene inyección de protocolos maliciosos
 */
export function sanitizeForUrl(input: string | null | undefined): string {
  const cleaned = stripTags(input).trim()
  // Bloquear protocolos peligrosos
  if (/^(javascript|data|vbscript|blob):/i.test(cleaned)) {
    return ''
  }
  return cleaned
}

/**
 * Valida y sanitiza un email
 * Retorna null si es inválido
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim().toLowerCase()
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
  return emailRegex.test(trimmed) ? trimmed : null
}

/**
 * Sanitiza un número de teléfono colombiano
 * Retorna solo dígitos, con formato validado
 */
export function sanitizePhone(input: string | null | undefined): string | null {
  if (typeof input !== 'string') return null
  const digits = input.replace(/\D/g, '')
  // Formato colombiano: 57 + 3XXXXXXXXX o 3XXXXXXXXX
  const match = digits.match(/^(?:57)?(3\d{9})$/)
  return match ? match[1] : null
}

/**
 * Verifica que un valor UUID sea válido
 */
export function isValidUUID(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)
}

/**
 * Sanitiza un objeto completo recursivamente
 * Solo sanitiza valores string; deja números y booleanos intactos
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxStringLength = 500
): T {
  const result = {} as Record<string, unknown>
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value, maxStringLength)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>, maxStringLength)
    } else {
      result[key] = value
    }
  }
  return result as T
}

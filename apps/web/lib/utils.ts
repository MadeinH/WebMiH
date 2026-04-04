/**
 * Utilidades compartidas del frontend
 */

/** Formatea un número como precio en COP con separador de miles */
export function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

/** Normaliza una URL pública del sitio y agrega https:// si falta el protocolo */
export function normalizeSiteUrl(siteUrl?: string): string {
  const fallback = 'https://www.madeinhshop.com'
  const rawValue = siteUrl?.trim()

  if (!rawValue) {
    return fallback
  }

  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '')
  } catch {
    return fallback
  }
}

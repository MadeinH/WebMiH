import type { ItemCotizacion } from '@/types/cotizacion'
import { sanitizeText, sanitizeForUrl } from '@/lib/security/sanitize'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '573249207921'
const IG_USERNAME = process.env.NEXT_PUBLIC_IG_USERNAME ?? 'madeinheaven.shop_'

/* ============================================
   WhatsApp
   ============================================ */

/**
 * Construye URL de WhatsApp con mensaje opcional pre-armado.
 * Sanitiza el mensaje para prevenir inyección de protocolos (A05).
 */
export function buildWhatsAppUrl(mensaje?: string): string {
  const base = `https://wa.me/${WA_NUMBER}`
  if (!mensaje) return base
  const clean = sanitizeForUrl(sanitizeText(mensaje, 1000))
  return clean ? `${base}?text=${encodeURIComponent(clean)}` : base
}

/** Construye URL de WhatsApp con los ítems de cotización formateados */
export function buildCotizacionUrl(items: ItemCotizacion[]): string {
  const texto = buildCotizacionText(items)
  return buildWhatsAppUrl(texto)
}

/** Construye URL de WhatsApp para consultar un producto específico */
export function buildProductoUrl(nombre: string): string {
  const clean = sanitizeText(nombre, 200)
  return buildWhatsAppUrl(`Hola! Me interesa el producto: ${clean}. ¿Me pueden dar más info?`)
}

/* ============================================
   Instagram
   ============================================ */

/**
 * Construye URL de Instagram Direct.
 * Usa ig.me/m/<username> (deep link oficial de Meta).
 * El texto se copia al portapapeles antes de abrir porque IG no soporta
 * parámetros de texto en la URL de DM.
 */
export function buildInstagramDMUrl(): string {
  return `https://ig.me/m/${IG_USERNAME}`
}

/* ============================================
   Utilidades compartidas
   ============================================ */

/** Genera el texto formateado de la cotización (reutilizable entre canales) */
export function buildCotizacionText(items: ItemCotizacion[]): string {
  const lineas = items
    .map((i) => {
      const nombre = sanitizeText(i?.nombre, 200)
      const variantes = sanitizeText(i?.variantes, 200)
      const cantidad = typeof i?.cantidad === 'number' && Number.isFinite(i.cantidad) ? Math.max(1, Math.floor(i.cantidad)) : 1

      if (!nombre && !variantes) return null

      const nombreSafe = nombre || 'Producto'
      const variantesSafe = variantes || 'Por definir'
      const comentario = i?.comentario ? ` — ${sanitizeText(i.comentario, 200)}` : ''
      return `• ${nombreSafe} (${variantesSafe}) x${cantidad}${comentario}`
    })
    .filter((linea): linea is string => Boolean(linea))

  if (lineas.length === 0) {
    return 'Hola! Quiero cotizar un pedido. ¿Me pueden ayudar con el proceso?'
  }

  return `Hola! Quiero cotizar:\n${lineas.join('\n')}`
}

/**
 * Copia texto al portapapeles del usuario.
 * Útil para Instagram donde no se puede pre-rellenar el mensaje vía URL.
 * Retorna true si se copió exitosamente.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

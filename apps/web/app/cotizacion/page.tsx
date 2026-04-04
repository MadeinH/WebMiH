import { redirect } from 'next/navigation'

/**
 * Ruta de compatibilidad: la experiencia de cotización/pago se unificó en /carrito.
 */
export default function CotizacionPage() {
  redirect('/carrito')
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import { useCart } from '@/lib/cart-context'
import { useRecaptcha } from '@/lib/recaptcha'
import { formatCOP } from '@/lib/utils'

function isPayable(item) {
  return !item.soloWhatsApp && typeof item.precioUnitario === 'number' && item.precioUnitario > 0
}

export default function CarritoPage() {
  const { items, removeItem, clearCart } = useCart()
  const { executeRecaptcha } = useRecaptcha()
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [message, setMessage] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const { payableItems, quoteItems, totalPayable } = useMemo(() => {
    const indexed = items.map((item, index) => ({ item, index }))
    const payables = indexed.filter(({ item }) => isPayable(item))
    const quotes = indexed.filter(({ item }) => !isPayable(item))
    const total = payables.reduce((sum, entry) => sum + (entry.item.cantidad * (entry.item.precioUnitario ?? 0)), 0)

    return {
      payableItems: payables,
      quoteItems: quotes,
      totalPayable: total,
    }
  }, [items])

  async function handlePayWithWompi() {
    if (payableItems.length === 0) {
      setMessage('No tienes productos pagables en el carrito.')
      return
    }

    if (!nombre.trim() || !email.trim()) {
      setMessage('Debes completar nombre y email para continuar con el pago.')
      return
    }

    setSubmittingPayment(true)
    setMessage('Creando sesión de pago...')

    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || undefined,
          items: payableItems.map(({ item }) => ({
            productoId: item.productoId,
            nombre: item.nombre,
            variantes: item.variantes,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            comentario: item.comentario,
          })),
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.checkoutUrl) {
        setMessage(payload?.error ?? 'No se pudo iniciar el pago. Intenta de nuevo.')
        return
      }

      window.location.href = payload.checkoutUrl
    } catch {
      setMessage('No se pudo conectar con el servicio de pagos.')
    } finally {
      setSubmittingPayment(false)
    }
  }

  async function handleSendQuoteToPanel() {
    if (quoteItems.length === 0) {
      setMessage('No hay productos pendientes de cotización.')
      return
    }

    if (!nombre.trim() || !email.trim() || !whatsapp.trim()) {
      setMessage('Para enviar al panel debes completar nombre, email y WhatsApp.')
      return
    }

    setSubmittingQuote(true)
    setMessage('Enviando solicitud de cotización al panel...')

    try {
      const recaptchaToken = await executeRecaptcha('submit_cotizacion')

      const response = await fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          comentarios: `Solicitud creada desde carrito. Ítems para cotizar: ${quoteItems.length}.`,
          recaptchaToken,
          items: quoteItems.map(({ item }) => ({
            productoId: item.productoId,
            nombre: item.nombre,
            variantes: item.variantes,
            cantidad: item.cantidad,
            comentario: item.comentario,
          })),
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(payload?.error ?? 'No se pudo enviar la solicitud de cotización.')
        return
      }

      setMessage('Solicitud enviada al panel de administración. Te contactaremos pronto para gestionar el estampado.')
    } catch {
      setMessage('No se pudo conectar con el panel de cotización.')
    } finally {
      setSubmittingQuote(false)
    }
  }

  return (
    <SectionWrapper>
      <div className="mb-10 text-center">
        <Badge variant="lilac">Carrito</Badge>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
          Resumen de compra y cotización
        </h1>
        <p className="mt-3 text-heaven-muted">Separamos lo pagable de lo que requiere cotización personalizada.</p>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-heaven-divider bg-heaven-bg-card p-8 text-center">
          <p className="text-heaven-muted">Tu carrito está vacío.</p>
          <CTAButton href="/catalogo" variant="primary" className="mt-6">
            Ir al catálogo
          </CTAButton>
        </div>
      ) : (
        <div className="grid gap-6 mx-auto grid-cols-1 max-w-4xl">
          <section className="rounded-2xl border border-heaven-divider bg-heaven-bg-card p-5">
            <h2 className="font-display text-2xl uppercase text-heaven-text">Productos con precio</h2>
            <p className="mt-2 text-xs text-heaven-muted">
              En pedidos de prendas al por mayor, aquí pagas solo la prenda base.
            </p>
            <div className="mt-4 space-y-3">
              {payableItems.length === 0 && (
                <p className="text-sm text-heaven-muted">No hay productos pagables en este carrito.</p>
              )}

              {payableItems.map(({ item, index }) => (
                <article key={`${item.productoId}-${index}`} className="rounded-lg border border-heaven-divider bg-heaven-bg-dark p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] items-start gap-4">
                    <div>
                      <p className="font-semibold text-heaven-text">{item.nombre}</p>
                      <p className="text-xs text-heaven-muted">{item.variantes}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-heaven-lilac font-display">{item.cantidad} x {formatCOP(item.precioUnitario ?? 0)}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-2 cursor-pointer text-xs text-heaven-muted transition-colors duration-200 hover:text-heaven-rose"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-heaven-divider pt-4">
              <div className="mb-4 grid gap-3">
                <input
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Nombre completo"
                  className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
                />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  type="email"
                  className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
                />
                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="WhatsApp (opcional)"
                  type="tel"
                  className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
                />
              </div>

              <p className="text-sm text-heaven-muted">Total</p>
              <p className="font-display text-3xl text-heaven-text">{formatCOP(totalPayable)}</p>
              <CTAButton
                variant="primary"
                type="button"
                onClick={handlePayWithWompi}
                disabled={submittingPayment || payableItems.length === 0}
                className="mt-4 w-full"
              >
                {submittingPayment ? 'Procesando...' : 'Pagar con Wompi'}
              </CTAButton>
            </div>
          </section>

          {/* Sección de cotizaciones movida al flujo unificado; el carrito muestra aquí solo productos pagables. */}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={clearCart}
          className="cursor-pointer rounded-lg border border-heaven-divider px-4 py-2 text-sm text-heaven-muted transition-colors duration-200 hover:text-heaven-rose"
        >
          Vaciar carrito
        </button>
        <Link href="/catalogo" className="text-sm text-heaven-lilac underline transition-colors duration-200 hover:text-heaven-mint">
          Seguir comprando
        </Link>
      </div>

      {message && <p className="mt-4 text-sm text-heaven-muted">{message}</p>}
    </SectionWrapper>
  )
}

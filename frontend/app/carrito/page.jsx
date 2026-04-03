'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import { useCart } from '@/lib/cart-context'
import { buildCotizacionUrl } from '@/lib/whatsapp'
import { formatCOP } from '@/lib/utils'

function isPayable(item) {
  return !item.soloWhatsApp && typeof item.precioUnitario === 'number' && item.precioUnitario > 0
}

export default function CarritoPage() {
  const { items, removeItem, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const { payableItems, quoteItems, totalPayable } = useMemo(() => {
    const payables = items.filter(isPayable)
    const quotes = items.filter((item) => !isPayable(item))
    const total = payables.reduce((sum, item) => sum + (item.cantidad * (item.precioUnitario ?? 0)), 0)

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

    setSubmitting(true)
    setMessage('Creando sesión de pago...')

    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || undefined,
          items: payableItems.map((item) => ({
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
      setSubmitting(false)
    }
  }

  const cotizacionHref = quoteItems.length > 0 ? buildCotizacionUrl(quoteItems) : '/cotizacion'

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
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-heaven-divider bg-heaven-bg-card p-6">
            <h2 className="font-display text-2xl uppercase text-heaven-text">Productos con precio</h2>
            <div className="mt-4 space-y-3">
              {payableItems.length === 0 && (
                <p className="text-sm text-heaven-muted">No hay productos pagables en este carrito.</p>
              )}

              {payableItems.map((item, index) => (
                <article key={`${item.productoId}-${index}`} className="rounded-lg border border-heaven-divider bg-heaven-bg-dark p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-heaven-text">{item.nombre}</p>
                      <p className="text-xs text-heaven-muted">{item.variantes}</p>
                      <p className="mt-1 text-sm text-heaven-lilac">
                        {item.cantidad} x {formatCOP(item.precioUnitario ?? 0)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(items.indexOf(item))}
                      className="cursor-pointer text-xs text-heaven-muted transition-colors duration-200 hover:text-heaven-rose"
                    >
                      Eliminar
                    </button>
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
                disabled={submitting || payableItems.length === 0}
                className="mt-4 w-full"
              >
                {submitting ? 'Procesando...' : 'Pagar con Wompi'}
              </CTAButton>
            </div>
          </section>

          <section className="rounded-2xl border border-heaven-divider bg-heaven-bg-card p-6">
            <h2 className="font-display text-2xl uppercase text-heaven-text">Productos para cotizar</h2>
            <div className="mt-4 space-y-3">
              {quoteItems.length === 0 && (
                <p className="text-sm text-heaven-muted">No hay productos pendientes de cotización.</p>
              )}

              {quoteItems.map((item, index) => (
                <article key={`${item.productoId}-${index}`} className="rounded-lg border border-heaven-divider bg-heaven-bg-dark p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-heaven-text">{item.nombre}</p>
                      <p className="text-xs text-heaven-muted">{item.variantes}</p>
                      <p className="mt-1 text-sm text-heaven-mint">Cantidad: {item.cantidad}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(items.indexOf(item))}
                      className="cursor-pointer text-xs text-heaven-muted transition-colors duration-200 hover:text-heaven-rose"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <CTAButton
              variant="whatsapp"
              href={cotizacionHref}
              external={quoteItems.length > 0}
              className="mt-6 w-full"
              disabled={quoteItems.length === 0}
            >
              Cotizar por WhatsApp
            </CTAButton>
          </section>
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

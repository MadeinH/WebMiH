'use client'

import { useState } from 'react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import GlowDivider from '@/components/ui/GlowDivider'
import {
  buildCotizacionUrl,
  buildCotizacionText,
  buildInstagramDMUrl,
  copyToClipboard,
} from '@/lib/whatsapp'
import { cotizacionSchema } from '@/lib/validations'
import { useCart } from '@/lib/cart-context'
import type { ItemCotizacion } from '@/types/cotizacion'

/** Página de cotización — carrito + formulario que redirige a WhatsApp o Instagram */
export default function CotizacionPage() {
  const { items, removeItem, clearCart, totalItems } = useCart()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [igCopied, setIgCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  /** Validación del formulario con Zod */
  function validate(): boolean {
    const result = cotizacionSchema.safeParse({ nombre, email, whatsapp, comentarios })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  /** Construye los ítems para el mensaje */
  function getItemsParaMensaje(): ItemCotizacion[] {
    return items.length > 0
      ? items
      : [
          {
            productoId: '00000000-0000-0000-0000-000000000000',
            nombre: 'Consulta general',
            variantes: 'Por definir',
            cantidad: 1,
            comentario: comentarios || undefined,
          },
        ]
  }

  async function submitCotizacion(): Promise<boolean> {
    const payload = {
      nombre,
      email,
      whatsapp,
      comentarios: comentarios || undefined,
      items: getItemsParaMensaje(),
    }

    const response = await fetch('/api/cotizacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      setSubmitMessage(data?.error ?? 'No se pudo enviar la cotización. Intenta nuevamente.')
      return false
    }

    setSubmitMessage('Cotización registrada. Te redirigimos a tu canal de contacto.')
    return true
  }

  /** Enviar cotización vía WhatsApp */
  function handleWhatsApp(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitMessage('')

    void (async () => {
      const ok = await submitCotizacion()
      if (ok) {
        const url = buildCotizacionUrl(getItemsParaMensaje())
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      setSubmitting(false)
    })()
  }

  /** Enviar cotización vía Instagram DM */
  async function handleInstagram() {
    if (!validate()) return

    setSubmitting(true)
    setSubmitMessage('')

    const saved = await submitCotizacion()
    if (!saved) {
      setSubmitting(false)
      return
    }

    // Instagram DM no soporta texto pre-rellenado en la URL,
    // así que copiamos el mensaje al portapapeles del usuario
    const texto = buildCotizacionText(getItemsParaMensaje())
    const copied = await copyToClipboard(texto)

    if (copied) {
      setIgCopied(true)
      setTimeout(() => setIgCopied(false), 4000)
    }

    // Abrir Instagram DM (el usuario pega el mensaje)
    window.open(buildInstagramDMUrl(), '_blank', 'noopener,noreferrer')
    setSubmitting(false)
  }

  return (
    <SectionWrapper>
      <div className="mb-12 text-center">
        <Badge variant="lilac">Cotización</Badge>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
          Solicita tu Cotización
        </h1>
        <p className="mt-4 text-heaven-muted">
          Completa el formulario y elige cómo quieres que te contactemos.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Carrito de ítems */}
        {items.length > 0 && (
          <div className="mb-8 rounded-2xl border border-heaven-divider bg-heaven-bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl uppercase tracking-wide text-heaven-text">
                Tu selección ({totalItems} {totalItems === 1 ? 'unidad' : 'unidades'})
              </h2>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-heaven-muted transition-colors hover:text-heaven-rose"
              >
                Vaciar carrito
              </button>
            </div>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-heaven-text">{item.nombre}</p>
                    <p className="text-xs text-heaven-muted">{item.variantes}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-heaven-lilac">x{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-heaven-muted transition-colors hover:text-heaven-rose"
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length === 0 && (
          <div className="mb-8 rounded-2xl border border-heaven-divider/50 bg-heaven-bg-card/50 p-8 text-center">
            <p className="text-heaven-muted">
              No tienes productos seleccionados aún. Puedes agregar productos desde el{' '}
              <a href="/catalogo" className="text-heaven-lilac underline">
                catálogo
              </a>
              , o simplemente completar el formulario para una consulta general.
            </p>
          </div>
        )}

        <GlowDivider />

        {/* Formulario */}
        <form onSubmit={handleWhatsApp} className="mt-8 space-y-6" noValidate>
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-heaven-text">
              Nombre completo *
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-heaven-text placeholder:text-heaven-muted/50 focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-heaven-rose">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-heaven-text">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-heaven-text placeholder:text-heaven-muted/50 focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-heaven-rose">{errors.email}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-heaven-text">
              WhatsApp *
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="3001234567"
              className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-heaven-text placeholder:text-heaven-muted/50 focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
            />
            {errors.whatsapp && (
              <p className="mt-1 text-xs text-heaven-rose">{errors.whatsapp}</p>
            )}
            <p className="mt-1 text-xs text-heaven-muted">Número colombiano (ej: 3001234567)</p>
          </div>

          {/* Comentarios */}
          <div>
            <label htmlFor="comentarios" className="mb-2 block text-sm font-medium text-heaven-text">
              Comentarios adicionales
            </label>
            <textarea
              id="comentarios"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Cuéntanos sobre tu idea, diseño, colores, cantidades..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-heaven-text placeholder:text-heaven-muted/50 focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
            />
            <p className="mt-1 text-xs text-heaven-muted">
              {comentarios.length}/500 caracteres
            </p>
          </div>

          {/* Submit — dos opciones de envío */}
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-heaven-text">
              Elige cómo enviar tu cotización:
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <CTAButton variant="whatsapp" type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar por WhatsApp'}
              </CTAButton>

              <CTAButton
                variant="instagram"
                type="button"
                onClick={handleInstagram}
                disabled={submitting}
                className="flex-1"
              >
                {igCopied ? '¡Mensaje copiado! Pégalo en el DM' : 'Enviar por Instagram'}
              </CTAButton>
            </div>
          </div>

          {submitMessage && (
            <p className="text-center text-sm text-heaven-muted">{submitMessage}</p>
          )}

          {/* Nota informativa */}
          <div className="space-y-1 text-center text-xs text-heaven-muted">
            <p>
              <strong>WhatsApp:</strong> Se abre una conversación con tu mensaje pre-armado.
            </p>
            <p>
              <strong>Instagram:</strong> Se copia tu mensaje al portapapeles y se abre nuestro DM para que lo pegues.
            </p>
          </div>
        </form>
      </div>
    </SectionWrapper>
  )
}

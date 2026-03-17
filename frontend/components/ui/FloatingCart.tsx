'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import CTAButton from '@/components/ui/CTAButton'
import { formatCOP } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/**
 * Carrito flotante — visible desde cualquier página
 * Se abre/cierra con un botón FAB y muestra items agregados
 */
export default function FloatingCart() {
  const { items, removeItem, clearCart, totalItems } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  // Calcular total simplificado (suma cantidad * 1 como base)
  // En realidad necesitaría el precio de cada item, que no almacenamos en cart
  const cartSummary = items.map((item, idx) => ({
    ...item,
    index: idx,
  }))

  if (!isOpen && totalItems === 0) {
    return null // No mostrar nada si carrito vacío y cerrado
  }

  return (
    <>
      {/* Botón FAB (Floating Action Button) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-heaven-lilac text-white shadow-lg transition-all hover:shadow-xl hover:scale-110"
        aria-label={`Carrito (${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'})`}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2-8m0 0h3.6l.4-2"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-heaven-rose text-xs font-bold text-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Overlay (cuando está abierto) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel flotante del carrito */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-heaven-divider bg-heaven-bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="border-b border-heaven-divider p-4">
            <h2 className="font-display text-lg uppercase tracking-wide text-heaven-text">
              Mi Cotización
            </h2>
            <p className="text-xs text-heaven-muted">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>

          {/* Lista de items */}
          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {cartSummary.length === 0 ? (
              <p className="text-center text-sm text-heaven-muted py-8">
                Tu carrito está vacío
              </p>
            ) : (
              cartSummary.map((item) => (
                <div
                  key={`${item.productoId}-${item.index}`}
                  className="flex items-start justify-between gap-3 rounded-lg bg-heaven-bg-dark p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-heaven-text truncate">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-heaven-muted">
                      Material: {item.variantes}
                    </p>
                    <p className="text-xs text-heaven-lilac font-semibold mt-1">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.index)}
                    className="text-heaven-muted text-xs font-semibold hover:text-heaven-rose transition-colors"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Acciones */}
          {cartSummary.length > 0 && (
            <div className="border-t border-heaven-divider p-4 space-y-3">
              <CTAButton
                variant="whatsapp"
                href={buildWhatsAppUrl(generateCartMessage(cartSummary))}
                external
                className="w-full"
              >
                Enviar Cotización por WhatsApp
              </CTAButton>
              <button
                onClick={() => clearCart()}
                className="w-full px-4 py-2 text-sm font-semibold text-heaven-muted hover:text-heaven-rose transition-colors"
              >
                Limpiar carrito
              </button>
            </div>
          )}

          {/* Botón cerrar */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-heaven-muted hover:text-heaven-text transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

/**
 * Genera el mensaje de WhatsApp con los items del carrito
 */
function generateCartMessage(items: { nombre: string; variantes: string; cantidad: number }[]): string {
  if (items.length === 0) return 'Hola, quiero cotizar un producto'

  const itemList = items
    .map((item, idx) => `${idx + 1}. ${item.nombre} - Cantidad: ${item.cantidad} - Material: ${item.variantes}`)
    .join('\n')

  return `¡Hola! Quisiera cotizar lo siguiente:\n\n${itemList}\n\n¿Pueden ayudarme con un presupuesto?`
}

'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart-context'

/**
 * Carrito flotante — visible desde cualquier página
 * Se abre/cierra con un botón FAB y muestra items agregados
 */
export default function FloatingCart() {
  const { items, removeItem, clearCart, totalItems } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleOpenCart() {
      setIsOpen(true)
    }

    window.addEventListener('mih:open-cart', handleOpenCart)
    return () => window.removeEventListener('mih:open-cart', handleOpenCart)
  }, [])

  // Calcular total e información del carrito
  const cartSummary = items.map((item, idx) => ({
    ...item,
    index: idx,
    subtotal: (item.precioUnitario ?? 0) * item.cantidad,
  }))

  const totalPrice = cartSummary.reduce((sum, item) => sum + item.subtotal, 0)
  const payableItems = cartSummary.filter((item) => (item.precioUnitario ?? 0) > 0)
  const quoteItems = cartSummary.filter((item) => (item.precioUnitario ?? 0) === 0 || item.soloWhatsApp)

  const visibleCount = payableItems.length
  const visibleUnits = payableItems.reduce((s, i) => s + i.cantidad, 0)

  return (
    <>
      {/* FAB removed — open the floating cart from the Navbar button (dispatch 'mih:open-cart') */}

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
        <div className="fixed top-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-heaven-divider bg-heaven-bg-card shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col">
          <div className="border-b border-heaven-divider p-4">
            <h2 className="font-display text-lg uppercase tracking-wide text-heaven-text">
              Mi Cotización
            </h2>
            <p className="text-xs text-heaven-muted">
              {visibleCount} {visibleCount === 1 ? 'producto' : 'productos'} — {visibleUnits} {visibleUnits === 1 ? 'unidad' : 'unidades'}
            </p>
          </div>

          {/* Lista de items (solo elementos pagables) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {payableItems.length === 0 ? (
                  <p className="text-center text-sm text-heaven-muted py-8">Tu carrito está vacío</p>
                ) : (
                  payableItems.map((item) => (
                    <div
                      key={`${item.productoId}-${item.index}`}
                      className="flex items-start justify-between gap-3 rounded-lg bg-heaven-bg-dark p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-heaven-text truncate">{item.nombre}</p>
                        <p className="text-xs text-heaven-muted">{item.variantes}</p>
                        <p className="text-xs text-heaven-lilac font-semibold mt-1">Cantidad: {item.cantidad}</p>
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

                {/* Nota: no listamos aquí los productos para cotizar - la gestión se hace desde la página de carrito. */}
              </div>

          {/* Acciones */}
          {cartSummary.length > 0 && (
            <div className="border-t border-heaven-divider p-4 space-y-3 bg-heaven-bg-dark/50">
              <div className="flex items-center justify-between text-sm font-semibold text-heaven-text">
                <span>Total</span>
                <span className="text-lg text-heaven-lilac">${totalPrice.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="/carrito"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 bg-heaven-lilac text-heaven-bg-dark font-bold rounded-full text-center transition-all duration-200 hover:bg-heaven-mint"
                >
                  Revisar carrito y enviar solicitud
                </a>
              </div>
              <button
                onClick={() => { clearCart(); setIsOpen(false); }}
                className="w-full px-4 py-1 text-xs font-semibold text-heaven-muted hover:text-heaven-rose transition-colors"
              >
                Vaciar carrito
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

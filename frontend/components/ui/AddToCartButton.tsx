'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import CTAButton from '@/components/ui/CTAButton'
import type { ItemCotizacion } from '@/types/cotizacion'

interface AddToCartButtonProps {
  productoId: string
  nombre: string
  material: string
}

/** Botón para agregar un producto al carrito de cotización */
export default function AddToCartButton({ productoId, nombre, material }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    const item: ItemCotizacion = {
      productoId,
      nombre,
      variantes: material,
      cantidad,
    }
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="flex items-center gap-3">
      {/* Selector de cantidad */}
      <div className="flex items-center rounded-lg border border-heaven-divider">
        <button
          type="button"
          onClick={() => setCantidad((c) => Math.max(1, c - 1))}
          className="px-3 py-2 text-heaven-muted transition-colors hover:text-heaven-text"
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-sm font-semibold text-heaven-text">
          {cantidad}
        </span>
        <button
          type="button"
          onClick={() => setCantidad((c) => Math.min(999, c + 1))}
          className="px-3 py-2 text-heaven-muted transition-colors hover:text-heaven-text"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <CTAButton
        variant="outline"
        type="button"
        onClick={handleAdd}
        className="flex-1"
      >
        {added ? '✓ ¡Agregado!' : 'Agregar a cotización'}
      </CTAButton>
    </div>
  )
}

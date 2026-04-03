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
    <div className="space-y-4">
      {/* Selector de cantidad personalizado (sin input default) */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-heaven-text">Cantidad:</label>
        <div className="flex items-center rounded-lg border-2 border-heaven-lilac bg-heaven-bg-dark">
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="px-4 py-2 text-heaven-lilac transition-colors hover:bg-heaven-divider/30"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center font-display text-lg font-bold text-heaven-text">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.min(999, c + 1))}
            className="px-4 py-2 text-heaven-lilac transition-colors hover:bg-heaven-divider/30"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      {/* Botón agregar a cotización */}
      <CTAButton
        variant="outline"
        type="button"
        onClick={handleAdd}
        className="w-full"
      >
        {added ? 'Agregado a la cotización' : 'Agregar a cotización'}
      </CTAButton>
    </div>
  )
}

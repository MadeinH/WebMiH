'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import MaterialSelector from './MaterialSelector'
import PriceTable from './PriceTable'
import CTAButton from './CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { ManagedItem } from '@/lib/content/types'

interface ProductQuotationFormProps {
  producto: ManagedItem
}

/**
 * Formulario de cotización integrado — cantidad, color, material, precio, botones
 */
export default function ProductQuotationForm({ producto }: ProductQuotationFormProps) {
  const { addItem } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [color, setColor] = useState('')
  const [material, setMaterial] = useState(() => {
    // Extraer primer material disponible
    const mats = producto.material.split('/').map((m) => m.trim())
    return mats[0] || producto.material
  })
  const [added, setAdded] = useState(false)

  // Técnicas disponibles según cantidad
  const getTecnicas = () => {
    if (cantidad < 3) return ['DTF', 'Sublimación', 'Bordado', 'Vinil Textil']
    if (cantidad < 6) return ['DTF',  'Serigrafía', 'Bordado', 'Vinil Textil']
    if (cantidad < 12) return ['DTF', 'Serigrafía', 'Bordado', 'Vinil Textil']
    return ['DTF', 'Serigrafía (opción económica)', 'Bordado', 'Vinil Textil']
  }

  // Texto dinámico según cantidad
  const getQuotationNote = () => {
    if (cantidad < 3) {
      return 'Precios en COP por unidad · Incluye prenda + estampado base'
    }
    if (cantidad < 6) {
      return 'Precios en COP por unidad · Precios al por mayor · Estampado por cotizar · Vinil textil disponible'
    }
    if (cantidad < 12) {
      return 'Precios en COP por unidad · Precios al por mayor · Estampado por cotizar · Vinil textil disponible'
    }
    return 'Precios en COP por unidad · Mayoreo 12+ · Estampado por cotizar · Serigrafía disponible · Contacta para precio final'
  }

  function handleAddToCart() {
    const item = {
      productoId: producto.id,
      nombre: producto.nombre,
      variantes: `Color: ${color || 'N/A'} | Material: ${material}`,
      cantidad,
    }
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  function handleWhatsApp() {
    const msg = `Hola! Quiero cotizar:\n\n` +
      `• Producto: ${producto.nombre}\n` +
      `• Cantidad: ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}\n` +
      `• Material: ${material}\n` +
      `• Color deseado: ${color || 'Por definir'}\n` +
      `• Técnicas disponibles: ${getTecnicas().join(', ')}`
    window.open(buildWhatsAppUrl(msg), '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Color deseado */}
      <div>
        <label htmlFor="color" className="mb-2 block text-sm font-medium text-heaven-text">
          Color deseado
        </label>
        <input
          id="color"
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="Ej: azul marino, negro, blanco"
          className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-heaven-text placeholder:text-heaven-muted/50 focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
        />
        <p className="mt-1 text-xs text-heaven-muted">Sujeto a disponibilidad del material</p>
      </div>

      {/* Material */}
      <MaterialSelector
        materialesText={producto.material}
        value={material}
        onChange={setMaterial}
      />

      {/* Tabla de precios */}
      {Object.values(producto.priceMatrix).some((v) => v !== null) && (
        <div className="space-y-4">
          <h3 className="font-display text-xl uppercase tracking-wide text-heaven-text">
            Precios por cantidad
          </h3>
          <PriceTable
            detal_carta={producto.priceMatrix.detalCarta ?? 0}
            detal_estandar={producto.priceMatrix.detalEstandar ?? 0}
            mayoreo_3={producto.priceMatrix.mayoreo3 ?? 0}
            mayoreo_6={producto.priceMatrix.mayoreo6 ?? 0}
            mayoreo_12={producto.priceMatrix.mayoreo12 ?? 0}
          />
          <p className="text-xs text-heaven-muted">{getQuotationNote()}</p>
        </div>
      )}

      {/* Cantidad */}
      <div className="space-y-3">
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

        {/* Técnicas disponibles (dinámico) */}
        <div className="rounded-lg bg-heaven-bg-card p-4">
          <p className="text-xs font-semibold text-heaven-lilac mb-2">Técnicas disponibles para {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}:</p>
          <div className="flex flex-wrap gap-2">
            {getTecnicas().map((t) => (
              <span key={t} className="rounded-full border border-heaven-divider bg-heaven-bg-dark px-3 py-1 text-xs text-heaven-muted">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        <CTAButton
          variant="outline"
          type="button"
          onClick={handleAddToCart}
          className="w-full"
        >
          {added ? '✓ ¡Agregado a la cotización!' : 'Agregar al carrito de cotización'}
        </CTAButton>
        <CTAButton
          variant="whatsapp"
          type="button"
          onClick={handleWhatsApp}
          className="w-full"
        >
          Cotizar por WhatsApp
        </CTAButton>
      </div>
    </div>
  )
}

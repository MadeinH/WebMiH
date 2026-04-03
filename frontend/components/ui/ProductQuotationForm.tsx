'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import MaterialSelector from './MaterialSelector'
import PriceTable from './PriceTable'
import CTAButton from './CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { ItemCotizacion } from '@/types/cotizacion'
import type { ManagedItem } from '@/lib/content/types'

interface ProductQuotationFormProps {
  producto: ManagedItem
}

/**
 * Formulario de cotización integrado — cantidad, color, material, precio, botones
 */
export default function ProductQuotationForm({ producto }: ProductQuotationFormProps) {
  const { addItem } = useCart()
  const isAccessory = producto.type === 'accessory'
  const [cantidad, setCantidad] = useState(1)
  const [color, setColor] = useState('')
  const [material, setMaterial] = useState(() => {
    // Extraer primer material disponible
    const mats = producto.material.split('/').map((m) => m.trim())
    return mats[0] || producto.material
  })
  const [selectedVariant, setSelectedVariant] = useState(() => producto.variants?.[0]?.label ?? '')
  const [tecnicaSeleccionada, setTecnicaSeleccionada] = useState('')
  const [added, setAdded] = useState(false)

  function getUnitPrice(): number {
    if (isAccessory && selectedVariant && Array.isArray(producto.variants)) {
      const variantPrice = producto.variants.find((variant) => variant.label === selectedVariant)?.price
      return typeof variantPrice === 'number' ? variantPrice : 0
    }

    if (cantidad >= 12 && typeof producto.priceMatrix.mayoreo12 === 'number') return producto.priceMatrix.mayoreo12
    if (cantidad >= 6 && typeof producto.priceMatrix.mayoreo6 === 'number') return producto.priceMatrix.mayoreo6
    if (cantidad >= 3 && typeof producto.priceMatrix.mayoreo3 === 'number') return producto.priceMatrix.mayoreo3

    if (typeof producto.priceMatrix.detalCarta === 'number') return producto.priceMatrix.detalCarta
    if (typeof producto.priceMatrix.detalEstandar === 'number') return producto.priceMatrix.detalEstandar
    return 0
  }

  function materialPermiteSublimacion(materialText: string): boolean {
    const value = materialText.toLowerCase()
    return (
      value.includes('poliester') ||
      value.includes('poliéster') ||
      value.includes('piel de algodon') ||
      value.includes('piel de algodón') ||
      value.includes('piel de durazno')
    )
  }

  const tecnicasDisponibles = useMemo(() => {
    if (isAccessory) return []

    const tecnicas = ['DTF']
    if (materialPermiteSublimacion(material)) {
      tecnicas.push('Sublimación')
    }
    if (cantidad >= 6) {
      tecnicas.push('Vinil Textil')
    }
    if (cantidad >= 12) {
      tecnicas.push('Serigrafía')
    }

    return tecnicas
  }, [cantidad, isAccessory, material])

  useEffect(() => {
    if (isAccessory) {
      setTecnicaSeleccionada('Estampado estándar')
      return
    }

    if (!tecnicasDisponibles.includes(tecnicaSeleccionada)) {
      setTecnicaSeleccionada(tecnicasDisponibles[0] ?? 'DTF')
    }
  }, [isAccessory, tecnicaSeleccionada, tecnicasDisponibles])

  // Texto dinámico según cantidad
  const getQuotationNote = () => {
    if (cantidad <= 2) {
      return 'Precios en COP por unidad · Incluye prenda + estampado · No incluye envío'
    }
    if (cantidad >= 3) {
      return 'Precios en COP por unidad · Incluye solo la prenda · Estampado se cotiza por separado'
    }
    return ''
  }

  function handleAddToCart() {
    const partes: string[] = []
    if (!isAccessory) {
      partes.push(`Color: ${color || 'Por definir'}`)
    }
    partes.push(`Material: ${material}`)
    if (selectedVariant) {
      partes.push(`Tamaño: ${selectedVariant}`)
    }
    partes.push(`Técnica: ${tecnicaSeleccionada}`)

    const item: ItemCotizacion = {
      productoId: producto.id,
      nombre: producto.nombre,
      variantes: partes.join(' | '),
      cantidad,
      precioUnitario: getUnitPrice(),
      soloWhatsApp: producto.soloCotizar,
      slug: producto.slug,
      imagenUrl: producto.imagenUrl ?? undefined,
    }

    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  function handleWhatsApp() {
    const msgBase = `Hola! Quiero cotizar:\n\n` +
      `• Producto: ${producto.nombre}\n` +
      `• Cantidad: ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}\n` +
      `• Material: ${material}\n` +
      (selectedVariant ? `• Tamaño: ${selectedVariant}\n` : '') +
      (!isAccessory ? `• Color deseado: ${color || 'Por definir'}\n` : '') +
      `• Técnica: ${tecnicaSeleccionada}`

    window.open(buildWhatsAppUrl(msgBase), '_blank')
  }

  return (
    <div className="space-y-6">
      {!isAccessory && (
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
      )}

      {/* Material */}
      <MaterialSelector
        materialesText={producto.material}
        value={material}
        onChange={setMaterial}
      />

      {isAccessory && (producto.variants?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-heaven-text">Tamaño / presentación</label>
          <div className="flex flex-wrap gap-2">
            {producto.variants?.map((variant) => (
              <button
                key={variant.label}
                type="button"
                onClick={() => setSelectedVariant(variant.label)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                  selectedVariant === variant.label
                    ? 'border-heaven-lilac bg-heaven-lilac text-heaven-bg-dark'
                    : 'border-heaven-divider bg-heaven-bg-dark text-heaven-text hover:border-heaven-lilac hover:text-heaven-lilac'
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
            cantidad={cantidad}
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

        {!isAccessory && (
          <div className="rounded-lg bg-heaven-bg-card p-4">
            <p className="mb-2 text-xs font-semibold text-heaven-lilac">
              Técnica para {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}:
            </p>
            <div className="flex flex-wrap gap-2">
              {tecnicasDisponibles.map((tecnica) => (
                <button
                  key={tecnica}
                  type="button"
                  onClick={() => setTecnicaSeleccionada(tecnica)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    tecnicaSeleccionada === tecnica
                      ? 'border-heaven-lilac bg-heaven-lilac text-heaven-bg-dark'
                      : 'border-heaven-divider bg-heaven-bg-dark text-heaven-muted hover:border-heaven-lilac hover:text-heaven-lilac'
                  }`}
                >
                  {tecnica}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        <CTAButton
          variant="outline"
          type="button"
          onClick={handleAddToCart}
          className="w-full"
        >
          {added ? 'Agregado a la cotización' : 'Agregar al carrito de cotización'}
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

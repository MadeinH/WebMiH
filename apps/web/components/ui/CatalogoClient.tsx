'use client'

import { useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import CatalogoFilter from '@/components/ui/CatalogoFilter'
import type { ManagedItem } from '@/lib/content/types'
import { getStartingPrice } from '@/lib/content/pricing'

const VALID_CATS = new Set<string>(['camisetas', 'hoodies', 'chaquetas', 'deportiva'])
const PRICE_RANGES = [
  { label: 'Hasta $50k', min: 0, max: 50000 },
  { label: '$50k - $100k', min: 50000, max: 100000 },
  { label: '$100k - $150k', min: 100000, max: 150000 },
  { label: '+$150k', min: 150000, max: Infinity },
]

function getCategoryFromHash(hash: string): string | null {
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash
  return VALID_CATS.has(rawHash) ? rawHash : null
}

interface CatalogoClientProps {
  items: ManagedItem[]
}

interface Filters {
  category: string | null
  priceRange: { min: number; max: number } | null
}

export default function CatalogoClient({ items }: CatalogoClientProps) {
  const [filters, setFilters] = useState<Filters>({ category: null, priceRange: null })
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')

  useEffect(() => {
    function syncFromHash() {
      const cat = getCategoryFromHash(window.location.hash)
      setFilters((prev) => ({ ...prev, category: cat }))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  function handleCategoryChange(nextCat: string | null) {
    const nextHash = nextCat ? `#${nextCat}` : '#top'
    window.history.replaceState(null, '', nextHash)
    setFilters((prev) => ({ ...prev, category: nextCat }))
  }

  function handlePriceChange(range: { min: number; max: number } | null) {
    setFilters((prev) => ({ ...prev, priceRange: range }))
  }

  const filtered = useMemo(() => {
    let result = items

    if (filters.category) {
      result = result.filter((item) => item.subcategoria === filters.category)
    }

    if (filters.priceRange) {
      result = result.filter((item) => {
        const price = getStartingPrice(item) ?? 0
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max
      })
    }

    return result.sort((a, b) => {
      if (sortBy === 'price') {
        return (getStartingPrice(a) ?? 0) - (getStartingPrice(b) ?? 0)
      }
      return a.nombre.localeCompare(b.nombre)
    })
  }, [filters, sortBy, items])

  return (
    <>
      <div className="mb-8 space-y-4">
        <CatalogoFilter activeCat={filters.category} onChange={handleCategoryChange} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-heaven-divider bg-heaven-bg-card p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-heaven-lilac">Rango:</span>
            <button
              onClick={() => handlePriceChange(null)}
              className={`cursor-pointer px-3 py-1 rounded-full text-xs transition-colors duration-200 ${
                !filters.priceRange
                  ? 'bg-heaven-lilac text-heaven-bg-dark'
                  : 'border border-heaven-divider text-heaven-muted hover:border-heaven-lilac/50'
              }`}
            >
              Todos
            </button>
            {PRICE_RANGES.map((range) => (
              <button
                key={`${range.min}-${range.max}`}
                onClick={() => handlePriceChange(range)}
                className={`cursor-pointer px-3 py-1 rounded-full text-xs transition-colors duration-200 ${
                  filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                    ? 'bg-heaven-lilac text-heaven-bg-dark'
                    : 'border border-heaven-divider text-heaven-muted hover:border-heaven-lilac/50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
            className="cursor-pointer rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text focus-visible:border-heaven-lilac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heaven-lilac/50"
          >
            <option value="name">Ordenar por nombre</option>
            <option value="price">Ordenar por precio</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {filtered.map((item) => (
          <ProductCard
            key={item.slug}
            nombre={item.nombre}
            material={item.material || 'Personalizable'}
            horma={item.horma || undefined}
            precioDesde={getStartingPrice(item) ?? undefined}
            soloWhatsApp={item.soloCotizar}
            slug={item.slug}
            imagenUrl={item.imagenUrl ?? undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Badge variant="rose">Sin resultados</Badge>
          <p className="mt-4 text-heaven-muted">No hay productos con esos filtros. Prueba con otras opciones.</p>
        </div>
      )}
    </>
  )
}
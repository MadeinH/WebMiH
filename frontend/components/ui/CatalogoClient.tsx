'use client'

import { useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import CatalogoFilter from '@/components/ui/CatalogoFilter'
import type { ManagedItem } from '@/lib/content/types'
import { getStartingPrice } from '@/lib/content/repository'

const VALID_CATS = new Set<string>(['camisetas', 'hoodies', 'chaquetas', 'deportiva'])

function getCategoryFromHash(hash: string): string | null {
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash
  return VALID_CATS.has(rawHash) ? rawHash : null
}

interface CatalogoClientProps {
  items: ManagedItem[]
}

export default function CatalogoClient({ items }: CatalogoClientProps) {
  const [activeCat, setActiveCat] = useState<string | null>(null)

  useEffect(() => {
    function syncFromHash() {
      setActiveCat(getCategoryFromHash(window.location.hash))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  function handleCategoryChange(nextCat: string | null) {
    const nextHash = nextCat ? `#${nextCat}` : '#top'
    window.history.replaceState(null, '', nextHash)
    setActiveCat(nextCat)
  }

  const filtered = useMemo(
    () => (activeCat ? items.filter((item) => item.subcategoria === activeCat) : items),
    [activeCat, items],
  )

  return (
    <>
      <CatalogoFilter activeCat={activeCat} onChange={handleCategoryChange} />

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
          <p className="mt-4 text-heaven-muted">No hay productos en esta categoría.</p>
        </div>
      )}
    </>
  )
}
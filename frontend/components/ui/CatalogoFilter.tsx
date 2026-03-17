'use client'

const categorias = [
  { key: null, label: 'Todas' },
  { key: 'camisetas', label: 'Camisetas' },
  { key: 'hoodies', label: 'Hoodies & Suéteres' },
  { key: 'chaquetas', label: 'Chaquetas & Rompevientos' },
  { key: 'deportiva', label: 'Deportiva' },
] as const

interface CatalogoFilterProps {
  activeCat: string | null
  onChange: (nextCat: string | null) => void
}

/** Filtro por categoría para el catálogo */
export default function CatalogoFilter({ activeCat, onChange }: CatalogoFilterProps) {
  return (
    <nav aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap justify-center gap-2">
      {categorias.map((cat) => {
        const isActive = activeCat === cat.key

        return (
          <button
            key={cat.label}
            type="button"
            onClick={() => onChange(cat.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-heaven-lilac text-heaven-bg-dark'
                : 'border border-heaven-divider text-heaven-muted hover:border-heaven-lilac/50 hover:text-heaven-text'
            }`}
          >
            {cat.label}
          </button>
        )
      })}
    </nav>
  )
}

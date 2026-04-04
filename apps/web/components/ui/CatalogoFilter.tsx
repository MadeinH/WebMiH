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
    <nav aria-label="Filtrar por categoría" className="mb-8 flex w-full justify-center">
      <div className="mx-0 flex w-full max-w-4xl gap-2 overflow-x-auto px-2 py-1 scrollbar-hide">
        {categorias.map((cat) => {
          const isActive = activeCat === cat.key

          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => onChange(cat.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-heaven-lilac text-heaven-bg-dark'
                  : 'border border-heaven-divider text-heaven-muted hover:border-heaven-lilac/50 hover:text-heaven-text'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

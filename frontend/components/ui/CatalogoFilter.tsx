import Link from 'next/link'

const categorias = [
  { key: null, label: 'Todas' },
  { key: 'camisetas', label: 'Camisetas' },
  { key: 'hoodies', label: 'Hoodies & Suéteres' },
  { key: 'chaquetas', label: 'Chaquetas & Rompevientos' },
  { key: 'deportiva', label: 'Deportiva' },
] as const

interface CatalogoFilterProps {
  activeCat: string | null
}

/** Filtro por categoría para el catálogo — Server Component, sin JS client */
export default function CatalogoFilter({ activeCat }: CatalogoFilterProps) {
  return (
    <nav aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap justify-center gap-2">
      {categorias.map((cat) => {
        const isActive = activeCat === cat.key
        const href = cat.key ? `/catalogo?cat=${cat.key}` : '/catalogo'

        return (
          <Link
            key={cat.label}
            href={href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-heaven-lilac text-heaven-bg-dark'
                : 'border border-heaven-divider text-heaven-muted hover:border-heaven-lilac/50 hover:text-heaven-text'
            }`}
          >
            {cat.label}
          </Link>
        )
      })}
    </nav>
  )
}

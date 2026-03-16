import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import CatalogoFilter from '@/components/ui/CatalogoFilter'
import { getCatalogItems, getSiteContent, getStartingPrice } from '@/lib/content/repository'

export const metadata: Metadata = {
  title: 'Catálogo de Prendas',
  description:
    'Explora nuestro catálogo completo de camisetas, hoodies, chaquetas, rompevientos y más. Todo personalizable con tu diseño.',
}

const VALID_CATS = new Set<string>(['camisetas', 'hoodies', 'chaquetas', 'deportiva'])

interface CatalogoPageProps {
  searchParams: { cat?: string }
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const [site, prendas] = await Promise.all([getSiteContent(), getCatalogItems()])
  const catParam = searchParams.cat
  const activeCat = catParam && VALID_CATS.has(catParam) ? catParam : null
  const filtered = activeCat
    ? prendas.filter((p) => p.subcategoria === activeCat)
    : prendas

  return (
    <SectionWrapper>
      {/* Encabezado */}
      <div className="mb-12 text-center">
        <Badge variant="lilac">Catálogo</Badge>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
          Prendas de Vestir
        </h1>
        <p className="mt-4 text-heaven-muted">
          {site.catalogoIntro}
        </p>
      </div>

      {/* Filtro de categorías */}
      <CatalogoFilter activeCat={activeCat} />

      {/* Nota sobre estampado reflectivo */}
      <div className="mb-8 rounded-xl border border-heaven-cream/30 bg-heaven-cream/10 p-4 text-center text-sm text-heaven-cream">
        ✨ Estampado reflectivo disponible en todas las prendas por +$5.000 adicional
      </div>

      {/* Grid de productos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard
            key={p.slug}
            nombre={p.nombre}
            material={p.material || 'Personalizable'}
            horma={p.horma || undefined}
            precioDesde={getStartingPrice(p) ?? undefined}
            soloWhatsApp={p.soloCotizar}
            slug={p.slug}
            imagenUrl={p.imagenUrl ?? undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-heaven-muted">
          No hay productos en esta categoría.
        </p>
      )}
    </SectionWrapper>
  )
}

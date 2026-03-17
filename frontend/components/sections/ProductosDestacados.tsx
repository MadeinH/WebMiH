import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import { getFeaturedProducts, getStartingPrice } from '@/lib/content/repository'

/** Sección de productos destacados en la homepage */
export default async function ProductosDestacados() {
  const productosDestacados = await getFeaturedProducts()

  return (
    <SectionWrapper>
      <div className="mb-12 text-center">
        <Badge variant="mint">Destacados</Badge>
        <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-heaven-text md:text-4xl">
          Los más pedidos
        </h2>
        <p className="mt-4 text-heaven-muted">
          Nuestros productos favoritos, todos completamente personalizables
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {productosDestacados.map((p) => (
          <ProductCard
            key={p.slug}
            nombre={p.nombre}
            material={p.material}
            horma={p.horma || undefined}
            precioDesde={getStartingPrice(p) ?? undefined}
            soloWhatsApp={p.soloCotizar}
            slug={p.slug}
            imagenUrl={p.imagenUrl ?? undefined}
            type={p.type}
          />
        ))}
      </div>
    </SectionWrapper>
  )
}

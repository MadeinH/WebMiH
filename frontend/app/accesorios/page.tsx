import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import { getAccessoryItems, getSiteContent, getStartingPrice } from '@/lib/content/repository'

export const metadata: Metadata = {
  title: 'Accesorios',
  description:
    'Cuadros, pósters, termos, gorras, medias, cojines, mousepads y más. Accesorios personalizados con tu diseño favorito.',
}

export default async function AccesoriosPage() {
  const [site, accessories] = await Promise.all([getSiteContent(), getAccessoryItems()])
  const accesoriosConPrecio = accessories.filter((item) => !item.soloCotizar)
  const accesoriosCotizar = accessories.filter((item) => item.soloCotizar)

  return (
    <SectionWrapper>
      {/* Encabezado */}
      <div className="mb-12 text-center">
        <Badge variant="mint">Accesorios</Badge>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
          Accesorios Personalizados
        </h1>
        <p className="mt-4 text-heaven-muted">
          {site.accesoriosIntro}
        </p>
      </div>

      {/* Accesorios con precio */}
      <div className="mb-12">
        <h2 className="mb-6 font-display text-2xl uppercase tracking-wide text-heaven-text">
          Con precios de referencia
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {accesoriosConPrecio.map((a) => (
            <ProductCard
              key={a.slug}
              nombre={a.nombre}
              material={a.material || 'Personalizable'}
              horma={a.horma || undefined}
              precioDesde={getStartingPrice(a) ?? undefined}
              soloWhatsApp={a.soloCotizar}
              slug={a.slug}
              imagenUrl={a.imagenUrl ?? undefined}
              type="accessory"
            />
          ))}
        </div>
      </div>

      {/* Accesorios solo cotización */}
      <div>
        <h2 className="mb-6 font-display text-2xl uppercase tracking-wide text-heaven-text">
          Solo por cotización
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {accesoriosCotizar.map((a) => (
            <ProductCard
              key={a.slug}
              nombre={a.nombre}
              material={a.material || 'Personalizable'}
              horma={a.horma || undefined}
              soloWhatsApp
              slug={a.slug}
              imagenUrl={a.imagenUrl ?? undefined}
              type="accessory"
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductQuotationForm from '@/components/ui/ProductQuotationForm'
import CTAButton from '@/components/ui/CTAButton'
import {
  getCatalogItemBySlug,
  getCatalogItems,
} from '@/lib/content/repository'
import { buildProductoUrl } from '@/lib/whatsapp'

interface ProductoPageProps {
  params: { slug: string }
}

/** Pre-genera páginas de producto activas en build time */
export async function generateStaticParams() {
  const catalog = await getCatalogItems()
  return catalog.map((item) => ({ slug: item.slug }))
}

/** Metadata dinámica para SEO */
export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const producto = await getCatalogItemBySlug(params.slug)

  if (!producto) {
    return { title: 'Producto no encontrado' }
  }

  return {
    title: producto.nombre,
    description: producto.descripcion || `Detalles de ${producto.nombre}`,
  }
}

function hasPrices(item: {
  priceMatrix: {
    detalCarta: number | null
    detalEstandar: number | null
    mayoreo3: number | null
    mayoreo6: number | null
    mayoreo12: number | null
  }
}): boolean {
  return Object.values(item.priceMatrix).some((value) => typeof value === 'number')
}

/** Página de producto individual */
export default async function ProductoPage({ params }: ProductoPageProps) {
  const producto = await getCatalogItemBySlug(params.slug)

  if (!producto) {
    return (
      <SectionWrapper>
        <div className="py-24 text-center">
          <h1 className="font-display text-4xl uppercase text-heaven-text">Producto no encontrado</h1>
          <p className="mt-4 text-heaven-muted">
            El producto que buscas no existe o ya no está disponible.
          </p>
          <CTAButton variant="primary" href="/catalogo" className="mt-8">
            Volver al catálogo
          </CTAButton>
        </div>
      </SectionWrapper>
    )
  }

  const showPriceTable = !producto.soloCotizar && hasPrices(producto)

  return (
    <SectionWrapper>
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-heaven-muted">
          <li>
            <Link href="/" className="transition-colors hover:text-heaven-lilac">Inicio</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/catalogo" className="transition-colors hover:text-heaven-lilac">Catálogo</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-heaven-text">{producto.nombre}</li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-heaven-divider bg-heaven-bg-card">
          <span className="text-heaven-muted">Imagen próximamente</span>
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="lilac">{producto.horma || 'Personalizable'}</Badge>
            <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
              {producto.nombre}
            </h1>
          </div>

          <p className="leading-relaxed text-heaven-muted">{producto.descripcion}</p>

          <div className="space-y-2">
            <p className="text-sm text-heaven-muted">
              <span className="font-semibold text-heaven-text">Material:</span>{' '}
              {producto.material || 'Personalizable'}
            </p>
          </div>

          {showPriceTable ? (
            <ProductQuotationForm producto={producto} />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-heaven-muted">
                Este producto requiere cotización personalizada.
              </p>
              <CTAButton
                variant="whatsapp"
                href={buildProductoUrl(producto.nombre)}
                external
                className="w-full"
              >
                Cotizar por WhatsApp
              </CTAButton>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}

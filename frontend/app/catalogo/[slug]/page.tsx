import type { Metadata } from 'next'
import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import PriceTable from '@/components/ui/PriceTable'
import CTAButton from '@/components/ui/CTAButton'
import AddToCartButton from '@/components/ui/AddToCartButton'
import {
  getAccessoryItemBySlug,
  getAccessoryItems,
  getCatalogItemBySlug,
  getCatalogItems,
} from '@/lib/content/repository'
import { buildProductoUrl, buildWhatsAppUrl } from '@/lib/whatsapp'

interface ProductoPageProps {
  params: { slug: string }
}

/** Pre-genera páginas de producto activas en build time */
export async function generateStaticParams() {
  const [catalog, accessories] = await Promise.all([getCatalogItems(), getAccessoryItems()])
  return [...catalog, ...accessories].map((item) => ({ slug: item.slug }))
}

/** Metadata dinámica para SEO */
export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const producto =
    (await getCatalogItemBySlug(params.slug)) ??
    (await getAccessoryItemBySlug(params.slug))

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
  const producto =
    (await getCatalogItemBySlug(params.slug)) ??
    (await getAccessoryItemBySlug(params.slug))

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

          <div>
            <label htmlFor="color" className="mb-2 block text-sm font-medium text-heaven-text">
              Color deseado
            </label>
            <input
              id="color"
              type="text"
              placeholder="Ej: azul marino"
              className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-heaven-text placeholder:text-heaven-muted/50 focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
            />
            <p className="mt-1 text-xs text-heaven-muted">Sujeto a disponibilidad del material</p>
          </div>

          {showPriceTable ? (
            <div className="space-y-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-heaven-text">
                Precios por cantidad
              </h2>
              <PriceTable
                detal_carta={producto.priceMatrix.detalCarta ?? 0}
                detal_estandar={producto.priceMatrix.detalEstandar ?? 0}
                mayoreo_3={producto.priceMatrix.mayoreo3 ?? 0}
                mayoreo_6={producto.priceMatrix.mayoreo6 ?? 0}
                mayoreo_12={producto.priceMatrix.mayoreo12 ?? 0}
              />
              <p className="text-xs text-heaven-cream">
                ✨ Estampado reflectivo: +$5.000 adicional por unidad
              </p>
              <p className="text-xs text-heaven-muted">
                Bordado: precio variable según diseño — consultar por WhatsApp
              </p>
            </div>
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

          <div className="space-y-4 pt-4">
            <AddToCartButton
              productoId={producto.id}
              nombre={producto.nombre}
              material={producto.material || 'Personalizable'}
            />
            <CTAButton
              variant="whatsapp"
              href={buildWhatsAppUrl(`Hola! Quiero cotizar: ${producto.nombre}`)}
              external
              className="w-full"
            >
              Escríbenos al WhatsApp
            </CTAButton>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

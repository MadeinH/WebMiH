import type { Metadata } from 'next'
import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductQuotationForm from '@/components/ui/ProductQuotationForm'
import CTAButton from '@/components/ui/CTAButton'
import {
  getAccessoryItemBySlug,
  getAccessoryItems,
  getSiteContent,
} from '@/lib/content/repository'
import { buildProductoUrl } from '@/lib/whatsapp'

export const revalidate = 86400
export const dynamicParams = false

interface AccesorioPageProps {
  // Next's generated PageProps may expect `params` as a Promise-wrapped type;
  // use `any` here to avoid brittle incompatibilities with the generated helpers.
  params: any
}

/** Pre-genera páginas de accesorios activos en build time */
export async function generateStaticParams() {
  const accessories = await getAccessoryItems()
  return accessories.map((item) => ({ slug: item.slug }))
}

/** Metadata dinámica para SEO */
export async function generateMetadata({ params }: AccesorioPageProps): Promise<Metadata> {
  const accesorio = await getAccessoryItemBySlug(params.slug)

  if (!accesorio) {
    return { title: 'Accesorio no encontrado' }
  }

  return {
    title: accesorio.nombre,
    description: accesorio.descripcion || `Detalles de ${accesorio.nombre}`,
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

/** Página de accesorio individual */
export default async function AccesorioPage({ params }: AccesorioPageProps) {
  const [accesorio, site] = await Promise.all([
    getAccessoryItemBySlug(params.slug),
    getSiteContent(),
  ])

  if (!accesorio) {
    return (
      <SectionWrapper>
        <div className="py-24 text-center">
          <h1 className="font-display text-4xl uppercase text-heaven-text">Accesorio no encontrado</h1>
          <p className="mt-4 text-heaven-muted">
            El accesorio que buscas no existe o ya no está disponible.
          </p>
          <CTAButton variant="primary" href="/accesorios" className="mt-8">
            Volver a accesorios
          </CTAButton>
        </div>
      </SectionWrapper>
    )
  }

  const showPriceTable = !accesorio.soloCotizar && hasPrices(accesorio)

  return (
    <SectionWrapper>
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-heaven-muted">
          <li>
            <Link href="/" className="transition-colors hover:text-heaven-lilac">Inicio</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/accesorios" className="transition-colors hover:text-heaven-lilac">Accesorios</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-heaven-text">{accesorio.nombre}</li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-heaven-divider bg-heaven-bg-card">
          <span className="text-heaven-muted">Imagen próximamente</span>
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="mint">{accesorio.horma || 'Accesorio'}</Badge>
            <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
              {accesorio.nombre}
            </h1>
          </div>

          <p className="leading-relaxed text-heaven-muted">{accesorio.descripcion}</p>

          <div className="space-y-2">
            <p className="text-sm text-heaven-muted">
              <span className="font-semibold text-heaven-text">Material:</span>{' '}
              {accesorio.material || 'Personalizable'}
            </p>
          </div>

          {!showPriceTable && (
            <p className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-4 py-3 text-sm text-heaven-muted">
              Este accesorio se maneja por cotización. Puedes agregarlo al carrito de cotización desde aquí.
            </p>
          )}

          <ProductQuotationForm producto={accesorio} quoteFromQuantity={site.quoteFromQuantity} />

          {!showPriceTable && (
            <CTAButton
              variant="whatsapp"
              href={buildProductoUrl(accesorio.nombre)}
              external
              className="w-full"
            >
              Cotizar por WhatsApp
            </CTAButton>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}

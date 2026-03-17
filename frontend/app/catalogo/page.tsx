import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CatalogoClient from '@/components/ui/CatalogoClient'
import { getCatalogItems, getSiteContent } from '@/lib/content/repository'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Catálogo de Prendas',
  description:
    'Explora nuestro catálogo completo de camisetas, hoodies, chaquetas, rompevientos y más. Todo personalizable con tu diseño.',
}

export default async function CatalogoPage() {
  const [site, prendas] = await Promise.all([getSiteContent(), getCatalogItems()])

  return (
    <SectionWrapper id="top">
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

      <CatalogoClient items={prendas} />
    </SectionWrapper>
  )
}

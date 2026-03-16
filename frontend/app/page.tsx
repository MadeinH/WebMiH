import HeroSection from '@/components/sections/HeroSection'
import CategoriasGrid from '@/components/sections/CategoriasGrid'
import ProductosDestacados from '@/components/sections/ProductosDestacados'
import PersonalizacionSection from '@/components/sections/PersonalizacionSection'
import OutOfCatalogBanner from '@/components/sections/OutOfCatalogBanner'
import GlowDivider from '@/components/ui/GlowDivider'
import { getSiteContent } from '@/lib/content/repository'

/** Página principal — Homepage */
export default async function HomePage() {
  const site = await getSiteContent()

  return (
    <>
      <HeroSection description={site.heroDescription} />
      <GlowDivider />
      <CategoriasGrid />
      <GlowDivider />
      <ProductosDestacados />
      <GlowDivider />
      <PersonalizacionSection />
      <GlowDivider />
      <OutOfCatalogBanner
        title={site.outOfCatalogTitle}
        description={site.outOfCatalogDescription}
      />
    </>
  )
}

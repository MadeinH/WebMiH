import HeroSection from '@/components/sections/HeroSection'
import CategoriasGrid from '@/components/sections/CategoriasGrid'
import ProductosDestacados from '@/components/sections/ProductosDestacados'
import PersonalizacionSection from '@/components/sections/PersonalizacionSection'
import OutOfCatalogBanner from '@/components/sections/OutOfCatalogBanner'
import GlowDivider from '@/components/ui/GlowDivider'

/** Página principal — Homepage */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <GlowDivider />
      <CategoriasGrid />
      <GlowDivider />
      <ProductosDestacados />
      <GlowDivider />
      <PersonalizacionSection />
      <GlowDivider />
      <OutOfCatalogBanner />
    </>
  )
}

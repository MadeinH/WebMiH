import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import CatalogoFilter from '@/components/ui/CatalogoFilter'

export const metadata: Metadata = {
  title: 'Catálogo de Prendas',
  description:
    'Explora nuestro catálogo completo de camisetas, hoodies, chaquetas, rompevientos y más. Todo personalizable con tu diseño.',
}

/**
 * Catálogo de productos completo.
 * En producción, los datos vendrán de Supabase.
 * Por ahora usamos datos estáticos del catálogo real.
 */

type Subcategoria = 'camisetas' | 'hoodies' | 'chaquetas' | 'deportiva'

interface Prenda {
  nombre: string
  material: string
  horma: string
  precioDesde: number
  slug: string
  subcategoria: Subcategoria
  soloWhatsApp?: boolean
}

const prendas: Prenda[] = [
  {
    nombre: 'Camiseta',
    material: 'Piel de durazno / Algodón 100%',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 18500,
    slug: 'camiseta',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camiseta Ranglan',
    material: 'Poliéster tacto algodón',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 22500,
    slug: 'camiseta-ranglan',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camiseta Calidad Premium',
    material: 'Algodón peruano / Tela burda',
    horma: 'Unisex',
    precioDesde: 37500,
    slug: 'camiseta-premium',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camibuzo',
    material: 'Piel de durazno / Algodón 100%',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 30500,
    slug: 'camibuzo',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camiseta Polo',
    material: 'Poliéster / Algodón Lacoste',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 24500,
    slug: 'camiseta-polo',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Ranglan Manga 3/4',
    material: 'Poliéster tacto algodón',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 30500,
    slug: 'ranglan-manga-34',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camiseta Acid Wash',
    material: 'Poli-algodón',
    horma: 'Unisex',
    precioDesde: 30500,
    slug: 'camiseta-acid-wash',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camiseta Oversize',
    material: 'Algodón 100% / Piel de durazno',
    horma: 'Unisex',
    precioDesde: 30500,
    slug: 'camiseta-oversize',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Camiseta Oversize Premium',
    material: 'Tela fría / Algodón 100% / Burda / Galleta',
    horma: 'Unisex',
    precioDesde: 45500,
    slug: 'camiseta-oversize-premium',
    subcategoria: 'camisetas',
  },
  {
    nombre: 'Hoodie (Un Color)',
    material: 'Algodón perchado',
    horma: 'Unisex',
    precioDesde: 58500,
    slug: 'hoodie-un-color',
    subcategoria: 'hoodies',
  },
  {
    nombre: 'Suéter (Un Color)',
    material: 'Algodón perchado',
    horma: 'Unisex',
    precioDesde: 31500,
    slug: 'sueter-un-color',
    subcategoria: 'hoodies',
  },
  {
    nombre: 'Suéter Calidad Premium',
    material: 'Algodón 100%',
    horma: 'Unisex',
    precioDesde: 51500,
    slug: 'sueter-premium',
    subcategoria: 'hoodies',
  },
  {
    nombre: 'Hoodie / Chaqueta / Suéter (2–3 Colores)',
    material: 'Perchado mónaco / Poliéster',
    horma: 'Unisex',
    precioDesde: 61500,
    slug: 'hoodie-multicolor',
    subcategoria: 'hoodies',
  },
  {
    nombre: 'Hoodie Oversize',
    material: 'Perchado mónaco / Poliéster',
    horma: 'Unisex',
    precioDesde: 67500,
    slug: 'hoodie-oversize',
    subcategoria: 'hoodies',
  },
  {
    nombre: 'Hoodie Calidad Premium',
    material: 'Algodón peruano perchado',
    horma: 'Unisex',
    precioDesde: 76500,
    slug: 'hoodie-premium',
    subcategoria: 'hoodies',
  },
  {
    nombre: 'Chaqueta (Un Color)',
    material: 'Algodón perchado',
    horma: 'Unisex',
    precioDesde: 58500,
    slug: 'chaqueta-un-color',
    subcategoria: 'chaquetas',
  },
  {
    nombre: 'Rompevientos',
    material: 'Nylon premium',
    horma: 'Unisex',
    precioDesde: 33500,
    slug: 'rompevientos',
    subcategoria: 'chaquetas',
  },
  {
    nombre: 'Rompevientos Semireflectivo',
    material: 'Nylon premium',
    horma: 'Unisex',
    precioDesde: 52000,
    slug: 'rompevientos-semireflectivo',
    subcategoria: 'chaquetas',
  },
  {
    nombre: 'Camiseta / Esqueleto Deportivo',
    material: 'Poliéster deportivo premium',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 35500,
    slug: 'camiseta-deportiva',
    subcategoria: 'deportiva',
  },
  {
    nombre: 'Buzo Compresivo Deportivo',
    material: 'Poliéster deportivo premium',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 43500,
    slug: 'buzo-compresivo',
    subcategoria: 'deportiva',
  },
  {
    nombre: 'Camisa Compresiva Deportiva',
    material: 'Poliéster deportivo premium',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 35500,
    soloWhatsApp: true,
    slug: 'camisa-compresiva',
    subcategoria: 'deportiva',
  },
]

const VALID_CATS = new Set<string>(['camisetas', 'hoodies', 'chaquetas', 'deportiva'])

interface CatalogoPageProps {
  searchParams: { cat?: string }
}

export default function CatalogoPage({ searchParams }: CatalogoPageProps) {
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
          Todas nuestras prendas son personalizables. Los precios incluyen prenda + estampado.
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
            material={p.material}
            horma={p.horma}
            precioDesde={p.precioDesde}
            soloWhatsApp={p.soloWhatsApp ?? false}
            slug={p.slug}
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

import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'

/** Productos destacados hardcodeados — en producción vendrán de Supabase */
const productosDestacados = [
  {
    nombre: 'Camiseta Personalizada',
    material: 'Piel de durazno / Algodón 100%',
    horma: 'Hombre, Mujer, Niño',
    precioDesde: 18500,
    soloWhatsApp: false,
    slug: 'camiseta-personalizada',
  },
  {
    nombre: 'Hoodie Un Color',
    material: 'Algodón perchado',
    horma: 'Unisex',
    precioDesde: 58500,
    soloWhatsApp: false,
    slug: 'hoodie-un-color',
  },
  {
    nombre: 'Camiseta Oversize',
    material: 'Algodón 100% / Piel de durazno',
    horma: 'Unisex',
    precioDesde: 30500,
    soloWhatsApp: false,
    slug: 'camiseta-oversize',
  },
  {
    nombre: 'Rompevientos',
    material: 'Nylon premium',
    horma: 'Unisex',
    precioDesde: 33500,
    soloWhatsApp: false,
    slug: 'rompevientos',
  },
]

/** Sección de productos destacados en la homepage */
export default function ProductosDestacados() {
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
          <ProductCard key={p.slug} {...p} />
        ))}
      </div>
    </SectionWrapper>
  )
}

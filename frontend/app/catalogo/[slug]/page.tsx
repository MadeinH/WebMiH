import type { Metadata } from 'next'
import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import PriceTable from '@/components/ui/PriceTable'
import CTAButton from '@/components/ui/CTAButton'
import AddToCartButton from '@/components/ui/AddToCartButton'
import { buildProductoUrl, buildWhatsAppUrl } from '@/lib/whatsapp'

/**
 * Datos estáticos del catálogo — en producción vendrán de Supabase vía [slug].
 * Este objeto mapea slug → data del producto.
 */
interface ProductoDetalle {
  nombre: string
  material: string
  horma: string
  descripcion: string
  categoria: 'camisetas' | 'hoodies' | 'chaquetas' | 'deportiva'
  precios: {
    detal_carta: number
    detal_estandar: number
    mayoreo_3: number
    mayoreo_6: number
    mayoreo_12: number
  } | null
  soloWhatsApp: boolean
}

const catalogoData: Record<string, ProductoDetalle> = {
  /* ── Camisetas ─────────────────────────────── */
  camiseta: {
    nombre: 'Camiseta',
    material: 'Piel de durazno / Algodón 100%',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'camisetas',
    descripcion:
      'Camiseta clásica personalizable con estampado de alta calidad. Disponible en piel de durazno o algodón 100%, perfecta para cualquier diseño geek o anime.',
    precios: { detal_carta: 34500, detal_estandar: 41500, mayoreo_3: 22500, mayoreo_6: 21000, mayoreo_12: 18500 },
    soloWhatsApp: false,
  },
  'camiseta-ranglan': {
    nombre: 'Camiseta Ranglan',
    material: 'Poliéster tacto algodón',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'camisetas',
    descripcion:
      'Camiseta ranglan con mangas contrastantes. Poliéster tacto algodón para mayor comodidad y durabilidad del estampado.',
    precios: { detal_carta: 36500, detal_estandar: 41500, mayoreo_3: 27500, mayoreo_6: 24700, mayoreo_12: 22500 },
    soloWhatsApp: false,
  },
  'camiseta-premium': {
    nombre: 'Camiseta Calidad Premium',
    material: 'Algodón peruano / Tela burda',
    horma: 'Unisex',
    categoria: 'camisetas',
    descripcion:
      'Camiseta premium en algodón peruano o tela burda. Acabado superior para quienes buscan la mejor calidad.',
    precios: { detal_carta: 67500, detal_estandar: 74500, mayoreo_3: 45500, mayoreo_6: 41500, mayoreo_12: 37500 },
    soloWhatsApp: false,
  },
  camibuzo: {
    nombre: 'Camibuzo',
    material: 'Piel de durazno / Algodón 100%',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'camisetas',
    descripcion:
      'Camibuzo personalizable en piel de durazno o algodón 100%. Ideal para un look casual con tu diseño favorito.',
    precios: { detal_carta: 45500, detal_estandar: 52500, mayoreo_3: 37500, mayoreo_6: 33500, mayoreo_12: 30500 },
    soloWhatsApp: false,
  },
  'camiseta-polo': {
    nombre: 'Camiseta Polo',
    material: 'Poliéster / Algodón Lacoste',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'camisetas',
    descripcion:
      'Camiseta tipo polo en poliéster o algodón Lacoste. Elegante y personalizable, ideal para eventos o dotaciones.',
    precios: { detal_carta: 42500, detal_estandar: 49500, mayoreo_3: 30500, mayoreo_6: 28500, mayoreo_12: 24500 },
    soloWhatsApp: false,
  },
  'ranglan-manga-34': {
    nombre: 'Ranglan Manga 3/4',
    material: 'Poliéster tacto algodón',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'camisetas',
    descripcion:
      'Ranglan manga 3/4 o camibuzo ranglan personalizable. Estilo retro con mangas contrastantes.',
    precios: { detal_carta: 42000, detal_estandar: 47000, mayoreo_3: 35500, mayoreo_6: 32500, mayoreo_12: 30500 },
    soloWhatsApp: false,
  },
  'camiseta-acid-wash': {
    nombre: 'Camiseta Acid Wash',
    material: 'Poli-algodón',
    horma: 'Unisex',
    categoria: 'camisetas',
    descripcion:
      'Camiseta acid wash con acabado vintage desgastado. Cada pieza es única gracias al proceso de lavado ácido.',
    precios: { detal_carta: 52500, detal_estandar: 59500, mayoreo_3: 35500, mayoreo_6: 32500, mayoreo_12: 30500 },
    soloWhatsApp: false,
  },
  'camiseta-oversize': {
    nombre: 'Camiseta Oversize',
    material: 'Algodón 100% / Piel de durazno',
    horma: 'Unisex',
    categoria: 'camisetas',
    descripcion:
      'Camiseta oversize con corte relajado. Algodón 100% o piel de durazno. El estilo más trendy personalizado.',
    precios: { detal_carta: 55500, detal_estandar: 62500, mayoreo_3: 35500, mayoreo_6: 32500, mayoreo_12: 30500 },
    soloWhatsApp: false,
  },
  'camiseta-oversize-premium': {
    nombre: 'Camiseta Oversize Premium',
    material: 'Tela fría / Algodón 100% / Burda / Galleta',
    horma: 'Unisex',
    categoria: 'camisetas',
    descripcion:
      'Oversize premium disponible en múltiples materiales de alta calidad: tela fría, algodón 100%, burda y galleta.',
    precios: { detal_carta: 75500, detal_estandar: 82500, mayoreo_3: 52500, mayoreo_6: 48500, mayoreo_12: 45500 },
    soloWhatsApp: false,
  },
  /* ── Hoodies & Suéteres ────────────────────── */
  'hoodie-un-color': {
    nombre: 'Hoodie (Un Color)',
    material: 'Algodón perchado',
    horma: 'Unisex',
    categoria: 'hoodies',
    descripcion:
      'Hoodie en algodón perchado de un solo color. Perfecta para personalizar con tu diseño favorito.',
    precios: { detal_carta: 76500, detal_estandar: 83500, mayoreo_3: 65500, mayoreo_6: 62500, mayoreo_12: 58500 },
    soloWhatsApp: false,
  },
  'sueter-un-color': {
    nombre: 'Suéter (Un Color)',
    material: 'Algodón perchado',
    horma: 'Unisex',
    categoria: 'hoodies',
    descripcion:
      'Suéter casual en algodón perchado de un solo color. Comodidad y estilo con tu diseño personalizado.',
    precios: { detal_carta: 70000, detal_estandar: 77000, mayoreo_3: 38500, mayoreo_6: 34500, mayoreo_12: 31500 },
    soloWhatsApp: false,
  },
  'sueter-premium': {
    nombre: 'Suéter Calidad Premium',
    material: 'Algodón 100%',
    horma: 'Unisex',
    categoria: 'hoodies',
    descripcion:
      'Suéter premium en algodón 100%. Acabado superior y confort inigualable para los más exigentes.',
    precios: { detal_carta: 80500, detal_estandar: 87500, mayoreo_3: 58500, mayoreo_6: 54500, mayoreo_12: 51500 },
    soloWhatsApp: false,
  },
  'hoodie-multicolor': {
    nombre: 'Hoodie / Chaqueta / Suéter (2–3 Colores)',
    material: 'Perchado mónaco / Poliéster',
    horma: 'Unisex',
    categoria: 'hoodies',
    descripcion:
      'Hoodie, chaqueta o suéter multicolor (2-3 colores). Perchado mónaco o poliéster, ideal para diseños más elaborados.',
    precios: { detal_carta: 80000, detal_estandar: 87000, mayoreo_3: 67500, mayoreo_6: 65500, mayoreo_12: 61500 },
    soloWhatsApp: false,
  },
  'hoodie-oversize': {
    nombre: 'Hoodie Oversize',
    material: 'Perchado mónaco / Poliéster',
    horma: 'Unisex',
    categoria: 'hoodies',
    descripcion:
      'Hoodie oversize de corte amplio y relajado. Perchado mónaco o poliéster para máxima comodidad.',
    precios: { detal_carta: 90000, detal_estandar: 97000, mayoreo_3: 72800, mayoreo_6: 70800, mayoreo_12: 67500 },
    soloWhatsApp: false,
  },
  'hoodie-premium': {
    nombre: 'Hoodie Calidad Premium',
    material: 'Algodón peruano perchado',
    horma: 'Unisex',
    categoria: 'hoodies',
    descripcion:
      'La hoodie definitiva: algodón peruano perchado de la más alta calidad. Acabado premium para diseños exclusivos.',
    precios: { detal_carta: 92000, detal_estandar: 99000, mayoreo_3: 82500, mayoreo_6: 80500, mayoreo_12: 76500 },
    soloWhatsApp: false,
  },
  /* ── Chaquetas & Rompevientos ──────────────── */
  'chaqueta-un-color': {
    nombre: 'Chaqueta (Un Color)',
    material: 'Algodón perchado',
    horma: 'Unisex',
    categoria: 'chaquetas',
    descripcion:
      'Chaqueta en algodón perchado de un solo color. Personalizable con estampado frontal y/o trasero.',
    precios: { detal_carta: 76500, detal_estandar: 83500, mayoreo_3: 65500, mayoreo_6: 62500, mayoreo_12: 58500 },
    soloWhatsApp: false,
  },
  rompevientos: {
    nombre: 'Rompevientos',
    material: 'Nylon premium',
    horma: 'Unisex',
    categoria: 'chaquetas',
    descripcion:
      'Rompevientos en nylon premium. Liviano, resistente al agua y personalizable con estampado DTF o sublimación.',
    precios: { detal_carta: 62500, detal_estandar: 69500, mayoreo_3: 40000, mayoreo_6: 36500, mayoreo_12: 33500 },
    soloWhatsApp: false,
  },
  'rompevientos-semireflectivo': {
    nombre: 'Rompevientos Semireflectivo',
    material: 'Nylon premium',
    horma: 'Unisex',
    categoria: 'chaquetas',
    descripcion:
      'Rompevientos con material semireflectivo incorporado. Perfecto para diseños llamativos que brillan con la luz.',
    precios: { detal_carta: 77000, detal_estandar: 84000, mayoreo_3: 61500, mayoreo_6: 55500, mayoreo_12: 52000 },
    soloWhatsApp: false,
  },
  /* ── Ropa Deportiva ────────────────────────── */
  'camiseta-deportiva': {
    nombre: 'Camiseta / Esqueleto Deportivo',
    material: 'Poliéster deportivo premium',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'deportiva',
    descripcion:
      'Camiseta o esqueleto deportivo de alto rendimiento. Poliéster deportivo premium con secado rápido.',
    precios: { detal_carta: 52000, detal_estandar: 59000, mayoreo_3: 47800, mayoreo_6: 38500, mayoreo_12: 35500 },
    soloWhatsApp: false,
  },
  'buzo-compresivo': {
    nombre: 'Buzo Compresivo Deportivo',
    material: 'Poliéster deportivo premium',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'deportiva',
    descripcion:
      'Buzo compresivo para entrenamiento intenso. Poliéster deportivo premium que se ajusta al cuerpo.',
    precios: { detal_carta: 56000, detal_estandar: 63000, mayoreo_3: 55500, mayoreo_6: 46500, mayoreo_12: 43500 },
    soloWhatsApp: false,
  },
  'camisa-compresiva': {
    nombre: 'Camisa Compresiva Deportiva',
    material: 'Poliéster deportivo premium',
    horma: 'Hombre, Mujer, Niño',
    categoria: 'deportiva',
    descripcion:
      'Camisa compresiva deportiva de alto rendimiento. Requiere cotización personalizada por la complejidad del diseño.',
    precios: null,
    soloWhatsApp: true,
  },
}

interface ProductoPageProps {
  params: { slug: string }
}

/** Pre-genera las 21 páginas de producto en build time */
export function generateStaticParams() {
  return Object.keys(catalogoData).map((slug) => ({ slug }))
}

/** Genera metadata dinámica para SEO */
export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const producto = catalogoData[params.slug]
  if (!producto) {
    return { title: 'Producto no encontrado' }
  }
  return {
    title: producto.nombre,
    description: producto.descripcion,
  }
}

/** Página de producto individual */
export default function ProductoPage({ params }: ProductoPageProps) {
  const producto = catalogoData[params.slug]

  // Producto no encontrado
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

  return (
    <SectionWrapper>
      {/* Breadcrumb */}
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
        {/* Imagen placeholder */}
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-heaven-divider bg-heaven-bg-card">
          <span className="text-heaven-muted">Imagen próximamente</span>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <Badge variant="lilac">{producto.horma}</Badge>
            <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
              {producto.nombre}
            </h1>
          </div>

          <p className="text-heaven-muted leading-relaxed">{producto.descripcion}</p>

          <div className="space-y-2">
            <p className="text-sm text-heaven-muted">
              <span className="font-semibold text-heaven-text">Material:</span> {producto.material}
            </p>
          </div>

          {/* Campo de color */}
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

          {/* Tabla de precios o botón WhatsApp */}
          {producto.soloWhatsApp ? (
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
          ) : producto.precios ? (
            <div className="space-y-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-heaven-text">
                Precios por cantidad
              </h2>
              <PriceTable {...producto.precios} />
              <p className="text-xs text-heaven-cream">
                ✨ Estampado reflectivo: +$5.000 adicional por unidad
              </p>
              <p className="text-xs text-heaven-muted">
                Bordado: precio variable según diseño — consultar por WhatsApp
              </p>
            </div>
          ) : null}

          {/* CTAs */}
          <div className="space-y-4 pt-4">
            <AddToCartButton
              productoId={params.slug}
              nombre={producto.nombre}
              material={producto.material}
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

import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'

export const metadata: Metadata = {
  title: 'Accesorios',
  description:
    'Cuadros, pósters, termos, gorras, medias, cojines, mousepads y más. Accesorios personalizados con tu diseño favorito.',
}

/** Accesorios del catálogo con precios disponibles */
const accesoriosConPrecio = [
  {
    nombre: 'Cuadro',
    material: 'MDF',
    slug: 'cuadro-mdf',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
  {
    nombre: 'Póster',
    material: 'Papel / Aluminio',
    slug: 'poster',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
  {
    nombre: 'Termos y Carimañolas',
    material: 'Vidrio / Acero inox / Aluminio',
    slug: 'termos',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
  {
    nombre: 'Gorras',
    material: 'Algodón / Poliéster',
    slug: 'gorras',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
  {
    nombre: 'Medias',
    material: 'Poliéster tacto algodón',
    slug: 'medias',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
  {
    nombre: 'Cojín',
    material: 'Personalizable',
    slug: 'cojin',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
  {
    nombre: 'Mousepad',
    material: 'Neopreno',
    slug: 'mousepad',
    soloWhatsApp: false,
    precioDesde: undefined,
  },
]

/** Accesorios solo por cotización */
const accesoriosCotizar = [
  {
    nombre: 'Peluches',
    material: 'Personalizable',
    slug: 'peluches',
    soloWhatsApp: true,
  },
  {
    nombre: 'Bufanda',
    material: 'Personalizable',
    slug: 'bufanda',
    soloWhatsApp: true,
  },
]

export default function AccesoriosPage() {
  return (
    <SectionWrapper>
      {/* Encabezado */}
      <div className="mb-12 text-center">
        <Badge variant="mint">Accesorios</Badge>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
          Accesorios Personalizados
        </h1>
        <p className="mt-4 text-heaven-muted">
          Cuadros, pósters, gorras, termos y mucho más. Todos personalizables con tu diseño.
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
              material={a.material}
              precioDesde={a.precioDesde}
              soloWhatsApp={a.soloWhatsApp}
              slug={a.slug}
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
              material={a.material}
              soloWhatsApp
              slug={a.slug}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}

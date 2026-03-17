import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'

/** Categorías del catálogo */
const categorias = [
  {
    nombre: 'Camisetas',
    descripcion: 'Piel de durazno, algodón, oversize, acid wash y más',
    href: '/catalogo?cat=camisetas',
    badge: 'Desde $18.500',
    badgeVariant: 'lilac' as const,
    icono: null,
  },
  {
    nombre: 'Hoodies & Suéteres',
    descripcion: 'Algodón perchado, mónaco, premium, oversize',
    href: '/catalogo?cat=hoodies',
    badge: 'Desde $31.500',
    badgeVariant: 'mint' as const,
    icono: null,
  },
  {
    nombre: 'Rompevientos & Chaquetas',
    descripcion: 'Nylon premium, algodón perchado',
    href: '/catalogo?cat=chaquetas',
    badge: 'Desde $33.500',
    badgeVariant: 'rose' as const,
    icono: null,
  },
  {
    nombre: 'Ropa Deportiva',
    descripcion: 'Camisetas, buzos y camisas compresivas',
    href: '/catalogo?cat=deportiva',
    badge: 'Desde $35.500',
    badgeVariant: 'lilac' as const,
    icono: null,
  },
  {
    nombre: 'Gorras & Accesorios',
    descripcion: 'Gorras, medias, bufandas, cojines, mousepads',
    href: '/accesorios',
    badge: 'Ver accesorios',
    badgeVariant: 'mint' as const,
    icono: null,
  },
  {
    nombre: 'Cuadros & Decoración',
    descripcion: 'Cuadros MDF, pósters, termos, peluches',
    href: '/accesorios',
    badge: 'Ver accesorios',
    badgeVariant: 'rose' as const,
    icono: null,
  },
]

/** Grid de categorías de productos */
export default function CategoriasGrid() {
  return (
    <SectionWrapper id="categorias">
      <div className="mb-12 text-center">
        <Badge variant="lilac">Categorías</Badge>
        <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-heaven-text md:text-4xl">
          Explora nuestro catálogo
        </h2>
        <p className="mt-4 text-heaven-muted">
          Ropa y accesorios para todos los gustos, todos personalizables
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((cat) => (
          <Link
            key={cat.nombre}
            href={cat.href}
            className="group rounded-2xl border border-heaven-divider bg-heaven-bg-card p-6 transition-all duration-300 hover:border-heaven-lilac/30 hover:shadow-heaven-glow"
          >
            <h3 className="font-display text-xl uppercase tracking-wide text-heaven-text transition-colors group-hover:text-heaven-lilac">
              {cat.nombre}
            </h3>
            <p className="mt-2 text-sm text-heaven-muted">{cat.descripcion}</p>
            <div className="mt-4">
              <Badge variant={cat.badgeVariant}>{cat.badge}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  )
}

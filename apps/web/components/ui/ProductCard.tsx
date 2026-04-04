import Image from 'next/image'
import Link from 'next/link'
import CTAButton from '@/components/ui/CTAButton'
import { buildProductoUrl } from '@/lib/whatsapp'
import { formatCOP } from '@/lib/utils'

interface ProductCardProps {
  nombre: string
  material: string
  horma?: string
  precioDesde?: number
  soloWhatsApp?: boolean
  imagenUrl?: string
  slug: string
  type?: 'catalog' | 'accessory' // Nuevo: para determinar la ruta
}

/** Tarjeta de producto para el catálogo */
export default function ProductCard({
  nombre,
  material,
  horma,
  precioDesde,
  soloWhatsApp = false,
  imagenUrl,
  slug,
  type = 'catalog',
}: ProductCardProps) {
  const detailUrl = type === 'accessory' ? `/accesorios/${slug}` : `/catalogo/${slug}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-heaven-divider bg-heaven-bg-card shadow-heaven-card transition-all duration-300 hover:-translate-y-1 hover:border-heaven-lilac/30 hover:shadow-heaven-glow">
      <Link href={detailUrl} prefetch={false} className="relative aspect-[4/5] cursor-pointer overflow-hidden">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={`Imagen de ${nombre}`}
            width={400}
            height={400}
            loading="lazy"
            quality={80}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-heaven-divider/35 via-heaven-bg-card to-heaven-bg-dark">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-heaven-muted">Imagen próximamente</span>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-heaven-bg-dark/55 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-heaven-divider bg-heaven-bg-dark/75 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-heaven-text backdrop-blur-sm">
          {soloWhatsApp ? 'Solo cotización' : 'Disponible'}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={detailUrl} prefetch={false}>
          <h3 className="cursor-pointer font-display text-lg uppercase tracking-[0.12em] text-heaven-text transition-colors duration-200 hover:text-heaven-lilac">
            {nombre}
          </h3>
        </Link>

        <p className="text-sm text-heaven-muted">{material}</p>
        {horma && (
          <p className="text-xs uppercase tracking-[0.16em] text-heaven-muted">
            Horma: {horma}
          </p>
        )}

        <div className="mt-auto pt-3">
          {soloWhatsApp ? (
            <CTAButton
              variant="whatsapp"
              href={buildProductoUrl(nombre)}
              external
              className="w-full text-sm"
            >
              Cotizar por WhatsApp
            </CTAButton>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-heaven-divider bg-heaven-bg-dark/60 px-4 py-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-heaven-muted">Desde</p>
                {precioDesde !== undefined ? (
                  <span className="font-display text-xl text-heaven-lilac">
                    {formatCOP(precioDesde)}
                  </span>
                ) : (
                  <span className="text-sm text-heaven-muted">Cotización variable</span>
                )}
              </div>
              <Link
                href={detailUrl}
                prefetch={false}
                className="cursor-pointer rounded-full border border-heaven-divider px-4 py-2 text-sm font-semibold text-heaven-mint transition-colors duration-200 hover:border-heaven-lilac/40 hover:text-heaven-lilac"
              >
                Detalles
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

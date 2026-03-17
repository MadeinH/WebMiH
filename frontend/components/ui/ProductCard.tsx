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
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-heaven-bg-card shadow-heaven-card transition-shadow duration-300 hover:shadow-heaven-glow">
      {/* Imagen del producto */}
      <Link href={detailUrl} prefetch={false} className="relative aspect-square overflow-hidden">
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
          <div className="flex h-full w-full items-center justify-center bg-heaven-divider/30">
            <span className="text-sm text-heaven-muted">Imagen próximamente</span>
          </div>
        )}
      </Link>

      {/* Información */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={detailUrl} prefetch={false}>
          <h3 className="font-display text-lg uppercase tracking-wide text-heaven-text transition-colors hover:text-heaven-lilac">
            {nombre}
          </h3>
        </Link>

        <p className="text-sm text-heaven-muted">{material}</p>
        {horma && (
          <p className="text-xs text-heaven-muted">
            Horma: {horma}
          </p>
        )}

        {/* Precio o botón WhatsApp */}
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
            <div className="flex items-center justify-between">
              {precioDesde !== undefined && (
                <span className="font-display text-xl text-heaven-lilac">
                  Desde {formatCOP(precioDesde)}
                </span>
              )}
              <Link
                href={detailUrl}
                prefetch={false}
                className="text-sm font-semibold text-heaven-mint transition-colors hover:text-heaven-lilac"
              >
                Ver detalles →
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

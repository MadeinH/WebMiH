"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface HeroSectionProps {
  description: string
  bannerImages?: string[]
}

const FALLBACK_BANNERS = ['/banners/banner-1.svg', '/banners/banner-2.svg', '/banners/banner-3.svg']

/** Sección hero principal de la homepage */
export default function HeroSection({ description, bannerImages }: HeroSectionProps) {
  const banners = useMemo(() => {
    const source = Array.isArray(bannerImages) && bannerImages.length > 0 ? bannerImages : FALLBACK_BANNERS
    return source.map((src, index) => ({
      src,
      alt: `Banner principal ${index + 1}`,
    }))
  }, [bannerImages])

  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = banners.length

  const currentBanner = useMemo(() => banners[activeSlide], [activeSlide, banners])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [totalSlides])

  function goToSlide(index: number) {
    setActiveSlide(index)
  }

  return (
    <section className="relative flex min-h-[60vh] md:min-h-[85vh] items-center overflow-hidden bg-heaven-bg-dark">
      {/* Fondo decorativo con gradiente */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-heaven-lilac/5 via-transparent to-heaven-mint/5"
      />

      {/* Elementos decorativos flotantes */}
      <div
        aria-hidden="true"
        className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-heaven-lilac/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-heaven-mint/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-2">
        <div className="max-w-3xl space-y-8">
          {/* Subtítulo */}
          <p className="font-body text-sm font-semibold uppercase tracking-[0.3em] text-heaven-lilac">
            Ropa &amp; Accesorios Personalizados
          </p>

          {/* Título principal */}
          <h1 className="font-display text-5xl uppercase leading-tight tracking-wide text-heaven-text md:text-7xl">
            Tu estilo,{' '}
            <span className="bg-gradient-to-r from-heaven-lilac via-heaven-mint to-heaven-rose bg-clip-text text-transparent">
              tu diseño
            </span>
          </h1>

          {/* Descripción */}
          <p className="max-w-xl font-body text-lg leading-relaxed text-heaven-muted">
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <CTAButton variant="primary" href="/catalogo">
              Ver catálogo
            </CTAButton>
            <CTAButton
              variant="whatsapp"
              href={buildWhatsAppUrl('Hola! Me interesa personalizar un producto')}
              external
            >
              Cotiza ya por WhatsApp
            </CTAButton>
          </div>

          {/* Técnicas disponibles */}
          <div className="flex flex-wrap gap-3 pt-4">
            {['DTF', 'Sublimación', 'Serigrafía', 'Vinil textil', 'Bordado'].map(
              (tecnica) => (
                <span
                  key={tecnica}
                  className="rounded-full border border-heaven-divider bg-heaven-bg-card px-3 py-1 text-xs text-heaven-muted"
                >
                  {tecnica}
                </span>
              )
            )}
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[16/9] sm:aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] w-full overflow-hidden rounded-3xl border border-heaven-divider bg-heaven-bg-card shadow-heaven-glow">
            <Image
              key={currentBanner.src}
              src={currentBanner.src}
              alt={currentBanner.alt}
              fill
              priority={activeSlide === 0}
              quality={82}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-heaven-bg-dark/35 via-transparent to-transparent" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2" aria-label="Indicadores del carrusel">
            {banners.map((banner, index) => (
              <button
                key={banner.src}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Ir al banner ${index + 1}`}
                aria-current={index === activeSlide}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? 'w-8 bg-heaven-lilac' : 'w-2.5 bg-heaven-divider hover:bg-heaven-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

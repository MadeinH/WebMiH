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
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches || totalSlides < 2) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [totalSlides])

  function goToSlide(index: number) {
    setActiveSlide(index)
  }

  return (
    <section className="relative overflow-hidden bg-heaven-bg-dark">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-heaven-lilac/10 via-transparent to-heaven-mint/10"
      />

      <div
        aria-hidden="true"
        className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-heaven-lilac/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-heaven-mint/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.38em] text-heaven-lilac">
              Ropa y accesorios personalizados
            </p>
            <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.92] tracking-[0.03em] text-heaven-text md:text-7xl lg:text-8xl">
              Diseña piezas que
              <span className="block bg-gradient-to-r from-heaven-lilac via-heaven-mint to-heaven-rose bg-clip-text text-transparent">
                sí se sienten tuyas
              </span>
            </h1>
          </div>

          <p className="max-w-2xl text-base leading-relaxed text-heaven-muted md:text-lg">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <CTAButton variant="primary" href="/catalogo">
              Ver catálogo
            </CTAButton>
            <CTAButton
              variant="whatsapp"
              href={buildWhatsAppUrl('Hola! Me interesa personalizar un producto')}
              external
            >
              Cotiza por WhatsApp
            </CTAButton>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {[
              'Entrega en Colombia',
              'Diseño a medida',
              'Cotización rápida',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-heaven-divider bg-heaven-bg-card/80 px-4 py-3 text-sm text-heaven-muted shadow-heaven-card"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {['DTF', 'Sublimación', 'Serigrafía', 'Vinil textil', 'Bordado'].map((tecnica) => (
              <span
                key={tecnica}
                className="rounded-full border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-heaven-muted"
              >
                {tecnica}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-heaven-divider bg-heaven-bg-card shadow-heaven-card">
            <Image
              key={currentBanner.src}
              src={currentBanner.src}
              alt={currentBanner.alt}
              fill
              priority={activeSlide === 0}
              quality={82}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-heaven-bg-dark/65 via-heaven-bg-dark/15 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="rounded-2xl border border-heaven-divider bg-heaven-bg-dark/80 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-heaven-lilac">Colección viva</p>
                <p className="mt-2 text-sm leading-relaxed text-heaven-text">
                  Banner {activeSlide + 1} de {totalSlides}. Cambiamos la historia según el producto y la campaña.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2" aria-label="Indicadores del carrusel">
            {banners.map((banner, index) => (
              <button
                key={banner.src}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Ir al banner ${index + 1}`}
                aria-current={index === activeSlide}
                className={`cursor-pointer rounded-full transition-all duration-200 ${
                  index === activeSlide
                    ? 'h-2.5 w-8 bg-heaven-lilac'
                    : 'h-2.5 w-2.5 bg-heaven-divider hover:bg-heaven-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

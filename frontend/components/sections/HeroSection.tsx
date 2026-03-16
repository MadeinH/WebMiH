import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface HeroSectionProps {
  description: string
}

/** Sección hero principal de la homepage */
export default function HeroSection({ description }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-heaven-bg-dark">
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

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
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
      </div>
    </section>
  )
}

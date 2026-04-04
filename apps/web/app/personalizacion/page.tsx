import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { getSiteContent } from '@/lib/content/repository'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Personalización',
  description:
    'Conoce todas las técnicas de personalización disponibles: DTF, sublimación, serigrafía, vinil textil y bordado.',
}

export default async function PersonalizacionPage() {
  const site = await getSiteContent()
  const tecnicas = site.personalizacionTecnicas

  return (
    <>
      <SectionWrapper>
        {/* Encabezado */}
        <div className="mb-12 text-center">
          <Badge variant="rose">Personalización</Badge>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text md:text-5xl">
            Técnicas de Personalización
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-heaven-muted">
            {site.personalizacionIntro}
          </p>
        </div>

        {/* Grid de técnicas */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tecnicas.map((t) => (
            <article
              key={t.nombre}
              className="rounded-2xl border border-heaven-divider bg-heaven-bg-card p-8 transition-all duration-300 hover:border-heaven-lilac/30 hover:shadow-heaven-glow"
            >
              <Badge variant={t.variant} className="mb-3">
                {t.nombre}
              </Badge>
              <p className="mt-3 text-sm leading-relaxed text-heaven-muted">{t.descripcion}</p>
              <div className="mt-4 space-y-2 border-t border-heaven-divider pt-4">
                <p className="text-xs text-heaven-muted">
                  <span className="font-semibold text-heaven-text">Ideal para:</span> {t.ideal}
                </p>
                <p className="text-xs text-heaven-muted">
                  <span className="font-semibold text-heaven-text">Telas:</span> {t.telas}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA final */}
      <section className="bg-heaven-bg-dark py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide text-heaven-text">
            ¿Listo para personalizar?
          </h2>
          <p className="mt-4 text-heaven-muted">
            Cuéntanos tu idea y te asesoramos sobre la mejor técnica, material y precio.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CTAButton
              variant="whatsapp"
              href={buildWhatsAppUrl('Hola! Quiero personalizar un producto. ¿Me pueden asesorar?')}
              external
            >
              Cotiza por WhatsApp
            </CTAButton>
            <CTAButton variant="outline" href="/catalogo">
              Ver catálogo
            </CTAButton>
          </div>
        </div>
      </section>
    </>
  )
}

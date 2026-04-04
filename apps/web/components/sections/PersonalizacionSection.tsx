import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { getSiteContent } from '@/lib/content/repository'

/** Sección de técnicas de personalización */
export default async function PersonalizacionSection() {
  const site = await getSiteContent()

  return (
    <SectionWrapper variant="dark">
      <div className="mb-12 text-center">
        <Badge variant="rose">Personalización</Badge>
        <h2 className="mt-4 font-display text-3xl uppercase tracking-[0.08em] text-heaven-text md:text-4xl">
          Hacemos tu idea realidad
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-heaven-muted">
          {site.personalizacionIntro}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {site.personalizacionTecnicas.map((t) => (
          <div
            key={t.nombre}
            className="rounded-[1.75rem] border border-heaven-divider bg-heaven-bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-heaven-lilac/30 hover:shadow-heaven-glow"
          >
            <h3 className="font-display text-lg uppercase tracking-[0.12em] text-heaven-text">
              {t.nombre}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-heaven-muted">{t.descripcion}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="mb-6 text-heaven-muted">
          ¿No sabes qué técnica es la mejor para tu diseño? Cuéntanos tu idea y te ayudamos.
        </p>
        <CTAButton
          variant="whatsapp"
          href={buildWhatsAppUrl('Hola! Quiero saber sobre las técnicas de personalización que manejan')}
          external
        >
          Consultar por WhatsApp
        </CTAButton>
      </div>
    </SectionWrapper>
  )
}

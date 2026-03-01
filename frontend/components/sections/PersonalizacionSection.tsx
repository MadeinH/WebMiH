import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/** Técnicas de personalización disponibles */
const tecnicas = [
  {
    nombre: 'DTF (Direct to Film)',
    descripcion: 'Estampados a todo color con alta resolución y durabilidad. Ideal para diseños complejos.',
    icono: '🎨',
  },
  {
    nombre: 'Sublimación',
    descripcion: 'Colores vibrantes que se funden con la tela. Perfecto para poliéster y telas claras.',
    icono: '🌈',
  },
  {
    nombre: 'Serigrafía',
    descripcion: 'Técnica clásica para grandes cantidades. Colores sólidos y duraderos.',
    icono: '🖨️',
  },
  {
    nombre: 'Vinil Textil',
    descripcion: 'Diseños con textura y relieve. Ideal para nombres, números y logos.',
    icono: '✂️',
  },
  {
    nombre: 'Bordado',
    descripcion: 'Acabado premium y elegante. Perfecto para logos y diseños pequeños.',
    icono: '🧵',
  },
  {
    nombre: 'Estampado Reflectivo',
    descripcion: 'Diseños que brillan en la oscuridad con luz directa. Efecto impactante.',
    icono: '✨',
  },
]

/** Sección de técnicas de personalización */
export default function PersonalizacionSection() {
  return (
    <SectionWrapper variant="dark">
      <div className="mb-12 text-center">
        <Badge variant="rose">Personalización</Badge>
        <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-heaven-text md:text-4xl">
          Hacemos tu idea realidad
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-heaven-muted">
          Contamos con múltiples técnicas de personalización para que tu diseño quede exactamente como lo imaginas.
          Si no estás seguro de cuál elegir, te asesoramos.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tecnicas.map((t) => (
          <div
            key={t.nombre}
            className="rounded-2xl border border-heaven-divider bg-heaven-bg-card p-6 transition-all duration-300 hover:border-heaven-lilac/30 hover:shadow-heaven-glow"
          >
            <div className="mb-3 text-3xl">{t.icono}</div>
            <h3 className="font-display text-lg uppercase tracking-wide text-heaven-text">
              {t.nombre}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-heaven-muted">{t.descripcion}</p>
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
          href={buildWhatsAppUrl('Hola! Quiero saber sobre las técnicas de personalización que manejan 🎨')}
          external
        >
          Consultar por WhatsApp
        </CTAButton>
      </div>
    </SectionWrapper>
  )
}

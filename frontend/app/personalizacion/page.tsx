import type { Metadata } from 'next'
import SectionWrapper from '@/components/ui/SectionWrapper'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Personalización',
  description:
    'Conoce todas las técnicas de personalización disponibles: DTF, sublimación, serigrafía, vinil textil, bordado y estampado reflectivo.',
}

/** Técnicas de personalización con detalle extendido */
const tecnicas = [
  {
    nombre: 'DTF (Direct to Film)',
    descripcion:
      'Impresión de película directa. Permite estampados a todo color con alta resolución y durabilidad. Ideal para diseños complejos, fotografías y gradientes. Compatible con la mayoría de telas y práctico para pedidos pequeños.',
    ideal: 'Diseños multicolor, fotos, gradientes',
    telas: 'Algodón, poliéster, mezclas',
    icono: null,
    variant: 'lilac' as const,
  },
  {
    nombre: 'Sublimación',
    descripcion:
      'Los colores se funden directamente en la fibra del tejido mediante calor. Genera un acabado suave que no se agrieta. Excelente para diseños vibrantes en prendas de colores claros.',
    ideal: 'Diseños all-over, colores vibrantes y saturados',
    telas: 'Poliéster y telas sintéticas',
    icono: null,
    variant: 'mint' as const,
  },
  {
    nombre: 'Serigrafía',
    descripcion:
      'Impresión por pantalla mediante plantillas. Ideal para grandes volúmenes con colores sólidos. Acabado profesional, muy duradero y económico en cantidades altas.',
    ideal: 'Logos, textos, diseños con pocos colores, volúmenes altos',
    telas: 'Algodón, mezclas, fibras naturales',
    icono: null,
    variant: 'rose' as const,
  },
  {
    nombre: 'Vinil Textil',
    descripcion:
      'Material cortado con plotter y transferido con calor. Crea efecto de textura. Disponible en acabados mate, brillante y especiales. Ideal para nombres, números y logos monocromáticos.',
    ideal: 'Nombres, números, logos de color único',
    telas: 'Algodón, poliéster, mezclas',
    icono: null,
    variant: 'lilac' as const,
  },
  {
    nombre: 'Bordado',
    descripcion:
      'Acabado premium con hilo industrial. Aspecto elegante y profesional. Otorga relieve y textura tangible. Ideal para logos corporativos y diseños pequeños de alta calidad.',
    ideal: 'Logos corporativos, emblemas, iniciales',
    telas: 'Telas con cuerpo suficiente (algodón, telas estructuradas)',
    icono: null,
    variant: 'mint' as const,
  },
]

export default function PersonalizacionPage() {
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
            Contamos con múltiples técnicas para que tu diseño quede exactamente como lo imaginas.
            Si no estás seguro de cuál elegir, te asesoramos sin compromiso.
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
              href={buildWhatsAppUrl('Hola! Quiero personalizar un producto. ¿Me pueden asesorar? 🎨')}
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

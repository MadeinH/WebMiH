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
      'Transferencia directa a película. Permite estampados a todo color con excelente resolución y durabilidad. Funciona en prácticamente cualquier tipo de tela y color de prenda.',
    ideal: 'Diseños multicolor complejos, fotos, gradientes',
    telas: 'Algodón, poliéster, mezclas',
    icono: '🎨',
    variant: 'lilac' as const,
  },
  {
    nombre: 'Sublimación',
    descripcion:
      'Los colores se funden directamente con la fibra del tejido mediante calor. El resultado es un acabado suave al tacto que no se agrieta ni se pela.',
    ideal: 'Diseños all-over, colores vibrantes',
    telas: 'Poliéster y telas claras',
    icono: '🌈',
    variant: 'mint' as const,
  },
  {
    nombre: 'Serigrafía',
    descripcion:
      'Técnica clásica de impresión por plantilla. Ideal para grandes cantidades con colores sólidos. Acabado profesional y muy duradero.',
    ideal: 'Logos, textos, diseños de pocos colores',
    telas: 'Algodón, mezclas',
    icono: '🖨️',
    variant: 'rose' as const,
  },
  {
    nombre: 'Vinil Textil',
    descripcion:
      'Material cortado con plotter y transferido con calor. Genera textura y relieve en la prenda. Disponible en acabados mate, brillante y especiales.',
    ideal: 'Nombres, números, logos monocromáticos',
    telas: 'Algodón, poliéster, mezclas',
    icono: '✂️',
    variant: 'lilac' as const,
  },
  {
    nombre: 'Bordado',
    descripcion:
      'Acabado premium bordado con hilo industrial. Da un aspecto elegante y profesional. Perfecto para logos corporativos o diseños pequeños de alta calidad.',
    ideal: 'Logos, emblemas, iniciales',
    telas: 'Cualquier tela con cuerpo suficiente',
    icono: '🧵',
    variant: 'mint' as const,
  },
  {
    nombre: 'Estampado Reflectivo',
    descripcion:
      'Material que refleja la luz directa en la oscuridad. Efecto visual impactante para prendas deportivas o streetwear. Cargo adicional de +$5.000 por unidad.',
    ideal: 'Streetwear, ropa deportiva nocturna',
    telas: 'Cualquier tela compatible con DTF',
    icono: '✨',
    variant: 'rose' as const,
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
              <div className="mb-4 text-4xl">{t.icono}</div>
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

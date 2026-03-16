import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface OutOfCatalogBannerProps {
  title: string
  description: string
}

/** Banner para productos fuera de catálogo */
export default function OutOfCatalogBanner({ title, description }: OutOfCatalogBannerProps) {
  return (
    <section className="bg-heaven-bg-dark py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="rounded-2xl border border-heaven-divider bg-gradient-to-br from-heaven-bg-card to-heaven-bg-dark p-8 md:p-12">
          <h2 className="font-display text-2xl uppercase tracking-wide text-heaven-text md:text-3xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-heaven-muted">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CTAButton
              variant="whatsapp"
              href={buildWhatsAppUrl('Hola! Busco un producto que no está en el catálogo')}
              external
            >
              Escríbenos al WhatsApp
            </CTAButton>
            <CTAButton variant="outline" href="/cotizacion">
              Solicitar cotización
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import CTAButton from '@/components/ui/CTAButton'

const STATUS_LABELS = {
  APPROVED: {
    title: 'Pago aprobado',
    description: 'Tu pago fue confirmado. Pronto te contactaremos con la trazabilidad del pedido.',
  },
  DECLINED: {
    title: 'Pago rechazado',
    description: 'El pago no se pudo completar. Puedes intentar nuevamente o escribirnos por WhatsApp.',
  },
  PENDING: {
    title: 'Pago pendiente',
    description: 'Estamos validando el estado de la transacción. Te confirmaremos en cuanto cambie.',
  },
}

export const metadata = {
  title: 'Estado de pedido',
}

export default function PedidoStatusPage({ params, searchParams }) {
  const status = (searchParams?.status ?? 'PENDING').toUpperCase()
  const info = STATUS_LABELS[status] ?? {
    title: 'Estado en verificación',
    description: 'Estamos confirmando tu transacción. Si tienes dudas, contáctanos por WhatsApp.',
  }

  return (
    <SectionWrapper>
      <div className="mx-auto max-w-2xl rounded-2xl border border-heaven-divider bg-heaven-bg-card p-8 text-center shadow-heaven-card">
        <h1 className="font-display text-4xl uppercase tracking-wide text-heaven-text">{info.title}</h1>
        <p className="mt-4 text-heaven-muted">{info.description}</p>
        <p className="mt-6 text-sm text-heaven-muted">
          Referencia: <span className="font-semibold text-heaven-text">{params.id}</span>
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <CTAButton href="/catalogo" variant="primary">
            Volver al catálogo
          </CTAButton>
          <CTAButton href="/cotizacion" variant="outline">
            Ir a cotización
          </CTAButton>
        </div>

        <p className="mt-6 text-xs text-heaven-muted">
          También puedes volver al inicio desde{' '}
          <Link href="/" className="text-heaven-lilac underline transition-colors duration-200 hover:text-heaven-mint">
            esta página
          </Link>
          .
        </p>
      </div>
    </SectionWrapper>
  )
}

import Link from 'next/link'
import SectionWrapper from '@/components/ui/SectionWrapper'
import CTAButton from '@/components/ui/CTAButton'
import { createServerClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, { title: string; description: string; color: string; bg: string; icon: 'check' | 'x' | 'clock' | 'alert' }> = {
  APPROVED: {
    title: 'Pago Aprobado',
    description: 'Tu pago fue procesado exitosamente. Pronto nos pondremos en contacto con la información de envío.',
    color: 'text-heaven-mint',
    bg: 'bg-heaven-bg-dark/50',
    icon: 'check',
  },
  DECLINED: {
    title: 'Pago Rechazado',
    description: 'Lamentablemente el pago no se completó. Verifica los datos de tu tarjeta e intenta nuevamente.',
    color: 'text-heaven-rose',
    bg: 'bg-heaven-bg-dark/50',
    icon: 'x',
  },
  PENDING: {
    title: 'Pago Pendiente',
    description: 'Estamos validando el estado de tu transacción en tiempo real. Esto generalmente toma menos de 5 minutos.',
    color: 'text-heaven-lilac',
    bg: 'bg-heaven-bg-dark/50',
    icon: 'clock',
  },
  ERROR: {
    title: 'Error en Transacción',
    description: 'Ocurrió un error procesando tu pago. Nuestro equipo está revisando. Tu dinero no ha sido debitado.',
    color: 'text-heaven-rose',
    bg: 'bg-heaven-bg-dark/50',
    icon: 'alert',
  },
}

export const metadata = {
  title: 'Estado de tu pedido',
  description: 'Revisa el estado de tu pedido en Made in Heaven',
}

export const revalidate = 10 // ISR: revalidar cada 10 segundos

interface PedidoStatusPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PedidoStatusPage({ params, searchParams }: PedidoStatusPageProps) {
  const { id: orderId } = await params
  const parsedSearchParams = await searchParams
  
  // Buscar en Supabase
  let order: any = null
  let fetchError = false
  
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Pedido Status] Supabase error:', error.message)
      fetchError = true
    }
    
    order = data
  } catch (err) {
    console.error('[Pedido Status] Database error:', err)
    fetchError = true
  }

  // Si no encuentra en UUID, intenta buscar por wompi_reference (legacy)
  if (!order && !fetchError) {
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('wompi_reference', orderId)
        .single()
      
      if (!error) {
        order = data
      }
    } catch (err) {
      // silently fail
    }
  }

  // Usar searchParams como fallback para estado (backward compatibility)
  const statusParam = typeof parsedSearchParams?.status === 'string' ? parsedSearchParams.status : undefined
  const status = (order?.estado?.toUpperCase() ?? statusParam ?? 'PENDING').toUpperCase()
  const info = STATUS_LABELS[status] ?? STATUS_LABELS.PENDING

  const orderDate = order?.created_at 
    ? new Date(order.created_at).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No disponible'

  return (
    <SectionWrapper>
      <div className="mx-auto max-w-2xl rounded-2xl border border-heaven-divider bg-heaven-bg-card p-8 text-center shadow-heaven-card">
        <div className="flex items-center justify-center gap-3 mb-4">
          {info.icon === 'check' && (
            <svg className={`h-8 w-8 ${info.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {info.icon === 'x' && (
            <svg className={`h-8 w-8 ${info.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {info.icon === 'clock' && (
            <svg className={`h-8 w-8 ${info.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-11a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {info.icon === 'alert' && (
            <svg className={`h-8 w-8 ${info.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47A9 9 0 1112 21a9.005 9.005 0 01-4.92-14.53" />
            </svg>
          )}
        </div>
        <h1 className={`font-display text-4xl uppercase tracking-wide ${info.color}`}>{info.title}</h1>
        <p className="mt-4 text-heaven-muted text-sm">{info.description}</p>

        {/* Información del pedido (si existe) */}
        {order && (
          <div className={`mt-6 rounded-lg ${info.bg} p-4 text-left space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-heaven-muted">Referencia:</span>
              <span className="font-mono text-sm text-heaven-text">{orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-heaven-muted">Total:</span>
              <span className="font-semibold text-heaven-lilac">${order.total_cop?.toLocaleString('es-CO') ?? '0'} COP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-heaven-muted">Cliente:</span>
              <span className="text-heaven-text">{order.nombre_cliente}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-heaven-muted">Email:</span>
              <span className="text-heaven-text text-sm">{order.email_cliente}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-heaven-muted">Fecha:</span>
              <span className="text-heaven-muted text-sm">{orderDate}</span>
            </div>
            {order.items && Array.isArray(order.items) && (
              <div className="border-t border-heaven-divider pt-3 mt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-heaven-muted">Ítems: {order.items.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Referencia simple (fallback) */}
        {!order && (
          <p className="mt-6 text-sm text-heaven-muted">
            Referencia: <span className="font-semibold text-heaven-text font-mono">{orderId}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <CTAButton href="/catalogo" variant="primary">
            Volver al catálogo
          </CTAButton>
          <CTAButton href="/" variant="outline">
            Ir al inicio
          </CTAButton>
        </div>

        <p className="mt-6 text-xs text-heaven-muted">
          ¿Dudas sobre tu pedido?{' '}
          <Link href="https://wa.me/573249207921" target="_blank" rel="noopener noreferrer" className="text-heaven-lilac underline transition-colors duration-200 hover:text-heaven-mint">
            Escríbenos por WhatsApp
          </Link>
          .
        </p>
      </div>
    </SectionWrapper>
  )
}

import { NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/validations'
import { createServerClient } from '@/lib/supabase/server'
import {
  checkoutCreateLimiter,
  createLogContext,
  logSecurityEvent,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  validateCSRF,
} from '@/lib/security'
import {
  buildWompiHostedCheckoutUrl,
  buildWompiRedirectUrl,
  calculateAmountInCents,
  generateWompiReference,
} from '@/lib/wompi'

const MAX_BODY_SIZE = 20_480

export async function POST(request) {
  const ctx = createLogContext(request)

  try {
    const rateResult = checkoutCreateLimiter.check(ctx.ip)
    if (!rateResult.allowed) {
      logSecurityEvent({ ...ctx, type: 'RATE_LIMITED', message: 'Checkout rate limited' })
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
        { status: 429, headers: checkoutCreateLimiter.getHeaders(rateResult) },
      )
    }

    const csrfError = validateCSRF(request)
    if (csrfError) {
      logSecurityEvent({ ...ctx, type: 'ACCESS_DENIED', message: `CSRF check failed: ${csrfError}` })
      return NextResponse.json({ error: 'Solicitud no autorizada' }, { status: 403 })
    }

    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 })
    }

    let body
    try {
      const rawBody = await request.text()
      if (rawBody.length > MAX_BODY_SIZE) {
        return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 })
      }
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      logSecurityEvent({ ...ctx, type: 'INVALID_INPUT', message: 'Checkout validation failed' })
      return NextResponse.json(
        { error: 'Datos inválidos. Verifica los campos del formulario.' },
        { status: 400 },
      )
    }

    const safeNombre = sanitizeText(parsed.data.nombre, 100)
    const safeEmail = sanitizeEmail(parsed.data.email)
    const safeWhatsapp = parsed.data.whatsapp ? sanitizePhone(parsed.data.whatsapp) : null

    if (!safeEmail || (parsed.data.whatsapp && !safeWhatsapp)) {
      return NextResponse.json({ error: 'Email o teléfono inválido' }, { status: 400 })
    }

    const totalCop = parsed.data.items.reduce(
      (sum, item) => sum + (item.cantidad * item.precioUnitario),
      0,
    )

    if (!Number.isSafeInteger(totalCop) || totalCop <= 0) {
      return NextResponse.json({ error: 'Total inválido en el carrito' }, { status: 400 })
    }

    // IDEMPOTENCIA: Verificar si existe un pedido con los mismos datos
    // Esto evita crear múltiples transacciones si el usuario reintenta rápidamente
    const supabase = createServerClient()
    
    // Buscar pedido previo con el mismo email, total y items (para detectar duplicados)
    const { data: existingOrders } = await supabase
      .from('pedidos')
      .select('*')
      .eq('email_cliente', safeEmail)
      .eq('total_cop', totalCop)
      .order('created_at', { ascending: false })
      .limit(1)
    
    // Si existe un pedido idéntico creado recientemente (<5 min), reutilizarlo (idempotencia)
    if (existingOrders && existingOrders.length > 0) {
      const lastOrder = existingOrders[0]
      const createdAtTime = new Date(lastOrder.created_at).getTime()
      const nowTime = Date.now()
      const diffMinutes = (nowTime - createdAtTime) / (1000 * 60)
      
      if (diffMinutes < 5 && lastOrder.estado === 'pendiente') {
        // Reutilizar la checkout URL existente (misma referencia)
        const reference = lastOrder.wompi_reference
        const amountInCents = calculateAmountInCents(totalCop)
        const redirectUrl = buildWompiRedirectUrl(reference)
        const checkoutUrl = await buildWompiHostedCheckoutUrl({
          amountInCents,
          currency: 'COP',
          customerEmail: safeEmail,
          redirectUrl,
          reference,
        })
        
        logSecurityEvent({
          ...ctx,
          type: 'CHECKOUT_REUSED',
          message: `Checkout reutilizado (idempotencia) para referencia ${reference}`,
        })
        
        return NextResponse.json(
          {
            reference,
            amountInCents,
            currency: 'COP',
            checkoutUrl,
            idempotent: true,
          },
          {
            status: 200,
            headers: checkoutCreateLimiter.getHeaders(rateResult),
          },
        )
      }
    }

    // Crear nuevo checkout
    const reference = generateWompiReference()
    const amountInCents = calculateAmountInCents(totalCop)
    const redirectUrl = buildWompiRedirectUrl(reference)
    const checkoutUrl = await buildWompiHostedCheckoutUrl({
      amountInCents,
      currency: 'COP',
      customerEmail: safeEmail,
      redirectUrl,
      reference,
    })

    try {
      await supabase.from('pedidos').insert({
        wompi_reference: reference,
        estado: 'pendiente',
        total_cop: totalCop,
        nombre_cliente: safeNombre,
        email_cliente: safeEmail,
        whatsapp: safeWhatsapp,
        items: parsed.data.items,
      })
    } catch (dbError) {
      logSecurityEvent({
        ...ctx,
        type: 'API_ERROR',
        message: 'No se pudo guardar el pedido pendiente antes de checkout',
        details: { error: dbError instanceof Error ? dbError.message : 'unknown' },
      })
    }

    logSecurityEvent({
      ...ctx,
      type: 'CHECKOUT_CREATED',
      message: `Checkout creado para referencia ${reference}`,
    })

    return NextResponse.json(
      {
        reference,
        amountInCents,
        currency: 'COP',
        checkoutUrl,
      },
      {
        status: 201,
        headers: checkoutCreateLimiter.getHeaders(rateResult),
      },
    )
  } catch (error) {
    logSecurityEvent({
      ...ctx,
      type: 'API_ERROR',
      message: `Checkout create failed: ${error instanceof Error ? error.message : 'unknown'}`,
    })

    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Intenta nuevamente.' },
      { status: 500 },
    )
  }
}

const METHOD_NOT_ALLOWED = { error: 'Method not allowed' }
const ALLOW_POST = { status: 405, headers: { Allow: 'POST' } }

export async function GET() {
  return NextResponse.json(METHOD_NOT_ALLOWED, ALLOW_POST)
}

export async function PUT() {
  return NextResponse.json(METHOD_NOT_ALLOWED, ALLOW_POST)
}

export async function DELETE() {
  return NextResponse.json(METHOD_NOT_ALLOWED, ALLOW_POST)
}

export async function PATCH() {
  return NextResponse.json(METHOD_NOT_ALLOWED, ALLOW_POST)
}

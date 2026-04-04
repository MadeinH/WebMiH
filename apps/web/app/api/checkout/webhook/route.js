import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { wompiWebhookSchema } from '@/lib/validations'
import { createLogContext, logSecurityEvent } from '@/lib/security'
import { normalizeWompiStatus, verifyWompiWebhookSignature } from '@/lib/wompi'

function getIncomingSignature(request, fallbackChecksum) {
  return (
    request.headers.get('x-wompi-signature') ??
    request.headers.get('x-signature') ??
    fallbackChecksum ??
    ''
  )
}

export async function POST(request) {
  const ctx = createLogContext(request)

  try {
    const rawBody = await request.text()

    let payload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      logSecurityEvent({ ...ctx, type: 'INVALID_INPUT', message: 'Webhook body no es JSON válido' })
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const parsed = wompiWebhookSchema.safeParse(payload)
    if (!parsed.success) {
      logSecurityEvent({ ...ctx, type: 'INVALID_INPUT', message: 'Webhook Wompi no cumple schema' })
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const signature = getIncomingSignature(request, parsed.data.signature?.checksum)
    const isValid = await verifyWompiWebhookSignature(rawBody, signature)
    if (!isValid) {
      logSecurityEvent({ ...ctx, type: 'ACCESS_DENIED', message: 'Firma webhook inválida' })
      return NextResponse.json({ error: 'Firma inválida' }, { status: 403 })
    }

    const tx = parsed.data.data.transaction
    const estado = normalizeWompiStatus(tx.status)

    const supabase = createServerClient()
    const { error } = await supabase
      .from('pedidos')
      .update({
        wompi_id: tx.id,
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq('wompi_reference', tx.reference)

    if (error) {
      logSecurityEvent({
        ...ctx,
        type: 'API_ERROR',
        message: 'Error actualizando pedido desde webhook',
        details: { code: error.code, txReference: tx.reference },
      })
      return NextResponse.json({ error: 'No se pudo procesar webhook' }, { status: 500 })
    }

    logSecurityEvent({
      ...ctx,
      type: 'PAYMENT_WEBHOOK_SUCCESS',
      message: `Webhook procesado para referencia ${tx.reference} con estado ${estado}`,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logSecurityEvent({
      ...ctx,
      type: 'API_ERROR',
      message: `Error no controlado en webhook: ${error instanceof Error ? error.message : 'unknown'}`,
    })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
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

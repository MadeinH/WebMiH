import { NextResponse } from 'next/server'
import { solicitudCotizacionSchema } from '@/lib/validations'
import { createServerClient } from '@/lib/supabase/server'
import {
  cotizacionLimiter,
  validateCSRF,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  logSecurityEvent,
  createLogContext,
} from '@/lib/security'

/** Tamaño máximo de body aceptado (10KB) — A05: prevenir payloads enormes */
const MAX_BODY_SIZE = 10_240

/** POST — Guardar solicitud de cotización en Supabase */
export async function POST(request: Request) {
  const ctx = createLogContext(request)

  try {
    // ── A01: Rate Limiting ──────────────────────────
    const rateResult = cotizacionLimiter.check(ctx.ip)
    if (!rateResult.allowed) {
      logSecurityEvent({ ...ctx, type: 'RATE_LIMITED', message: 'Cotización rate limited' })
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
        { status: 429, headers: cotizacionLimiter.getHeaders(rateResult) }
      )
    }

    // ── A01: CSRF Validation ────────────────────────
    const csrfError = validateCSRF(request)
    if (csrfError) {
      logSecurityEvent({ ...ctx, type: 'ACCESS_DENIED', message: `CSRF check failed: ${csrfError}` })
      return NextResponse.json(
        { error: 'Solicitud no autorizada' },
        { status: 403 }
      )
    }

    // ── A05: Limitar tamaño del body ────────────────
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      logSecurityEvent({ ...ctx, type: 'SUSPICIOUS_REQUEST', message: `Oversized body: ${contentLength}` })
      return NextResponse.json(
        { error: 'Solicitud demasiado grande' },
        { status: 413 }
      )
    }

    // ── Parsear body de forma segura ────────────────
    let body: unknown
    try {
      const text = await request.text()
      if (text.length > MAX_BODY_SIZE) {
        return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 })
      }
      body = JSON.parse(text)
    } catch {
      logSecurityEvent({ ...ctx, type: 'INVALID_INPUT', message: 'Malformed JSON body' })
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    // ── A05: Validar schema con Zod ─────────────────
    const parseResult = solicitudCotizacionSchema.safeParse(body)
    if (!parseResult.success) {
      logSecurityEvent({
        ...ctx,
        type: 'INVALID_INPUT',
        message: 'Zod validation failed',
        details: { errors: parseResult.error.issues.map((i: { message: string }) => i.message) },
      })
      // A02: NO exponer detalles de validación internos al cliente
      return NextResponse.json(
        { error: 'Datos inválidos. Verifica los campos del formulario.' },
        { status: 400 }
      )
    }

    const { nombre, email, whatsapp, comentarios, items, recaptchaToken } = parseResult.data

    // ── A05: Sanitizar inputs después de validación ─
    const cleanNombre = sanitizeText(nombre, 100)
    const cleanEmail = sanitizeEmail(email)
    const cleanWhatsapp = sanitizePhone(whatsapp)
    const cleanComentarios = comentarios ? sanitizeText(comentarios, 500) : null

    if (!cleanEmail || !cleanWhatsapp) {
      return NextResponse.json({ error: 'Email o teléfono inválido' }, { status: 400 })
    }

    // Sanitizar items
    const cleanItems = items.map((item: { nombre: string; variantes: string; comentario?: string; productoId: string; cantidad: number }) => ({
      ...item,
      nombre: sanitizeText(item.nombre, 200),
      variantes: sanitizeText(item.variantes, 200),
      comentario: item.comentario ? sanitizeText(item.comentario, 200) : undefined,
    }))

    // ── A07: Verificar reCAPTCHA v3 ─────────────────
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    if (process.env.NODE_ENV === 'production' && !recaptchaSecret) {
      logSecurityEvent({ ...ctx, type: 'API_ERROR', message: 'RECAPTCHA_SECRET_KEY no configurado en producción' })
      return NextResponse.json(
        { error: 'Servicio temporalmente no disponible.' },
        { status: 503 }
      )
    }

    if (recaptchaSecret) {
      try {
        const recaptchaResponse = typeof recaptchaToken === 'string' ? recaptchaToken : ''
        const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: recaptchaResponse,
          }),
        })
        const recaptchaData = await recaptchaRes.json()

        if (!recaptchaData.success || recaptchaData.score < 0.5) {
          logSecurityEvent({
            ...ctx,
            type: 'RECAPTCHA_FAILURE',
            message: `Score: ${recaptchaData.score ?? 'N/A'}`,
          })
          return NextResponse.json(
            { error: 'Verificación de seguridad fallida. Intenta de nuevo.' },
            { status: 403 }
          )
        }

        // A07: Verificar que el token fue generado para la acción correcta
        // Previene reutilización de tokens de otras páginas/acciones
        if (recaptchaData.action && recaptchaData.action !== 'submit_cotizacion') {
          logSecurityEvent({
            ...ctx,
            type: 'RECAPTCHA_FAILURE',
            message: `Action mismatch: expected submit_cotizacion, got ${recaptchaData.action}`,
          })
          return NextResponse.json(
            { error: 'Verificación de seguridad fallida. Intenta de nuevo.' },
            { status: 403 }
          )
        }
      } catch (recaptchaError) {
        // A10: No bloquear si reCAPTCHA está caído, pero loguear
        logSecurityEvent({ ...ctx, type: 'API_ERROR', message: 'reCAPTCHA service unavailable' })
      }
    }

    // ── A08: Guardar en Supabase ────────────────────
    const supabase = createServerClient()
    const { error: dbError } = await supabase.from('cotizaciones').insert({
      nombre: cleanNombre,
      email: cleanEmail,
      whatsapp: cleanWhatsapp,
      comentarios: cleanComentarios,
      items: cleanItems,
      estado: 'pendiente',
    })

    if (dbError) {
      // A09: Loguear error de DB pero NO exponer detalles al cliente
      logSecurityEvent({
        ...ctx,
        type: 'API_ERROR',
        message: 'Database insert failed',
        details: { code: dbError.code },
      })
      return NextResponse.json(
        { error: 'Error al procesar la solicitud. Intenta más tarde.' },
        { status: 500 }
      )
    }

    // ── A09: Audit trail — registrar cotización exitosa ─
    logSecurityEvent({
      ...ctx,
      type: 'COTIZACION_SUCCESS',
      message: `Cotización creada: ${cleanEmail} — ${cleanItems.length} items`,
    })

    return NextResponse.json(
      { message: 'Cotización recibida exitosamente' },
      { status: 201, headers: cotizacionLimiter.getHeaders(rateResult) }
    )
  } catch (error) {
    logSecurityEvent({
      ...ctx,
      type: 'API_ERROR',
      message: `Unhandled error: ${error instanceof Error ? error.message : 'unknown'}`,
    })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/** Rechazar otros métodos HTTP — A02: Misconfiguration */
const METHOD_NOT_ALLOWED = { error: 'Method not allowed' }
const ALLOW_POST = { status: 405, headers: { Allow: 'POST' } } as const

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

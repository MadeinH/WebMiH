import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE_NAME,
  clearAdminAttempt,
  createAdminSessionToken,
  getAdminAttempt,
  getAdminRetryAfterSeconds,
  getAdminSessionCookieOptions,
  isAdminCredentialConfigured,
  isAdminSessionConfigured,
  registerFailedAdminAttempt,
  validateAdminCredentials,
  validateCSRF,
} from '@/lib/security'

function getRequestIP(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

export async function POST(request: Request) {
  const csrfError = validateCSRF(request)
  if (csrfError) {
    const errorMessage = process.env.NODE_ENV !== 'production'
      ? `Solicitud no autorizada (${csrfError})`
      : 'Solicitud no autorizada'

    return NextResponse.json(
      { error: errorMessage },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (!isAdminCredentialConfigured() || !isAdminSessionConfigured()) {
    return NextResponse.json(
      { error: 'La autenticación administrativa no está configurada' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const ip = getRequestIP(request)
  const blocked = await getAdminAttempt(ip)
  if (blocked && blocked.blockedUntil > Date.now()) {
    const retryAfter = getAdminRetryAfterSeconds(blocked)
    return NextResponse.json(
      { error: 'Demasiados intentos fallidos. Intenta más tarde.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(retryAfter),
        },
      },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const username = typeof (payload as { username?: unknown })?.username === 'string'
    ? (payload as { username: string }).username.trim()
    : ''
  const password = typeof (payload as { password?: unknown })?.password === 'string'
    ? (payload as { password: string }).password
    : ''

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Debes ingresar usuario y contraseña' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (!validateAdminCredentials(username, password)) {
    const attempt = await registerFailedAdminAttempt(ip)
    const response = NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )

    if (attempt.blockedUntil > Date.now()) {
      response.headers.set('Retry-After', String(getAdminRetryAfterSeconds(attempt)))
    }

    return response
  }

  await clearAdminAttempt(ip)

  const token = await createAdminSessionToken(username)
  if (!token) {
    return NextResponse.json(
      { error: 'No se pudo crear la sesión administrativa' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const response = NextResponse.json(
    { authenticated: true, username },
    { headers: { 'Cache-Control': 'no-store' } },
  )

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, getAdminSessionCookieOptions())
  return response
}
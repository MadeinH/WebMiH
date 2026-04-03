import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionCookieDeletionOptions,
  validateCSRF,
} from '@/lib/security'

export async function POST(request: Request) {
  const csrfError = validateCSRF(request)
  if (csrfError) {
    return NextResponse.json(
      { error: 'Solicitud no autorizada' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const response = NextResponse.json(
    { authenticated: false },
    { headers: { 'Cache-Control': 'no-store' } },
  )

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', getAdminSessionCookieDeletionOptions())
  return response
}
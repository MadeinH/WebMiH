import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE_NAME, getAdminSessionCookieDeletionOptions } from '@/lib/security'

export async function POST() {
  const response = NextResponse.json(
    { authenticated: false },
    { headers: { 'Cache-Control': 'no-store' } },
  )

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', getAdminSessionCookieDeletionOptions())
  return response
}
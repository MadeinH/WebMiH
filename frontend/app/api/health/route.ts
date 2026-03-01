import { NextResponse } from 'next/server'

/**
 * GET — Health check endpoint
 * A02: Revelar solo información mínima necesaria (no versiones ni env)
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

/** Rechazar otros métodos — A02: incluir Allow header per HTTP spec */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'GET' } }
  )
}

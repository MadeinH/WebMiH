import { NextResponse } from 'next/server'

export const revalidate = 60

/**
 * GET — Health check endpoint
 * A02: Revelar solo información mínima necesaria (no versiones ni env)
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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

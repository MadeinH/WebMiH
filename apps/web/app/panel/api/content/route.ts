import { NextResponse } from 'next/server'
import { getAdminContent, saveAdminContent } from '@/lib/content/repository'
import { adminContentSchema } from '@/lib/validations'
import { getAdminSessionFromRequest, validateCSRF } from '@/lib/security'

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  const content = await getAdminContent()
  return NextResponse.json(content, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  const csrfError = validateCSRF(request)
  if (csrfError) {
    const errorMessage = process.env.NODE_ENV !== 'production'
      ? `Solicitud no autorizada (${csrfError})`
      : 'Solicitud no autorizada'

    return NextResponse.json({ error: errorMessage }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }

  const session = await getAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }

  const parsed = adminContentSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'El contenido no pasó la validación',
        fieldErrors: parsed.error.flatten().fieldErrors,
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      },
      { status: 422, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const saved = await saveAdminContent(parsed.data)
    return NextResponse.json(saved, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo persistir el contenido del panel.'
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
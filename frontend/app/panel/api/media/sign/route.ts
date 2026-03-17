import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest, verifyOrigin } from '@/lib/security'

const DEFAULT_BUCKET = 'catalog-media'

// Simple in-memory rate limiter (per IP) — safe for single-instance dev/testing.
const rateMap = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000 // 1 minute
const MAX_PER_WINDOW = 30

function getIp(request: Request) {
  try {
    // @ts-ignore nextUrl may not exist in Node script; fallback to unknown
    return (request as any).ip ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })

  if (!verifyOrigin(request)) return NextResponse.json({ error: 'Origen inválido' }, { status: 403 })

  const ip = getIp(request)
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    entry.count++
    if (entry.count > MAX_PER_WINDOW) {
      console.warn(`[sign] rate limit exceeded for ${ip}`)
      return NextResponse.json({ error: 'Demasiadas solicitudes, reintenta más tarde' }, { status: 429 })
    }
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const filenameRaw = String(body.filename ?? '')
  const folderRaw = String(body.folder ?? 'panel')
  const folder = folderRaw.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.\.{2,}/g, '') || 'panel'
  const ext = (filenameRaw.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '')
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  try {
    const supabase = createServerClient()
    const bucket = process.env.SUPABASE_CMS_BUCKET || DEFAULT_BUCKET
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
    if (error) {
      console.error('[sign] createSignedUploadUrl error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // eslint-disable-next-line no-console
    console.info(`[sign] ${session.username ?? 'admin'} signed upload for ${path} from ${ip}`)
    return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: data.path })
  } catch (err: any) {
    console.error('[sign] unexpected error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

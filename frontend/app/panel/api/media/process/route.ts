import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest, verifyOrigin } from '@/lib/security'
import sharp from 'sharp'

const DEFAULT_BUCKET = 'catalog-media'

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })

  if (!verifyOrigin(request)) return NextResponse.json({ error: 'Origen inválido' }, { status: 403 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const path = String(body.path ?? '')
  if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 })
  const safePath = path.replace(/[^a-zA-Z0-9/_\-.]/g, '')
  if (!safePath || !['panel/', 'catalog/', 'accessories/'].some((prefix) => safePath.startsWith(prefix))) {
    return NextResponse.json({ error: 'Path inválido' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const bucket = process.env.SUPABASE_CMS_BUCKET || DEFAULT_BUCKET

    const downloaded = await supabase.storage.from(bucket).download(safePath)
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json({ error: downloaded.error?.message ?? 'No encontrado' }, { status: 404 })
    }

    const arrayBuffer = await (downloaded.data as any).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Only process raster images
    const mime = (await sharp(buffer).metadata()).format
    if (!mime) return NextResponse.json({ error: 'Formato no soportado' }, { status: 415 })

    const baseId = safePath.replace(/\.[^.]+$/, '')
    const webpPath = `${baseId}.webp`
    const thumbPath = `${baseId}-thumb.webp`

    const webpBuffer = await sharp(buffer).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    const thumbBuffer = await sharp(buffer).rotate().resize({ width: 400, height: 400, fit: 'cover' }).webp({ quality: 75 }).toBuffer()

    // Upload variants
    const up1 = await supabase.storage.from(bucket).upload(webpPath, webpBuffer, { cacheControl: '31536000', upsert: false, contentType: 'image/webp' })
    if (up1.error) return NextResponse.json({ error: up1.error.message }, { status: 500 })

    const up2 = await supabase.storage.from(bucket).upload(thumbPath, thumbBuffer, { cacheControl: '31536000', upsert: false, contentType: 'image/webp' })
    if (up2.error) return NextResponse.json({ error: up2.error.message }, { status: 500 })

    const urls: Record<string, string> = {}
    urls.original = supabase.storage.from(bucket).getPublicUrl(safePath).data.publicUrl
    urls.webp = supabase.storage.from(bucket).getPublicUrl(webpPath).data.publicUrl
    urls.thumb = supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl

    return NextResponse.json({ urls, paths: [safePath, webpPath, thumbPath] })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err)
    return NextResponse.json({ error: 'No se pudo procesar el archivo' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest, verifyOrigin } from '@/lib/security'
import sharp from 'sharp'

const DEFAULT_BUCKET = 'catalog-media'
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
])

function getExtensionFromMime(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'
  if (mimeType === 'video/mp4') return 'mp4'
  return 'bin'
}

async function optimizeMedia(file: File): Promise<{
  body: Buffer
  contentType: string
  extension: string
  webpBuffer?: Buffer
  thumbBuffer?: Buffer
}> {
  const mimeType = file.type || 'application/octet-stream'
  const bytes = Buffer.from(await file.arrayBuffer())

  const result: any = {
    body: bytes,
    contentType: mimeType,
    extension: getExtensionFromMime(mimeType),
  }

  // Only optimize raster images (skip animated GIFs and videos)
  if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
    try {
      const image = sharp(bytes)
      // Normalizar orientación y limitar ancho máximo (evitar imágenes enormes)
      const optimized = await image.rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
      const thumb = await image.rotate().resize({ width: 400, height: 400, fit: 'cover' }).webp({ quality: 75 }).toBuffer()

      result.webpBuffer = optimized
      result.thumbBuffer = thumb
    } catch (err) {
      // Si falla la optimización, devolvemos el original sin bloquear el upload
      console.warn('sharp optimization failed', err)
    }
  }

  return result
}

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
  }

  if (!verifyOrigin(request)) {
    return NextResponse.json({ error: 'Origen inválido' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Formulario inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Debes adjuntar un archivo' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 415 })
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Archivo demasiado grande (máximo 10MB)' }, { status: 413 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase Storage no está configurado' }, { status: 503 })
  }

  const supabase = createServerClient()
  const bucket = process.env.SUPABASE_CMS_BUCKET || DEFAULT_BUCKET
  const { body, contentType, extension, webpBuffer, thumbBuffer } = await optimizeMedia(file)
  const folderRaw = String(formData.get('folder') ?? 'panel')
  const folder = folderRaw.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.{2,}/g, '') || 'panel'
  const now = Date.now()
  const baseId = `${folder}/${now}-${crypto.randomUUID()}`
  const originalPath = `${baseId}.${extension}`

  const uploads: Array<{ path: string; body: Buffer | Uint8Array; contentType?: string }> = [
    { path: originalPath, body, contentType },
  ]

  if (webpBuffer) {
    uploads.push({ path: `${baseId}.webp`, body: webpBuffer, contentType: 'image/webp' })
  }
  if (thumbBuffer) {
    uploads.push({ path: `${baseId}-thumb.webp`, body: thumbBuffer, contentType: 'image/webp' })
  }

  for (const u of uploads) {
    const { error } = await supabase.storage.from(bucket).upload(u.path, u.body as any, {
      cacheControl: '31536000',
      upsert: false,
      contentType: u.contentType,
    })

    if (error) {
      console.error('upload error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const urls: Record<string, string> = {}
  const originalPublic = supabase.storage.from(bucket).getPublicUrl(originalPath)
  urls.original = originalPublic.data.publicUrl
  if (webpBuffer) {
    const p = supabase.storage.from(bucket).getPublicUrl(`${baseId}.webp`)
    urls.webp = p.data.publicUrl
  }
  if (thumbBuffer) {
    const t = supabase.storage.from(bucket).getPublicUrl(`${baseId}-thumb.webp`)
    urls.thumb = t.data.publicUrl
  }

  return NextResponse.json({ urls, paths: uploads.map((u) => u.path) })
}
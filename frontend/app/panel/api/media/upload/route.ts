import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest, verifyOrigin } from '@/lib/security'

const DEFAULT_BUCKET = 'catalog-media'

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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase Storage no está configurado' }, { status: 503 })
  }

  const supabase = createServerClient()
  const bucket = process.env.SUPABASE_CMS_BUCKET || DEFAULT_BUCKET
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `panel/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path })
}
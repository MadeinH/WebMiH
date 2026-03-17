#!/usr/bin/env node
/* Test script to simulate presign + upload + process flow using Supabase server client.
   Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_CMS_BUCKET
   Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/presign_flow_test.js /path/to/file.jpg
*/

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

async function main() {
  const fileArg = process.argv[2]
  if (!fileArg) {
    console.error('Usage: node presign_flow_test.js /path/to/file.jpg')
    process.exit(2)
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const BUCKET = process.env.SUPABASE_CMS_BUCKET || 'catalog-media'

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
    process.exit(2)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const absolute = path.resolve(fileArg)
  const fileBuffer = fs.readFileSync(absolute)
  const stat = fs.statSync(absolute)

  const filename = path.basename(absolute)
  const folder = 'test-presign'
  const ext = filename.split('.').pop() || 'bin'
  const destPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  console.log('Creating signed upload URL for', destPath)
  const t0 = Date.now()
  const { data: signData, error: signErr } = await supabase.storage.from(BUCKET).createSignedUploadUrl(destPath)
  const t1 = Date.now()
  if (signErr) {
    console.error('createSignedUploadUrl error', signErr)
    process.exit(2)
  }
  console.log('Signed URL acquired in', t1 - t0, 'ms')

  // Upload via PUT
  console.log('Uploading file via signed URL (simulates admin browser)')
  const uploadStart = Date.now()
  const res = await fetch(signData.signedUrl, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: fileBuffer })
  const uploadEnd = Date.now()
  if (!res.ok) {
    console.error('Upload failed', res.status, await res.text())
    process.exit(2)
  }
  console.log('Upload completed in', uploadEnd - uploadStart, 'ms — size:', stat.size, 'bytes')

  // Simulate processing (download, process with sharp, upload variants)
  console.log('Simulating processing: download -> webp -> thumb -> upload')
  const procStart = Date.now()
  const { data: downloadData, error: dlErr } = await supabase.storage.from(BUCKET).download(destPath)
  if (dlErr || !downloadData) {
    console.error('Download error', dlErr)
    process.exit(2)
  }
  const downloaded = Buffer.from(await downloadData.arrayBuffer())
  const webp = await sharp(downloaded).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
  const thumb = await sharp(downloaded).rotate().resize({ width: 400, height: 400, fit: 'cover' }).webp({ quality: 75 }).toBuffer()

  const webpPath = destPath.replace(/\.[^.]+$/, '') + '.webp'
  const thumbPath = destPath.replace(/\.[^.]+$/, '') + '-thumb.webp'

  const up1 = await supabase.storage.from(BUCKET).upload(webpPath, webp, { cacheControl: '31536000', upsert: false, contentType: 'image/webp' })
  if (up1.error) {
    console.error('Upload webp error', up1.error)
    process.exit(2)
  }
  const up2 = await supabase.storage.from(BUCKET).upload(thumbPath, thumb, { cacheControl: '31536000', upsert: false, contentType: 'image/webp' })
  if (up2.error) {
    console.error('Upload thumb error', up2.error)
    process.exit(2)
  }
  const procEnd = Date.now()

  const originalUrl = supabase.storage.from(BUCKET).getPublicUrl(destPath).data.publicUrl
  const webpUrl = supabase.storage.from(BUCKET).getPublicUrl(webpPath).data.publicUrl
  const thumbUrl = supabase.storage.from(BUCKET).getPublicUrl(thumbPath).data.publicUrl

  console.log('Processing completed in', procEnd - procStart, 'ms')
  console.log('URLs:')
  console.log(' original:', originalUrl)
  console.log(' webp:    ', webpUrl)
  console.log(' thumb:   ', thumbUrl)

  // Simple estimate report
  const report = {
    fileSizeBytes: stat.size,
    signDurationMs: t1 - t0,
    uploadDurationMs: uploadEnd - uploadStart,
    processingDurationMs: procEnd - procStart,
    webpSizeBytes: webp.length,
    thumbSizeBytes: thumb.length,
  }

  console.log('\n=== Report ===')
  console.table(report)
  console.log('\nEstimate: with presign, Vercel handles only signing (~few ms) and webhook calls; storage provider handles upload and egress. If processing runs in a worker on Vercel, add processingDurationMs as Vercel CPU time per job.')
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})

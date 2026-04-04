import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  const logoPath = path.resolve(process.cwd(), '..', '..', 'logo.png')
  const file = await readFile(logoPath)
  const body = new Uint8Array(file)

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

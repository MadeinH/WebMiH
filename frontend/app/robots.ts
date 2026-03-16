import type { MetadataRoute } from 'next'
import { normalizeSiteUrl } from '@/lib/utils'

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

/**
 * Robots.txt — Next.js 14 App Router
 * Genera /robots.txt automáticamente.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

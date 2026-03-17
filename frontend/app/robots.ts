import type { MetadataRoute } from 'next'
import { normalizeSiteUrl } from '@/lib/utils'

export const revalidate = 86400

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
        disallow: ['/api/', '/panel/', '/panel/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

import type { MetadataRoute } from 'next'
import { normalizeSiteUrl } from '@/lib/utils'
import { getAccessoryItems, getCatalogItems } from '@/lib/content/repository'

export const revalidate = 86400

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

/**
 * Sitemap dinámico — Next.js 14 App Router
 * Genera /sitemap.xml automáticamente.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/catalogo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/accesorios`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/personalizacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/cotizacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const [catalogItems, accessoryItems] = await Promise.all([getCatalogItems(), getAccessoryItems()])

  const productPages: MetadataRoute.Sitemap = catalogItems.map((item) => ({
    url: `${siteUrl}/catalogo/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const accessoryPages: MetadataRoute.Sitemap = accessoryItems.map((item) => ({
    url: `${siteUrl}/accesorios/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...accessoryPages]
}

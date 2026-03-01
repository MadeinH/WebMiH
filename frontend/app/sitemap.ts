import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://madeinheavenco.com'

/**
 * Sitemap dinámico — Next.js 14 App Router
 * Genera /sitemap.xml automáticamente.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/catalogo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/accesorios`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/personalizacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/cotizacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Slugs de productos — en producción vendrán de Supabase
  const productSlugs = [
    'camiseta', 'camiseta-ranglan', 'camiseta-premium', 'camibuzo', 'camiseta-polo',
    'ranglan-manga-34', 'camiseta-acid-wash', 'camiseta-oversize', 'camiseta-oversize-premium',
    'hoodie-un-color', 'sueter-un-color', 'sueter-premium', 'hoodie-multicolor',
    'hoodie-oversize', 'hoodie-premium', 'chaqueta-un-color', 'rompevientos',
    'rompevientos-semireflectivo', 'camiseta-deportiva', 'buzo-compresivo', 'camisa-compresiva',
  ]

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${siteUrl}/catalogo/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages]
}

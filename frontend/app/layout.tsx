import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFAB from '@/components/ui/WhatsAppFAB'
import FloatingCart from '@/components/ui/FloatingCart'
import { CartProvider } from '@/lib/cart-context'
import { normalizeSiteUrl } from '@/lib/utils'
import './globals.css'

/* ============================================
   Fuentes
   ============================================ */

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
})

/* ============================================
   Metadata SEO
   ============================================ */

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Made in Heaven — Ropa y Accesorios Personalizados',
    template: '%s | Made in Heaven',
  },
  description:
    'Tienda colombiana de ropa y accesorios personalizados. Camisetas, hoodies, gorras y más con DTF, sublimación, bordado y otras técnicas.',
  keywords: [
    'ropa personalizada Colombia',
    'camisetas personalizadas',
    'hoodies personalizados',
    'accesorios personalizados',
    'estampados DTF',
    'sublimación',
    'bordado',
    'made in heaven',
    'uniformes personalizados',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: siteUrl,
    siteName: 'Made in Heaven',
    title: 'Made in Heaven — Ropa y Accesorios Personalizados',
    description:
      'Personaliza camisetas, hoodies, gorras y accesorios con acabados premium. Desde Colombia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Made in Heaven — Ropa y Accesorios Personalizados',
    description:
      'Personaliza camisetas, hoodies, gorras y accesorios con acabados premium.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

/* ============================================
   JSON-LD — Structured Data
   ============================================ */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Made in Heaven',
  description:
    'Tienda colombiana de ropa y accesorios personalizados.',
  url: siteUrl,
  telephone: '+573249207921',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CO',
  },
  sameAs: [
    'https://instagram.com/madeinheavenco',
    'https://tiktok.com/@madeinheavenco',
  ],
}

/* ============================================
   Layout Raíz
   ============================================ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" dir="ltr" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="alternate icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <Script
          id="mih-jsonld"
          strategy="beforeInteractive"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-body">
        <CartProvider>
            {/* Skip navigation para accesibilidad */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-heaven-lilac focus:px-4 focus:py-2 focus:text-heaven-bg-dark focus:shadow-heaven-cta"
            >
              Saltar al contenido principal
            </a>

            <Navbar />

            <main id="main-content">
              {children}
            </main>

            <Footer />

            {/* FAB de WhatsApp — siempre visible */}
            <WhatsAppFAB />
            
            {/* Carrito flotante */}
            <FloatingCart />
        </CartProvider>
      </body>
    </html>
  )
}

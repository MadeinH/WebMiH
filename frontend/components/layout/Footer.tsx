import Link from 'next/link'
import Image from 'next/image'
import GlowDivider from '@/components/ui/GlowDivider'
import CTAButton from '@/components/ui/CTAButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/** Columnas de enlaces del footer */
const footerLinks = [
  {
    title: 'Catálogo',
    links: [
      { href: '/catalogo',       label: 'Prendas' },
      { href: '/accesorios',     label: 'Accesorios' },
      { href: '/personalizacion', label: 'Personalización' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { href: '/cotizacion', label: 'Cotizar' },
      { href: '/#categorias', label: 'Categorías' },
    ],
  },
]

/** Footer principal del sitio */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-heaven-bg-dark">
      <GlowDivider />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Marca */}
          <div className="space-y-4">
            <Link href="/" aria-label="Made in Heaven — Inicio">
              <Image
                src="/logo.png"
                alt="Made in Heaven"
                width={180}
                height={44}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-heaven-muted">
              Ropa y accesorios personalizados de calidad premium. 
              Fabricados en Colombia para el mundo.
            </p>
            <CTAButton
              variant="whatsapp"
              href={buildWhatsAppUrl()}
              external
              className="text-sm"
            >
              Escríbenos al WhatsApp
            </CTAButton>

            <div className="hidden rounded-xl border border-heaven-divider bg-heaven-bg-card/70 p-4 md:block">
              <p className="text-xs uppercase tracking-widest text-heaven-lilac">Siguenos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://instagram.com/madeinheaven.shop_"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Made in Heaven"
                  className="inline-flex items-center gap-2 rounded-lg border border-heaven-divider px-4 py-2 text-sm font-semibold text-heaven-text transition-colors hover:border-heaven-rose/50 hover:text-heaven-rose bg-gradient-to-r from-[#833AB4]/10 via-transparent to-transparent"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Instagram
                </a>
                <a
                  href="https://tiktok.com/@madeinheaven.shop_"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok de Made in Heaven"
                  className="inline-flex items-center gap-2 rounded-lg border border-heaven-divider px-4 py-2 text-sm font-semibold text-heaven-text transition-colors hover:border-heaven-sky/50 hover:text-heaven-sky bg-gradient-to-r from-transparent via-[#00F2EA]/10 to-transparent"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-display text-sm uppercase tracking-widest text-heaven-lilac">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-heaven-muted transition-colors hover:text-heaven-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Banner fuera de catálogo */}
        <div className="mt-12 rounded-2xl border border-heaven-divider bg-heaven-bg-card p-6 text-center">
          <p className="text-sm text-heaven-muted">
            ¿Buscas algo diferente? Escríbenos y tratamos de conseguirlo.
          </p>
          <CTAButton
            variant="outline"
            href={buildWhatsAppUrl('Hola! Busco un producto que no está en el catálogo')}
            external
            className="mt-4 text-sm"
          >
            Consultar producto personalizado
          </CTAButton>
        </div>

        {/* Copyright y redes */}
        <GlowDivider />
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-heaven-muted">
            © {year} Made in Heaven. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a
              href="https://instagram.com/madeinheaven.shop_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Made in Heaven"
              className="hidden md:inline-flex items-center gap-2 rounded-lg border border-heaven-divider px-3 py-2 text-sm font-semibold text-heaven-text transition-colors hover:text-heaven-rose"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com/@madeinheaven.shop_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de Made in Heaven"
              className="hidden md:inline-flex items-center gap-2 rounded-lg border border-heaven-divider px-3 py-2 text-sm font-semibold text-heaven-text transition-colors hover:text-heaven-sky"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

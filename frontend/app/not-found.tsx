import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Página no encontrada | Made in Heaven',
}

/**
 * Not Found page — También sirve como honeypot catch-all.
 * A02: No revela información del servidor ni estructura de archivos.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-heaven-dark px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display text-heaven-gold mb-2">404</p>
        <h1 className="text-2xl font-display text-heaven-text mb-4">
          Página no encontrada
        </h1>
        <p className="text-heaven-muted mb-8 leading-relaxed">
          La página que buscas no existe o fue movida.
          Explora nuestro catálogo de prendas geek y anime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-heaven-gold text-heaven-dark font-bold rounded-lg
                       hover:bg-heaven-gold/90 transition-colors text-center"
          >
            Ir al inicio
          </Link>
          <Link
            href="/catalogo"
            className="px-6 py-3 border border-heaven-gold/30 text-heaven-gold rounded-lg
                       hover:bg-heaven-gold/10 transition-colors text-center"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}

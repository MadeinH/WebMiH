'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CTAButton from '@/components/ui/CTAButton'
import { useCart } from '@/lib/cart-context'

/** Ítems de navegación */
const navItems = [
  { href: '/',                label: 'Inicio' },
  { href: '/catalogo',       label: 'Catálogo' },
  { href: '/accesorios',     label: 'Accesorios' },
  { href: '/personalizacion', label: 'Personalización' },
]

/** Barra de navegación principal */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()
  const badgeCount = items
    .filter((item) => !item.soloWhatsApp && (item.precioUnitario ?? 0) > 0)
    .reduce((sum, item) => sum + item.cantidad, 0)

  function openFloatingCart() {
    window.dispatchEvent(new CustomEvent('mih:open-cart'))
  }

  return (
    <header className="sticky top-0 z-40 border-b border-heaven-divider/80 bg-heaven-bg-dark/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heaven-lilac"
          aria-label="Made in Heaven — Inicio"
        >
          <Image
            src="/logo.png"
            alt="Made in Heaven"
            width={160}
            height={38}
            priority
            className="h-10 w-auto"
          />
          <div className="leading-tight">
            <p className="font-body text-[0.65rem] uppercase tracking-[0.35em] text-heaven-muted">Made in</p>
            <p className="font-display text-xl uppercase tracking-[0.18em] text-heaven-text">Heaven</p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          <ul className="flex items-center gap-7 rounded-full border border-heaven-divider bg-heaven-bg-card/70 px-5 py-3 shadow-heaven-card">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="cursor-pointer text-sm font-medium text-heaven-muted transition-colors duration-200 hover:text-heaven-lilac"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <CTAButton variant="outline" href="/carrito" className="px-4 py-2 text-sm">
            Pagar
          </CTAButton>

          <button
            type="button"
            onClick={openFloatingCart}
            className="relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-heaven-divider bg-heaven-bg-card p-2 text-heaven-muted transition-colors duration-200 hover:border-heaven-lilac/40 hover:text-heaven-lilac"
            aria-label={`Abrir carrito flotante: ${badgeCount} unidades`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-heaven-text">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            {badgeCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-heaven-rose text-xs font-bold text-white">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-heaven-divider bg-heaven-bg-card text-heaven-text transition-colors duration-200 hover:border-heaven-lilac/40 hover:text-heaven-lilac xl:hidden"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-heaven-divider bg-heaven-bg-dark/98 xl:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block cursor-pointer rounded-2xl px-4 py-3 text-sm font-medium text-heaven-muted transition-colors duration-200 hover:bg-heaven-divider/20 hover:text-heaven-lilac"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <CTAButton variant="outline" href="/carrito" className="w-full">
                Ir al carrito
              </CTAButton>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

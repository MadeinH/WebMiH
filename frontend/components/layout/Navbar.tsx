'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

/** Ítems de navegación */
const navItems = [
  { href: '/',                label: 'Inicio' },
  { href: '/catalogo',       label: 'Catálogo' },
  { href: '/accesorios',     label: 'Accesorios' },
  { href: '/personalizacion', label: 'Personalización' },
  { href: '/cotizacion',     label: 'Cotización' },
]

/** Barra de navegación principal */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-heaven-divider bg-heaven-bg-dark/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl uppercase tracking-widest text-heaven-text transition-colors hover:text-heaven-lilac"
        >
          Made in Heaven
        </Link>

        {/* Navegación desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-heaven-muted transition-colors hover:text-heaven-lilac"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Carrito badge */}
          <Link
            href="/cotizacion"
            className="relative text-heaven-muted transition-colors hover:text-heaven-lilac"
            aria-label={`Cotización: ${totalItems} productos`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-heaven-lilac text-[10px] font-bold text-heaven-bg-dark">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-heaven-text transition-colors hover:bg-heaven-divider/30 md:hidden"
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

      {/* Menú mobile */}
      {isOpen && (
        <div className="border-t border-heaven-divider bg-heaven-bg-dark md:hidden">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-heaven-muted transition-colors hover:bg-heaven-divider/20 hover:text-heaven-lilac"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

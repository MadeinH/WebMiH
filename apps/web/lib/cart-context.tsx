'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ItemCotizacion } from '@/types/cotizacion'

/* ============================================
   Tipos
   ============================================ */

interface CartContextValue {
  /** Ítems actuales en el carrito */
  items: ItemCotizacion[]
  /** Agrega un ítem (si ya existe el mismo productoId+variantes, suma cantidad) */
  addItem: (item: ItemCotizacion) => void
  /** Elimina un ítem por su índice */
  removeItem: (index: number) => void
  /** Vacía completamente el carrito */
  clearCart: () => void
  /** Total de unidades en el carrito */
  totalItems: number
}

const STORAGE_KEY = 'mih_carrito_v2'
const MAX_ITEMS = 50

function normalizeStoredItem(raw: unknown): ItemCotizacion | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const productoId = typeof r.productoId === 'string' ? r.productoId : typeof r.producto_id === 'string' ? r.producto_id : ''
  const nombre = typeof r.nombre === 'string' ? r.nombre : ''
  const variantes = typeof r.variantes === 'string' ? r.variantes : ''
  const cantidad = typeof r.cantidad === 'number' && Number.isFinite(r.cantidad) ? Math.floor(r.cantidad) : 0
  const precioUnitario = typeof r.precioUnitario === 'number' ? r.precioUnitario : typeof r.precio_unitario === 'number' ? r.precio_unitario : undefined
  const soloWhatsApp = typeof r.soloWhatsApp === 'boolean' ? r.soloWhatsApp : typeof r.solo_whatsapp === 'boolean' ? r.solo_whatsapp : Boolean(r.soloWhatsApp)
  const slug = typeof r.slug === 'string' ? r.slug : undefined
  const imagenUrl = typeof r.imagenUrl === 'string' ? r.imagenUrl : undefined
  const comentario = typeof r.comentario === 'string' ? r.comentario : undefined

  if (!productoId || !nombre || !variantes || cantidad < 1) return null

  return {
    productoId,
    nombre,
    variantes,
    cantidad: Math.min(Math.max(cantidad, 1), 999),
    precioUnitario: typeof precioUnitario === 'number' ? Math.max(0, Math.trunc(precioUnitario)) : undefined,
    soloWhatsApp: Boolean(soloWhatsApp),
    slug,
    imagenUrl,
    comentario,
  }
}

function normalizeIncomingItem(raw: ItemCotizacion): ItemCotizacion | null {
  if (!raw) return null
  const productoId = typeof raw.productoId === 'string' ? raw.productoId : ''
  const nombre = typeof raw.nombre === 'string' ? raw.nombre : ''
  const variantes = typeof raw.variantes === 'string' ? raw.variantes : ''
  const cantidad = typeof raw.cantidad === 'number' && Number.isFinite(raw.cantidad) ? Math.floor(raw.cantidad) : 0
  if (!productoId || !nombre || !variantes || cantidad < 1) return null
  return {
    productoId,
    nombre,
    variantes,
    cantidad: Math.min(Math.max(cantidad, 1), 999),
    precioUnitario: typeof raw.precioUnitario === 'number' ? Math.max(0, Math.trunc(raw.precioUnitario)) : undefined,
    soloWhatsApp: Boolean(raw.soloWhatsApp),
    slug: raw.slug,
    imagenUrl: raw.imagenUrl,
    comentario: raw.comentario,
  }
}

/* ============================================
   Context
   ============================================ */

const CartContext = createContext<CartContextValue | null>(null)

/* ============================================
   Provider
   ============================================ */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCotizacion[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hidratar desde localStorage al montar (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Normalize and dedupe by productoId+variantes
          const normalized: ItemCotizacion[] = []
          for (const entry of parsed) {
            const item = normalizeStoredItem(entry)
            if (!item) continue

            const idx = normalized.findIndex((i) => i.productoId === item.productoId && i.variantes === item.variantes)
            if (idx >= 0) {
              normalized[idx].cantidad = Math.min(999, normalized[idx].cantidad + item.cantidad)
            } else if (normalized.length < MAX_ITEMS) {
              normalized.push(item)
            }
          }

          setItems(normalized.slice(0, MAX_ITEMS))
        }
      }
    } catch {
      // localStorage no disponible o datos corruptos — ignorar
    }
    setHydrated(true)
  }, [])

  // Persistir en localStorage cuando cambie
  useEffect(() => {
    if (!hydrated) return
    try {
      // Ensure we persist a clean normalized representation
      const safe = items.map((it) => ({
        productoId: it.productoId,
        nombre: it.nombre,
        variantes: it.variantes,
        cantidad: Math.min(Math.max(Math.floor(it.cantidad), 1), 999),
        precioUnitario: typeof it.precioUnitario === 'number' ? Math.max(0, Math.trunc(it.precioUnitario)) : undefined,
        soloWhatsApp: Boolean(it.soloWhatsApp),
        slug: it.slug,
        imagenUrl: it.imagenUrl,
        comentario: it.comentario,
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
    } catch {
      // Quota excedida o no disponible — ignorar
    }
  }, [items, hydrated])

  // Diagnostics: en desarrollo, exponer cambios para depuración
  useEffect(() => {
    try {
      // Consola legible para revisar duplicaciones (no falla si console no existe)
      // eslint-disable-next-line no-console
      console.debug && console.debug('[mih/cart] items changed:', items.length)
      // Exponer snapshot y un helper dump en window para inspección manual desde DevTools
      // @ts-ignore
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window.__mih_cart_snapshot = items
        // @ts-ignore
        window.__mih_cart_dump = function () {
          try {
            const raw = localStorage.getItem(STORAGE_KEY)
            return { items, raw }
          } catch (e) {
            return { items, raw: null, error: String(e) }
          }
        }
      }
    } catch {
      // fallthrough
    }
  }, [items])

  const addItem = useCallback((newItem: ItemCotizacion) => {
    const item = normalizeIncomingItem(newItem)
    if (!item) return

    setItems((prev) => {
      // Buscar duplicado exacto (mismo productoId + mismas variantes)
      const existingIdx = prev.findIndex((i) => i.productoId === item.productoId && i.variantes === item.variantes)

      if (existingIdx >= 0) {
        // Sumar cantidad al existente
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          cantidad: Math.min(updated[existingIdx].cantidad + item.cantidad, 999),
        }
        return updated
      }

      // Nuevo ítem — verificar límite
      if (prev.length >= MAX_ITEMS) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

/* ============================================
   Hook
   ============================================ */

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }
  return ctx
}

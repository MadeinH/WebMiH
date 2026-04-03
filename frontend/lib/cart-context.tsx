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
          setItems(parsed.slice(0, MAX_ITEMS))
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Quota excedida o no disponible — ignorar
    }
  }, [items, hydrated])

  const addItem = useCallback((newItem: ItemCotizacion) => {
    setItems((prev) => {
      // Buscar duplicado exacto (mismo productoId + mismas variantes)
      const existingIdx = prev.findIndex(
        (i) => i.productoId === newItem.productoId && i.variantes === newItem.variantes
      )

      if (existingIdx >= 0) {
        // Sumar cantidad al existente
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          cantidad: Math.min(updated[existingIdx].cantidad + newItem.cantidad, 999),
        }
        return updated
      }

      // Nuevo ítem — verificar límite
      if (prev.length >= MAX_ITEMS) return prev
      return [...prev, newItem]
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

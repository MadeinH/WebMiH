/**
 * Tipos de producto — usados por supabase/schema.sql.
 * Se activarán cuando se conecte a Supabase en producción.
 * Mantener sincronizados con el schema SQL.
 */

export type Categoria = 'prendas' | 'accesorios'

export type Horma = 'hombre' | 'mujer' | 'nino' | 'unisex'

export interface Producto {
  id: string
  slug: string
  nombre: string
  descripcion: string | null
  categoria: Categoria
  subcategoria: string | null
  material: string | null
  horma: Horma | null
  solo_cotizar: boolean
  activo: boolean
  created_at: string
}

export interface PreciosPorCantidad {
  id: string
  producto_id: string
  detal_carta: number | null
  detal_estandar: number | null
  mayoreo_3: number | null
  mayoreo_6: number | null
  mayoreo_12: number | null
  updated_at: string
}

export interface ProductoConPrecios extends Producto {
  precios: PreciosPorCantidad | null
}

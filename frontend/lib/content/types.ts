export type ManagedItemType = 'catalog' | 'accessory'

export interface PriceMatrix {
  detalCarta: number | null
  detalEstandar: number | null
  mayoreo3: number | null
  mayoreo6: number | null
  mayoreo12: number | null
}

export interface ManagedItem {
  id: string
  type: ManagedItemType
  slug: string
  nombre: string
  descripcion: string
  subcategoria: string
  material: string
  horma: string
  soloCotizar: boolean
  activo: boolean
  imagenUrl: string | null
  featured: boolean
  priceMatrix: PriceMatrix
}

export interface SiteContent {
  heroDescription: string
  catalogoIntro: string
  accesoriosIntro: string
  outOfCatalogTitle: string
  outOfCatalogDescription: string
  featuredProductSlugs: string[]
}

export interface AdminContentSnapshot {
  site: SiteContent
  catalog: ManagedItem[]
  accessories: ManagedItem[]
  updatedAt: string
}
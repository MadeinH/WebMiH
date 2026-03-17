import { revalidatePath, revalidateTag, unstable_cache, unstable_noStore as noStore } from 'next/cache'
import { defaultAdminContent } from '@/lib/content/default-content'
import type { AdminContentSnapshot, ManagedItem } from '@/lib/content/types'
import { createServerClient } from '@/lib/supabase/server'

let memorySnapshot: AdminContentSnapshot = structuredClone(defaultAdminContent)
const PUBLIC_CONTENT_REVALIDATE_SECONDS = 60 * 60 * 24
const PUBLIC_CONTENT_TAG = 'public-content'

type CmsSiteRow = {
  id: string
  hero_description?: string | null
  catalog_intro?: string | null
  accessories_intro?: string | null
  out_of_catalog_title?: string | null
  out_of_catalog_description?: string | null
  featured_product_slugs?: string[] | null
  content?: Record<string, unknown> | null
}

function cloneSnapshot(snapshot: AdminContentSnapshot): AdminContentSnapshot {
  return structuredClone(snapshot)
}

function normalizeItem(item: ManagedItem): ManagedItem {
  return {
    ...item,
    imagenUrl: item.imagenUrl || null,
    priceMatrix: {
      detalCarta: item.priceMatrix.detalCarta ?? null,
      detalEstandar: item.priceMatrix.detalEstandar ?? null,
      mayoreo3: item.priceMatrix.mayoreo3 ?? null,
      mayoreo6: item.priceMatrix.mayoreo6 ?? null,
      mayoreo12: item.priceMatrix.mayoreo12 ?? null,
    },
  }
}

function normalizeSnapshot(snapshot: AdminContentSnapshot): AdminContentSnapshot {
  const bannerImages = Array.isArray(snapshot.site.bannerImages)
    ? snapshot.site.bannerImages.filter((value) => typeof value === 'string' && value.length > 0)
    : []

  return {
    site: {
      ...snapshot.site,
      featuredProductSlugs: [...snapshot.site.featuredProductSlugs],
      bannerImages: bannerImages.length > 0 ? bannerImages : [...defaultAdminContent.site.bannerImages],
    },
    catalog: snapshot.catalog.map(normalizeItem),
    accessories: snapshot.accessories.map(normalizeItem),
    updatedAt: snapshot.updatedAt,
  }
}

function hasSupabaseServerConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function throwOnSupabaseError(operation: string, error: { message: string } | null): void {
  if (error) {
    throw new Error(`${operation}: ${error.message}`)
  }
}

function sortItems(items: ManagedItem[]): ManagedItem[] {
  return [...items].sort((left, right) => left.nombre.localeCompare(right.nombre, 'es'))
}

function readSiteContentFromRow(row: CmsSiteRow | null): AdminContentSnapshot['site'] {
  if (!row) {
    return defaultAdminContent.site
  }

  const json = row.content
  const fromJson = json && typeof json === 'object' ? json : null
  const featuredFromJson = Array.isArray(fromJson?.featuredProductSlugs)
    ? fromJson.featuredProductSlugs.filter((value): value is string => typeof value === 'string')
    : null

  return {
    heroDescription:
      row.hero_description ??
      (typeof fromJson?.heroDescription === 'string' ? fromJson.heroDescription : null) ??
      defaultAdminContent.site.heroDescription,
    catalogoIntro:
      row.catalog_intro ??
      (typeof fromJson?.catalogoIntro === 'string' ? fromJson.catalogoIntro : null) ??
      defaultAdminContent.site.catalogoIntro,
    accesoriosIntro:
      row.accessories_intro ??
      (typeof fromJson?.accesoriosIntro === 'string' ? fromJson.accesoriosIntro : null) ??
      defaultAdminContent.site.accesoriosIntro,
    outOfCatalogTitle:
      row.out_of_catalog_title ??
      (typeof fromJson?.outOfCatalogTitle === 'string' ? fromJson.outOfCatalogTitle : null) ??
      defaultAdminContent.site.outOfCatalogTitle,
    outOfCatalogDescription:
      row.out_of_catalog_description ??
      (typeof fromJson?.outOfCatalogDescription === 'string' ? fromJson.outOfCatalogDescription : null) ??
      defaultAdminContent.site.outOfCatalogDescription,
    featuredProductSlugs:
      row.featured_product_slugs ?? featuredFromJson ?? defaultAdminContent.site.featuredProductSlugs,
    bannerImages:
      Array.isArray(fromJson?.bannerImages)
        ? fromJson.bannerImages.filter((value): value is string => typeof value === 'string')
        : defaultAdminContent.site.bannerImages,
  }
}

function pickPrimaryImage(row: {
  image_url?: string | null
  imagen_url?: string | null
  media_urls?: string[] | null
}): string | null {
  if (row.image_url) {
    return row.image_url
  }

  if (row.imagen_url) {
    return row.imagen_url
  }

  if (Array.isArray(row.media_urls) && typeof row.media_urls[0] === 'string') {
    return row.media_urls[0]
  }

  return null
}

async function loadSnapshotFromSupabase(): Promise<AdminContentSnapshot | null> {
  if (!hasSupabaseServerConfig()) {
    return null
  }

  const supabase = createServerClient()

  const [{ data: siteRows }, { data: productos }, { data: precios }] = await Promise.all([
    supabase.from('cms_site_content').select('*').in('id', ['site', 'site-content']),
    supabase.from('productos').select('*').order('created_at', { ascending: true }),
    supabase.from('precios').select('*'),
  ])

  const siteRow = Array.isArray(siteRows)
    ? (siteRows.find((row) => row.id === 'site') ?? siteRows.find((row) => row.id === 'site-content') ?? null)
    : null
  const site = readSiteContentFromRow(siteRow as CmsSiteRow | null)

  const priceMap = new Map<string, Record<string, number | null>>()
  for (const row of precios ?? []) {
    priceMap.set(row.producto_id, {
      detalCarta: row.detal_carta ?? null,
      detalEstandar: row.detal_estandar ?? null,
      mayoreo3: row.mayoreo_3 ?? null,
      mayoreo6: row.mayoreo_6 ?? null,
      mayoreo12: row.mayoreo_12 ?? null,
    })
  }

  if (!productos) {
    return null
  }

  const mapped: ManagedItem[] = productos.map((row) => ({
    id: row.id,
    type: row.categoria === 'accesorios' ? 'accessory' : 'catalog',
    slug: row.slug,
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    subcategoria: row.subcategoria ?? '',
    material: row.material ?? '',
    horma: row.horma ?? '',
    soloCotizar: Boolean(row.solo_cotizar),
    activo: row.activo !== false,
    imagenUrl: pickPrimaryImage(row),
    featured: site.featuredProductSlugs.includes(row.slug),
    priceMatrix: {
      detalCarta: priceMap.get(row.id)?.detalCarta ?? null,
      detalEstandar: priceMap.get(row.id)?.detalEstandar ?? null,
      mayoreo3: priceMap.get(row.id)?.mayoreo3 ?? null,
      mayoreo6: priceMap.get(row.id)?.mayoreo6 ?? null,
      mayoreo12: priceMap.get(row.id)?.mayoreo12 ?? null,
    },
  }))

  return normalizeSnapshot({
    site,
    catalog: sortItems(mapped.filter((item) => item.type === 'catalog')),
    accessories: sortItems(mapped.filter((item) => item.type === 'accessory')),
    updatedAt: new Date().toISOString(),
  })
}

async function persistSnapshotToSupabase(snapshot: AdminContentSnapshot): Promise<void> {
  if (!hasSupabaseServerConfig()) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para persistir cambios del panel.')
  }

  const supabase = createServerClient()
  const nowIso = new Date().toISOString()
  const allItems = [...snapshot.catalog, ...snapshot.accessories]

  const { data: existingProducts, error: existingProductsError } = await supabase
    .from('productos')
    .select('id')
  throwOnSupabaseError('No se pudieron consultar los productos actuales', existingProductsError)

  const nextProductIds = new Set(allItems.map((item) => item.id))
  const idsToDelete = (existingProducts ?? [])
    .map((row) => String(row.id))
    .filter((id) => !nextProductIds.has(id))

  const { error: siteUpsertError } = await supabase.from('cms_site_content').upsert(
    {
      id: 'site',
      hero_description: snapshot.site.heroDescription,
      catalog_intro: snapshot.site.catalogoIntro,
      accessories_intro: snapshot.site.accesoriosIntro,
      out_of_catalog_title: snapshot.site.outOfCatalogTitle,
      out_of_catalog_description: snapshot.site.outOfCatalogDescription,
      featured_product_slugs: snapshot.site.featuredProductSlugs,
      content: {
        bannerImages: snapshot.site.bannerImages,
      },
      updated_at: nowIso,
    },
    { onConflict: 'id' },
  )
  throwOnSupabaseError('No se pudo actualizar el contenido global del sitio', siteUpsertError)

  const productRows = allItems.map((item, index) => ({
    id: item.id,
    slug: item.slug,
    nombre: item.nombre,
    descripcion: item.descripcion,
    categoria: item.type === 'accessory' ? 'accesorios' : 'prendas',
    subcategoria: item.subcategoria || null,
    material: item.material || null,
    horma: item.horma || null,
    solo_cotizar: item.soloCotizar,
    activo: item.activo,
    image_url: item.imagenUrl,
    media_urls: item.imagenUrl ? [item.imagenUrl] : [],
    sort_order: index,
  }))

  const { error: productsUpsertError } = await supabase.from('productos').upsert(productRows, { onConflict: 'id' })
  throwOnSupabaseError('No se pudieron guardar los productos', productsUpsertError)

  if (idsToDelete.length > 0) {
    const { error: productsDeleteError } = await supabase.from('productos').delete().in('id', idsToDelete)
    throwOnSupabaseError('No se pudieron eliminar los productos removidos del panel', productsDeleteError)
  }

  const priceRows = allItems.map((item) => ({
    producto_id: item.id,
    detal_carta: item.priceMatrix.detalCarta,
    detal_estandar: item.priceMatrix.detalEstandar,
    mayoreo_3: item.priceMatrix.mayoreo3,
    mayoreo_6: item.priceMatrix.mayoreo6,
    mayoreo_12: item.priceMatrix.mayoreo12,
    updated_at: nowIso,
  }))

  const { error: pricesUpsertError } = await supabase.from('precios').upsert(priceRows, { onConflict: 'producto_id' })
  throwOnSupabaseError('No se pudieron guardar los precios', pricesUpsertError)

  const { error: auditInsertError } = await supabase.from('cms_audit_logs').insert({
    action: 'admin_content_saved',
    payload_summary: { updatedAt: snapshot.updatedAt, itemCount: allItems.length },
    created_at: nowIso,
  })
  throwOnSupabaseError('No se pudo guardar el log de auditoría del panel', auditInsertError)
}

const getCachedPublicSnapshot = unstable_cache(
  async (): Promise<AdminContentSnapshot> => {
    try {
      const snapshot = await loadSnapshotFromSupabase()
      if (snapshot) {
        memorySnapshot = cloneSnapshot(snapshot)
        return snapshot
      }
    } catch {
      // Fallback a memoria/defaults si la BD no está disponible temporalmente.
    }

    return cloneSnapshot(memorySnapshot)
  },
  ['mih-public-content-snapshot'],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: [PUBLIC_CONTENT_TAG] },
)

export async function getAdminContent(): Promise<AdminContentSnapshot> {
  noStore()
  try {
    const snapshot = await loadSnapshotFromSupabase()
    if (snapshot) {
      memorySnapshot = cloneSnapshot(snapshot)
      return snapshot
    }
  } catch {
    // Fallback a memoria/defaults si no existe el esquema CMS todavía.
  }

  return cloneSnapshot(memorySnapshot)
}

export async function saveAdminContent(snapshot: AdminContentSnapshot): Promise<AdminContentSnapshot> {
  const normalized = normalizeSnapshot({
    ...snapshot,
    updatedAt: new Date().toISOString(),
  })

  await persistSnapshotToSupabase(normalized)
  memorySnapshot = cloneSnapshot(normalized)

  revalidateTag(PUBLIC_CONTENT_TAG)
  revalidatePath('/')
  revalidatePath('/catalogo')
  revalidatePath('/accesorios')
  revalidatePath('/catalogo/[slug]', 'page')
  revalidatePath('/accesorios/[slug]', 'page')

  return cloneSnapshot(normalized)
}

export async function getSiteContent() {
  const snapshot = await getCachedPublicSnapshot()
  return {
    ...snapshot.site,
    featuredProductSlugs: [...snapshot.site.featuredProductSlugs],
    bannerImages: [...snapshot.site.bannerImages],
  }
}

export async function getCatalogItems() {
  return (await getCachedPublicSnapshot()).catalog.filter((item) => item.activo)
}

export async function getCatalogItemBySlug(slug: string) {
  return (await getCachedPublicSnapshot()).catalog.find((item) => item.slug === slug) ?? null
}

export async function getAccessoryItems() {
  return (await getCachedPublicSnapshot()).accessories.filter((item) => item.activo)
}

export async function getAccessoryItemBySlug(slug: string) {
  return (await getCachedPublicSnapshot()).accessories.find((item) => item.slug === slug) ?? null
}

export async function getFeaturedProducts() {
  const snapshot = await getCachedPublicSnapshot()
  const all = [...snapshot.catalog, ...snapshot.accessories].filter((item) => item.activo)
  return snapshot.site.featuredProductSlugs
    .map((slug) => all.find((item) => item.slug === slug) ?? null)
    .filter((item): item is ManagedItem => item !== null)
}

export function getStartingPrice(item: ManagedItem): number | null {
  const prices = Object.values(item.priceMatrix).filter((value): value is number => typeof value === 'number')
  if (prices.length === 0) {
    return null
  }
  return Math.min(...prices)
}
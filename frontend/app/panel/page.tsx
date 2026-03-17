'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import SectionWrapper from '@/components/ui/SectionWrapper'
import { defaultAdminContent } from '@/lib/content/default-content'
import { adminContentSchema } from '@/lib/validations'
import type { AdminContentSnapshot, ManagedItem, ManagedItemType } from '@/lib/content/types'

const STORAGE_KEY = 'mih-admin-content-v2'

function createEmptyItem(type: ManagedItemType): ManagedItem {
  return {
    id: crypto.randomUUID(),
    type,
    slug: '',
    nombre: '',
    descripcion: '',
    subcategoria: '',
    material: '',
    horma: '',
    soloCotizar: false,
    activo: true,
    imagenUrl: null,
    featured: false,
    priceMatrix: {
      detalCarta: null,
      detalEstandar: null,
      mayoreo3: null,
      mayoreo6: null,
      mayoreo12: null,
    },
  }
}

function cloneSnapshot(snapshot: AdminContentSnapshot): AdminContentSnapshot {
  return structuredClone(snapshot)
}

function withFeaturedSlugs(snapshot: AdminContentSnapshot): AdminContentSnapshot {
  const featuredProductSlugs = [...snapshot.catalog, ...snapshot.accessories]
    .filter((item) => item.featured)
    .map((item) => item.slug)

  return {
    ...snapshot,
    site: {
      ...snapshot.site,
      featuredProductSlugs,
    },
  }
}

function ensureSnapshot(snapshot: AdminContentSnapshot): AdminContentSnapshot {
  return {
    ...snapshot,
    site: {
      ...snapshot.site,
      bannerImages:
        Array.isArray(snapshot.site.bannerImages) && snapshot.site.bannerImages.length > 0
          ? snapshot.site.bannerImages
          : [...defaultAdminContent.site.bannerImages],
    },
  }
}

export default function PanelPage() {
  const router = useRouter()
  const [content, setContent] = useState<AdminContentSnapshot>(cloneSnapshot(defaultAdminContent))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [status, setStatus] = useState('Cargando contenido del panel...')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  if (loading) {
    return (
      <SectionWrapper>
        <div className="space-y-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-heaven-divider bg-heaven-bg-card p-6 shadow-heaven-card lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge variant="lilac">Panel Admin</Badge>
              <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text">
                Cargando panel
              </h1>
              <p className="mt-3 text-sm text-heaven-muted">{status}</p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  useEffect(() => {
    const localDraft = localStorage.getItem(STORAGE_KEY)
    if (localDraft) {
      try {
        setContent(ensureSnapshot(JSON.parse(localDraft) as AdminContentSnapshot))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    async function loadContent() {
      try {
        const response = await fetch('/panel/api/content', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/panel/login?next=/panel')
          return
        }
        const payload = await response.json()
        if (!response.ok) {
          setStatus(payload?.error ?? 'No se pudo cargar el contenido.')
          return
        }
        setContent(ensureSnapshot(payload))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        setStatus('Contenido listo para editar.')
      } catch {
        setStatus('No se pudo conectar con el panel. Se conservará el borrador local si existe.')
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [router])

  function updateSiteField(field: keyof AdminContentSnapshot['site'], value: string | string[]) {
    setContent((current) => ({
      ...current,
      site: {
        ...current.site,
        [field]: value,
      },
    }))
  }

  function updateItem(type: ManagedItemType, index: number, nextItem: ManagedItem) {
    setContent((current) => {
      const key = type === 'catalog' ? 'catalog' : 'accessories'
      const items = [...current[key]]
      items[index] = nextItem
      return withFeaturedSlugs({ ...current, [key]: items })
    })
  }

  function addItem(type: ManagedItemType) {
    setContent((current) =>
      withFeaturedSlugs({
        ...current,
        [type === 'catalog' ? 'catalog' : 'accessories']: [
          ...(type === 'catalog' ? current.catalog : current.accessories),
          createEmptyItem(type),
        ],
      }),
    )
  }

  function removeItem(type: ManagedItemType, index: number) {
    setContent((current) => {
      const key = type === 'catalog' ? 'catalog' : 'accessories'
      const items = [...current[key]]
      items.splice(index, 1)
      return withFeaturedSlugs({ ...current, [key]: items })
    })
  }

  async function uploadImage(type: ManagedItemType, index: number, file: File) {
    setStatus('Solicitando URL firmada...')
    try {
      const filename = file.name
      const folder = type === 'catalog' ? 'catalog' : 'accessories'
      const sigRes = await fetch('/panel/api/media/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, folder }),
      })

      if (sigRes.status === 401) {
        setStatus('La sesión expiró. Debes volver a iniciar sesión.')
        router.replace('/panel/login?next=/panel')
        return
      }

      const sig = await sigRes.json().catch(() => null)
      if (!sigRes.ok || !sig?.signedUrl) {
        setStatus(sig?.error ?? 'No se pudo obtener la URL firmada.')
        return
      }

      setStatus('Subiendo directamente al storage...')
      const uploadRes = await fetch(sig.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        setStatus('Error al subir el archivo al storage.')
        return
      }

      setStatus('Solicitando procesamiento de variantes...')
      const processRes = await fetch('/panel/api/media/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: sig.path }),
      })

      const proc = await processRes.json().catch(() => null)
      if (!processRes.ok || !proc?.urls) {
        // Fallback to original public URL
        const publicUrl = `/api/_internal/public-url?path=${encodeURIComponent(sig.path)}`
        const item = (type === 'catalog' ? content.catalog : content.accessories)[index]
        updateItem(type, index, { ...item, imagenUrl: publicUrl })
        setStatus('Imagen subida, pero falló el procesamiento. Se usa original.')
        return
      }

      const item = (type === 'catalog' ? content.catalog : content.accessories)[index]
      updateItem(type, index, { ...item, imagenUrl: proc.urls.webp ?? proc.urls.original })
      setStatus('Imagen cargada y procesada correctamente.')
    } catch (err) {
      setStatus('Error inesperado al subir la imagen.')
    }
  }

  async function uploadBannerImage(index: number, file: File) {
    setStatus('Solicitando URL firmada para banner...')
    try {
      const filename = file.name
      const folder = 'banners'
      const sigRes = await fetch('/panel/api/media/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, folder }),
      })

      if (sigRes.status === 401) {
        setStatus('La sesión expiró. Debes volver a iniciar sesión.')
        router.replace('/panel/login?next=/panel')
        return
      }

      const sig = await sigRes.json().catch(() => null)
      if (!sigRes.ok || !sig?.signedUrl) {
        setStatus(sig?.error ?? 'No se pudo obtener la URL firmada para el banner.')
        return
      }

      setStatus('Subiendo banner al storage...')
      const uploadRes = await fetch(sig.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        setStatus('Error al subir el banner al storage.')
        return
      }

      setStatus('Procesando variantes del banner...')
      const processRes = await fetch('/panel/api/media/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: sig.path }),
      })

      const proc = await processRes.json().catch(() => null)
      if (!processRes.ok || !proc?.urls) {
        const publicUrl = `/api/_internal/public-url?path=${encodeURIComponent(sig.path)}`
        setContent((current) => {
          const nextBanners = [...current.site.bannerImages]
          nextBanners[index] = publicUrl
          return { ...current, site: { ...current.site, bannerImages: nextBanners } }
        })
        setStatus('Banner subido, pero falló el procesamiento. Se usa original.')
        return
      }

      setContent((current) => {
        const nextBanners = [...current.site.bannerImages]
        nextBanners[index] = proc.urls.webp ?? proc.urls.original
        return { ...current, site: { ...current.site, bannerImages: nextBanners } }
      })

      setStatus('Banner cargado y procesado correctamente.')
    } catch (err) {
      setStatus('Error inesperado al subir el banner.')
    }
  }

  async function saveContent() {
    setSaving(true)
    setValidationErrors([])
    setStatus('Guardando cambios...')

    try {
        const payload = withFeaturedSlugs({ ...content, updatedAt: new Date().toISOString() })

        const localValidation = adminContentSchema.safeParse(payload)
        if (!localValidation.success) {
          const issues = localValidation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
          setValidationErrors(issues)
          setStatus('Errores de validación locales. Corrige antes de guardar.')
          setSaving(false)
          return
        }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))

      const response = await fetch('/panel/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        setStatus('La sesión expiró. Debes volver a iniciar sesión.')
        router.replace('/panel/login?next=/panel')
        return
      }

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const issues = Array.isArray(data?.issues) ? data.issues.map((issue: { path: string; message: string }) => `${issue.path}: ${issue.message}`) : []
        setValidationErrors(issues)
        setStatus(data?.error ?? 'No se pudo guardar el contenido.')
        return
      }

      setContent(ensureSnapshot(data))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setStatus('Cambios guardados correctamente.')
    } catch {
      setStatus('Fallo de red al guardar. El borrador local se conservó.')
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    setLoggingOut(true)
    try {
      await fetch('/panel/api/auth/logout', { method: 'POST' })
    } finally {
      setLoggingOut(false)
      router.replace('/panel/login')
      router.refresh()
    }
  }

  function resetDefaults() {
    const snapshot = withFeaturedSlugs(cloneSnapshot(defaultAdminContent))
    setContent(snapshot)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    setStatus('Se restauró el contenido base en el borrador local.')
  }

  return (
    <SectionWrapper>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-heaven-divider bg-heaven-bg-card p-6 shadow-heaven-card lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="lilac">Panel Admin</Badge>
            <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text">
              Administrar Contenido
            </h1>
            <p className="mt-3 text-sm text-heaven-muted">{status}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetDefaults}
              className="rounded-lg border border-heaven-divider px-4 py-3 text-sm text-heaven-text"
            >
              Restaurar base
            </button>
            <button
              type="button"
              onClick={saveContent}
              disabled={loading || saving}
              className="rounded-lg bg-heaven-lilac px-4 py-3 text-sm font-semibold text-heaven-bg-dark disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-lg border border-heaven-rose/40 px-4 py-3 text-sm text-heaven-rose disabled:opacity-60"
            >
              {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="rounded-2xl border border-heaven-rose/40 bg-heaven-rose/10 p-4 text-sm text-heaven-text">
            <p className="font-semibold text-heaven-rose">Hay errores de validación:</p>
            <ul className="mt-3 space-y-1 text-heaven-muted">
              {validationErrors.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-heaven-divider bg-heaven-bg-card p-6 shadow-heaven-card lg:col-span-2">
            <h2 className="font-display text-2xl uppercase tracking-wide text-heaven-text">Contenido global</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <textarea
                value={content.site.heroDescription}
                onChange={(event) => updateSiteField('heroDescription', event.target.value)}
                placeholder="Descripción del hero"
                className="min-h-28 rounded-xl border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text"
              />
              <textarea
                value={content.site.catalogoIntro}
                onChange={(event) => updateSiteField('catalogoIntro', event.target.value)}
                placeholder="Introducción catálogo"
                className="min-h-28 rounded-xl border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text"
              />
              <textarea
                value={content.site.accesoriosIntro}
                onChange={(event) => updateSiteField('accesoriosIntro', event.target.value)}
                placeholder="Introducción accesorios"
                className="min-h-28 rounded-xl border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text"
              />
              <div className="grid gap-4">
                <input
                  value={content.site.outOfCatalogTitle}
                  onChange={(event) => updateSiteField('outOfCatalogTitle', event.target.value)}
                  placeholder="Título fuera de catálogo"
                  className="rounded-xl border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text"
                />
                <textarea
                  value={content.site.outOfCatalogDescription}
                  onChange={(event) => updateSiteField('outOfCatalogDescription', event.target.value)}
                  placeholder="Descripción fuera de catálogo"
                  className="min-h-20 rounded-xl border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text"
                />
              </div>

              <div className="md:col-span-2 rounded-xl border border-heaven-divider bg-heaven-bg-dark/50 p-4">
                <p className="mb-3 text-sm font-semibold text-heaven-text">Banners Home (Hero)</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {content.site.bannerImages.map((banner, index) => (
                    <div key={`banner-${index}`} className="space-y-2">
                      <input
                        value={banner}
                        onChange={(event) => {
                          const next = [...content.site.bannerImages]
                          next[index] = event.target.value
                          updateSiteField('bannerImages', next)
                        }}
                        placeholder={`URL banner ${index + 1}`}
                        className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-xs text-heaven-text"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            void uploadBannerImage(index, file)
                          }
                        }}
                        className="w-full text-xs text-heaven-muted"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <ItemCollectionEditor
            title="Catálogo"
            items={content.catalog}
            onAdd={() => addItem('catalog')}
            onRemove={(index) => removeItem('catalog', index)}
            onChange={(index, item) => updateItem('catalog', index, item)}
            onUpload={(index, file) => uploadImage('catalog', index, file)}
          />

          <ItemCollectionEditor
            title="Accesorios"
            items={content.accessories}
            onAdd={() => addItem('accessory')}
            onRemove={(index) => removeItem('accessory', index)}
            onChange={(index, item) => updateItem('accessory', index, item)}
            onUpload={(index, file) => uploadImage('accessory', index, file)}
          />
        </div>

        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={saveContent}
            disabled={loading || saving}
            className="rounded-full bg-heaven-lilac px-6 py-3 text-sm font-semibold text-heaven-bg-dark shadow-heaven-cta disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </SectionWrapper>
  )
}

function ItemCollectionEditor({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
  onUpload,
}: {
  title: string
  items: ManagedItem[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, item: ManagedItem) => void
  onUpload: (index: number, file: File) => void
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all')
  const [quoteFilter, setQuoteFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [priceOrder, setPriceOrder] = useState<'default' | 'asc'>('default')
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filtered = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (statusFilter === 'active' && !item.activo) return false
        if (statusFilter === 'inactive' && item.activo) return false

        if (featuredFilter === 'featured' && !item.featured) return false
        if (featuredFilter === 'normal' && item.featured) return false

        if (quoteFilter === 'yes' && !item.soloCotizar) return false
        if (quoteFilter === 'no' && item.soloCotizar) return false

        if (!normalizedQuery) return true

        const haystack = [item.nombre, item.slug, item.subcategoria, item.material, item.descripcion]
          .join(' ')
          .toLowerCase()

        return haystack.includes(normalizedQuery)
      })

    if (priceOrder === 'asc') {
      const basePrice = (product: ManagedItem): number => {
        const candidates = [
          product.priceMatrix.detalCarta,
          product.priceMatrix.detalEstandar,
          product.priceMatrix.mayoreo3,
          product.priceMatrix.mayoreo6,
          product.priceMatrix.mayoreo12,
        ].filter((value): value is number => typeof value === 'number')

        if (candidates.length === 0) return Number.MAX_SAFE_INTEGER
        return Math.min(...candidates)
      }

      return [...filtered].sort((a, b) => basePrice(a.item) - basePrice(b.item))
    }

    return filtered
  }, [featuredFilter, items, priceOrder, query, quoteFilter, statusFilter])

  function toggleSelection(itemId: string) {
    setSelectedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    )
  }

  function toggleSelectAllVisible() {
    const visibleIds = visibleItems.map(({ item }) => item.id)
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])))
  }

  function setSelectedActiveState(nextActive: boolean) {
    for (const selectedId of selectedIds) {
      const index = items.findIndex((candidate) => candidate.id === selectedId)
      if (index < 0) continue
      const selected = items[index]
      onChange(index, { ...selected, activo: nextActive })
    }
  }

  function formatCurrency(value: number | null): string {
    if (typeof value !== 'number') return '—'
    return `$${value.toLocaleString('es-CO')}`
  }

  return (
    <section className="rounded-3xl border border-heaven-divider bg-heaven-bg-card p-6 shadow-heaven-card">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-heaven-text">{title}</h2>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg border border-heaven-divider px-4 py-2 text-sm text-heaven-text"
          >
            Agregar
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, slug, subcategoría..."
            className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(event) => setFeaturedFilter(event.target.value as 'all' | 'featured' | 'normal')}
            className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
          >
            <option value="all">Todos</option>
            <option value="featured">Solo destacados</option>
            <option value="normal">No destacados</option>
          </select>
          <select
            value={quoteFilter}
            onChange={(event) => setQuoteFilter(event.target.value as 'all' | 'yes' | 'no')}
            className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
          >
            <option value="all">Con y sin cotización</option>
            <option value="yes">Solo cotización</option>
            <option value="no">Con precios</option>
          </select>
          <select
            value={priceOrder}
            onChange={(event) => setPriceOrder(event.target.value as 'default' | 'asc')}
            className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-2 text-sm text-heaven-text"
          >
            <option value="default">Orden original</option>
            <option value="asc">Precio: menor a mayor</option>
          </select>
        </div>

        <p className="text-xs text-heaven-muted">
          Mostrando {visibleItems.length} de {items.length} elementos.
        </p>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-heaven-divider bg-heaven-bg-dark/50 p-3">
          <button
            type="button"
            onClick={toggleSelectAllVisible}
            className="rounded-lg border border-heaven-divider px-3 py-2 text-xs text-heaven-text"
          >
            Seleccionar visibles
          </button>
          <button
            type="button"
            onClick={() => setSelectedActiveState(true)}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-heaven-divider px-3 py-2 text-xs text-heaven-text disabled:opacity-40"
          >
            Activar seleccionados
          </button>
          <button
            type="button"
            onClick={() => setSelectedActiveState(false)}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-heaven-rose/40 px-3 py-2 text-xs text-heaven-rose disabled:opacity-40"
          >
            Desactivar seleccionados
          </button>
          <p className="text-xs text-heaven-muted">{selectedIds.length} seleccionados</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {visibleItems.length === 0 && (
          <article className="rounded-2xl border border-dashed border-heaven-divider bg-heaven-bg-dark p-6 text-center text-sm text-heaven-muted">
            No hay elementos que coincidan con los filtros.
          </article>
        )}

        {visibleItems.map(({ item, index }) => {
          const isExpanded = expandedId === item.id

          return (
            <article key={item.id} className="rounded-2xl border border-heaven-divider bg-heaven-bg-dark p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      aria-label={`Seleccionar ${item.nombre || item.slug || item.id}`}
                    />
                    <p className="truncate text-sm font-semibold text-heaven-text">
                      {item.nombre || 'Sin nombre'}
                    </p>
                    {item.activo ? (
                      <Badge variant="mint">Activo</Badge>
                    ) : (
                      <Badge variant="rose">Inactivo</Badge>
                    )}
                    {item.featured && <Badge variant="lilac">Destacado</Badge>}
                    {item.soloCotizar && <Badge variant="lilac">Solo cotizar</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-heaven-muted">
                    /{item.slug || 'sin-slug'} · {item.subcategoria || 'sin subcategoría'}
                  </p>
                  <p className="mt-2 text-xs text-heaven-muted">
                    Carta: {formatCurrency(item.priceMatrix.detalCarta)} · Estándar: {formatCurrency(item.priceMatrix.detalEstandar)} · 3+: {formatCurrency(item.priceMatrix.mayoreo3)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="rounded-lg border border-heaven-divider px-3 py-2 text-xs text-heaven-text"
                  >
                    {isExpanded ? 'Ocultar' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-lg border border-heaven-rose/40 px-3 py-2 text-xs text-heaven-rose"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-heaven-divider pt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={item.nombre}
                      onChange={(event) => onChange(index, { ...item, nombre: event.target.value })}
                      placeholder="Nombre"
                      className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                    />
                    <input
                      value={item.slug}
                      onChange={(event) => onChange(index, { ...item, slug: event.target.value })}
                      placeholder="slug"
                      className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                    />
                    <input
                      value={item.subcategoria}
                      onChange={(event) => onChange(index, { ...item, subcategoria: event.target.value })}
                      placeholder="Subcategoría"
                      className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                    />
                    <input
                      value={item.material}
                      onChange={(event) => onChange(index, { ...item, material: event.target.value })}
                      placeholder="Material"
                      className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                    />
                    <input
                      value={item.horma}
                      onChange={(event) => onChange(index, { ...item, horma: event.target.value })}
                      placeholder="Horma"
                      className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                    />
                    <input
                      value={item.imagenUrl ?? ''}
                      onChange={(event) => onChange(index, { ...item, imagenUrl: event.target.value || null })}
                      placeholder="URL imagen"
                      className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                    />
                  </div>

                  <textarea
                    value={item.descripcion}
                    onChange={(event) => onChange(index, { ...item, descripcion: event.target.value })}
                    placeholder="Descripción"
                    className="min-h-24 w-full rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                  />

                  <div className="grid gap-3 md:grid-cols-5">
                    {[
                      ['detalCarta', '1-2 carta'],
                      ['detalEstandar', '1-2 estándar'],
                      ['mayoreo3', '3+'],
                      ['mayoreo6', '6+'],
                      ['mayoreo12', '12+'],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        type="number"
                        value={item.priceMatrix[key as keyof ManagedItem['priceMatrix']] ?? ''}
                        onChange={(event) =>
                          onChange(index, {
                            ...item,
                            priceMatrix: {
                              ...item.priceMatrix,
                              [key]: event.target.value ? Number(event.target.value) : null,
                            },
                          })
                        }
                        placeholder={label}
                        className="rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-heaven-muted">
                      <input
                        type="checkbox"
                        checked={item.soloCotizar}
                        onChange={(event) => onChange(index, { ...item, soloCotizar: event.target.checked })}
                      />
                      Solo cotizar
                    </label>
                    <label className="flex items-center gap-2 text-xs text-heaven-muted">
                      <input
                        type="checkbox"
                        checked={item.activo}
                        onChange={(event) => onChange(index, { ...item, activo: event.target.checked })}
                      />
                      Activo
                    </label>
                    <label className="flex items-center gap-2 text-xs text-heaven-muted">
                      <input
                        type="checkbox"
                        checked={item.featured}
                        onChange={(event) => onChange(index, { ...item, featured: event.target.checked })}
                      />
                      Destacado
                    </label>
                    <label className="text-xs text-heaven-muted">
                      <span className="mr-2">Subir imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            void onUpload(index, file)
                          }
                        }}
                        className="text-xs"
                      />
                    </label>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
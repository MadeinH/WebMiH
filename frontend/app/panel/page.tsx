'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import SectionWrapper from '@/components/ui/SectionWrapper'
import { defaultAdminContent } from '@/lib/content/default-content'
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

export default function PanelPage() {
  const router = useRouter()
  const [content, setContent] = useState<AdminContentSnapshot>(cloneSnapshot(defaultAdminContent))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [status, setStatus] = useState('Cargando contenido del panel...')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    const localDraft = localStorage.getItem(STORAGE_KEY)
    if (localDraft) {
      try {
        setContent(JSON.parse(localDraft) as AdminContentSnapshot)
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
        setContent(payload)
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
    const formData = new FormData()
    formData.append('file', file)

    setStatus('Subiendo imagen...')
    const response = await fetch('/panel/api/media/upload', {
      method: 'POST',
      body: formData,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.url) {
      setStatus(payload?.error ?? 'No se pudo subir la imagen.')
      return
    }

    const item = (type === 'catalog' ? content.catalog : content.accessories)[index]
    updateItem(type, index, { ...item, imagenUrl: payload.url })
    setStatus('Imagen cargada correctamente.')
  }

  async function saveContent() {
    setSaving(true)
    setValidationErrors([])
    setStatus('Guardando cambios...')

    try {
      const payload = withFeaturedSlugs({ ...content, updatedAt: new Date().toISOString() })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))

      const response = await fetch('/panel/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const issues = Array.isArray(data?.issues) ? data.issues.map((issue: { path: string; message: string }) => `${issue.path}: ${issue.message}`) : []
        setValidationErrors(issues)
        setStatus(data?.error ?? 'No se pudo guardar el contenido.')
        return
      }

      setContent(data)
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
  return (
    <section className="rounded-3xl border border-heaven-divider bg-heaven-bg-card p-6 shadow-heaven-card">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl uppercase tracking-wide text-heaven-text">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-heaven-divider px-4 py-2 text-sm text-heaven-text"
        >
          Agregar
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <article key={item.id} className="rounded-2xl border border-heaven-divider bg-heaven-bg-dark p-4">
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
              className="mt-3 min-h-24 w-full rounded-lg border border-heaven-divider bg-heaven-bg-card px-3 py-2 text-sm text-heaven-text"
            />

            <div className="mt-3 grid gap-3 md:grid-cols-5">
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

            <div className="mt-4 flex flex-wrap items-center gap-4">
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
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-auto rounded-lg border border-heaven-rose/40 px-3 py-2 text-xs text-heaven-rose"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
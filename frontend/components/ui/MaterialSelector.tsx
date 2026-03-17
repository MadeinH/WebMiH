'use client'

interface MaterialSelectorProps {
  /** Materiales disponibles (ej: "Algodón 100% / Piel de durazno") */
  materialesText: string
  /** Valor actual seleccionado */
  value: string
  /** Callback cuando cambia */
  onChange: (value: string) => void
}

/**
 * Selector de material — extrae opciones del texto y permite seleccionar
 */
export default function MaterialSelector({ materialesText, value,onChange }: MaterialSelectorProps) {
  // Extraer opciones del texto (ej: Algodón / Piel → [Algodón, Piel])
  const opciones = materialesText
    .split('/')
    .map((m) => m.trim())
    .filter(Boolean)

  // Si solo hay una opción, retornar display simple
  if (opciones.length <= 1) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-heaven-text">Material</label>
        <div className="rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text">
          {materialesText || 'Personalizable'}
        </div>
      </div>
    )
  }

  // Si hay múltiples opciones, mostrar selector
  return (
    <div className="space-y-2">
      <label htmlFor="material" className="block text-sm font-medium text-heaven-text">
        Material deseado
      </label>
      <select
        id="material"
        value={value || opciones[0]}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-4 py-3 text-sm text-heaven-text transition-colors hover:border-heaven-lilac focus:border-heaven-lilac focus:outline-none focus:ring-1 focus:ring-heaven-lilac"
      >
        {opciones.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

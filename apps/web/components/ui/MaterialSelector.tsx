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
 * Selector de material — extrae opciones del texto y permite seleccionar visualmente
 */
export default function MaterialSelector({ materialesText, value, onChange }: MaterialSelectorProps) {
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

  // Si hay múltiples opciones, mostrar selector visual (pills)
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-heaven-text">
        Material deseado
      </label>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
              value === opt
                ? 'border-heaven-lilac bg-heaven-lilac text-heaven-bg-dark'
                : 'border-heaven-divider bg-heaven-bg-dark text-heaven-text hover:border-heaven-lilac hover:text-heaven-lilac'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { formatCOP } from '@/lib/utils'

interface PriceTableProps {
  detal_carta: number
  detal_estandar: number
  mayoreo_3: number
  mayoreo_6: number
  mayoreo_12: number
  cantidad: number
}

/** Columnas de la tabla de precios */
const columnas = [
  { key: 'detal_carta',    label: '1–2 und (carta)',     rango: [1, 2] },
  { key: 'detal_estandar', label: '1–2 und (estándar)',  rango: [1, 2] },
  { key: 'mayoreo_3',      label: '3 und',               rango: [3, 5] },
  { key: 'mayoreo_6',      label: '6 und',               rango: [6, 11] },
  { key: 'mayoreo_12',     label: '12+ und',             rango: [12, 999] },
] as const

/** Tabla de precios por cantidad con resaltado de columna activa */
export default function PriceTable(precios: PriceTableProps) {
  /** Determina cuál columna está activa según la cantidad */
  function getActiveColumn(): string {
    if (precios.cantidad >= 12) return 'mayoreo_12'
    if (precios.cantidad >= 6) return 'mayoreo_6'
    if (precios.cantidad >= 3) return 'mayoreo_3'
    return 'detal_carta'
  }

  const activeCol = getActiveColumn()

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-heaven-divider">
        <table className="w-full text-center text-sm">
          <thead>
            <tr className="border-b border-heaven-divider bg-heaven-bg-card">
              {columnas.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    activeCol === col.key
                      ? 'bg-heaven-lilac/20 text-heaven-lilac'
                      : 'text-heaven-muted'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columnas.map((col) => {
                const valor = precios[col.key]
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-4 font-display text-lg transition-colors ${
                      activeCol === col.key
                        ? 'bg-heaven-lilac/10 text-heaven-text'
                        : 'text-heaven-muted'
                    }`}
                  >
                    {valor ? formatCOP(valor) : '—'}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

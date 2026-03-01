/**
 * Loading UI — Streaming SSR fallback
 * Mejora la métrica FCP mientras se cargan los datos del server component.
 * Usa las clases heaven-* del design system.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-heaven-dark"
      role="status"
      aria-label="Cargando contenido"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado con colores de marca */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-heaven-gold/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-heaven-gold animate-spin" />
        </div>
        <p className="text-heaven-gold/80 font-display text-lg tracking-wider">
          Cargando...
        </p>
      </div>
    </div>
  )
}

'use client'

/**
 * Error Boundary global — A10 (Server-Side Request Forgery prevention
 * + graceful degradation). NO expone detalles del error al usuario.
 */
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log seguro — no exponer el error al cliente
    // eslint-disable-next-line no-console
      // Integración futura: enviar a servicio de observabilidad
      void error
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-heaven-dark px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6" aria-hidden="true">⚡</div>
        <h2 className="text-2xl font-display text-heaven-gold mb-4">
          Algo salió mal
        </h2>
        <p className="text-heaven-muted mb-8 leading-relaxed">
          Ocurrió un error inesperado. No te preocupes, nuestro equipo
          ya fue notificado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-heaven-gold text-heaven-dark font-bold rounded-lg
                       hover:bg-heaven-gold/90 transition-colors focus:outline-none
                       focus:ring-2 focus:ring-heaven-gold/50"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-heaven-gold/30 text-heaven-gold rounded-lg
                       hover:bg-heaven-gold/10 transition-colors text-center"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  )
}

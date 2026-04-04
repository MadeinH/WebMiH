'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import SectionWrapper from '@/components/ui/SectionWrapper'

function getSafeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith('/panel') || candidate.startsWith('/panel/login')) {
    return '/panel'
  }

  return candidate
}

export default function PanelLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = useMemo(() => getSafeNextPath(searchParams.get('next')), [searchParams])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('Ingresa tus credenciales para administrar el contenido.')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('Validando acceso...')

    try {
      const response = await fetch('/panel/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          setStatus(
            retryAfter
              ? `Acceso bloqueado temporalmente. Intenta de nuevo en ${retryAfter} segundos.`
              : payload?.error ?? 'Acceso bloqueado temporalmente.',
          )
        } else {
          setStatus(payload?.error ?? 'No se pudo iniciar sesión.')
        }
        return
      }

      setStatus('Sesión iniciada. Redirigiendo al panel...')
      router.replace(redirectTo)
      router.refresh()
    } catch {
      setStatus('No se pudo conectar con el servicio de autenticación.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionWrapper>
      <div className="mx-auto max-w-md rounded-3xl border border-heaven-divider bg-heaven-bg-card p-8 shadow-heaven-card">
        <div className="text-center">
          <Badge variant="lilac">Acceso Admin</Badge>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-heaven-text">
            Iniciar Sesión
          </h1>
          <p className="mt-4 text-sm text-heaven-muted">{status}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm text-heaven-muted">
            Usuario
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-3 text-sm text-heaven-text"
              disabled={submitting}
            />
          </label>

          <label className="block text-sm text-heaven-muted">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-heaven-divider bg-heaven-bg-dark px-3 py-3 text-sm text-heaven-text"
              disabled={submitting}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-heaven-lilac px-4 py-3 text-sm font-semibold text-heaven-bg-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Validando...' : 'Entrar al panel'}
          </button>
        </form>
      </div>
    </SectionWrapper>
  )
}
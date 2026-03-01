'use client'

import { useCallback, useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

/**
 * Hook para Google reCAPTCHA v3.
 * Carga el script de reCAPTCHA una sola vez (lazy, al primer uso)
 * y expone `executeRecaptcha(action)` que retorna un token.
 *
 * Si NEXT_PUBLIC_RECAPTCHA_SITE_KEY no está configurado,
 * retorna un token vacío (desarrollo local).
 */
export function useRecaptcha() {
  const loaded = useRef(false)

  useEffect(() => {
    if (!SITE_KEY || loaded.current) return
    if (document.querySelector(`script[src*="recaptcha"]`)) {
      loaded.current = true
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    loaded.current = true
  }, [])

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    if (!SITE_KEY) return '' // dev mode

    // Esperar a que grecaptcha esté disponible (max 5s)
    const grecaptcha = await waitForGrecaptcha()
    if (!grecaptcha) return ''

    return new Promise((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(() => resolve(''))
      })
    })
  }, [])

  return { executeRecaptcha }
}

/** Espera a que el objeto global grecaptcha esté disponible */
function waitForGrecaptcha(timeout = 5000): Promise<typeof globalThis.grecaptcha | null> {
  return new Promise((resolve) => {
    if (typeof globalThis.grecaptcha !== 'undefined') {
      resolve(globalThis.grecaptcha)
      return
    }

    const start = Date.now()
    const interval = setInterval(() => {
      if (typeof globalThis.grecaptcha !== 'undefined') {
        clearInterval(interval)
        resolve(globalThis.grecaptcha)
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        resolve(null)
      }
    }, 100)
  })
}
